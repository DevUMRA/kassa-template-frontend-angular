import { Injectable } from '@angular/core';

const STORAGE_KEY = 'kassa.auth.token';

/** API токенін localStorage-та сақтайды (жеке режимде localStorage болмаса — тек жадта). */
@Injectable({ providedIn: 'root' })
export class TokenStorage {
  private memory: string | null = null;

  get(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? this.memory;
    } catch {
      return this.memory;
    }
  }

  set(token: string): void {
    this.memory = token;
    try {
      localStorage.setItem(STORAGE_KEY, token);
    } catch {
      // localStorage қолжетімсіз — токен тек осы беттің жадында
    }
  }

  clear(): void {
    this.memory = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // елемейміз
    }
  }
}
