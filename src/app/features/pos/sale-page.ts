import { afterNextRender, Component, computed, inject, signal, viewChild } from '@angular/core';

import { errorMessages } from '../../core/api/api-error';
import { ToastService } from '../../core/ui/toast.service';
import { formatMoney } from '../../shared/format/format';
import { MoneyPipe } from '../../shared/format/money.pipe';
import { QtyPipe } from '../../shared/format/qty.pipe';
import { Sale } from '../../shared/models/document';
import { Product } from '../../shared/models/product';
import { AlertBox } from '../../shared/ui/alert-box';
import { ProductScan } from '../../shared/ui/product-scan';
import { ProductSearch } from '../../shared/ui/product-search';
import { ReceiptView } from '../../shared/ui/receipt-view';
import { BusyFlag } from '../../shared/util/busy-flag';
import { addToCart, CartLine, cartItems, cartTotal, setCartQuantity } from './cart';
import { SalesService } from './sales.service';

/** Касса: чек жинау (сканер, іздеу), сату. */
@Component({
  selector: 'app-sale-page',
  imports: [ProductScan, ProductSearch, ReceiptView, AlertBox, MoneyPipe, QtyPipe],
  templateUrl: './sale-page.html',
})
export class SalePage {
  private readonly sales = inject(SalesService);
  private readonly toast = inject(ToastService);
  private readonly scan = viewChild.required(ProductScan);

  protected readonly cart = signal<CartLine[]>([]);
  protected readonly total = computed(() => cartTotal(this.cart()));
  protected readonly lastReceipt = signal<Sale | null>(null);
  protected readonly errors = signal<readonly string[] | null>(null);
  protected readonly sellBusy = new BusyFlag();

  constructor() {
    afterNextRender(() => this.scan().focus());
  }

  protected add(product: Product): void {
    this.cart.update((cart) => addToCart(cart, product));
    this.lastReceipt.set(null);
    this.errors.set(null);
  }

  protected addFromSearch(product: Product): void {
    this.add(product);
    this.scan().focus();
  }

  protected changeQuantity(line: CartLine, input: HTMLInputElement): void {
    const value = Number(input.value);
    if (!(value > 0)) {
      input.value = String(line.quantity);
      return;
    }
    this.cart.update((cart) => setCartQuantity(cart, line.product.id, value));
    this.errors.set(null);
  }

  protected isShort(line: CartLine): boolean {
    return line.quantity > Number(line.product.available);
  }

  protected remove(line: CartLine): void {
    this.cart.update((cart) => cart.filter((l) => l !== line));
    this.errors.set(null);
  }

  protected clear(): void {
    this.cart.set([]);
    this.errors.set(null);
    this.scan().focus();
  }

  protected sell(): Promise<void | undefined> {
    return this.sellBusy.run(async () => {
      try {
        const receipt = await this.sales.sell(cartItems(this.cart()));
        this.lastReceipt.set(receipt);
        this.cart.set([]);
        this.errors.set(null);
        this.toast.show(`Чек №${receipt.number}: ${formatMoney(receipt.total)}`);
      } catch (error) {
        this.errors.set(errorMessages(error));
        return;
      }
      this.scan().focus();
    });
  }
}
