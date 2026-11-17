import { Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { catchError, map, of, switchMap, timer } from 'rxjs';

import { errorMessages } from '../../core/api/api-error';
import { ProductService } from '../data/product.service';
import { MoneyPipe } from '../format/money.pipe';
import { QtyPipe } from '../format/qty.pipe';
import { Product } from '../models/product';
import { AlertBox } from './alert-box';

export const SEARCH_DEBOUNCE_MS = 300;
const MIN_TERM_LENGTH = 2;

type SearchState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'results'; readonly products: readonly Product[] }
  | { readonly kind: 'error'; readonly messages: readonly string[] };

const IDLE: SearchState = { kind: 'idle' };

/** Атауы немесе артикулы бойынша тауар іздеу; жолды басқанда `selected` шығарылады. */
@Component({
  selector: 'app-product-search',
  imports: [ReactiveFormsModule, AlertBox, MoneyPipe, QtyPipe],
  styles: `
    :host {
      display: block;
    }
  `,
  templateUrl: './product-search.html',
})
export class ProductSearch {
  private readonly products = inject(ProductService);

  readonly placeholder = input('Атауы немесе артикулы бойынша іздеу');
  /** Бағасы бағанын көрсету (касса). */
  readonly showPrice = input(false);
  /** Таңдағаннан кейін іздеуді тазалау (түгендеуде бірнеше тауар қатарынан таңдалады). */
  readonly clearOnSelect = input(true);
  readonly selected = output<Product>();

  protected readonly term = new FormControl('', { nonNullable: true });

  /** Қысқа сұраныс — нәтижелер бірден тазаланады, әйтпесе 300 мс күтіп іздейміз. */
  private readonly state = toSignal(
    this.term.valueChanges.pipe(
      map((value) => value.trim()),
      switchMap((term) =>
        term.length < MIN_TERM_LENGTH
          ? of(IDLE)
          : timer(SEARCH_DEBOUNCE_MS).pipe(
              switchMap(() => this.products.search$(term)),
              map((page): SearchState => ({ kind: 'results', products: page.results })),
              catchError((error: unknown) =>
                of<SearchState>({ kind: 'error', messages: errorMessages(error) }),
              ),
            ),
      ),
    ),
    { initialValue: IDLE },
  );
  protected readonly results = computed(() => {
    const state = this.state();
    return state.kind === 'results' ? state.products : null;
  });
  protected readonly errors = computed(() => {
    const state = this.state();
    return state.kind === 'error' ? state.messages : null;
  });

  protected select(product: Product): void {
    this.selected.emit(product);
    if (this.clearOnSelect()) this.term.setValue('');
  }
}
