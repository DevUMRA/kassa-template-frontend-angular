import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/** Касса: Сату / Қайтару ауыстырғышы. */
@Component({
  selector: 'app-pos-page',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="stack">
      <div class="row">
        <a
          class="tab"
          routerLink="/pos"
          routerLinkActive
          #sale="routerLinkActive"
          [routerLinkActiveOptions]="{ exact: true }"
          [attr.aria-selected]="sale.isActive"
          >Сату</a
        >
        <a
          class="tab"
          routerLink="/pos/return"
          routerLinkActive
          #back="routerLinkActive"
          [attr.aria-selected]="back.isActive"
          >Қайтару</a
        >
      </div>
      <div><router-outlet /></div>
    </div>
  `,
})
export class PosPage {}
