/** Кестені CSV мәтініне айналдырады (Excel үшін ; бөлгіш). Бос кесте жолы («Деректер жоқ») өткізіледі. */
export function tableToCsv(table: HTMLTableElement): string {
  const escape = (text: string) => (/[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text);
  return [...table.querySelectorAll('tr')]
    .filter((tr) => !tr.querySelector('.empty'))
    .map((tr) => [...tr.children].map((cell) => escape((cell.textContent ?? '').trim())).join(';'))
    .join('\r\n');
}

/** CSV файлын (UTF-8 BOM) жүктейді. */
export function downloadCsv(table: HTMLTableElement, filename: string): void {
  const blob = new Blob(['﻿' + tableToCsv(table)], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
