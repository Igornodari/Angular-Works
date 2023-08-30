import { Component, OnDestroy, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';
import { ProductsService } from 'src/app/services/products/products.service';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EventAction } from 'src/app/models/interfaces/products/event/eventAction';
import { DeleteProductAction } from './../../../../models/interfaces/products/event/deleteProductAction';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { ProductsFormComponent } from '../../components/products-form/products-form/products-form.component';

@Component({
  selector: 'app-products-home',
  templateUrl: './products-home.component.html',
  styleUrls: ['./products-home.component.scss'],
})
export class ProductsHomeComponent implements OnDestroy, OnInit {
  private readonly destroy$: Subject<void> = new Subject();
  public productsDatas: Array<GetAllProductsResponse> = [];
  private ref!: DynamicDialogRef;

  constructor(
    private productsService: ProductsService,
    private messageService: MessageService,
    private productsDtService: ProductsDataTransferService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.getServiceProductsData();
  }

  ngOnDestroy(): void {}

  handleProductAction(event: EventAction) {
    if (event) {
      this.ref = this.dialogService.open(ProductsFormComponent, {
        header: event.action,
        width: '70%',
        contentStyle: { overFlow: 'auto' },
        baseZIndex: 1000,
        maximizable: true,
        data: {
          event: event,
          productDatas: this.productsDatas,
        },
      });
      this.ref.onClose.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => this.getAPIProductsData(),
      });
    }
  }
  handleDeleteProductAction(event: DeleteProductAction) {
    if (event) {
      this.confirmationService.confirm({
        message: `Confirma a exclusão do produto :${event?.productName}?`,
        header: 'Confirmação de exclusão',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: () => this.deleteProduct(event?.product_id),
      });
      console.log(event.productName);
    }
  }
  deleteProduct(product_id: string) {
    if (product_id) {
      this.productsService
        .deleteProduct(product_id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.messageService.add({
                severity: 'Sucesso',
                summary: 'Sucesso',
                detail: 'Sucesso ao deletar produto',
                id: product_id,
                life: 2500,
              });
            }
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'Error',
              summary: 'erro',
              detail: 'Erro ao deletar produto',
              id: product_id,
              life: 2500,
            });
          },
        });
    }
  }

  getServiceProductsData() {
    const productsLoaded = this.productsDtService.getProductsDatas();
    if (productsLoaded.length > 0) {
      this.productsDatas = productsLoaded;
    } else this.getAPIProductsData();
  }

  getAPIProductsData() {
    this.productsService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.productsDatas = response;
          }
        },
        error: (err) => {
          console.log(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro na api de produtos',
            life: 2500,
          });
          this.router.navigate(['/dashboard']);
        },
      });
  }
}
