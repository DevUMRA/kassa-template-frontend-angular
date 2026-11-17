import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';
import { firstSectionGuard, sectionGuard } from './core/navigation/section.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Кіру — Дүкен',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    title: 'Дүкен',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [firstSectionGuard],
        loadComponent: () =>
          import('./features/shell/no-sections-page').then((m) => m.NoSectionsPage),
      },
      {
        path: 'pos',
        data: { section: 'pos' },
        canActivate: [sectionGuard],
        loadChildren: () => import('./features/pos/pos.routes').then((m) => m.POS_ROUTES),
      },
      {
        path: 'warehouse',
        data: { section: 'warehouse' },
        canActivate: [sectionGuard],
        loadChildren: () =>
          import('./features/warehouse/warehouse.routes').then((m) => m.WAREHOUSE_ROUTES),
      },
      {
        path: 'inventory',
        data: { section: 'inventory' },
        canActivate: [sectionGuard],
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then((m) => m.INVENTORY_ROUTES),
      },
      {
        path: 'documents',
        data: { section: 'documents' },
        canActivate: [sectionGuard],
        loadChildren: () =>
          import('./features/documents/documents.routes').then((m) => m.DOCUMENTS_ROUTES),
      },
      {
        path: 'reports',
        data: { section: 'reports' },
        canActivate: [sectionGuard],
        loadChildren: () =>
          import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
