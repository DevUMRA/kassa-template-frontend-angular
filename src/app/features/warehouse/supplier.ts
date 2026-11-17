/** `GET /api/warehouse/suppliers/` */
export interface Supplier {
  readonly id: number;
  readonly name: string;
  readonly bin: string;
  readonly phone: string;
}

export function supplierLabel(supplier: Supplier): string {
  return supplier.bin ? `${supplier.name} (БСН ${supplier.bin})` : supplier.name;
}
