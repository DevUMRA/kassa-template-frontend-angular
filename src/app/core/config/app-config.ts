import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';

/** Іске қосылу кезіндегі баптаулар: `/config.js` → `window.__APP_CONFIG__`. */
export interface AppConfig {
  /** Backend адресі, мысалы `https://team-1-backend.example.kz`. Бос — сол домен (dev proxy). */
  readonly apiUrl: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig>;
  }
}

/** Баптауларды тексеріп, қалыпқа келтіреді: соңғы `/` алынады, мән жоқ болса — бос жол. */
export function readAppConfig(source: Partial<AppConfig> | null | undefined): AppConfig {
  const raw = typeof source?.apiUrl === 'string' ? source.apiUrl.trim() : '';
  return { apiUrl: raw.replace(/\/+$/, '') };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => readAppConfig(inject(DOCUMENT).defaultView?.__APP_CONFIG__),
});
