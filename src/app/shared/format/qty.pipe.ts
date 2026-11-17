import { Pipe, PipeTransform } from '@angular/core';

import { formatQty } from './format';

@Pipe({ name: 'qty' })
export class QtyPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    return formatQty(value);
  }
}
