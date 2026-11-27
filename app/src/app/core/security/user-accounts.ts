import { Role, isRole } from './permissions';

/**
 * A user account. Neither the password nor the PIN is stored: only a salted PBKDF2 hash of each (US-01).
 * The login (identifiant) is what the user types on the lock screen; the password signs them in;
 * the PIN is only asked for the manager's authorisations (closing, US-03).
 */
export interface UserAccount {
  readonly id: string;
  readonly name: string;
  /** Identifiant used to sign in. Lowercase, unique. */
  readonly login: string;
  readonly roleId: Role;
  readonly passwordSalt: string;
  readonly passwordHash: string;
  readonly salt: string;
  readonly pinHash: string;
  readonly active: boolean;
}

export const PBKDF2_ITERATIONS = 150_000;
export const PIN_LENGTH = 4;
const LOGIN_PATTERN = /^[a-z0-9._-]{3,32}$/;

const encoder = new TextEncoder();

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Random 16-byte salt, in hexadecimal. */
export function newSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
}

/** PBKDF2-SHA256 hash of a secret (PIN or password) with its salt, in hexadecimal. */
export async function hashSecret(secret: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), 'PBKDF2', false, ['deriveBits']);
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

/** A password has at least `minLength` characters, and is not only spaces. */
export function isValidPassword(password: string, minLength: number): boolean {
  return password.length >= minLength && password.trim() !== '';
}

/** Identifiant as typed: trimmed and lowercase. Returns null when it breaks the format. */
export function normalizeLogin(login: string): string | null {
  const value = login.trim().toLowerCase();
  return LOGIN_PATTERN.test(value) ? value : null;
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
      typeof item.login === 'string' &&
      isRole(item.roleId) &&
      typeof item.passwordSalt === 'string' &&
      typeof item.passwordHash === 'string' &&
      typeof item.salt === 'string' &&
      typeof item.pinHash === 'string' &&
      typeof item.active === 'boolean',
  );
}
