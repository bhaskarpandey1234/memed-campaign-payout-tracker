export function formatRupees(paise: number) {
  return formatRupeesIndian(paise);
}

export function formatRupeesIndian(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Converts a user-entered rupee value to paise without floating-point drift. */
export function rupeesToPaise(value: string): number | null {
  const normalized = value.trim().replace(/,/g, '');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, decimal = ''] = normalized.split('.');
  const paise = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  return Number.isSafeInteger(paise) ? paise : null;
}

export function paiseToRupeesInput(paise: number) {
  return (paise / 100).toFixed(2);
}
