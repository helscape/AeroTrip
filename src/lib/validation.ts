export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function required(value: string, label: string): string | undefined {
  return value.trim() ? undefined : `${label} is required.`;
}

export function validEmail(value: string): string | undefined {
  return EMAIL_RE.test(value.trim()) ? undefined : "Enter a valid email address.";
}

export function validFutureDate(value: string, label: string): string | undefined {
  if (!value) return `${label} is required.`;
  const today = new Date().toISOString().slice(0, 10);
  return value >= today ? undefined : `${label} cannot be in the past.`;
}

export function validPastDate(value: string, label: string): string | undefined {
  if (!value) return `${label} is required.`;
  const today = new Date().toISOString().slice(0, 10);
  return value < today ? undefined : `${label} must be in the past.`;
}

/** Collect the first error from a list of validators. */
export function firstError(...errors: Array<string | undefined>): string | undefined {
  return errors.find(Boolean);
}
