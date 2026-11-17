import { HttpErrorResponse } from '@angular/common/http';

/** API өрістерінің атаулары — қате хабарының алдына қойылады («Себебі: Бұл мән міндетті.»). */
const FIELD_LABELS: Readonly<Record<string, string>> = {
  items: 'Тауарлар',
  product_id: 'Тауар',
  barcode: 'Штрихкод',
  quantity: 'Саны',
  price: 'Бағасы',
  comment: 'Түсініктеме',
  reason: 'Себебі',
  supplier_id: 'Жеткізуші',
  product_ids: 'Тауарлар',
  date_from: 'Басы',
  date_to: 'Соңы',
  group_by: 'Топтау',
  warehouse: 'Қойма',
  doc_type: 'Түрі',
  status: 'Мәртебесі',
  low: 'Қалдық ≤',
  search: 'Іздеу',
};

export const NETWORK_ERROR_MESSAGE = 'Серверге қосылу мүмкін емес. Желіні тексеріңіз.';

/** API қатесі: пайдаланушыға көрсетілетін хабарлар және HTTP статусы (0 — желі қатесі). */
export class ApiError extends Error {
  constructor(
    readonly messages: readonly string[],
    readonly status: number,
  ) {
    super(messages.join('\n'));
    this.name = 'ApiError';
  }
}

/** DRF қателерінің кез келген пішінін ({detail}, өріс қателері, тізімдер) жолдар тізіміне жинайды. */
export function collectMessages(data: unknown, prefix = ''): string[] {
  if (data === null || data === undefined) return [];
  if (typeof data === 'string') return [prefix + data];
  if (Array.isArray(data)) {
    // Жолдар тізімінің қатесі ({items: [{}, {quantity: [...]}]}) — жол нөмірімен
    const perLine = data.some((x) => x !== null && typeof x === 'object' && !Array.isArray(x));
    return data.flatMap((x, i) => collectMessages(x, perLine ? `${prefix}${i + 1}-жол: ` : prefix));
  }
  if (typeof data === 'object') {
    return Object.entries(data).flatMap(([key, value]) => {
      const label =
        key === 'detail' || key === 'non_field_errors' ? '' : `${FIELD_LABELS[key] ?? key}: `;
      return collectMessages(value, prefix + label);
    });
  }
  return [prefix + String(data)];
}

/** HttpClient қатесін ApiError-ға айналдырады. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return new ApiError([NETWORK_ERROR_MESSAGE], 0);
    if (error.status === 401) return new ApiError(['Сессия аяқталды.'], 401);
    // JSON емес жауап (мысалы, proxy-дің HTML беті) мәтін ретінде көрсетілмейді
    const messages = typeof error.error === 'object' ? collectMessages(error.error) : [];
    return new ApiError(messages.length ? messages : [`Қате: HTTP ${error.status}`], error.status);
  }
  return new ApiError([error instanceof Error ? error.message : String(error)], 0);
}

/** catch блогындағы кез келген қатенің хабарлары. */
export function errorMessages(error: unknown): readonly string[] {
  return toApiError(error).messages;
}
