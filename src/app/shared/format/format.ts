/** Сандар мен күндерді бұрынғы интерфейстегідей пішімдеу (ru-RU: 1 234,50). */
const moneyFormat = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const qtyFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 3 });

type NumericValue = string | number | null | undefined;

/** 1234.5 → «1 234,50 ₸» */
export function formatMoney(value: NumericValue): string {
  return `${moneyFormat.format(Number(value || 0))} ₸`;
}

/** 2.000 → «2», 1.25 → «1,25» */
export function formatQty(value: NumericValue): string {
  return qtyFormat.format(Number(value || 0));
}

/** ISO уақыт → жергілікті күн мен уақыт; бос — «—». */
export function formatDateTime(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleString('ru-RU') : '—';
}

/** ISO күн (YYYY-MM-DD) немесе уақыт → жергілікті күн; бос — «—». */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('ru-RU');
}

/** Бүгін, YYYY-MM-DD (жергілікті уақыт). */
export function isoToday(now: Date = new Date()): string {
  return now.toLocaleDateString('sv-SE');
}

/** Ағымдағы айдың бірінші күні, YYYY-MM-DD. */
export function isoMonthStart(now: Date = new Date()): string {
  return `${isoToday(now).slice(0, 8)}01`;
}

/** Теріс — қызыл, оң — жасыл. */
export function signClass(value: NumericValue): string {
  const number = Number(value);
  return number < 0 ? 'num neg' : number > 0 ? 'num pos' : 'num';
}

/** Санды мыңдық дәлдікке дөңгелектейді (0.1 + 0.2 қателерінен). */
export function roundQty(value: number): number {
  return Math.round(value * 1000) / 1000;
}
