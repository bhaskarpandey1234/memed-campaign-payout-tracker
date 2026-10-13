export function formatRupees(paise: number) {
  return `₹${(paise / 100).toFixed(2)}`;
}

export function formatRupeesIndian(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
