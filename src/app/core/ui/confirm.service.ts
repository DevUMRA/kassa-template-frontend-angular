import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

/** Браузердің confirm() терезесі (тесттерде ауыстыруға ыңғайлы). */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly window = inject(DOCUMENT).defaultView;

  ask(question: string): boolean {
    return this.window?.confirm(question) ?? false;
  }
}
