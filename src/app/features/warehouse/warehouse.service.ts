import { inject, Injectable } from '@angular/core';

import { ApiService } from '../../core/api/api.service';
import { LineInput, Receipt, WriteOff } from '../../shared/models/document';
import { Supplier } from './supplier';

export interface ReceiptRequest {
  readonly supplier_id: number;
  readonly items: readonly LineInput[];
  readonly comment: string;
}

/** Қоймалық құжаттар: жеткізушіден қабылдау, есептен шығару. */
@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly api = inject(ApiService);

  suppliers(): Promise<Supplier[]> {
    return this.api.getAll<Supplier>('/warehouse/suppliers/');
  }

  createReceipt(request: ReceiptRequest): Promise<Receipt> {
    return this.api.post<Receipt>('/warehouse/receipts/', request);
  }

  createWriteOff(items: readonly LineInput[], comment: string): Promise<WriteOff> {
    return this.api.post<WriteOff>('/warehouse/write-offs/', { items, comment });
  }
}
