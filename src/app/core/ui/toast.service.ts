import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastMessage {
  readonly text: string;
  readonly kind: ToastKind;
}

const TOAST_DURATION_MS = 4000;

/** Экранның төменгі бұрышындағы қысқа хабарлама (4 секунд). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly current = signal<ToastMessage | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly message = this.current.asReadonly();

  show(text: string, kind: ToastKind = 'success'): void {
    this.current.set({ text, kind });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.current.set(null), TOAST_DURATION_MS);
  }
}
