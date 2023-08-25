import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductsService } from './../../../../services/products/products.service';
import { MessageService } from 'primeng/api';
import { GetAllProductsResponse } from './../../../../models/interfaces/products/response/GetAllProductsResponse';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: [],
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  public productList: Array<GetAllProductsResponse> = [];
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductsService,
    private messageService: MessageService,
    private productsDTService: ProductsDataTransferService
  ) {}

  ngOnInit(): void {
    this.getAllProductsData();
  }
  getAllProductsData() {
    this.productService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.productList = response;
            this.productsDTService.setProductsDatas(this.productList);
          }
        },
        error: (err) => {
          console.log(err);
          this.messageService.add({
            severity: 'Error de chamada',
            summary: 'Erro',
            detail: 'Erro ao buscar produtos !!',
            life: 2500,
          });
        },
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
