import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { availableSections } from './sections';

/** Бөлім рөлге қолжетімсіз болса — алғашқы қолжетімді бөлімге (`/`). Маршрут data.section. */
export const sectionGuard: CanActivateFn = (route) => {
  const user = inject(AuthService).user();
  if (!user) return true; // жүктеу қатесі қабық бетінде көрсетіледі
  const section = route.data['section'] as string | undefined;
  return availableSections(user).some((s) => s === section)
    ? true
    : inject(Router).createUrlTree(['/']);
};

/** `/` → алғашқы қолжетімді бөлім; бөлім жоқ болса — бет ашылады (хабарламамен). */
export const firstSectionGuard: CanActivateFn = () => {
  const [first] = availableSections(inject(AuthService).user());
  return first ? inject(Router).createUrlTree(['/', first]) : true;
};
