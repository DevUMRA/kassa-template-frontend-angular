import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { APP_CONFIG } from '../config/app-config';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { makeUser } from '../../../testing/fixtures';
import { TokenStorage } from './token-storage';

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let tokens: TokenStorage;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiUrl: 'https://backend.test' } },
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    tokens = TestBed.inject(TokenStorage);
    router = TestBed.inject(Router);
  });

  afterEach(() => http.verify());

  it('logs in with a token and loads the current user', async () => {
    tokens.set('stale');
    const login = auth.login('admin', 'secret');

    const tokenReq = http.expectOne('https://backend.test/api/auth/token/');
    expect(tokenReq.request.method).toBe('POST');
    expect(tokenReq.request.body).toEqual({ username: 'admin', password: 'secret' });
    expect(tokenReq.request.headers.has('Authorization')).toBe(false);
    tokenReq.flush({ token: 'abc' });
    await new Promise((resolve) => setTimeout(resolve));

    const meReq = http.expectOne('https://backend.test/api/me/');
    expect(meReq.request.headers.get('Authorization')).toBe('Token abc');
    meReq.flush(makeUser());

    await expect(login).resolves.toEqual(makeUser());
    expect(tokens.get()).toBe('abc');
    expect(localStorage.getItem('kassa.auth.token')).toBe('abc');
    expect(auth.user()?.username).toBe('admin');
  });

  it('rejects a wrong password without storing a token', async () => {
    const login = auth.login('admin', 'wrong');
    http
      .expectOne('https://backend.test/api/auth/token/')
      .flush({ non_field_errors: ['Қате.'] }, { status: 400, statusText: 'Bad Request' });
    await expect(login).rejects.toMatchObject({ status: 400 });
    expect(tokens.get()).toBeNull();
  });

  it('ensureUser returns null and drops an invalid token on 401', async () => {
    tokens.set('expired');
    const navigate = vi.spyOn(router, 'navigate');
    const result = auth.ensureUser();
    http
      .expectOne('https://backend.test/api/me/')
      .flush({ detail: 'Invalid token.' }, { status: 401, statusText: 'Unauthorized' });
    await expect(result).resolves.toBeNull();
    expect(tokens.get()).toBeNull();
    expect(navigate).not.toHaveBeenCalled(); // бағыттауды guard жасайды
  });

  it('ensureUser keeps the token and reports other errors', async () => {
    tokens.set('abc');
    const result = auth.ensureUser();
    http.expectOne('https://backend.test/api/me/').error(new ProgressEvent('error'));
    await expect(result).resolves.toBe('error');
    expect(auth.loadError()).toEqual(['Серверге қосылу мүмкін емес. Желіні тексеріңіз.']);
    expect(tokens.get()).toBe('abc');
  });

  it('logout calls the API, ignores failures and clears the session', async () => {
    tokens.set('abc');
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const logout = auth.logout();
    const req = http.expectOne('https://backend.test/api/auth/logout/');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Token abc');
    req.flush(null, { status: 404, statusText: 'Not Found' });
    await logout;
    expect(tokens.get()).toBeNull();
    expect(auth.user()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
