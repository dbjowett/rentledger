/**
 * Money helpers. Amounts are always integer cents (CAD); text and display formats only exist at
 * the edges (inputs and labels).
 */

const MAX_DOLLAR_DIGITS = 9;

const formatters = {
  cents: new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }),
  whole: new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
  grouped: new Intl.NumberFormat('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
};

/**
 * Formats cents as CAD. Always unsigned.
 * @param hideCents Rounds to whole dollars.
 * @example formatCents(124050) // '$1,240.50'
 * @example formatCents(124050, true) // '$1,241'
 */
function formatCents(cents: number, hideCents = false): string {
  return (hideCents ? formatters.whole : formatters.cents).format(Math.abs(cents) / 100);
}

/**
 * Like {@link formatCents}, but drops ".00" only when the amount is whole dollars.
 * @example formatCentsCompact(145000) // '$1,450'
 * @example formatCentsCompact(145050) // '$1,450.50'
 */
function formatCentsCompact(cents: number): string {
  return formatCents(cents, cents % 100 === 0);
}

/**
 * Grouped amount without the currency sign, for showing inside an input.
 * @example formatCentsGrouped(124050) // '1,240.50'
 */
function formatCentsGrouped(cents: number | null): string {
  return cents === null ? '' : formatters.grouped.format(cents / 100);
}

/**
 * Cleans typed text: keeps digits and the first dot, at most 2 decimals.
 * @example sanitizeMoneyText('$1,240.555') // '1240.55'
 */
function sanitizeMoneyText(text: string): string {
  const cleaned = text.replaceAll(/[^\d.]/g, '');
  const [whole = '', ...fractionParts] = cleaned.split('.');
  const dollars = whole.replace(/^0+(?=\d)/, '').slice(0, MAX_DOLLAR_DIGITS);
  if (fractionParts.length === 0) return dollars;
  return `${dollars === '' ? '0' : dollars}.${fractionParts.join('').slice(0, 2)}`;
}

/**
 * Sanitized text to cents. Empty input is null, not 0.
 * @example parseMoneyText('1240.5') // 124050
 */
function parseMoneyText(text: string): number | null {
  if (text === '' || text === '.') return null;
  const [whole = '0', fraction = ''] = text.split('.');
  return Number(whole === '' ? '0' : whole) * 100 + Number(fraction.padEnd(2, '0'));
}

/**
 * Any typed amount ("$1,450.50", "1450") to cents, or null when it isn't a valid amount.
 * @example parseMoneyToCents('$1,450.50') // 145050
 */
function parseMoneyToCents(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\$?\s*[\d,\s]*(\.\d{0,2})?$/.test(trimmed)) return null;
  return parseMoneyText(sanitizeMoneyText(trimmed));
}

/**
 * Cents to editable text; whole dollars drop the fraction.
 * @example centsToEditText(124050) // '1240.50'
 * @example centsToEditText(124000) // '1240'
 */
function centsToEditText(cents: number | null): string {
  if (cents === null) return '';
  const dollars = Math.trunc(cents / 100);
  const rest = cents % 100;
  return rest === 0 ? String(dollars) : `${dollars}.${String(rest).padStart(2, '0')}`;
}

export {
  centsToEditText,
  formatCents,
  formatCentsCompact,
  formatCentsGrouped,
  parseMoneyText,
  parseMoneyToCents,
  sanitizeMoneyText,
};
