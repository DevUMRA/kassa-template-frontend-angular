import { Component, computed, input } from '@angular/core';

import { formatDate } from '../../shared/format/format';
import { MoneyPipe } from '../../shared/format/money.pipe';
import { QtyPipe } from '../../shared/format/qty.pipe';
import { SalesGroupBy, SalesReport, SalesRow } from './report';

const GROUP_TITLES: Readonly<Record<SalesGroupBy, string>> = {
  day: 'Күн',
  product: 'Тауар',
  cashier: 'Кассир',
};

/** Топтау кілтінің мәні: күн, тауар немесе кассир. */
export function salesRowKey(groupBy: SalesGroupBy, row: SalesRow): string {
  if (groupBy === 'day') return formatDate(row.day);
  return (groupBy === 'product' ? row.product_name : row.cashier) ?? '';
}

@Component({
  selector: 'app-sales-report',
  imports: [MoneyPipe, QtyPipe],
  template: `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ keyTitle() }}</th>
            <th class="num">Чек</th>
            <th class="num">Сатылды</th>
            <th class="num">Сату сомасы</th>
            <th class="num">Қайтару</th>
            <th class="num">Қайтару сомасы</th>
            <th class="num">Түсім</th>
          </tr>
        </thead>
        <tbody>
          @for (r of data().rows; track $index) {
            <tr>
              <td>{{ rowKey(r) }}</td>
              <td class="num">{{ r.receipts }}</td>
              <td class="num">{{ r.sold_qty | qty }}</td>
              <td class="num">{{ r.sold_amount | money }}</td>
              <td class="num">{{ r.returns }} / {{ r.returned_qty | qty }}</td>
              <td class="num neg">{{ r.returned_amount | money }}</td>
              <td class="num">{{ r.net_amount | money }}</td>
            </tr>
          } @empty {
            <tr>
              <td class="empty" colspan="7">Деректер жоқ</td>
            </tr>
          }
        </tbody>
        <tfoot>
          <tr>
            <td>Барлығы</td>
            <td class="num">{{ data().totals.receipts }}</td>
            <td></td>
            <td class="num">{{ data().totals.sold_amount | money }}</td>
            <td class="num">{{ data().totals.returns }}</td>
            <td class="num">{{ data().totals.returned_amount | money }}</td>
            <td class="num">{{ data().totals.net_amount | money }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `,
})
export class SalesReportView {
  readonly data = input.required<SalesReport>();
  protected readonly keyTitle = computed(() => GROUP_TITLES[this.data().group_by]);

  protected rowKey(row: SalesRow): string {
    return salesRowKey(this.data().group_by, row);
  }
}
