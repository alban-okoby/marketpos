import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

/** Current time and date, formatted for French-speaking users (24-hour clock). */
@Injectable({ providedIn: 'root' })
export class ClockService {
  private readonly timeFormat = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
  private readonly dateFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  private readonly now = signal(new Date());

  readonly time = computed(() => this.timeFormat.format(this.now()));
  readonly date = computed(() => {
    const text = this.dateFormat.format(this.now());
    return text.charAt(0).toUpperCase() + text.slice(1);
  });

  constructor() {
    // Minute precision is enough for the clock; 15 s keeps it correct without waking the UI every second.
    const timer = setInterval(() => this.now.set(new Date()), 15_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}
