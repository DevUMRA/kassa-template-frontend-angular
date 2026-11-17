import { Component } from '@angular/core';

import { AlertBox } from '../../shared/ui/alert-box';

@Component({
  selector: 'app-no-sections-page',
  imports: [AlertBox],
  template: `<app-alert-box kind="info" messages="Сіздің рөліңізге қолжетімді бөлім жоқ." />`,
})
export class NoSectionsPage {}
