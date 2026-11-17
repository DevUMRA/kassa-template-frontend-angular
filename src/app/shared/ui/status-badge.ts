import { Component, computed, input } from '@angular/core';

import { statusTitle } from '../models/document';

@Component({
  selector: 'app-status-badge',
  template: `<span [class]="'badge badge-' + status()">{{ title() }}</span>`,
})
export class StatusBadge {
  readonly status = input.required<string>();
  protected readonly title = computed(() => statusTitle(this.status()));
}
