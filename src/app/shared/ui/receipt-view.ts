import { Component, input } from '@angular/core';

import { DateTimePipe } from '../format/date-time.pipe';
import { MoneyPipe } from '../format/money.pipe';
import { QtyPipe } from '../format/qty.pipe';
import { BaseDocument } from '../models/document';

/** Чек түріндегі құжат: жолдар және жиыны. */
@Component({
  selector: 'app-receipt-view',
  imports: [MoneyPipe, QtyPipe, DateTimePipe],
  template: `
    <div class="receipt card">
      <h3>{{ title() }} №{{ document().number }}</h3>
      <div class="muted">{{ document().posted_at || document().date | dateTime }}</div>
      <hr />
      @for (item of document().items; track item.product_id) {
        <div>
          <div>{{ item.product_name }}</div>
          <div class="line">
            <span>{{ item.quantity | qty }} × {{ item.price | money }}</span>
            <span>{{ item.total | money }}</span>
          </div>
        </div>
      }
      <hr />
      <div class="line">
        <strong>Жиыны</strong><strong>{{ document().total | money }}</strong>
      </div>
    </div>
  `,
})
export class ReceiptView {
  readonly document = input.required<BaseDocument>();
  readonly title = input.required<string>();
}
