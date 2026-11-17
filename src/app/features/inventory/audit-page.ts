import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { errorMessages } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmService } from '../../core/ui/confirm.service';
import { ToastService } from '../../core/ui/toast.service';
import { formatDateTime, formatQty, signClass } from '../../shared/format/format';
import { DateTimePipe } from '../../shared/format/date-time.pipe';
import { QtyPipe } from '../../shared/format/qty.pipe';
import { AlertBox } from '../../shared/ui/alert-box';
import { StatusBadge } from '../../shared/ui/status-badge';
import { BusyFlag } from '../../shared/util/busy-flag';
import { Audit, AuditItem } from './audit';
import {
  addScan,
  changedLines,
  countDifference,
  countedTotal,
  countsFromAudit,
} from './audit-counts';
import { InventoryService } from './inventory.service';

/** Түгендеу: санау (сканер/қолмен), сақтау, бекіту, күшін жою. */
@Component({
  selector: 'app-audit-page',
  imports: [ReactiveFormsModule, RouterLink, AlertBox, StatusBadge, QtyPipe, DateTimePipe],
  templateUrl: './audit-page.html',
  host: { '(window:beforeunload)': 'warnUnsaved($event)' },
})
export class AuditPage {
  private readonly inventory = inject(InventoryService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly auth = inject(AuthService);

  /** Маршрут параметрі `:id` */
  readonly id = input.required<string>();

  private readonly scanInput = viewChild<ElementRef<HTMLInputElement>>('scan');
  private readonly cancelReasonInput = viewChild<ElementRef<HTMLInputElement>>('cancelReasonInput');
  private readonly countInputs = viewChildren<ElementRef<HTMLInputElement>>('countInput');

  protected readonly isManager = this.auth.isManager;
  protected readonly audit = signal<Audit | null>(null);
  protected readonly loadErrors = signal<readonly string[] | null>(null);
  protected readonly message = signal<readonly string[] | null>(null);
  /** Енгізілген сандар (әр пернеде) — қорытынды мен сақтау үшін */
  private readonly counts = signal<ReadonlyMap<number, string>>(new Map());
  /** Кестеде көрсетілген сандар — өріс өзгергенде (change) немесе сканерлегенде жаңарады */
  private readonly shown = signal<ReadonlyMap<number, string>>(new Map());
  private readonly dirty = signal<ReadonlySet<number>>(new Set());

  protected readonly step = new FormControl('1', { nonNullable: true });
  protected readonly comment = new FormControl('', { nonNullable: true });
  protected readonly cancelReason = new FormControl('', { nonNullable: true });
  protected readonly saveBusy = new BusyFlag();
  protected readonly approveBusy = new BusyFlag();
  protected readonly cancelBusy = new BusyFlag();

  protected readonly editable = computed(() => this.audit()?.status === 'DRAFT');
  protected readonly posted = computed(() => this.audit()?.status === 'POSTED');
  protected readonly hasChanges = computed(() => this.dirty().size > 0);
  protected readonly rows = computed(() => {
    const shown = this.shown();
    return (this.audit()?.items ?? []).map((item) => {
      const value = shown.get(item.product_id) ?? '';
      const difference = countDifference(item, value);
      return {
        item,
        value,
        difference,
        differenceText:
          difference === null ? '—' : (difference > 0 ? '+' : '') + formatQty(difference),
        differenceClass: difference === null ? 'num' : signClass(difference),
      };
    });
  });
  protected readonly summary = computed(() => {
    const total = this.audit()?.items.length ?? 0;
    const changed = this.dirty().size;
    return (
      `Саналды: ${countedTotal(this.counts())} / ${total}` +
      (changed ? ` · сақталмаған өзгеріс: ${changed}` : '')
    );
  });
  protected readonly canceledInfo = computed(() => {
    const audit = this.audit();
    if (audit?.status !== 'CANCELED') return null;
    return (
      `Күші жойылды: ${formatDateTime(audit.canceled_at)}${audit.canceled_by ? ` · ${audit.canceled_by}` : ''}` +
      (audit.cancel_reason ? ` · Себебі: ${audit.cancel_reason}` : '')
    );
  });

  constructor() {
    effect(() => {
      const id = Number(this.id());
      untracked(() => void this.load(id));
    });
  }

  protected warnUnsaved(event: BeforeUnloadEvent): void {
    if (this.hasChanges()) event.preventDefault();
  }

  protected typeCount(item: AuditItem, value: string): void {
    this.counts.update((counts) => new Map(counts).set(item.product_id, value));
    this.dirty.update((dirty) => new Set(dirty).add(item.product_id));
  }

  protected commitCounts(): void {
    this.shown.set(this.counts());
  }

  protected scanBarcode(input: HTMLInputElement): void {
    const code = input.value.trim();
    input.value = '';
    if (!code) return;
    const item = this.audit()?.items.find((i) => i.barcode === code);
    if (!item) {
      this.toast.show(`Бұл тауар түгендеуде жоқ: ${code}`, 'error');
      return;
    }
    const value = addScan(this.counts().get(item.product_id), this.step.value);
    this.typeCount(item, value);
    this.commitCounts();
    this.countInputs()
      .find((ref) => ref.nativeElement.dataset['productId'] === String(item.product_id))
      ?.nativeElement.scrollIntoView({ block: 'nearest' });
  }

  protected saveCounts(): Promise<void | undefined> {
    return this.saveBusy.run(async () => {
      if (await this.save()) this.toast.show('Сандар сақталды.');
    });
  }

  protected approve(): Promise<void | undefined> {
    return this.approveBusy.run(async () => {
      const audit = this.audit();
      if (!audit) return;
      const question =
        'Қалдықтар нақты санға теңестіріледі, айырма журналға жазылады. Бекітесіз бе?';
      if (!this.confirm.ask(question)) return;
      if (!(await this.save())) return;
      try {
        await this.inventory.approve(audit.id, this.comment.value);
        this.toast.show(`Түгендеу №${audit.number} бекітілді.`);
        await this.load(audit.id);
      } catch (error) {
        this.message.set(errorMessages(error));
      }
    });
  }

  protected cancel(): Promise<void | undefined> {
    return this.cancelBusy.run(async () => {
      const audit = this.audit();
      if (!audit) return;
      const posted = this.posted();
      // Өткізілген түгендеудің күшін жою себебі міндетті (сервер де тексереді)
      if (posted && !this.cancelReason.value.trim()) {
        this.message.set(['Өткізілген түгендеудің күшін жою себебін көрсетіңіз.']);
        this.cancelReasonInput()?.nativeElement.focus();
        return;
      }
      const question = posted
        ? 'Түгендеудің күшін жоясыз ба? Қалдықтар түгендеуге дейінгі күйге қайтарылады.'
        : 'Түгендеудің күшін жоясыз ба? Тауарлар бойынша бұғат алынады.';
      if (!this.confirm.ask(question)) return;
      try {
        await this.inventory.cancel(audit.id, this.cancelReason.value);
        this.toast.show(`Түгендеу №${audit.number}: күші жойылды.`);
        await this.load(audit.id);
      } catch (error) {
        this.message.set(errorMessages(error));
      }
    });
  }

  /** Өзгертілген сандарды сақтайды; сәтті болса (немесе сақтайтын ештеңе жоқ) — true. */
  private async save(): Promise<boolean> {
    const audit = this.audit();
    const items = changedLines(this.dirty(), this.counts());
    if (!audit || !items.length) return true;
    try {
      this.apply(await this.inventory.saveCounts(audit.id, items));
      return true;
    } catch (error) {
      this.message.set(errorMessages(error));
      return false;
    }
  }

  private async load(id: number): Promise<void> {
    this.audit.set(null);
    this.loadErrors.set(null);
    try {
      const audit = await this.inventory.get(id);
      this.apply(audit);
      this.comment.setValue(audit.comment);
      this.cancelReason.setValue('');
      if (audit.status === 'DRAFT') queueMicrotask(() => this.scanInput()?.nativeElement.focus());
    } catch (error) {
      this.loadErrors.set(errorMessages(error));
    }
  }

  private apply(audit: Audit): void {
    const counts = countsFromAudit(audit);
    this.audit.set(audit);
    this.counts.set(counts);
    this.shown.set(counts);
    this.dirty.set(new Set());
    this.message.set(null);
  }
}
