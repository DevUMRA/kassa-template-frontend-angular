import { Component, input } from '@angular/core';

import { MoneyPipe } from '../../shared/format/money.pipe';
import { QtyPipe } from '../../shared/format/qty.pipe';
import { StockReport } from './report';

@Component({
  selector: 'app-stock-report',
  imports: [MoneyPipe, QtyPipe],
  template: `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Тауар</th>
            <th>Артикул</th>
            <th>Қойма</th>
            <th class="num">Қалдық</th>
            <th class="num">Бағасы</th>
            <th class="num">Құны</th>
          </tr>
        </thead>
        <tbody>
          @for (r of data().rows; track $index) {
            <tr>
              <td>{{ r.product_name }}</td>
              <td>{{ r.sku }}</td>
              <td>{{ r.warehouse }}</td>
              <td class="num">{{ r.quantity | qty }} {{ r.unit }}</td>
              <td class="num">{{ r.sale_price | money }}</td>
              <td class="num">{{ r.value | money }}</td>
            </tr>
          } @empty {
            <tr>
              <td class="empty" colspan="6">Деректер жоқ</td>
            </tr>
          }
        </tbody>
        <tfoot>
          <tr>
            <td>Позиция: {{ data().totals.positions }}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="num">{{ data().totals.value | money }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `,
})
export class StockReportView {
  readonly data = input.required<StockReport>();
}
