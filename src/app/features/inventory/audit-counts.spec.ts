import { Audit, AuditItem } from './audit';
import {
  addScan,
  changedLines,
  countDifference,
  countedTotal,
  countsFromAudit,
} from './audit-counts';

const item = (overrides: Partial<AuditItem> = {}): AuditItem => ({
  product_id: 1,
  product_name: 'Нан',
  sku: 'BREAD',
  barcode: '4870001',
  expected_quantity: '5.000',
  counted_quantity: null,
  is_counted: false,
  difference: null,
  ...overrides,
});

describe('audit counts', () => {
  it('reads counted quantities from the audit', () => {
    const audit = {
      items: [item(), item({ product_id: 2, counted_quantity: '3.000', is_counted: true })],
    } as Audit;
    const counts = countsFromAudit(audit);
    expect([...counts]).toEqual([
      [1, ''],
      [2, '3.000'],
    ]);
    expect(countedTotal(counts)).toBe(1);
  });

  it('computes the difference only for counted items', () => {
    expect(countDifference(item(), '')).toBeNull();
    expect(countDifference(item(), '3')).toBe(-2);
    expect(countDifference(item({ expected_quantity: null }), '1')).toBe(1);
  });

  it('adds scans with the step (1 by default)', () => {
    expect(addScan(undefined, '1')).toBe('1');
    expect(addScan('2', '')).toBe('3');
    expect(addScan('0.1', '0.2')).toBe('0.3');
  });

  it('sends only changed, non-empty counts', () => {
    const counts = new Map([
      [1, '4'],
      [2, ''],
      [3, '7'],
    ]);
    expect(changedLines(new Set([1, 2]), counts)).toEqual([{ product_id: 1, quantity: '4' }]);
  });
});
