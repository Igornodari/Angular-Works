import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductEvent } from 'src/app/models/enums/product/product.event';
import { DeleteProductAction } from 'src/app/models/interfaces/products/event/deleteProductAction';
import { EventAction } from 'src/app/models/interfaces/products/event/eventAction';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';

@Component({
  selector: 'app-products-table',
  templateUrl: './products-table.component.html',
  styleUrls: ['./products-table.component.scss'],
})
export class ProductsTableComponent {
  @Input() products: Array<GetAllProductsResponse> = [];
  @Output() productEvent = new EventEmitter<EventAction>();
  @Output() deleteProductEvent = new EventEmitter<DeleteProductAction>();

  public productsSelected!: GetAllProductsResponse;
  public addProducEvent = ProductEvent.ADD_PRODUCT_EVENT;
  public editProducEvent = ProductEvent.EDIT_PRODUCT_EVENT;

  handleProductEvent(action: string, id?: string) {
    if (action != '' && action) {
      const productEventData = id && id !== '' ? { action, id } : { action };
      this.productEvent.emit(productEventData);
    }
  }
  handleDeleteProduct( productName: string,product_id: string): void {
    console.log(product_id)
    if (product_id !== '' && productName !== '') {
     this.deleteProductEvent.emit({
      product_id,
      productName
     })
    }
  }
}
