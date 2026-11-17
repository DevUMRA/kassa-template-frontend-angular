import { roundQty } from '../../shared/format/format';
import { Audit, AuditItem, CountLine } from './audit';

/** product_id → енгізілген нақты сан (жол; саналмаса — '') */
export type Counts = ReadonlyMap<number, string>;

export function countsFromAudit(audit: Audit): Map<number, string> {
  return new Map(audit.items.map((item) => [item.product_id, item.counted_quantity ?? '']));
}

export function countedTotal(counts: Counts): number {
  return [...counts.values()].filter((value) => value !== '').length;
}

/** Нақты − есептік; саналмаса — null. */
export function countDifference(item: AuditItem, value: string | undefined): number | null {
  if (value === undefined || value === '') return null;
  return Number(value) - Number(item.expected_quantity ?? 0);
}

/** Сканерлеу: ағымдағы санға қадам қосылады (қадам бос болса — 1). */
export function addScan(current: string | undefined, step: string): string {
  return String(roundQty(Number(current || 0) + Number(step || 1)));
}

/** Сақталатын жолдар: тек өзгертілгендері, бос мәндер жіберілмейді. */
export function changedLines(dirty: ReadonlySet<number>, counts: Counts): CountLine[] {
  return [...dirty]
    .filter((productId) => (counts.get(productId) ?? '') !== '')
    .map((productId) => ({ product_id: productId, quantity: String(counts.get(productId)) }));
}
