import { Component, computed, input } from '@angular/core';

import { formatMoney, formatQty, signClass } from '../../shared/format/format';
import { DateTimePipe } from '../../shared/format/date-time.pipe';
import { MoneyPipe } from '../../shared/format/money.pipe';
import { QtyPipe } from '../../shared/format/qty.pipe';
import { InventoryReport } from './report';

@Component({
  selector: 'app-inventory-report',
  imports: [MoneyPipe, QtyPipe, DateTimePipe],
  templateUrl: './inventory-report-view.html',
})
export class InventoryReportView {
  readonly data = input.required<InventoryReport>();

  protected readonly signClass = signClass;
  protected readonly summary = computed(() => {
    const t = this.data().totals;
    return (
      `Бекітілген түгендеу: ${t.audits} · кемшілік: ${formatQty(t.shortage_qty)} (${formatMoney(t.shortage_amount)})` +
      ` · артық: ${formatQty(t.surplus_qty)} (${formatMoney(t.surplus_amount)})`
    );
  });
  /** Айырмасы бар тауарлар — барлық түгендеулер бойынша бір кесте */
  protected readonly lines = computed(() =>
    this.data().audits.flatMap((audit) => audit.lines.map((line) => ({ audit, line }))),
  );
}
