import { computed, inject, Signal } from '@angular/core';

import { AuthService } from './auth.service';

/** Ағымдағы қызметкердің қоймасының атауы (бөлімдер қоймасыз ашылмайды). */
export function injectWarehouseName(): Signal<string> {
  const auth = inject(AuthService);
  return computed(() => auth.user()?.warehouse?.name ?? '');
}
