import { Pipe, PipeTransform } from '@angular/core';

import { formatMoney } from './format';

@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    return formatMoney(value);
  }
}
