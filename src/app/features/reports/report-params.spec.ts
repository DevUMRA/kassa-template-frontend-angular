import { pageFromUrl, reportParams } from './report-params';

const form = {
  date_from: '2026-11-01',
  date_to: '2026-11-17',
  warehouse: '2',
  group_by: 'product',
  search: ' нан ',
  low: '5',
};

describe('reportParams', () => {
  it('sends only the filters each report understands', () => {
    expect(reportParams('stock', form)).toEqual({ warehouse: '2', search: 'нан', low: '5' });
    expect(reportParams('sales', form)).toEqual({
      warehouse: '2',
      date_from: '2026-11-01',
      date_to: '2026-11-17',
      group_by: 'product',
    });
    expect(reportParams('movements', form, 3)).toMatchObject({ page: 3 });
    expect(reportParams('turnover', form, 3)).not.toHaveProperty('page');
  });

  it('parses DRF page links', () => {
    expect(pageFromUrl('http://x/api/reports/movements/?page=4&date_from=1')).toBe(4);
    expect(pageFromUrl('http://x/api/reports/movements/?date_from=1')).toBe(1);
    expect(pageFromUrl(null)).toBeNull();
  });
});
