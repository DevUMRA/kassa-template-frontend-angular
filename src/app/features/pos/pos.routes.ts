import { Routes } from '@angular/router';

import { PosPage } from './pos-page';

export const POS_ROUTES: Routes = [
  {
    path: '',
    component: PosPage,
    children: [
      { path: '', loadComponent: () => import('./sale-page').then((m) => m.SalePage) },
      {
        path: 'return',
        loadComponent: () => import('./sale-return-page').then((m) => m.SaleReturnPage),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
