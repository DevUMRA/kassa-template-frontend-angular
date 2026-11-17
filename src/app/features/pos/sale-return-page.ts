import { Component } from '@angular/core';

import { formatDateTime, formatMoney } from '../../shared/format/format';
import { Sale } from '../../shared/models/document';
import { ReturnScreen } from '../../shared/returns/return-screen';
import { ReturnScreenConfig } from '../../shared/returns/return-screen-config';

const SALE_RETURN: ReturnScreenConfig = {
  title: 'Сатудан қайтару',
  docLabel: 'Чек',
  placeholder: 'Чек нөмірі, мысалы SAL-000034',
  path: '/pos/sales/',
  soldTitle: 'Сатылды',
  info: (document) => {
    const sale = document as Sale;
    return `${formatDateTime(sale.posted_at)} · ${sale.cashier} · ${formatMoney(sale.total)}`;
  },
};

@Component({
  selector: 'app-sale-return-page',
  imports: [ReturnScreen],
  template: `<app-return-screen [config]="config" />`,
})
export class SaleReturnPage {
  protected readonly config = SALE_RETURN;
}
