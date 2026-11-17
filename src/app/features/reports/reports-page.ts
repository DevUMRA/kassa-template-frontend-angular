import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';

import { errorMessages } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { isoMonthStart, isoToday } from '../../shared/format/format';
import { AlertBox } from '../../shared/ui/alert-box';
import { BusyFlag } from '../../shared/util/busy-flag';
import { downloadCsv } from './csv-export';
import { InventoryReportView } from './inventory-report-view';
import { MovementsReportView } from './movements-report-view';
import { isReportKey, ReportKey, ReportResult, REPORTS } from './report';
import { reportParams } from './report-params';
import { ReportsService, WarehouseOption } from './reports.service';
import { SalesReportView } from './sales-report-view';
import { StockReportView } from './stock-report-view';
import { TurnoverReportView } from './turnover-report-view';

/** Есептер: таңдау, сүзгілер, нәтиже кестелері, CSV. */
@Component({
  selector: 'app-reports-page',
  imports: [
    ReactiveFormsModule,
    AlertBox,
    StockReportView,
    TurnoverReportView,
    SalesReportView,
    InventoryReportView,
    MovementsReportView,
  ],
  templateUrl: './reports-page.html',
})
export class ReportsPage implements OnInit {
  private readonly reports = inject(ReportsService);
  private readonly auth = inject(AuthService);

  /** Маршрут параметрі `:report` (міндетті емес) */
  readonly report = input<string>();

  private readonly output = viewChild.required<ElementRef<HTMLElement>>('output');

  protected readonly isManager = this.auth.isManager;
  protected readonly available = computed(() =>
    REPORTS.filter((r) => !r.managerOnly || this.isManager()),
  );
  protected readonly form = inject(NonNullableFormBuilder).group({
    report: 'stock' as ReportKey,
    date_from: isoMonthStart(),
    date_to: isoToday(),
    warehouse: '',
    group_by: 'day',
    search: '',
    low: '',
  });
  protected readonly selected = signal<ReportKey>('stock');
  protected readonly selectedDefinition = computed(() =>
    REPORTS.find((r) => r.key === this.selected()),
  );
  protected readonly warehouses = signal<readonly WarehouseOption[]>([]);
  protected readonly result = signal<ReportResult | null>(null);
  protected readonly errors = signal<readonly string[] | null>(null);
  protected readonly showBusy = new BusyFlag();

  ngOnInit(): void {
    const initial = this.report();
    if (isReportKey(initial) && this.available().some((r) => r.key === initial)) {
      this.form.controls.report.setValue(initial);
      this.selected.set(initial);
    }
    void this.init();
  }

  protected changeReport(): void {
    this.selected.set(this.form.controls.report.value);
    this.result.set(null);
    this.errors.set(null);
  }

  protected showReport(): Promise<void | undefined> {
    return this.showBusy.run(() => this.show());
  }

  protected exportCsv(): void {
    const { report, date_from, date_to } = this.form.getRawValue();
    const tables = this.output().nativeElement.querySelectorAll('table');
    tables.forEach((table, i) =>
      downloadCsv(
        table,
        `${report}_${date_from}_${date_to}${tables.length > 1 ? '_' + (i + 1) : ''}.csv`,
      ),
    );
  }

  protected async show(page?: number): Promise<void> {
    const { report: key, ...values } = this.form.getRawValue();
    try {
      const data = await this.reports.load<ReportResult['data']>(
        key,
        reportParams(key, values, page),
      );
      this.result.set({ key, data } as ReportResult);
      this.errors.set(null);
    } catch (error) {
      this.result.set(null);
      this.errors.set(errorMessages(error));
    }
  }

  private async init(): Promise<void> {
    if (this.isManager()) {
      try {
        this.warehouses.set(await this.reports.warehouses());
      } catch (error) {
        this.errors.set(errorMessages(error));
      }
    }
    await this.show();
  }
}
