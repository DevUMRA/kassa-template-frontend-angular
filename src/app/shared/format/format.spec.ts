import {
  formatDate,
  formatMoney,
  formatQty,
  isoMonthStart,
  isoToday,
  roundQty,
  signClass,
} from './format';

// Intl ru-RU мыңдықтарды тар бос орынмен бөледі
const normalize = (text: string) => text.replace(/\s/g, ' ');

describe('format', () => {
  it('formats money and quantities like the old UI', () => {
    expect(normalize(formatMoney('1234.5'))).toBe('1 234,50 ₸');
    expect(normalize(formatMoney(null))).toBe('0,00 ₸');
    expect(formatQty('2.000')).toBe('2');
    expect(formatQty('1.250')).toBe('1,25');
  });

  it('formats dates and builds ISO period defaults', () => {
    expect(formatDate('2026-11-17')).toBe('17.11.2026');
    expect(formatDate(null)).toBe('—');
    const now = new Date(2026, 10, 17, 12);
    expect(isoToday(now)).toBe('2026-11-17');
    expect(isoMonthStart(now)).toBe('2026-11-01');
  });

  it('signClass and roundQty', () => {
    expect(signClass('-1')).toBe('num neg');
    expect(signClass(2)).toBe('num pos');
    expect(signClass(0)).toBe('num');
    expect(roundQty(0.1 + 0.2)).toBe(0.3);
  });
});
