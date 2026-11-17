import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { errorMessages } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmService } from '../../core/ui/confirm.service';
import { ToastService } from '../../core/ui/toast.service';
import { Product } from '../../shared/models/product';
import { AlertBox } from '../../shared/ui/alert-box';
import { ProductSearch } from '../../shared/ui/product-search';
import { BusyFlag } from '../../shared/util/busy-flag';
import { StartAuditRequest } from './audit';
import { InventoryService } from './inventory.service';

/** Жаңа түгендеу: таңдалған тауарлар немесе қоймадағы барлық тауар. */
@Component({
  selector: 'app-start-audit-card',
  imports: [ReactiveFormsModule, ProductSearch, AlertBox],
  templateUrl: './start-audit-card.html',
})
export class StartAuditCard {
  private readonly inventory = inject(InventoryService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  protected readonly warehouseName = computed(() => this.auth.user()?.warehouse?.name ?? null);
  protected readonly selected = signal<readonly Product[]>([]);
  protected readonly comment = new FormControl('', { nonNullable: true });
  protected readonly errors = signal<readonly string[] | null>(null);
  protected readonly selectedBusy = new BusyFlag();
  protected readonly allBusy = new BusyFlag();

  protected select(product: Product): void {
    this.selected.update((list) =>
      list.some((p) => p.id === product.id) ? list : [...list, product],
    );
  }

  protected unselect(product: Product): void {
    this.selected.update((list) => list.filter((p) => p.id !== product.id));
  }

  protected startSelected(): Promise<void | undefined> {
    return this.selectedBusy.run(() =>
      this.start({ product_ids: this.selected().map((p) => p.id), comment: this.comment.value }),
    );
  }

  protected startAll(): Promise<void | undefined> {
    return this.allBusy.run(async () => {
      const question =
        'Қоймадағы барлық белсенді тауар түгенделеді және бекітілгенше олармен сату тоқтайды. Жалғастырасыз ба?';
      if (!this.confirm.ask(question)) return;
      await this.start({ all: true, comment: this.comment.value });
    });
  }

  private async start(request: StartAuditRequest): Promise<void> {
    try {
      const audit = await this.inventory.start(request);
      this.toast.show(`Түгендеу №${audit.number} басталды. Тауарлар бойынша қозғалыс бұғатталды.`);
      await this.router.navigate(['/inventory', audit.id]);
    } catch (error) {
      this.errors.set(errorMessages(error));
    }
  }
}
