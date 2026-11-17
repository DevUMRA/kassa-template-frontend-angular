import { inject, Injectable, signal } from '@angular/core';

import { ApiService } from '../../core/api/api.service';
import { Paginated } from '../../core/api/paginated';
import { DocumentFilters, EMPTY_FILTERS, JournalDocument } from './journal-document';

/** Құжаттар журналы (Басқарушы). Сүзгілер беттер арасында сақталады. */
@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private readonly api = inject(ApiService);

  /** Соңғы қолданылған сүзгілер — құжаттан тізімге қайтқанда қалпына келеді. */
  readonly filters = signal<DocumentFilters>(EMPTY_FILTERS);

  list(filters: DocumentFilters): Promise<Paginated<JournalDocument>> {
    this.filters.set(filters);
    return this.api.get<Paginated<JournalDocument>>('/documents/', { params: { ...filters } });
  }

  get(id: number): Promise<JournalDocument> {
    return this.api.get<JournalDocument>(`/documents/${id}/`);
  }

  cancel(id: number, reason: string): Promise<JournalDocument> {
    return this.api.post<JournalDocument>(`/documents/${id}/cancel/`, { reason });
  }
}
