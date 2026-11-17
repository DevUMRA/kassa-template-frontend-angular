import { formatMoney } from '../format/format';
import { BaseDocument, statusTitle } from '../models/document';

/** «№RET-000001 (Өткізілді, 1 000,00 ₸ — ақаулы), …» */
export function describeReturns(returns: readonly BaseDocument[]): string {
  return returns
    .map(
      (r) =>
        `№${r.number} (${statusTitle(r.status)}, ${formatMoney(r.total)}` +
        `${r.comment ? ` — ${r.comment}` : ''}${r.cancel_reason ? `; күшін жою себебі: ${r.cancel_reason}` : ''})`,
    )
    .join(', ');
}
