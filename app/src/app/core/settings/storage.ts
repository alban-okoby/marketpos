/** Reads a saved value and checks it with `parse`, which always returns a valid value (the fallback when nothing usable is stored). */
export function readStored<T>(key: string, parse: (raw: unknown) => T): T {
  try {
    const stored = localStorage.getItem(key);
    return parse(stored === null ? null : JSON.parse(stored));
  } catch {
    return parse(null);
  }
}

/** Saves a value. If storage is blocked, the setting still applies for this session. */
export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is full or blocked.
  }
}

/** Text setting: trimmed and limited in length. Anything else falls back to the default. */
export function textOr(value: unknown, fallback: string, maxLength = 120): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : fallback;
}

/** Number setting kept within [min, max]. Anything else falls back to the default. */
export function numberOr(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}
