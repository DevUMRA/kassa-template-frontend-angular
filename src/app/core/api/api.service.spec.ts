import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { APP_CONFIG } from '../config/app-config';
import { ApiError } from './api-error';
import { ApiService, toHttpParams } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  function setUp(apiUrl: string): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiUrl } },
      ],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  }

  afterEach(() => http.verify());

  it('builds URLs from the runtime apiUrl', () => {
    setUp('https://backend.test');
    expect(api.url('/me/')).toBe('https://backend.test/api/me/');
  });

  it('uses same-origin /api when apiUrl is empty (dev proxy)', async () => {
    setUp('');
    const promise = api.get<{ ok: boolean }>('/me/');
    http.expectOne('/api/me/').flush({ ok: true });
    await expect(promise).resolves.toEqual({ ok: true });
  });

  it('drops empty query params', async () => {
    setUp('');
    const promise = api.get('/documents/', { params: { status: '', search: 'SAL', page: 2 } });
    const req = http.expectOne((r) => r.url === '/api/documents/');
    expect(req.request.params.keys()).toEqual(['search', 'page']);
    req.flush({});
    await promise;
  });

  it('turns HTTP errors into ApiError', async () => {
    setUp('');
    const promise = api.post('/pos/sales/', { items: [] });
    http
      .expectOne('/api/pos/sales/')
      .flush({ items: ['Бос.'] }, { status: 400, statusText: 'Bad Request' });
    await expect(promise).rejects.toEqual(new ApiError(['Тауарлар: Бос.'], 400));
  });

  it('collects all pages', async () => {
    setUp('');
    const promise = api.getAll<number>('/warehouse/suppliers/');
    http
      .expectOne('/api/warehouse/suppliers/?page=1')
      .flush({ count: 3, next: 'x?page=2', previous: null, results: [1, 2] });
    await new Promise((resolve) => setTimeout(resolve));
    http
      .expectOne('/api/warehouse/suppliers/?page=2')
      .flush({ count: 3, next: null, previous: 'x', results: [3] });
    await expect(promise).resolves.toEqual([1, 2, 3]);
  });

  it('toHttpParams keeps zero and false', () => {
    expect(toHttpParams({ a: 0, b: false, c: null }).toString()).toBe('a=0&b=false');
  });
});
