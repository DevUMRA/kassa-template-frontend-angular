import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { SKIP_AUTH, SKIP_UNAUTHORIZED_REDIRECT } from '../api/http-context';
import { APP_CONFIG } from '../config/app-config';
import { AuthService } from './auth.service';
import { TokenStorage } from './token-storage';

/** Сұраныс біздің backend-ке ме: токен бөгде доменге жіберілмеуі тиіс. */
export function isApiRequest(url: string, apiUrl: string): boolean {
  return url.startsWith(`${apiUrl}/api/`);
}

/**
 * Backend сұраныстарына `Authorization: Token <token>` қосады;
 * 401 жауабында сессияны тазалап, кіру бетіне бағыттайды.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiUrl } = inject(APP_CONFIG);
  if (!isApiRequest(req.url, apiUrl)) return next(req);

  const token = req.context.get(SKIP_AUTH) ? null : inject(TokenStorage).get();
  const auth = inject(AuthService);
  const request = token ? req.clone({ setHeaders: { Authorization: `Token ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.context.get(SKIP_AUTH) &&
        !req.context.get(SKIP_UNAUTHORIZED_REDIRECT)
      ) {
        auth.handleUnauthorized();
      }
      return throwError(() => error);
    }),
  );
};
