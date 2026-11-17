import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./audit-list-page').then((m) => m.AuditListPage) },
  { path: ':id', loadComponent: () => import('./audit-page').then((m) => m.AuditPage) },
];
