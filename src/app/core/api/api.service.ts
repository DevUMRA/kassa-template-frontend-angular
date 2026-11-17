import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';
import { toApiError } from './api-error';
import { Paginated } from './paginated';

export type QueryParams = Readonly<Record<string, string | number | boolean | null | undefined>>;

export interface RequestOptions {
  readonly params?: QueryParams;
  readonly context?: HttpContext;
}

/** Бос мәндерді ('' / null / undefined) тастап, HttpParams жасайды. */
export function toHttpParams(params: QueryParams | undefined): HttpParams {
  let result = new HttpParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === '' || value === null || value === undefined) continue;
    result = result.set(key, String(value));
  }
  return result;
}

/**
 * Backend API клиенті: `{apiUrl}/api{path}`. Қателер ApiError-ға айналады,
 * токенді authInterceptor қосады.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  /** `/me/` → `https://backend.example.kz/api/me/` */
  url(path: string): string {
    return `${this.config.apiUrl}/api${path}`;
  }

  get$<T>(path: string, options: RequestOptions = {}): Observable<T> {
    return this.http
      .get<T>(this.url(path), { params: toHttpParams(options.params), context: options.context })
      .pipe(catchError((error: unknown) => throwError(() => toApiError(error))));
  }

  get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return firstValueFrom(this.get$<T>(path, options));
  }

  post<T>(path: string, body: unknown, options: RequestOptions = {}): Promise<T> {
    return firstValueFrom(
      this.http
        .post<T>(this.url(path), body, {
          params: toHttpParams(options.params),
          context: options.context,
        })
        .pipe(catchError((error: unknown) => throwError(() => toApiError(error)))),
    );
  }

  /** Беттелген тізімнің барлық беттерін жинайды. */
  async getAll<T>(path: string): Promise<T[]> {
    const all: T[] = [];
    for (let page = 1; ; page += 1) {
      const data = await this.get<Paginated<T>>(path, { params: { page } });
      all.push(...data.results);
      if (!data.next) return all;
    }
  }
}
