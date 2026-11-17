import { Routes } from '@angular/router';

import { WarehousePage } from './warehouse-page';

export const WAREHOUSE_ROUTES: Routes = [
  {
    path: '',
    component: WarehousePage,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'receipt' },
      {
        path: 'receipt',
        loadComponent: () => import('./receipt-page').then((m) => m.ReceiptPage),
      },
      {
        path: 'supplier-return',
        loadComponent: () => import('./supplier-return-page').then((m) => m.SupplierReturnPage),
      },
      {
        // Қабылдаулар тізімінен: нөмір бойынша бірден ашылады
        path: 'supplier-return/:number',
        loadComponent: () => import('./supplier-return-page').then((m) => m.SupplierReturnPage),
      },
      {
        path: 'write-off',
        loadComponent: () => import('./write-off-page').then((m) => m.WriteOffPage),
      },
      { path: '**', redirectTo: 'receipt' },
    ],
  },
];
