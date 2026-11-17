import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { makeUser } from '../../../testing/fixtures';

describe('auth guards', () => {
  const ensureUser = vi.fn();
  const hasToken = vi.fn();

  beforeEach(() => {
    ensureUser.mockReset();
    hasToken.mockReset();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { ensureUser, hasToken } }],
    });
  });

  function runAuthGuard(url: string): Promise<boolean | UrlTree> {
    return TestBed.runInInjectionContext(
      () =>
        authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot) as Promise<
          boolean | UrlTree
        >,
    );
  }

  it('lets a logged-in user through', async () => {
    ensureUser.mockResolvedValue(makeUser());
    await expect(runAuthGuard('/pos')).resolves.toBe(true);
  });

  it('lets the shell show load errors', async () => {
    ensureUser.mockResolvedValue('error');
    await expect(runAuthGuard('/pos')).resolves.toBe(true);
  });

  it('redirects anonymous users to /login?next=', async () => {
    ensureUser.mockResolvedValue(null);
    const result = await runAuthGuard('/inventory/3');
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?next=%2Finventory%2F3');
  });

  it('guestGuard sends users with a token to the app', () => {
    hasToken.mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/');

    hasToken.mockReturnValue(false);
    expect(
      TestBed.runInInjectionContext(() =>
        guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      ),
    ).toBe(true);
  });
});
