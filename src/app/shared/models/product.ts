/** `GET /api/pos/products/` — тауар және кассирдің қоймасындағы қолжетімді қалдық. */
export interface Product {
  readonly id: number;
  readonly name: string;
  readonly sku: string;
  readonly barcode: string | null;
  readonly category: number | null;
  readonly unit: string;
  readonly unit_display: string;
  readonly sale_price: string;
  readonly available: string;
}
