import { Component, computed, input } from '@angular/core';

export type AlertKind = 'error' | 'success' | 'info';

/** Хабарлама блогы: бір хабар — мәтін, бірнешеу — тізім. */
@Component({
  selector: 'app-alert-box',
  template: `
    <div [class]="'alert alert-' + kind()" [attr.role]="kind() === 'error' ? 'alert' : 'status'">
      @if (list().length === 1) {
        {{ list()[0] }}
      } @else {
        <ul>
          @for (message of list(); track $index) {
            <li>{{ message }}</li>
          }
        </ul>
      }
    </div>
  `,
})
export class AlertBox {
  readonly messages = input.required<string | readonly string[]>();
  readonly kind = input<AlertKind>('error');

  protected readonly list = computed(() => {
    const value = this.messages();
    return typeof value === 'string' ? [value] : value;
  });
}
