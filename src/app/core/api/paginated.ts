/** DRF PageNumberPagination жауабы. */
export interface Paginated<T> {
  readonly count: number;
  readonly next: string | null;
  readonly previous: string | null;
  readonly results: T[];
}
