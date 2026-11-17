import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { APP_CONFIG } from '../../core/config/app-config';
import { ToastService } from '../../core/ui/toast.service';
import { makeProduct } from '../../../testing/fixtures';
import { SalePage } from './sale-page';

const tick = () => new Promise((resolve) => setTimeout(resolve));

describe('SalePage', () => {
  let fixture: ComponentFixture<SalePage>;
  let http: HttpTestingController;
  let element: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [SalePage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { apiUrl: '' } },
      ],
    });
    fixture = TestBed.createComponent(SalePage);
    http = TestBed.inject(HttpTestingController);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  async function scan(code: string) {
    const input = element.querySelector<HTMLInputElement>('input.scan')!;
    input.value = code;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    return http.expectOne(`/api/pos/products/barcode/${code}/`);
  }

  it('scans a barcode into the cart and sells it', async () => {
    (await scan('4870001')).flush(makeProduct());
    await tick();
    (await scan('4870001')).flush(makeProduct());
    await fixture.whenStable();

    expect(element.querySelector('.total')?.textContent).toContain('500,00');
    const sell = element.querySelector<HTMLButtonElement>('.btn-big')!;
    expect(sell.disabled).toBe(false);

    const toast = vi.spyOn(TestBed.inject(ToastService), 'show');
    sell.click();
    const req = http.expectOne('/api/pos/sales/');
    expect(req.request.body).toEqual({ items: [{ product_id: 1, quantity: '2' }] });
    req.flush({
      id: 7,
      number: 'SAL-000007',
      status: 'POSTED',
      date: '2026-11-17T10:00:00Z',
      posted_at: '2026-11-17T10:00:00Z',
      items: [
        { product_id: 1, product_name: 'Нан', quantity: '2.000', price: '250.00', total: '500.00' },
      ],
      total: '500.00',
    });
    await fixture.whenStable();

    expect(toast).toHaveBeenCalledWith(expect.stringContaining('Чек №SAL-000007'));
    expect(element.querySelector('.receipt h3')?.textContent).toBe('Чек №SAL-000007');
    expect(element.querySelector<HTMLButtonElement>('.btn-big')!.disabled).toBe(true);
  });

  it('shows a toast when the barcode is unknown', async () => {
    const toast = vi.spyOn(TestBed.inject(ToastService), 'show');
    (await scan('000')).flush({ detail: 'Not found' }, { status: 404, statusText: 'Not Found' });
    await tick();
    expect(toast).toHaveBeenCalledWith('Штрихкод табылмады: 000', 'error');
  });

  it('shows API errors next to the sell button', async () => {
    (await scan('4870001')).flush(makeProduct());
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.btn-big')!.click();
    http
      .expectOne('/api/pos/sales/')
      .flush({ detail: ['Қалдық жетпейді.'] }, { status: 400, statusText: 'Bad Request' });
    await fixture.whenStable();
    expect(element.querySelector('aside .alert-error')?.textContent?.trim()).toBe(
      'Қалдық жетпейді.',
    );
  });
});
