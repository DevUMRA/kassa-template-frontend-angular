import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { errorMessages } from '../../core/api/api-error';
import { ApiService } from '../../core/api/api.service';
import { Paginated } from '../../core/api/paginated';
import { ToastService } from '../../core/ui/toast.service';
import { formatMoney } from '../format/format';
import { MoneyPipe } from '../format/money.pipe';
import { QtyPipe } from '../format/qty.pipe';
import { BaseDocument, LineInput, ReturnableDocument } from '../models/document';
import { AlertBox } from '../ui/alert-box';
import { ReceiptView } from '../ui/receipt-view';
import { StatusBadge } from '../ui/status-badge';
import { BusyFlag } from '../util/busy-flag';
import { describeReturns } from './previous-returns';
import { ReturnScreenConfig } from './return-screen-config';

/** Негіз құжатты (чек, қабылдау) нөмірі бойынша тауып, одан қайтару жасайтын экран. */
@Component({
  selector: 'app-return-screen',
  imports: [ReactiveFormsModule, AlertBox, StatusBadge, ReceiptView, MoneyPipe, QtyPipe],
  templateUrl: './return-screen.html',
})
export class ReturnScreen implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  readonly config = input.required<ReturnScreenConfig>();
  /** Ашылғанда бірден ізделетін нөмір (мысалы, қабылдаулар тізімінен). */
  readonly initialNumber = input('');

  private readonly numberInput = viewChild.required<ElementRef<HTMLInputElement>>('numberInput');

  protected readonly number = new FormControl('', { nonNullable: true });
  protected readonly reason = new FormControl('', { nonNullable: true });
  protected readonly findBusy = new BusyFlag();
  protected readonly returnBusy = new BusyFlag();

  protected readonly document = signal<ReturnableDocument | null>(null);
  /** Іздеу нәтижесінің орнына көрсетілетін қате (табылмады, т.б.) */
  protected readonly findErrors = signal<readonly string[] | null>(null);
  protected readonly message = signal<readonly string[] | null>(null);
  /** Соңғы өткізілген қайтару */
  protected readonly lastReturn = signal<BaseDocument | null>(null);
  /** product_id → енгізілген қайтару саны */
  private readonly quantities = new Map<number, string>();

  protected readonly rows = computed(() => {
    const document = this.document();
    if (!document) return [];
    return document.items.map((item) => ({
      item,
      left: Number(document.returnable[String(item.product_id)] ?? 0),
    }));
  });
  protected readonly info = computed(() => {
    const document = this.document();
    return document ? this.config().info(document) : '';
  });
  protected readonly previousReturns = computed(() =>
    describeReturns(this.document()?.returns ?? []),
  );

  ngOnInit(): void {
    const initial = this.initialNumber();
    if (initial) {
      this.number.setValue(initial);
      void this.find();
    } else {
      queueMicrotask(() => this.numberInput().nativeElement.focus());
    }
  }

  protected find(): Promise<void | undefined> {
    return this.findBusy.run(async () => {
      const value = this.number.value.trim().toUpperCase();
      if (!value) return;
      const { path, docLabel } = this.config();
      try {
        const data = await this.api.get<Paginated<ReturnableDocument>>(path, {
          params: { search: value },
        });
        const [found] = data.results;
        if (found) this.show(found, null);
        else this.showFindError([`${docLabel} табылмады: ${value}`]);
      } catch (error) {
        this.showFindError(errorMessages(error));
      }
    });
  }

  protected setQuantity(productId: number, value: string): void {
    this.quantities.set(productId, value);
  }

  protected submitReturn(): Promise<void | undefined> {
    return this.returnBusy.run(async () => {
      const document = this.document();
      if (!document) return;
      const items: LineInput[] = [...this.quantities]
        .filter(([, value]) => Number(value) > 0)
        .map(([productId, value]) => ({ product_id: productId, quantity: value }));
      if (!items.length) {
        this.message.set(['Қайтаратын санды енгізіңіз.']);
        return;
      }
      const { path } = this.config();
      try {
        const result = await this.api.post<BaseDocument>(`${path}${document.id}/returns/`, {
          items,
          comment: this.reason.value,
        });
        this.toast.show(`Қайтару №${result.number}: ${formatMoney(result.total)}`);
        this.show(await this.api.get<ReturnableDocument>(`${path}${document.id}/`), result);
      } catch (error) {
        this.message.set(errorMessages(error));
      }
    });
  }

  private show(document: ReturnableDocument, lastReturn: BaseDocument | null): void {
    this.quantities.clear();
    this.reason.setValue('');
    this.message.set(null);
    this.findErrors.set(null);
    this.lastReturn.set(lastReturn);
    this.document.set(document);
  }

  private showFindError(messages: readonly string[]): void {
    this.document.set(null);
    this.lastReturn.set(null);
    this.findErrors.set(messages);
  }
}
