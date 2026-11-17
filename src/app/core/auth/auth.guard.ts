import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/** Кірмеген пайдаланушыны кіру бетіне (`?next=` — қайтатын бет) бағыттайды. */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = await auth.ensureUser();
  if (user) return true; // 'error' — қабық бетінде қате көрсетіледі
  return router.createUrlTree(['/login'], {
    queryParams: state.url && state.url !== '/' ? { next: state.url } : {},
  });
};

/** Кірген пайдаланушыға кіру беті керек емес. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.hasToken() ? inject(Router).createUrlTree(['/']) : true;
};
