import { Component, ElementRef, inject, output, viewChild } from '@angular/core';

import { errorMessages, ApiError } from '../../core/api/api-error';
import { ToastService } from '../../core/ui/toast.service';
import { ProductService } from '../data/product.service';
import { Product } from '../models/product';

/** Штрихкод сканері: Enter → тауар API-дан ізделеді, табылса `found` шығарылады. */
@Component({
  selector: 'app-product-scan',
  styles: `
    :host {
      display: block;
    }
  `,
  template: `
    <div class="row">
      <input
        #scan
        class="scan grow"
        placeholder="Штрихкодты сканерлеңіз немесе енгізіңіз"
        autocomplete="off"
        aria-label="Штрихкод"
        (keydown.enter)="lookUp(scan)"
      />
    </div>
  `,
})
export class ProductScan {
  private readonly products = inject(ProductService);
  private readonly toast = inject(ToastService);
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('scan');

  readonly found = output<Product>();

  focus(): void {
    this.input().nativeElement.focus();
  }

  protected async lookUp(input: HTMLInputElement): Promise<void> {
    const code = input.value.trim();
    input.value = '';
    if (!code) return;
    try {
      this.found.emit(await this.products.byBarcode(code));
    } catch (error) {
      const notFound = error instanceof ApiError && error.status === 404;
      this.toast.show(
        notFound ? `Штрихкод табылмады: ${code}` : errorMessages(error).join('\n'),
        'error',
      );
    }
  }
}
