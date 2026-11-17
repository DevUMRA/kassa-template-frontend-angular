import { DocumentStatus } from '../../shared/models/document';

export interface AuditItem {
  readonly product_id: number;
  readonly product_name: string;
  readonly sku: string;
  readonly barcode: string | null;
  /** Есептік қалдық (түгендеу басталғандағы) */
  readonly expected_quantity: string | null;
  /** Нақты саны; саналмаса — null */
  readonly counted_quantity: string | null;
  readonly is_counted: boolean;
  readonly difference: string | null;
}

/** `GET /api/inventory/audits/{id}/` */
export interface Audit {
  readonly id: number;
  readonly number: string;
  readonly status: DocumentStatus;
  readonly warehouse: string;
  readonly responsible: string;
  readonly date: string;
  readonly posted_at: string | null;
  readonly canceled_at: string | null;
  readonly canceled_by: string | null;
  readonly cancel_reason: string;
  readonly comment: string;
  readonly progress: { readonly total: number; readonly counted: number };
  readonly items: AuditItem[];
}

export type StartAuditRequest =
  | { readonly product_ids: readonly number[]; readonly comment: string }
  | { readonly all: true; readonly comment: string };

export interface CountLine {
  readonly product_id: number;
  readonly quantity: string;
}
