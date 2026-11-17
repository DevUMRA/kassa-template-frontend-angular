import { Component, input } from '@angular/core';

import { QtyPipe } from '../../shared/format/qty.pipe';
import { TurnoverReport } from './report';

@Component({
  selector: 'app-turnover-report',
  imports: [QtyPipe],
  template: `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Тауар</th>
            <th>Қойма</th>
            <th class="num">Бастапқы</th>
            <th class="num">Кіріс</th>
            <th class="num">Шығыс</th>
            <th class="num">Соңғы</th>
          </tr>
        </thead>
        <tbody>
          @for (r of data().rows; track $index) {
            <tr>
              <td>{{ r.product_name }}</td>
              <td>{{ r.warehouse }}</td>
              <td class="num">{{ r.opening | qty }}</td>
              <td class="num pos">{{ r.incoming | qty }}</td>
              <td class="num neg">{{ r.outgoing | qty }}</td>
              <td class="num">{{ r.closing | qty }}</td>
            </tr>
          } @empty {
            <tr>
              <td class="empty" colspan="6">Деректер жоқ</td>
            </tr>
          }
        </tbody>
        <tfoot>
          <tr>
            <td>Барлығы</td>
            <td></td>
            <td class="num">{{ data().totals.opening | qty }}</td>
            <td class="num">{{ data().totals.incoming | qty }}</td>
            <td class="num">{{ data().totals.outgoing | qty }}</td>
            <td class="num">{{ data().totals.closing | qty }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `,
})
export class TurnoverReportView {
  readonly data = input.required<TurnoverReport>();
}
