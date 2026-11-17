import { Component, computed, input, signal, viewChild } from '@angular/core';

import { roundQty } from '../../shared/format/format';
import { MoneyPipe } from '../../shared/format/money.pipe';
import { QtyPipe } from '../../shared/format/qty.pipe';
import { LineInput } from '../../shared/models/document';
import { Product } from '../../shared/models/product';
import { ProductScan } from '../../shared/ui/product-scan';
import { ProductSearch } from '../../shared/ui/product-search';

export interface EditorLine {
  readonly product: Product;
  readonly quantity: number;
  /** Сатып алу бағасы (тек withPrice), енгізілмесе — '' */
  readonly price: string;
}

/** Тауар жолдарын жинау: сканер + іздеу, саны және (withPrice болса) бағасы. */
@Component({
  selector: 'app-line-editor',
  imports: [ProductScan, ProductSearch, MoneyPipe, QtyPipe],
  styles: `
    :host {
      display: block;
    }
  `,
  templateUrl: './line-editor.html',
})
export class LineEditor {
  readonly withPrice = input(false);
  private readonly scan = viewChild.required(ProductScan);

  protected readonly lines = signal<readonly EditorLine[]>([]);
  readonly size = computed(() => this.lines().length);
  readonly total = computed(() =>
    this.lines().reduce((sum, line) => sum + Number(line.price || 0) * line.quantity, 0),
  );
  /** Бағасы енгізілмеген тауарлар (withPrice болғанда) */
  readonly missingPrices = computed(() =>
    this.withPrice()
      ? this.lines()
          .filter((l) => l.price === '')
          .map((l) => l.product.name)
      : [],
  );

  items(): LineInput[] {
    return this.lines().map((line) => ({
      product_id: line.product.id,
      quantity: String(line.quantity),
      ...(this.withPrice() ? { price: String(line.price) } : {}),
    }));
  }

  clear(): void {
    this.lines.set([]);
  }

  focus(): void {
    this.scan().focus();
  }

  protected add(product: Product): void {
    this.lines.update((lines) => {
      const existing = lines.find((l) => l.product.id === product.id);
      if (!existing) return [...lines, { product, quantity: 1, price: '' }];
      return lines.map((l) =>
        l === existing ? { ...l, product, quantity: roundQty(l.quantity + 1) } : l,
      );
    });
  }

  protected addFromSearch(product: Product): void {
    this.add(product);
    this.focus();
  }

  protected changeQuantity(line: EditorLine, input: HTMLInputElement): void {
    const value = Number(input.value);
    if (!(value > 0)) {
      input.value = String(line.quantity);
      return;
    }
    this.replace(line, { ...line, quantity: value });
  }

  protected changePrice(line: EditorLine, input: HTMLInputElement): void {
    this.replace(line, { ...line, price: input.value });
  }

  protected remove(line: EditorLine): void {
    this.lines.update((lines) => lines.filter((l) => l !== line));
  }

  /** Кіріс қалдықты арттырады — тек шығыста ескертеміз. */
  protected isShort(line: EditorLine): boolean {
    return !this.withPrice() && line.quantity > Number(line.product.available);
  }

  private replace(line: EditorLine, next: EditorLine): void {
    this.lines.update((lines) => lines.map((l) => (l === line ? next : l)));
  }
}
