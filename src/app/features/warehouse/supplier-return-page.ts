import { Component, input } from '@angular/core';

import { formatDateTime, formatMoney } from '../../shared/format/format';
import { Receipt } from '../../shared/models/document';
import { ReturnScreen } from '../../shared/returns/return-screen';
import { ReturnScreenConfig } from '../../shared/returns/return-screen-config';

const SUPPLIER_RETURN: ReturnScreenConfig = {
  title: 'Жеткізушіге қайтару',
  docLabel: 'Қабылдау',
  placeholder: 'Қабылдау нөмірі, мысалы RCV-000001',
  path: '/warehouse/receipts/',
  soldTitle: 'Қабылданды',
  info: (document) => {
    const receipt = document as Receipt;
    return `${formatDateTime(receipt.posted_at)} · ${receipt.supplier} · ${formatMoney(receipt.total)}`;
  },
};

@Component({
  selector: 'app-supplier-return-page',
  imports: [ReturnScreen],
  template: `<app-return-screen [config]="config" [initialNumber]="number() ?? ''" />`,
})
export class SupplierReturnPage {
  /** Маршрут параметрі `:number` (қабылдаулар тізімінен) */
  readonly number = input<string>();
  protected readonly config = SUPPLIER_RETURN;
}
