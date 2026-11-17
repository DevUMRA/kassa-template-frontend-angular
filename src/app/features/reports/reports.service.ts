import { inject, Injectable } from '@angular/core';

import { ApiService, QueryParams } from '../../core/api/api.service';
import { ReportKey } from './report';

export interface WarehouseOption {
  readonly id: number;
  readonly name: string;
}

/** Есептер және қоймалар тізімі (сүзгі үшін). */
@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly api = inject(ApiService);

  warehouses(): Promise<WarehouseOption[]> {
    return this.api.get<WarehouseOption[]>('/warehouses/');
  }

  load<T>(key: ReportKey, params: QueryParams): Promise<T> {
    return this.api.get<T>(`/reports/${key}/`, { params });
  }
}
