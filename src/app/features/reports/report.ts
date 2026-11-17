/** Есептер (`/api/reports/<key>/`) — жауап құрылымдары inventory/api/report_schemas.py бойынша. */
export type ReportKey = 'stock' | 'turnover' | 'sales' | 'inventory' | 'movements';
export type SalesGroupBy = 'day' | 'product' | 'cashier';

export interface ReportDefinition {
  readonly key: ReportKey;
  readonly title: string;
  /** Кезең (Басы/Соңы) керек пе */
  readonly period: boolean;
  readonly managerOnly?: boolean;
}

export const REPORTS: readonly ReportDefinition[] = [
  { key: 'stock', title: 'Қалдықтар', period: false },
  { key: 'turnover', title: 'Айналым ведомосі', period: true },
  { key: 'sales', title: 'Сату есебі', period: true, managerOnly: true },
  { key: 'inventory', title: 'Түгендеу нәтижелері', period: true },
  { key: 'movements', title: 'Қозғалыс журналы', period: true },
];

export function isReportKey(value: string | undefined): value is ReportKey {
  return REPORTS.some((r) => r.key === value);
}

export interface StockReport {
  readonly rows: readonly {
    readonly product_id: number;
    readonly product_name: string;
    readonly sku: string;
    readonly unit: string;
    readonly warehouse: string;
    readonly quantity: string;
    readonly sale_price: string;
    readonly value: string;
  }[];
  readonly totals: { readonly positions: number; readonly value: string };
}

export interface TurnoverReport {
  readonly rows: readonly {
    readonly product_id: number;
    readonly product_name: string;
    readonly warehouse_id: number;
    readonly warehouse: string;
    readonly opening: string;
    readonly incoming: string;
    readonly outgoing: string;
    readonly closing: string;
  }[];
  readonly totals: {
    readonly opening: string;
    readonly incoming: string;
    readonly outgoing: string;
    readonly closing: string;
  };
}

export interface SalesRow {
  readonly day?: string;
  readonly product_name?: string;
  readonly cashier?: string;
  readonly receipts: number;
  readonly sold_qty: string;
  readonly sold_amount: string;
  readonly returns: number;
  readonly returned_qty: string;
  readonly returned_amount: string;
  readonly net_amount: string;
}

export interface SalesReport {
  readonly group_by: SalesGroupBy;
  readonly rows: readonly SalesRow[];
  readonly totals: {
    readonly receipts: number;
    readonly returns: number;
    readonly sold_amount: string;
    readonly returned_amount: string;
    readonly net_amount: string;
  };
}

export interface InventoryReport {
  readonly audits: readonly {
    readonly id: number;
    readonly number: string;
    readonly posted_at: string;
    readonly warehouse: string;
    readonly comment: string;
    readonly shortage_amount: string;
    readonly surplus_amount: string;
    readonly lines: readonly {
      readonly product_id: number;
      readonly product_name: string;
      readonly difference: string;
      readonly price: string;
      readonly amount: string;
    }[];
  }[];
  readonly totals: {
    readonly audits: number;
    readonly shortage_qty: string;
    readonly shortage_amount: string;
    readonly surplus_qty: string;
    readonly surplus_amount: string;
  };
  readonly write_offs: {
    readonly rows: readonly {
      readonly product_id: number;
      readonly product_name: string;
      readonly sku: string;
      readonly documents: number;
      readonly quantity: string;
      readonly amount: string;
    }[];
    readonly documents: readonly {
      readonly id: number;
      readonly number: string;
      readonly posted_at: string;
      readonly warehouse: string;
      readonly reason: string;
      readonly quantity: string;
      readonly amount: string;
    }[];
    readonly total_quantity: string;
    readonly total_amount: string;
  };
}

export interface MovementsReport {
  readonly count: number;
  readonly next: string | null;
  readonly previous: string | null;
  readonly results: readonly {
    readonly id: number;
    readonly date: string;
    readonly product_name: string;
    readonly warehouse: string;
    readonly quantity: string;
    readonly doc_type_display: string;
    readonly document_number: string;
    readonly comment: string;
    readonly is_reversal: boolean;
    readonly cancel_reason: string;
    readonly user: string;
  }[];
}

export type ReportResult =
  | { readonly key: 'stock'; readonly data: StockReport }
  | { readonly key: 'turnover'; readonly data: TurnoverReport }
  | { readonly key: 'sales'; readonly data: SalesReport }
  | { readonly key: 'inventory'; readonly data: InventoryReport }
  | { readonly key: 'movements'; readonly data: MovementsReport };
