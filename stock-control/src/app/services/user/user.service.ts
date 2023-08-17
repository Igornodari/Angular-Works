import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthRequest } from 'src/app/models/interfaces/user/auth/authRequest';
import { AuthResponse } from 'src/app/models/interfaces/user/auth/authRespose';
import { SingupUserRequests } from 'src/app/models/interfaces/user/singupUserRequests';
import { SingupUserResponse } from 'src/app/models/interfaces/user/singupUserResponse';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient, private cookie: CookieService) {}

  singUpUser(requestDatas: SingupUserRequests): Observable<SingupUserResponse> {
    return this.http.post<SingupUserResponse>(
      `${this.API_URL}/user`,
      requestDatas
    );
  }

  authUser(resquestDatas: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth`, resquestDatas);
  }
  isLoggedIn(): boolean {
    const JWT_TOKEN = this.cookie.get('USER_INFO');
    return JWT_TOKEN ? true : false;
  }
}
