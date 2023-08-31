import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { MessageService } from 'primeng/api';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/responses/GetCategoriesResponse';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from 'src/app/services/products/products.service';
import { CreateProductRequest } from 'src/app/models/interfaces/products/request/CreateProductRequest';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EventAction } from 'src/app/models/interfaces/products/event/eventAction';
import { ProductsDataTransferService } from './../../../../../shared/services/products/products-data-transfer.service';
import { ProductEvent } from 'src/app/models/enums/product/product.event';
import { EditProductRequest } from 'src/app/models/interfaces/products/request/EditProductRequest';

@Component({
  selector: 'app-products-form',
  templateUrl: './products-form.component.html',
  styleUrls: ['./products-form.component.scss'],
})
export class ProductsFormComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public categoriesDatas: Array<GetCategoriesResponse> = [];
  public selectedCategorie: Array<{ name: string; code: string }> = [];
  public productAction!: {
    event: EventAction;
    productDatas: Array<GetAllProductsResponse>;
  };
  public productSelectedDatas!: GetAllProductsResponse;

  public addFormProduct = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    category_id: ['', Validators.required],
    amount: ['', Validators.required],
  });

  public editFormProduct = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    amount: [0, Validators.required],
  });

  public productDatas: Array<GetAllProductsResponse> = [];
  public addProductAction = ProductEvent.ADD_PRODUCT_EVENT;
  public editProductAction = ProductEvent.EDIT_PRODUCT_EVENT;
  public saleProductAction = ProductEvent.SALE_PRODUCT_EVENT;

  constructor(
    private categoriesService: CategoriesService,
    private productService: ProductsService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router,
    private ref: DynamicDialogConfig,
    private productsDTService: ProductsDataTransferService
  ) {}

  ngOnInit(): void {
    this.productAction = this.ref.data;
    if (
      this.productAction.event.action === this.editProductAction &&
      this.productAction.productDatas
    ) {
      this.getProductSelectedDatas(this.productAction?.event?.id as string);
    }
    this.productAction.event.action === this.saleProductAction &&
      this.getProductDatas();

    this.getAllCategories();
  }

// GET das categorias
  getAllCategories() {
    this.categoriesService
      .getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.categoriesDatas = response;
            this.messageService.add({
              severity: 'success',
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
// Validação se tem valor e se o formulario esta valido
    if (this.addFormProduct?.value && this.addFormProduct?.valid) {
// Montando o Objeto com os valores a ser gravados
      const requestCreateProduct: CreateProductRequest = {
        name: this.addFormProduct.value.name as string,
        price: this.addFormProduct.value.price as string,
        description: this.addFormProduct.value.description as string,
        category_id: this.addFormProduct.value.category_id as string,
        amount: Number(this.addFormProduct.value.amount),
      };
//POST dos dados para criar um produto novo
      this.productService
        .createProduct(requestCreateProduct)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Sucesso ao criar produto',
                id: this.categoriesDatas,
                life: 2500,
              });
            }
          },
          error: (err) => {
            console.log(err);
            this.messageService.add({
              severity: 'error',
              summary: 'erro',
              detail: 'Erro ao criar produto',
              id: this.categoriesDatas,
              life: 2500,
            });
          },
        });
    }
    this.addFormProduct.reset();
  }

  handleSubmitEditProduct() {
// Validação se tem valor e se esta editando
    if (
      this.editFormProduct.value &&
      this.editFormProduct.valid &&
      this.productAction.event.id
    ) {
// Montando o Objeto com os novos dados
      const requestEditProduct: EditProductRequest = {
        name: this.editFormProduct.value.name as string,
        price: this.editFormProduct.value.price as string,
        description: this.editFormProduct.value.description as string,
        product_id: this.productAction.event.id,
        amount: Number(this.editFormProduct.value.amount),
      };
// PUT dos dados editados
      this.productService
        .editProduct(requestEditProduct)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Sucesso ao editar produto',
                id: this.categoriesDatas,
                life: 2500,
              });
            }
          },
          error: (err) => {
            console.log(err);
            this.messageService.add({
              severity: 'error',
              summary: 'erro',
              detail: 'Erro ao editar produto',
              id: this.categoriesDatas,
              life: 2500,
            });
          },
        });
    }
  }
// GET BY ID dos produtos para edição !!
  getProductSelectedDatas(product_id: string) {
    const allProducts = this.productAction?.productDatas;
    if (allProducts.length > 0) {
// Filtrando os produtos cadastrados por id !
      const productsFiltered = allProducts.filter(
        (element) => element.id == product_id
      );
// Quando achado o produto, inputamos os dados no OBJETO
      if (productsFiltered) {
        this.productSelectedDatas = productsFiltered[0];
        this.editFormProduct.setValue({
          name: this.productSelectedDatas?.name as string,
          price: this.productSelectedDatas?.price as string,
          amount: Number(this.productSelectedDatas?.amount),
          description: this.productSelectedDatas?.description as string,
        });
      }
    }
  }
// GET ALL dos produtos
  getProductDatas() {
    this.productService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            this.productDatas = response;
            this.productDatas &&
              this.productsDTService.setProductsDatas(this.productDatas);
          }
        },
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
