import {
  centsToEditText,
  formatCents,
  formatCentsCompact,
  parseMoneyText,
  parseMoneyToCents,
  sanitizeMoneyText,
} from './money';

describe('money', () => {
  it('parses typed amounts to cents', () => {
    expect(parseMoneyToCents('1,450.50')).toBe(145_050);
    expect(parseMoneyToCents('$1,450.50')).toBe(145_050);
    expect(parseMoneyToCents(' 1450 ')).toBe(145_000);
    expect(parseMoneyToCents('0.5')).toBe(50);
  });

  it('rejects invalid amounts', () => {
    expect(parseMoneyToCents('')).toBeNull();
    expect(parseMoneyToCents('1.234')).toBeNull();
    expect(parseMoneyToCents('abc')).toBeNull();
    expect(parseMoneyToCents('-5')).toBeNull();
  });

  it('sanitizes and parses input text', () => {
    expect(sanitizeMoneyText('$1,240.555')).toBe('1240.55');
    expect(sanitizeMoneyText('007')).toBe('7');
    expect(parseMoneyText('1240.5')).toBe(124_050);
    expect(parseMoneyText('.')).toBeNull();
  });

  it('formats cents as CAD', () => {
    expect(formatCents(145_050)).toBe('$1,450.50');
    expect(formatCents(-145_050)).toBe('$1,450.50');
    expect(formatCentsCompact(145_000)).toBe('$1,450');
    expect(formatCentsCompact(145_050)).toBe('$1,450.50');
  });

  it('turns cents back into editable text', () => {
    expect(centsToEditText(124_050)).toBe('1240.50');
    expect(centsToEditText(124_000)).toBe('1240');
    expect(centsToEditText(null)).toBe('');
  });
});
