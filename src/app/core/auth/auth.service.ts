import { HttpContext } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ApiError } from '../api/api-error';
import { ApiService } from '../api/api.service';
import { SKIP_AUTH, SKIP_UNAUTHORIZED_REDIRECT } from '../api/http-context';
import { CurrentUser } from './current-user';
import { TokenStorage } from './token-storage';

interface TokenResponse {
  readonly token: string;
}

/** Кіру/шығу және ағымдағы пайдаланушы (`/api/me/`). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly tokens = inject(TokenStorage);
  private readonly router = inject(Router);

  private readonly currentUser = signal<CurrentUser | null>(null);
  /** `/me/` жүктелмеді (401-ден басқа қате) — қабық бетінде көрсетіледі. */
  private readonly userLoadError = signal<readonly string[] | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly loadError = this.userLoadError.asReadonly();
  readonly isManager = computed(() => this.currentUser()?.is_manager ?? false);

  hasToken(): boolean {
    return this.tokens.get() !== null;
  }

  /** `POST /api/auth/token/` → токен сақталады, содан кейін `/me/` жүктеледі. */
  async login(username: string, password: string): Promise<CurrentUser> {
    this.tokens.clear();
    this.currentUser.set(null);
    const { token } = await this.api.post<TokenResponse>(
      '/auth/token/',
      { username, password },
      { context: new HttpContext().set(SKIP_AUTH, true) },
    );
    this.tokens.set(token);
    return this.loadUser();
  }

  async loadUser(): Promise<CurrentUser> {
    const user = await this.api.get<CurrentUser>('/me/', {
      context: new HttpContext().set(SKIP_UNAUTHORIZED_REDIRECT, true),
    });
    this.currentUser.set(user);
    this.userLoadError.set(null);
    return user;
  }

  /**
   * Токен бар болса, пайдаланушыны жүктейді (бір рет). Токен жарамсыз (401) — null.
   * Басқа қате (желі, 500) — пайдаланушы null, ал қате `loadError`-да.
   */
  async ensureUser(): Promise<CurrentUser | 'error' | null> {
    const loaded = this.currentUser();
    if (loaded) return loaded;
    if (!this.hasToken()) return null;
    try {
      return await this.loadUser();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        this.tokens.clear();
        return null;
      }
      this.userLoadError.set(error instanceof ApiError ? error.messages : [String(error)]);
      return 'error';
    }
  }

  /** `POST /api/auth/logout/` (қатесі елеусіз), токен өшіріледі, кіру беті. */
  async logout(): Promise<void> {
    if (this.hasToken()) {
      try {
        await this.api.post<void>('/auth/logout/', null, {
          context: new HttpContext().set(SKIP_UNAUTHORIZED_REDIRECT, true),
        });
      } catch {
        // Backend-те эндпоинт болмауы немесе токен ескіруі мүмкін — бәрібір шығамыз
      }
    }
    this.clearSession();
    await this.router.navigate(['/login']);
  }

  /** Сессия бітті (401): токен өшіріліп, кіру бетіне `next` параметрімен бағытталады. */
  handleUnauthorized(): void {
    this.clearSession();
    const current = this.router.url;
    if (current.startsWith('/login')) return;
    void this.router.navigate(['/login'], {
      queryParams: current && current !== '/' ? { next: current } : {},
    });
  }

  private clearSession(): void {
    this.tokens.clear();
    this.currentUser.set(null);
    this.userLoadError.set(null);
  }
}
