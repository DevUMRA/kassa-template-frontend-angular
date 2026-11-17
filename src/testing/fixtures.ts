import { CurrentUser } from '../app/core/auth/current-user';
import { Product } from '../app/shared/models/product';

/** Тесттерге арналған деректер. */

/** Басқарушы, қоймасы бар, барлық бөлім. */
export function makeUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    username: 'admin',
    full_name: 'Әкімші',
    role: 'MANAGER',
    role_display: 'Басқарушы',
    is_manager: true,
    warehouse: { id: 1, name: 'Негізгі қойма' },
    sections: ['pos', 'warehouse', 'inventory', 'documents', 'reports'],
    ...overrides,
  };
}

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'Нан',
    sku: 'BREAD',
    barcode: '4870001',
    category: null,
    unit: 'pcs',
    unit_display: 'дана',
    sale_price: '250.00',
    available: '10.000',
    ...overrides,
  };
}
