import { afterNextRender, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { errorMessages } from '../../core/api/api-error';
import { injectWarehouseName } from '../../core/auth/warehouse-name';
import { ToastService } from '../../core/ui/toast.service';
import { formatMoney } from '../../shared/format/format';
import { MoneyPipe } from '../../shared/format/money.pipe';
import { Receipt } from '../../shared/models/document';
import { AlertBox } from '../../shared/ui/alert-box';
import { ReceiptView } from '../../shared/ui/receipt-view';
import { BusyFlag } from '../../shared/util/busy-flag';
import { LineEditor } from './line-editor';
import { RecentColumn, RecentDocuments } from './recent-documents';
import { Supplier, supplierLabel } from './supplier';
import { WarehouseService } from './warehouse.service';

/** Тексеру: жеткізуші таңдалған, барлық жолдың бағасы бар. */
export function validateReceipt(supplierId: string, missingPrices: readonly string[]): string[] {
  const errors: string[] = [];
  if (!supplierId) errors.push('Жеткізушіні таңдаңыз.');
  if (missingPrices.length) errors.push(`Бағасы енгізілмеген: ${missingPrices.join(', ')}.`);
  return errors;
}

/** Жеткізушіден қабылдау. */
@Component({
  selector: 'app-receipt-page',
  imports: [ReactiveFormsModule, LineEditor, RecentDocuments, ReceiptView, AlertBox, MoneyPipe],
  templateUrl: './receipt-page.html',
})
export class ReceiptPage implements OnInit {
  private readonly warehouse = inject(WarehouseService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly editor = viewChild.required(LineEditor);
  private readonly recent = viewChild.required<RecentDocuments<Receipt>>('recent');

  protected readonly warehouseName = injectWarehouseName();
  protected readonly form = inject(NonNullableFormBuilder).group({ supplier: '', comment: '' });
  protected readonly suppliers = signal<readonly Supplier[] | null>(null);
  protected readonly supplierLabel = supplierLabel;
  protected readonly side = signal<
    | { kind: 'errors'; messages: readonly string[]; info?: boolean }
    | { kind: 'receipt'; receipt: Receipt }
    | null
  >(null);
  protected readonly submitBusy = new BusyFlag();
  protected readonly recentColumns: readonly RecentColumn<Receipt>[] = [
    { title: 'Жеткізуші', value: (d) => d.supplier },
  ];

  constructor() {
    afterNextRender(() => this.editor().focus());
  }

  ngOnInit(): void {
    void this.loadSuppliers();
  }

  protected openReturn(receipt: Receipt): void {
    void this.router.navigate(['/warehouse/supplier-return', receipt.number]);
  }

  protected submit(): Promise<void | undefined> {
    return this.submitBusy.run(async () => {
      const editor = this.editor();
      const { supplier, comment } = this.form.getRawValue();
      const errors = validateReceipt(supplier, editor.missingPrices());
      if (errors.length) {
        this.side.set({ kind: 'errors', messages: errors });
        return;
      }
      try {
        const receipt = await this.warehouse.createReceipt({
          supplier_id: Number(supplier),
          items: editor.items(),
          comment,
        });
        this.toast.show(`Қабылдау №${receipt.number}: ${formatMoney(receipt.total)}`);
        editor.clear();
        this.form.controls.comment.setValue('');
        this.side.set({ kind: 'receipt', receipt });
        void this.recent().reload();
        editor.focus();
      } catch (error) {
        this.side.set({ kind: 'errors', messages: errorMessages(error) });
      }
    });
  }

  private async loadSuppliers(): Promise<void> {
    try {
      const suppliers = await this.warehouse.suppliers();
      this.suppliers.set(suppliers);
      if (!suppliers.length) {
        this.side.set({
          kind: 'errors',
          messages: ['Жеткізушілер жоқ — әкімшіге хабарласыңыз.'],
          info: true,
        });
      }
    } catch (error) {
      this.side.set({ kind: 'errors', messages: errorMessages(error) });
    }
  }
}
