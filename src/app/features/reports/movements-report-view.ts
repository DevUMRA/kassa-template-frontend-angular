import { Component, computed, input, output } from '@angular/core';

import { signClass } from '../../shared/format/format';
import { DateTimePipe } from '../../shared/format/date-time.pipe';
import { QtyPipe } from '../../shared/format/qty.pipe';
import { MovementsReport } from './report';
import { pageFromUrl } from './report-params';

type Movement = MovementsReport['results'][number];

/** Кері жазбада — күшін жою себебі, әйтпесе құжаттың түсініктемесі. */
export function movementReason(m: Movement): string {
  if (m.is_reversal) return m.cancel_reason ? `Күшін жою: ${m.cancel_reason}` : '';
  return m.comment || '';
}

@Component({
  selector: 'app-movements-report',
  imports: [QtyPipe, DateTimePipe],
  template: `
    <div class="stack">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Уақыты</th>
              <th>Тауар</th>
              <th>Қойма</th>
              <th class="num">Саны</th>
              <th>Құжат</th>
              <th>Себебі</th>
              <th>Қызметкер</th>
            </tr>
          </thead>
          <tbody>
            @for (m of data().results; track m.id) {
              <tr>
                <td>{{ m.date | dateTime }}</td>
                <td>{{ m.product_name }}</td>
                <td>{{ m.warehouse }}</td>
                <td [class]="signClass(m.quantity)">{{ m.quantity | qty }}</td>
                <td>
                  {{ m.doc_type_display }} №{{ m.document_number
                  }}{{ m.is_reversal ? ' (кері)' : '' }}
                </td>
                <td>{{ reason(m) }}</td>
                <td>{{ m.user }}</td>
              </tr>
            } @empty {
              <tr>
                <td class="empty" colspan="7">Деректер жоқ</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="row">
        <span class="muted">Барлығы: {{ data().count }}</span>
        <span class="spacer"></span>
        <button
          class="btn"
          type="button"
          [disabled]="!data().previous"
          (click)="go(previousPage())"
        >
          ← Алдыңғы
        </button>
        <button class="btn" type="button" [disabled]="!data().next" (click)="go(nextPage())">
          Келесі →
        </button>
      </div>
    </div>
  `,
})
export class MovementsReportView {
  readonly data = input.required<MovementsReport>();
  readonly pageChange = output<number>();

  protected readonly signClass = signClass;
  protected readonly reason = movementReason;
  protected readonly previousPage = computed(() => pageFromUrl(this.data().previous));
  protected readonly nextPage = computed(() => pageFromUrl(this.data().next));

  protected go(page: number | null): void {
    if (page) this.pageChange.emit(page);
  }
}
