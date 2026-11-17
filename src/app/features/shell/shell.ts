import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { Section } from '../../core/auth/current-user';
import {
  availableSections,
  isSection,
  needsWarehouse,
  SECTION_TITLES,
} from '../../core/navigation/sections';
import { AlertBox } from '../../shared/ui/alert-box';

/** Белсенді маршруттың `data.section` мәні (ең терең сегменттен). */
function activeSection(root: ActivatedRouteSnapshot): Section | null {
  let section: Section | null = null;
  for (let route: ActivatedRouteSnapshot | null = root; route; route = route.firstChild) {
    const value = route.data['section'] as unknown;
    if (typeof value === 'string' && isSection(value)) section = value;
  }
  return section;
}

/** Кірген соңғы қабық: жоғарғы панель (бөлімдер, пайдаланушы, шығу) және бөлім беті. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, AlertBox],
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly titles = SECTION_TITLES;
  protected readonly sections = computed(() => availableSections(this.auth.user()));
  protected readonly active = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => activeSection(this.router.routerState.snapshot.root)),
    ),
    { initialValue: activeSection(this.router.routerState.snapshot.root) },
  );
  protected readonly userInfo = computed(() => {
    const user = this.auth.user();
    if (!user) return '';
    return `${user.full_name} · ${user.role_display}${user.warehouse ? ' · ' + user.warehouse.name : ''}`;
  });
  protected readonly warehouseMissing = computed(() => {
    const user = this.auth.user();
    const section = this.active();
    return !!user && !!section && needsWarehouse(section, user);
  });

  protected logout(): void {
    void this.auth.logout();
  }
}
