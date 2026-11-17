import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../core/api/api.service';
import { Paginated } from '../../core/api/paginated';
import { Product } from '../models/product';

/** Тауарларды іздеу және штрихкод бойынша табу (касса, қойма, түгендеу). */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  search$(term: string): Observable<Paginated<Product>> {
    return this.api.get$<Paginated<Product>>('/pos/products/', { params: { search: term } });
  }

  byBarcode(code: string): Promise<Product> {
    return this.api.get<Product>(`/pos/products/barcode/${encodeURIComponent(code)}/`);
  }
}
