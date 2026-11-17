import { Routes } from '@angular/router';

export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./document-list-page').then((m) => m.DocumentListPage),
  },
  { path: ':id', loadComponent: () => import('./document-page').then((m) => m.DocumentPage) },
];
