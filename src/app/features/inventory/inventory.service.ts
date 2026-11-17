import { inject, Injectable } from '@angular/core';

import { ApiService } from '../../core/api/api.service';
import { Paginated } from '../../core/api/paginated';
import { Audit, CountLine, StartAuditRequest } from './audit';

/** Түгендеу: бастау, санау, бекіту, күшін жою. */
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly api = inject(ApiService);

  list(): Promise<Paginated<Audit>> {
    return this.api.get<Paginated<Audit>>('/inventory/audits/');
  }

  get(id: number): Promise<Audit> {
    return this.api.get<Audit>(`/inventory/audits/${id}/`);
  }

  start(request: StartAuditRequest): Promise<Audit> {
    return this.api.post<Audit>('/inventory/audits/', request);
  }

  saveCounts(id: number, items: readonly CountLine[]): Promise<Audit> {
    return this.api.post<Audit>(`/inventory/audits/${id}/counts/`, { items });
  }

  approve(id: number, comment: string): Promise<Audit> {
    return this.api.post<Audit>(`/inventory/audits/${id}/approve/`, { comment });
  }

  cancel(id: number, reason: string): Promise<Audit> {
    return this.api.post<Audit>(`/inventory/audits/${id}/cancel/`, { reason });
  }
}
