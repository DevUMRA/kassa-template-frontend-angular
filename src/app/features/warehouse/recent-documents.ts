import { Component, inject, input, OnInit, output, signal } from '@angular/core';

import { errorMessages } from '../../core/api/api-error';
import { ApiService } from '../../core/api/api.service';
import { Paginated } from '../../core/api/paginated';
import { DateTimePipe } from '../../shared/format/date-time.pipe';
import { MoneyPipe } from '../../shared/format/money.pipe';
import { BaseDocument } from '../../shared/models/document';
import { AlertBox } from '../../shared/ui/alert-box';
import { StatusBadge } from '../../shared/ui/status-badge';

export interface RecentColumn<T> {
  readonly title: string;
  readonly value: (document: T) => string;
}

/** Қойма құжаттарының соңғы тізімі (жаңасы бірінші). */
@Component({
  selector: 'app-recent-documents',
  imports: [AlertBox, StatusBadge, MoneyPipe, DateTimePipe],
  templateUrl: './recent-documents.html',
})
export class RecentDocuments<T extends BaseDocument> implements OnInit {
  private readonly api = inject(ApiService);

  readonly path = input.required<string>();
  readonly columns = input<readonly RecentColumn<T>[]>([]);
  /** Жолдарды басуға болады ма (`opened` шығарылады). */
  readonly clickable = input(false);
  readonly opened = output<T>();

  protected readonly documents = signal<readonly T[] | null>(null);
  protected readonly errors = signal<readonly string[] | null>(null);

  ngOnInit(): void {
    void this.reload();
  }

  async reload(): Promise<void> {
    this.documents.set(null);
    this.errors.set(null);
    try {
      this.documents.set((await this.api.get<Paginated<T>>(this.path())).results);
    } catch (error) {
      this.errors.set(errorMessages(error));
    }
  }

  protected open(document: T): void {
    if (this.clickable()) this.opened.emit(document);
  }
}
