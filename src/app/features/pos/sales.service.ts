import { inject, Injectable } from '@angular/core';

import { ApiService } from '../../core/api/api.service';
import { LineInput, Sale } from '../../shared/models/document';

/** Касса: сату чегін өткізу. */
@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly api = inject(ApiService);

  sell(items: readonly LineInput[]): Promise<Sale> {
    return this.api.post<Sale>('/pos/sales/', { items });
  }
}
