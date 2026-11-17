import { roundQty } from '../../shared/format/format';
import { LineInput } from '../../shared/models/document';
import { Product } from '../../shared/models/product';

export interface CartLine {
  readonly product: Product;
  readonly quantity: number;
}

/** Тауар қосу: бар болса саны артады, қалдығы (product) жаңартылады. */
export function addToCart(cart: readonly CartLine[], product: Product, amount = 1): CartLine[] {
  const existing = cart.find((line) => line.product.id === product.id);
  if (!existing) return [...cart, { product, quantity: roundQty(amount) }];
  return cart.map((line) =>
    line === existing ? { product, quantity: roundQty(line.quantity + amount) } : line,
  );
}

export function setCartQuantity(
  cart: readonly CartLine[],
  productId: number,
  quantity: number,
): CartLine[] {
  return cart.map((line) => (line.product.id === productId ? { ...line, quantity } : line));
}

export function cartTotal(cart: readonly CartLine[]): number {
  return cart.reduce((sum, line) => sum + Number(line.product.sale_price) * line.quantity, 0);
}

export function cartItems(cart: readonly CartLine[]): LineInput[] {
  return cart.map((line) => ({ product_id: line.product.id, quantity: String(line.quantity) }));
}
