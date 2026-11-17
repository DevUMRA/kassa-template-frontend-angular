import { tableToCsv } from './csv-export';

describe('tableToCsv', () => {
  it('uses ; separators, quotes special cells and skips the empty row', () => {
    const table = document.createElement('table');
    table.innerHTML = `
      <thead><tr><th>Тауар</th><th>Сомасы</th></tr></thead>
      <tbody>
        <tr><td>Нан "ақ"</td><td>1;5</td></tr>
        <tr><td class="empty" colspan="2">Деректер жоқ</td></tr>
      </tbody>`;
    expect(tableToCsv(table)).toBe('Тауар;Сомасы\r\n"Нан ""ақ""";"1;5"');
  });
});
