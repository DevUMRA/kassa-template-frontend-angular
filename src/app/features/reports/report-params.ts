import { QueryParams } from '../../core/api/api.service';
import { ReportKey, REPORTS } from './report';

export interface ReportFormValue {
  readonly date_from: string;
  readonly date_to: string;
  readonly warehouse: string;
  readonly group_by: string;
  readonly search: string;
  readonly low: string;
}

/** Есепке қатысты параметрлер ғана жіберіледі. */
export function reportParams(key: ReportKey, form: ReportFormValue, page?: number): QueryParams {
  const definition = REPORTS.find((r) => r.key === key);
  const params: Record<string, string | number> = { warehouse: form.warehouse };
  if (definition?.period)
    Object.assign(params, { date_from: form.date_from, date_to: form.date_to });
  if (key === 'sales') params['group_by'] = form.group_by;
  if (key === 'stock') Object.assign(params, { search: form.search.trim(), low: form.low });
  if (key === 'movements' && page) params['page'] = page;
  return params;
}

/** DRF беттеу сілтемесінен бет нөмірі (`?page=` жоқ болса — 1). */
export function pageFromUrl(url: string | null): number | null {
  if (!url) return null;
  return Number(new URL(url, 'http://localhost').searchParams.get('page') || 1);
}
