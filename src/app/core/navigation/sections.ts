import { CurrentUser, Section } from '../auth/current-user';

/** Жоғарғы панельдегі бөлімдер (реті — `/me/` sections тізімі бойынша). */
export const SECTION_TITLES: Readonly<Record<Section, string>> = {
  pos: 'Касса',
  warehouse: 'Қойма',
  inventory: 'Түгендеу',
  documents: 'Құжаттар',
  reports: 'Есептер',
};

export function isSection(value: string): value is Section {
  return Object.hasOwn(SECTION_TITLES, value);
}

/** Пайдаланушыға қолжетімді (және фронтенд білетін) бөлімдер. */
export function availableSections(user: CurrentUser | null): Section[] {
  return (user?.sections ?? []).filter(isSection);
}

/**
 * Касса мен қоймалық операциялар қызметкердің қоймасында жасалады:
 * қойма бекітілмесе, бөлім ашылмайды (Басқарушы түгендеулерді қоймасыз да көре алады).
 */
export function needsWarehouse(section: Section, user: CurrentUser): boolean {
  if (user.warehouse) return false;
  return (
    section === 'pos' || section === 'warehouse' || (section === 'inventory' && !user.is_manager)
  );
}
