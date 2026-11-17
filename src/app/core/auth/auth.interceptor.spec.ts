import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';
import { authInterceptor, isApiRequest } from './auth.interceptor';
import { TokenStorage } from './token-storage';

describe('authInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  let tokens: TokenStorage;

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
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    tokens = TestBed.inject(TokenStorage);
  });

  afterEach(() => http.verify());

  it('adds the Token header to backend requests', () => {
    tokens.set('abc');
    void firstValueFrom(client.get('https://backend.test/api/me/'));
    const req = http.expectOne('https://backend.test/api/me/');
    expect(req.request.headers.get('Authorization')).toBe('Token abc');
    req.flush({});
  });

  it('never sends the token to other hosts', () => {
    tokens.set('abc');
    void firstValueFrom(client.get('https://cdn.example.com/api/file.json'));
    const req = http.expectOne('https://cdn.example.com/api/file.json');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('sends the user to the login page with next on 401', async () => {
    tokens.set('abc');
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'url', 'get').mockReturnValue('/inventory/5');
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const request = firstValueFrom(client.get('https://backend.test/api/documents/'));
    http
      .expectOne('https://backend.test/api/documents/')
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    await expect(request).rejects.toMatchObject({ status: 401 });
    expect(tokens.get()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { next: '/inventory/5' } });
  });

  it('isApiRequest matches only the configured backend', () => {
    expect(isApiRequest('/api/me/', '')).toBe(true);
    expect(isApiRequest('https://evil.test/api/me/', '')).toBe(false);
    expect(isApiRequest('https://backend.test/api/me/', 'https://backend.test')).toBe(true);
    expect(isApiRequest('https://backend.test.evil/api/', 'https://backend.test')).toBe(false);
  });
});
