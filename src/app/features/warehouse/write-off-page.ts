import { afterNextRender, Component, inject, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { errorMessages } from '../../core/api/api-error';
import { injectWarehouseName } from '../../core/auth/warehouse-name';
import { ConfirmService } from '../../core/ui/confirm.service';
import { ToastService } from '../../core/ui/toast.service';
import { formatMoney } from '../../shared/format/format';
import { WriteOff } from '../../shared/models/document';
import { AlertBox } from '../../shared/ui/alert-box';
import { ReceiptView } from '../../shared/ui/receipt-view';
import { BusyFlag } from '../../shared/util/busy-flag';
import { LineEditor } from './line-editor';
import { RecentColumn, RecentDocuments } from './recent-documents';
import { WarehouseService } from './warehouse.service';

/** Есептен шығару (себебі міндетті). */
@Component({
  selector: 'app-write-off-page',
  imports: [ReactiveFormsModule, LineEditor, RecentDocuments, ReceiptView, AlertBox],
  templateUrl: './write-off-page.html',
})
export class WriteOffPage {
  private readonly warehouse = inject(WarehouseService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly editor = viewChild.required(LineEditor);
  private readonly recent = viewChild.required<RecentDocuments<WriteOff>>('recent');

  protected readonly warehouseName = injectWarehouseName();
  protected readonly reason = new FormControl('', { nonNullable: true });
  protected readonly errors = signal<readonly string[] | null>(null);
  protected readonly result = signal<WriteOff | null>(null);
  protected readonly submitBusy = new BusyFlag();
  protected readonly recentColumns: readonly RecentColumn<WriteOff>[] = [
    { title: 'Себебі', value: (d) => d.comment || '—' },
    { title: 'Жауапты', value: (d) => d.responsible },
  ];

  constructor() {
    afterNextRender(() => this.editor().focus());
  }

  protected submit(reasonInput: HTMLInputElement): Promise<void | undefined> {
    return this.submitBusy.run(async () => {
      if (!this.reason.value.trim()) {
        this.showErrors(['Есептен шығару себебін көрсетіңіз.']);
        reasonInput.focus();
        return;
      }
      if (!this.confirm.ask('Тауарлар қалдықтан шығарылады. Жалғастырасыз ба?')) return;
      const editor = this.editor();
      try {
        const writeOff = await this.warehouse.createWriteOff(editor.items(), this.reason.value);
        this.toast.show(`Есептен шығару №${writeOff.number}: ${formatMoney(writeOff.total)}`);
        editor.clear();
        this.reason.setValue('');
        this.errors.set(null);
        this.result.set(writeOff);
        void this.recent().reload();
        editor.focus();
      } catch (error) {
        this.showErrors(errorMessages(error));
      }
    });
  }

  private showErrors(messages: readonly string[]): void {
    this.result.set(null);
    this.errors.set(messages);
  }
}
