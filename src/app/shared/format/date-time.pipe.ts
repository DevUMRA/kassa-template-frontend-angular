import { Pipe, PipeTransform } from '@angular/core';

import { formatDateTime } from './format';

@Pipe({ name: 'dateTime' })
export class DateTimePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatDateTime(value);
  }
}
