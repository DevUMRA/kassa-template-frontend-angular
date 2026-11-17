import { BaseDocument, DocumentStatus, DocumentType } from '../../shared/models/document';

export interface DocumentLink {
  readonly id: number;
  readonly number: string;
  readonly doc_type: DocumentType;
  readonly status: DocumentStatus;
}

/** Құжаттар журналы (`/api/documents/`): кез келген түрдегі құжат. */
export interface JournalDocument extends BaseDocument {
  readonly doc_type: DocumentType;
  readonly doc_type_display: string;
  readonly warehouse: string;
  readonly supplier: string | null;
  readonly responsible: string;
  readonly base_document: DocumentLink | null;
  readonly returns: DocumentLink[];
}

export interface DocumentFilters {
  readonly doc_type: string;
  readonly status: string;
  readonly search: string;
  readonly date_from: string;
  readonly date_to: string;
  readonly page: number;
}

export const EMPTY_FILTERS: DocumentFilters = {
  doc_type: '',
  status: '',
  search: '',
  date_from: '',
  date_to: '',
  page: 1,
};
