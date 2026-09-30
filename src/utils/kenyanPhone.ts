export function normalizeKenyanMobilePhone(value: string): string | null {
  const rawValue = String(value ?? '').trim();
  const numericValue = Number(rawValue);
  const phoneValue = /e[+-]?\d+$/i.test(rawValue) && Number.isSafeInteger(numericValue)
    ? String(Math.trunc(numericValue))
    : rawValue;
  const digits = phoneValue.replace(/\D/g, '');
  let nationalNumber = digits;

  if (digits.startsWith('254')) {
    nationalNumber = `0${digits.slice(3)}`;
  } else if (/^\d{9}$/.test(digits)) {
    nationalNumber = `0${digits}`;
  }

  return /^0[17]\d{8}$/.test(nationalNumber) ? nationalNumber : null;
}
