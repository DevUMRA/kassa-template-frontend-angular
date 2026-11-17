import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { errorMessages } from '../../core/api/api-error';
import { Paginated } from '../../core/api/paginated';
import { DateTimePipe } from '../../shared/format/date-time.pipe';
import { MoneyPipe } from '../../shared/format/money.pipe';
import { DOC_TYPE_TITLES, STATUS_TITLES } from '../../shared/models/document';
import { AlertBox } from '../../shared/ui/alert-box';
import { StatusBadge } from '../../shared/ui/status-badge';
import { BusyFlag } from '../../shared/util/busy-flag';
import { DocumentsService } from './documents.service';
import { JournalDocument } from './journal-document';

/** Құжаттар журналы: сүзгілер, беттеу. */
@Component({
  selector: 'app-document-list-page',
  imports: [ReactiveFormsModule, AlertBox, StatusBadge, MoneyPipe, DateTimePipe],
  templateUrl: './document-list-page.html',
})
export class DocumentListPage implements OnInit {
  private readonly documents = inject(DocumentsService);
  private readonly router = inject(Router);

  protected readonly docTypes = Object.entries(DOC_TYPE_TITLES);
  protected readonly statuses = Object.entries(STATUS_TITLES);
  protected readonly form = inject(NonNullableFormBuilder).group({
    doc_type: '',
    status: '',
    search: '',
    date_from: '',
    date_to: '',
  });
  protected readonly page = signal<Paginated<JournalDocument> | null>(null);
  protected readonly errors = signal<readonly string[] | null>(null);
  protected readonly showBusy = new BusyFlag();
  private currentPage = 1;

  ngOnInit(): void {
    const { page, ...filters } = this.documents.filters();
    this.form.setValue(filters);
    void this.show(page);
  }

  protected showFirstPage(): Promise<void | undefined> {
    return this.showBusy.run(() => this.show(1));
  }

  protected showPage(delta: number): void {
    void this.show(this.currentPage + delta);
  }

  protected open(document: JournalDocument): void {
    void this.router.navigate(['/documents', document.id]);
  }

  private async show(page: number): Promise<void> {
    const values = this.form.getRawValue();
    try {
      const data = await this.documents.list({ ...values, search: values.search.trim(), page });
      this.currentPage = page;
      this.page.set(data);
      this.errors.set(null);
    } catch (error) {
      this.page.set(null);
      this.errors.set(errorMessages(error));
    }
  }
}
