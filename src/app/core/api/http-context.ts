import { HttpContextToken } from '@angular/common/http';

/** `Authorization` тақырыбын қоспау (мысалы, токен алу сұранысы). */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

/** 401 жауабында кіру бетіне бағыттамау — шақырушы өзі шешеді. */
export const SKIP_UNAUTHORIZED_REDIRECT = new HttpContextToken<boolean>(() => false);
