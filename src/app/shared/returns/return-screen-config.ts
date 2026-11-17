import { ReturnableDocument } from '../models/document';

/** Қайтару экранының баптауы: чектен (касса) немесе қабылдаудан (қойма). */
export interface ReturnScreenConfig {
  readonly title: string;
  /** «Чек», «Қабылдау» */
  readonly docLabel: string;
  readonly placeholder: string;
  /** API жолы, мысалы `/pos/sales/` — тізім (?search=), `{id}/` және `{id}/returns/` */
  readonly path: string;
  /** Сатылды / Қабылданды бағанының атауы */
  readonly soldTitle: string;
  /** Құжат тақырыбының жанындағы қысқа ақпарат */
  readonly info: (document: ReturnableDocument) => string;
}
