import { HttpErrorResponse } from '@angular/common/http';

import { ApiError, collectMessages, NETWORK_ERROR_MESSAGE, toApiError } from './api-error';

describe('collectMessages', () => {
  it('flattens DRF detail and field errors with Kazakh labels', () => {
    expect(collectMessages({ detail: ['Қалдық жетпейді.'] })).toEqual(['Қалдық жетпейді.']);
    expect(collectMessages({ reason: ['Бұл мән міндетті.'] })).toEqual([
      'Себебі: Бұл мән міндетті.',
    ]);
    expect(collectMessages({ non_field_errors: ['Қате.'] })).toEqual(['Қате.']);
  });

  it('numbers per-line errors', () => {
    expect(collectMessages({ items: [{}, { quantity: ['Тым аз.'] }] })).toEqual([
      'Тауарлар: 2-жол: Саны: Тым аз.',
    ]);
  });
});

describe('toApiError', () => {
  it('maps network failures', () => {
    const error = toApiError(new HttpErrorResponse({ status: 0 }));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.messages).toEqual([NETWORK_ERROR_MESSAGE]);
  });

  it('uses the HTTP status when the body is not JSON', () => {
    const error = toApiError(new HttpErrorResponse({ status: 502, error: '<html>' }));
    expect(error.messages).toEqual(['Қате: HTTP 502']);
    expect(error.status).toBe(502);
  });

  it('collects JSON body messages', () => {
    const error = toApiError(new HttpErrorResponse({ status: 400, error: { detail: 'Жоқ.' } }));
    expect(error.messages).toEqual(['Жоқ.']);
  });
});
