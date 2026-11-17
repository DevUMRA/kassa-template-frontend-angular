export type DocumentStatus = 'DRAFT' | 'POSTED' | 'CANCELED';

export type DocumentType =
  'SALE' | 'SALE_RETURN' | 'RECEIPT' | 'SUPPLIER_RETURN' | 'WRITE_OFF' | 'INVENTORY';

export const STATUS_TITLES: Readonly<Record<DocumentStatus, string>> = {
  DRAFT: 'Жоба',
  POSTED: 'Өткізілді',
  CANCELED: 'Күші жойылды',
};

export const DOC_TYPE_TITLES: Readonly<Record<DocumentType, string>> = {
  SALE: 'Сату',
  SALE_RETURN: 'Сатушылық қайтару',
  RECEIPT: 'Жеткізушіден қабылдау',
  SUPPLIER_RETURN: 'Жеткізушіге қайтару',
  WRITE_OFF: 'Есептен шығару',
  INVENTORY: 'Түгендеу',
};

export function statusTitle(status: string): string {
  return STATUS_TITLES[status as DocumentStatus] ?? status;
}

export interface DocumentItem {
  readonly product_id: number;
  readonly product_name: string;
  readonly barcode: string | null;
  readonly quantity: string;
  readonly price: string;
  readonly total: string;
}

/** Қайтару, есептен шығару және т.б. — жолдары мен сомасы бар құжат. */
export interface BaseDocument {
  readonly id: number;
  readonly number: string;
  readonly status: DocumentStatus;
  readonly date: string;
  readonly posted_at: string | null;
  readonly canceled_at: string | null;
  readonly canceled_by: string | null;
  readonly cancel_reason: string;
  readonly comment: string;
  readonly items: DocumentItem[];
  readonly total: string;
}

/** Қайтаруға болатын құжат (чек, қабылдау): қайтарулары және әлі қайтаруға болатын саны. */
export interface ReturnableDocument extends BaseDocument {
  readonly warehouse: string;
  readonly returns: BaseDocument[];
  /** {product_id: әлі қайтаруға болатын саны} */
  readonly returnable: Readonly<Record<string, string>>;
}

export interface Sale extends ReturnableDocument {
  readonly cashier: string;
}

export interface Receipt extends ReturnableDocument {
  readonly supplier_id: number;
  readonly supplier: string;
  readonly responsible: string;
}

export interface WriteOff extends BaseDocument {
  readonly warehouse: string;
  readonly responsible: string;
}

/** Жолдар: тауар және саны (бағаны тек қабылдау жібереді). */
export interface LineInput {
  readonly product_id: number;
  readonly quantity: string;
  readonly price?: string;
}
