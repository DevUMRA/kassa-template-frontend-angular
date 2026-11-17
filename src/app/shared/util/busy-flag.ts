import { signal } from '@angular/core';

/** Батырманы сұраныс біткенше бұғаттайды — екі рет жіберуден қорғау. */
export class BusyFlag {
  private readonly state = signal(false);
  readonly active = this.state.asReadonly();

  async run<T>(action: () => Promise<T>): Promise<T | undefined> {
    if (this.state()) return undefined;
    this.state.set(true);
    try {
      return await action();
    } finally {
      this.state.set(false);
    }
  }
}
