import { Role, isRole } from './permissions';

/** A user account. The PIN is never stored: only a salted PBKDF2 hash of it (US-01). */
export interface UserAccount {
  readonly id: string;
  readonly name: string;
  readonly roleId: Role;
  readonly salt: string;
  readonly pinHash: string;
  readonly active: boolean;
}

export const PBKDF2_ITERATIONS = 150_000;
export const PIN_LENGTH = 4;

const encoder = new TextEncoder();

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Random 16-byte salt, in hexadecimal. */
export function newSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
}

/** PBKDF2-SHA256 hash of a PIN with its salt, in hexadecimal. */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return toHex(bits);
}

/** A PIN is exactly PIN_LENGTH digits. */
export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

/** Saved accounts, checked. Invalid entries are dropped rather than trusted. */
export function parseAccounts(raw: unknown): UserAccount[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter(
    (item): item is UserAccount =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      isRole(item.roleId) &&
      typeof item.salt === 'string' &&
      typeof item.pinHash === 'string' &&
      typeof item.active === 'boolean',
  );
}

