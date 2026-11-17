import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiError, errorMessages } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { AlertBox } from '../../shared/ui/alert-box';

/** Ішкі жол ғана (`/inventory/5`): бөгде сайтқа бағыттаудан қорғау. */
export function safeNextUrl(next: string | undefined): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, AlertBox],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** `?next=` — кіргеннен кейін ашылатын бет. */
  readonly next = input<string>();

  private readonly usernameInput = viewChild.required<ElementRef<HTMLInputElement>>('username');

  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  protected readonly errors = signal<readonly string[] | null>(null);
  protected readonly submitting = signal(false);

  constructor() {
    afterNextRender(() => this.usernameInput().nativeElement.focus());
  }

  protected async logIn(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errors.set(null);
    const { username, password } = this.form.getRawValue();
    try {
      await this.auth.login(username, password);
      await this.router.navigateByUrl(safeNextUrl(this.next()));
    } catch (error) {
      this.errors.set(
        error instanceof ApiError && error.status === 400
          ? ['Логин немесе құпия сөз қате.']
          : errorMessages(error),
      );
      this.form.controls.password.reset();
    } finally {
      this.submitting.set(false);
    }
  }
}
