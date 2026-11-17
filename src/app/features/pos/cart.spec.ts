import { makeProduct } from '../../../testing/fixtures';
import { addToCart, cartItems, cartTotal, setCartQuantity } from './cart';

describe('cart', () => {
  it('adds products and increments existing lines', () => {
    let cart = addToCart([], makeProduct());
    cart = addToCart(cart, makeProduct({ available: '9.000' }));
    cart = addToCart(cart, makeProduct({ id: 2, sale_price: '100.00' }), 0.5);
    expect(cart.map((l) => l.quantity)).toEqual([2, 0.5]);
    expect(cart[0].product.available).toBe('9.000'); // қалдық жаңартылады
    expect(cartTotal(cart)).toBe(550);
  });

  it('changes quantity and builds API items', () => {
    const cart = setCartQuantity(addToCart([], makeProduct()), 1, 1.5);
    expect(cartItems(cart)).toEqual([{ product_id: 1, quantity: '1.5' }]);
  });
});
