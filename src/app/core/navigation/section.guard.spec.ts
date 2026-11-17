import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user';
import { makeUser } from '../../../testing/fixtures';
import { firstSectionGuard, sectionGuard } from './section.guard';
import { availableSections, needsWarehouse } from './sections';

describe('section guards', () => {
  const user = signal<CurrentUser | null>(null);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { user } }],
    });
  });

  const route = (section: string) => ({ data: { section } }) as unknown as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  const serialize = (tree: unknown) => TestBed.inject(Router).serializeUrl(tree as UrlTree);

  it('blocks sections that are not in /me/ sections', () => {
    user.set(makeUser({ sections: ['pos'] }));
    expect(TestBed.runInInjectionContext(() => sectionGuard(route('pos'), state))).toBe(true);
    expect(
      serialize(TestBed.runInInjectionContext(() => sectionGuard(route('documents'), state))),
    ).toBe('/');
  });

  it('redirects / to the first available section', () => {
    user.set(makeUser({ sections: ['warehouse', 'inventory', 'reports'] }));
    expect(
      serialize(TestBed.runInInjectionContext(() => firstSectionGuard(route(''), state))),
    ).toBe('/warehouse');
    user.set(makeUser({ sections: [] }));
    expect(TestBed.runInInjectionContext(() => firstSectionGuard(route(''), state))).toBe(true);
  });

  it('ignores unknown sections and checks warehouse requirement', () => {
    expect(availableSections(makeUser({ sections: ['pos', 'future'] }))).toEqual(['pos']);
    const noWarehouse = (isManager: boolean) =>
      makeUser({ warehouse: null, is_manager: isManager });
    expect(needsWarehouse('pos', noWarehouse(true))).toBe(true);
    expect(needsWarehouse('inventory', noWarehouse(true))).toBe(false);
    expect(needsWarehouse('inventory', noWarehouse(false))).toBe(true);
    expect(needsWarehouse('reports', noWarehouse(false))).toBe(false);
    expect(needsWarehouse('pos', makeUser())).toBe(false);
  });
});
