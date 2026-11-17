import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { errorMessages } from '../../core/api/api-error';
import { ConfirmService } from '../../core/ui/confirm.service';
import { ToastService } from '../../core/ui/toast.service';
import { formatDateTime } from '../../shared/format/format';
import { DateTimePipe } from '../../shared/format/date-time.pipe';
import { MoneyPipe } from '../../shared/format/money.pipe';
import { QtyPipe } from '../../shared/format/qty.pipe';
import { statusTitle } from '../../shared/models/document';
import { AlertBox } from '../../shared/ui/alert-box';
import { StatusBadge } from '../../shared/ui/status-badge';
import { BusyFlag } from '../../shared/util/busy-flag';
import { DocumentsService } from './documents.service';
import { JournalDocument } from './journal-document';

/** Құжат: толық ақпарат, жолдар, күшін жою. */
@Component({
  selector: 'app-document-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertBox,
    StatusBadge,
    MoneyPipe,
    QtyPipe,
    DateTimePipe,
  ],
  templateUrl: './document-page.html',
})
export class DocumentPage {
  private readonly documents = inject(DocumentsService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  /** Маршрут параметрі `:id` */
  readonly id = input.required<string>();

  private readonly reasonInput = viewChild<ElementRef<HTMLInputElement>>('reasonInput');

  protected readonly statusTitle = statusTitle;
  protected readonly document = signal<JournalDocument | null>(null);
  protected readonly loadErrors = signal<readonly string[] | null>(null);
  protected readonly message = signal<readonly string[] | null>(null);
  protected readonly reason = new FormControl('', { nonNullable: true });
  protected readonly cancelBusy = new BusyFlag();

  protected readonly hasPostedReturns = computed(
    () => this.document()?.returns.some((r) => r.status === 'POSTED') ?? false,
  );
  protected readonly canceledInfo = computed(() => {
    const doc = this.document();
    if (doc?.status !== 'CANCELED') return null;
    return (
      `Күші жойылды: ${formatDateTime(doc.canceled_at)}${doc.canceled_by ? ` · ${doc.canceled_by}` : ''}` +
      (doc.cancel_reason ? ` · Себебі: ${doc.cancel_reason}` : '')
    );
  });

  constructor() {
    // Негіз құжат/қайтару сілтемесі сол компонентті басқа id-мен ашады
    effect(() => {
      const id = Number(this.id());
      untracked(() => void this.load(id));
    });
  }

  protected cancel(): Promise<void | undefined> {
    return this.cancelBusy.run(async () => {
      const doc = this.document();
      if (!doc) return;
      const posted = doc.status === 'POSTED';
      if (posted && !this.reason.value.trim()) {
        this.message.set(['Өткізілген құжаттың күшін жою себебін көрсетіңіз.']);
        this.reasonInput()?.nativeElement.focus();
        return;
      }
      const question = posted
        ? `№${doc.number} құжатының күшін жоясыз ба? Кері қозғалыстар жазылып, қалдық құжатқа дейінгі күйге қайтады.`
        : `№${doc.number} жобасының күшін жоясыз ба?`;
      if (!this.confirm.ask(question)) return;
      try {
        await this.documents.cancel(doc.id, this.reason.value);
        this.toast.show(`№${doc.number}: күші жойылды.`);
        await this.load(doc.id);
      } catch (error) {
        this.message.set(errorMessages(error));
      }
    });
  }

  private async load(id: number): Promise<void> {
    this.document.set(null);
    this.loadErrors.set(null);
    this.message.set(null);
    this.reason.setValue('');
    try {
      this.document.set(await this.documents.get(id));
    } catch (error) {
      this.loadErrors.set(errorMessages(error));
    }
  }
}
