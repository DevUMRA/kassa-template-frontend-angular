import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

const MODES = [
  { path: 'receipt', title: 'Қабылдау' },
  { path: 'supplier-return', title: 'Жеткізушіге қайтару' },
  { path: 'write-off', title: 'Есептен шығару' },
] as const;

/** Қойма: Қабылдау / Жеткізушіге қайтару / Есептен шығару. */
@Component({
  selector: 'app-warehouse-page',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="stack">
      <div class="row">
        @for (mode of modes; track mode.path) {
          <a
            class="tab"
            [routerLink]="['/warehouse', mode.path]"
            routerLinkActive
            #link="routerLinkActive"
            [attr.aria-selected]="link.isActive"
            >{{ mode.title }}</a
          >
        }
      </div>
      <div><router-outlet /></div>
    </div>
  `,
})
export class WarehousePage {
  protected readonly modes = MODES;
}
