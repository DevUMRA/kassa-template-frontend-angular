import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { errorMessages } from '../../core/api/api-error';
import { DateTimePipe } from '../../shared/format/date-time.pipe';
import { AlertBox } from '../../shared/ui/alert-box';
import { StatusBadge } from '../../shared/ui/status-badge';
import { Audit } from './audit';
import { InventoryService } from './inventory.service';
import { StartAuditCard } from './start-audit-card';

/** Түгендеулер тізімі және жаңасын бастау. */
@Component({
  selector: 'app-audit-list-page',
  imports: [StartAuditCard, AlertBox, StatusBadge, DateTimePipe],
  templateUrl: './audit-list-page.html',
})
export class AuditListPage implements OnInit {
  private readonly inventory = inject(InventoryService);
  private readonly router = inject(Router);

  protected readonly audits = signal<readonly Audit[] | null>(null);
  protected readonly errors = signal<readonly string[] | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  protected open(audit: Audit): void {
    void this.router.navigate(['/inventory', audit.id]);
  }

  private async load(): Promise<void> {
    try {
      this.audits.set((await this.inventory.list()).results);
    } catch (error) {
      this.errors.set(errorMessages(error));
    }
  }
}
