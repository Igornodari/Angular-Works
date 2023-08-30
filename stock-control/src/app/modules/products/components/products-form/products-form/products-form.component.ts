import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Subject, takeUntil } from 'rxjs';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { MessageService } from 'primeng/api';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/responses/GetCategoriesResponse';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from 'src/app/services/products/products.service';
import { CreateProductResponse } from 'src/app/models/interfaces/products/response/CreateProductResponse';
import { CreateProductRequest } from 'src/app/models/interfaces/products/request/CreateProductRequest';

@Component({
  selector: 'app-products-form',
  templateUrl: './products-form.component.html',
  styleUrls: ['./products-form.component.scss'],
})
export class ProductsFormComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public categoriesDatas: Array<GetCategoriesResponse> = [];
  public selectedCategorie: Array<{ name: string; code: string }> = [];

  public addFormProduct = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    category_id: ['', Validators.required],
    amount: ['', Validators.required],
  });

  constructor(
    private categoriesService: CategoriesService,
    private productService: ProductsService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllCategories();
  }
  getAllCategories() {
    this.categoriesService
      .getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.categoriesDatas = response;
            this.messageService.add({
              severity: 'Sucesso',
              summary: 'Sucesso',
              detail: 'Sucesso ao requerir categorias',
              id: this.categoriesDatas,
              life: 2500,
            });
          }
        },
      });
  }
  handleSubmitProduct() {
    if (this.addFormProduct?.value && this.addFormProduct?.valid) {
      const requestCreateProduct: CreateProductRequest = {
        name: this.addFormProduct.value.name as string,
        price: this.addFormProduct.value.price as string,
        description: this.addFormProduct.value.description as string,
        category_id: this.addFormProduct.value.category_id as string,
        amount: Number(this.addFormProduct.value.amount)
      };
      console.log(requestCreateProduct)
      this.productService.createProduct(requestCreateProduct).pipe(takeUntil(this.destroy$)).subscribe({
        next:(response)=>{
          if(response){
            this.messageService.add({
              severity: 'Sucesso',
              summary: 'Sucesso',
              detail: 'Sucesso ao criar produto',
              id: this.categoriesDatas,
              life: 2500,
            });
          }
        },
        error:(err) => {
          console.log(err);
          this.messageService.add({
            severity: 'Error',
            summary: 'erro',
            detail: 'Erro ao criar produto',
            id: this.categoriesDatas,
            life: 2500,
          });
        }
      })
    }
    this.addFormProduct.reset();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
