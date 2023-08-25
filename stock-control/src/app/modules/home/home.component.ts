import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from './../../services/user/user.service';
import { SingupUserRequests } from 'src/app/models/interfaces/user/singupUserRequests';
import { AuthRequest } from 'src/app/models/interfaces/user/auth/authRequest';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { AuthGuard } from './../../guards/auth-guard.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  loginCard = true;
  loginForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
  registerForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
    name: ['', Validators.required],
  });
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private AuthGuard: AuthGuard,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('ABRIUUU');
  }
  onSubmmitLoginForm() {
    if (this.loginForm.valid && this.loginForm.value)
      this.userService
        .authUser(this.loginForm.value as AuthRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.cookieService.set('USER_INFO', response?.token);
              this.loginForm.reset();
              this.router.navigate(['/dashboard']);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso !!',
                detail: `Bem vindo ${response.name} !`,
                life: 2000,
              });
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: `Erro ao fazer login !`,
              life: 2000,
            });
            console.log(err);
          },
        });
  }
  onSubmmitRegisterForm() {
    if (this.registerForm.value && this.registerForm.valid) {
      this.userService
        .singUpUser(this.registerForm.value as SingupUserRequests)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.registerForm.reset();
              this.loginCard = true;
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso !!',
                detail: `Bem vindo ${response.name}, registrado com sucesso !!`,
                life: 5000,
              });
            }
          },
          error: (err) =>
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: `Erro ao criar usuario, verifique os campos !`,
              life: 2000,
            }),
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
