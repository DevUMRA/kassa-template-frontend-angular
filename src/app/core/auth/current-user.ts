export type Section = 'pos' | 'warehouse' | 'inventory' | 'documents' | 'reports';

/** `GET /api/me/` — ағымдағы қызметкер, рөлі, қоймасы және қолжетімді бөлімдер. */
export interface CurrentUser {
  readonly username: string;
  readonly full_name: string;
  readonly role: string;
  readonly role_display: string;
  readonly is_manager: boolean;
  readonly warehouse: { readonly id: number; readonly name: string } | null;
  readonly sections: readonly string[];
}
