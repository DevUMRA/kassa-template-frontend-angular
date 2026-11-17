import { Component, computed, inject } from '@angular/core';

import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div [class]="classes()" role="status" aria-live="polite" [hidden]="!toast.message()">
      {{ toast.message()?.text }}
    </div>
  `,
})
export class Toast {
  protected readonly toast = inject(ToastService);
  protected readonly classes = computed(
    () => `toast alert alert-${this.toast.message()?.kind ?? 'success'}`,
  );
}
