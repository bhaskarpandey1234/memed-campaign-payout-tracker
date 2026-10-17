import { describe, expect, it } from 'vitest';
import { formatRupeesIndian, rupeesToPaise } from './currency';

describe('currency helpers', () => {
  it('formats paise as Indian rupees', () => expect(formatRupeesIndian(123456)).toBe('₹1,234.56'));
  it('converts exact rupee strings to paise without drift', () => expect(rupeesToPaise('500.25')).toBe(50025));
  it('rejects malformed or over-precise rupee values', () => { expect(rupeesToPaise('3.456')).toBeNull(); expect(rupeesToPaise('abc')).toBeNull(); });
});
