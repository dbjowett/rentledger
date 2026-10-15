import { TZDate } from '@date-fns/tz';
import {
  addDays,
  addMonths,
  differenceInCalendarMonths,
  format,
  isValid,
  lastDayOfMonth,
  parseISO,
  setDate,
  startOfMonth,
} from 'date-fns';

/**
 * Date logic shared by the app and the API routes.
 *
 * Rent works in calendar dates, not instants: "rent for October" or "due on the 1st" means the
 * same day wherever the user is. So dates travel as plain strings matching Postgres `date`:
 * - {@link IsoDate} `YYYY-MM-DD`, a calendar day.
 * - {@link MonthStart} `YYYY-MM-01`, a whole month.
 *
 * Only "what day is it now?" depends on a time zone; pass the user's saved one.
 */

/** A calendar day, `YYYY-MM-DD`. No time and no time zone. */
type IsoDate = string;

/** A calendar month, written as its first day: `YYYY-MM-01`. */
type MonthStart = string;

/** When rent is due within a month: a fixed day 1–28, or the month's last day (28th–31st). */
type DueDay = { type: 'day'; day: number } | { type: 'last' };

const ISO_DATE_FORMAT = 'yyyy-MM-dd';

const MONTH_START_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-01$/;

const ISO_DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/**
 * Parses a calendar date as local midnight, so date-fns arithmetic never shifts it a day.
 * @example parseIsoDate('2026-10-01') // Oct 1 2026, 00:00 local
 */
function parseIsoDate(value: IsoDate): Date {
  return parseISO(value);
}

/**
 * Formats a date's calendar day, ignoring its time.
 * @example toIsoDate(new Date(2026, 9, 14)) // '2026-10-14'
 */
function toIsoDate(date: Date): IsoDate {
  return format(date, ISO_DATE_FORMAT);
}

/**
 * True when `value` is a real `YYYY-MM-01` month start.
 * @example isMonthStart('2026-10-01') // true
 * @example isMonthStart('2026-10-14') // false
 */
function isMonthStart(value: string): value is MonthStart {
  return MONTH_START_PATTERN.test(value) && isValid(parseIsoDate(value));
}

/**
 * True when `value` is a real `YYYY-MM-DD` calendar day.
 * @example isIsoDate('2026-10-14') // true
 * @example isIsoDate('2026-02-30') // false
 */
function isIsoDate(value: string): value is IsoDate {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const parsed = parseIsoDate(value);
  return isValid(parsed) && toIsoDate(parsed) === value;
}

/**
 * Today's calendar date in `timeZone`.
 * @param timeZone IANA name, e.g. the user's `settings.timeZone`.
 * @example todayIn('America/Vancouver') // '2026-10-14'
 */
function todayIn(timeZone: string): IsoDate {
  return toIsoDate(TZDate.tz(timeZone));
}

/**
 * The month containing today in `timeZone`. Defaults the "Renting since" field.
 * @example currentMonthStart('America/Toronto') // '2026-10-01'
 */
function currentMonthStart(timeZone: string): MonthStart {
  return toIsoDate(startOfMonth(TZDate.tz(timeZone)));
}

/**
 * The month start of any calendar date.
 * @example toMonthStart('2026-10-14') // '2026-10-01'
 */
function toMonthStart(value: IsoDate): MonthStart {
  return toIsoDate(startOfMonth(parseIsoDate(value)));
}

/**
 * Moves a calendar day forward or back.
 * @example addDaysTo('2026-10-14', -90) // '2026-07-16'
 */
function addDaysTo(date: IsoDate, days: number): IsoDate {
  return toIsoDate(addDays(parseIsoDate(date), days));
}

/**
 * Moves a month forward or back.
 * @example addMonthsTo('2026-11-01', 3) // '2027-02-01'
 */
function addMonthsTo(month: MonthStart, months: number): MonthStart {
  return toIsoDate(addMonths(parseIsoDate(month), months));
}

/**
 * Whole months from `from` to `to` (negative when `to` is earlier).
 * @example monthsBetween('2026-10-01', '2027-01-01') // 3
 */
function monthsBetween(from: MonthStart, to: MonthStart): number {
  return differenceInCalendarMonths(parseIsoDate(to), parseIsoDate(from));
}

/**
 * True when `month` is no more than `months` after the current month in `timeZone`.
 * Past months always pass.
 * @example isWithinMonthsAhead('2027-10-01', 12, 'America/Toronto') // true in Oct 2026
 */
function isWithinMonthsAhead(month: MonthStart, months: number, timeZone: string): boolean {
  return monthsBetween(currentMonthStart(timeZone), month) <= months;
}

/**
 * True when `date` is no later than the same day `months` from today in `timeZone`.
 * Past dates always pass.
 * @example isDateWithinMonthsAhead('2027-10-14', 12, 'UTC') // true on 2026-10-14
 */
function isDateWithinMonthsAhead(date: IsoDate, months: number, timeZone: string): boolean {
  const today = parseIsoDate(todayIn(timeZone));
  return date <= toIsoDate(addMonths(today, months));
}

/**
 * The actual due date of rent for a month. "Last day" resolves to that month's real last day.
 * @example dueDateInMonth('2027-02-01', { type: 'last' }) // '2027-02-28'
 * @example dueDateInMonth('2028-02-01', { type: 'last' }) // '2028-02-29'
 * @example dueDateInMonth('2026-10-01', { type: 'day', day: 15 }) // '2026-10-15'
 */
function dueDateInMonth(month: MonthStart, due: DueDay): IsoDate {
  const start = parseIsoDate(month);
  if (due.type === 'last') return toIsoDate(lastDayOfMonth(start));
  return toIsoDate(setDate(start, due.day));
}

/**
 * A calendar day for display.
 * @example formatDateMedium('2026-10-14') // 'Oct 14, 2026'
 */
function formatDateMedium(date: IsoDate): string {
  return format(parseIsoDate(date), 'MMM d, yyyy');
}

/**
 * Long month and year for display.
 * @example formatMonthYear('2026-10-01') // 'October 2026'
 */
function formatMonthYear(month: MonthStart): string {
  return format(parseIsoDate(month), 'MMMM yyyy');
}

/**
 * Short month name for compact pickers.
 * @example formatMonthShort('2026-10-01') // 'Oct'
 */
function formatMonthShort(month: MonthStart): string {
  return format(parseIsoDate(month), 'MMM');
}

/**
 * A day of the month as an English ordinal.
 * @example formatDayOrdinal(1) // '1st'
 * @example formatDayOrdinal(22) // '22nd'
 */
function formatDayOrdinal(day: number): string {
  return format(new Date(2000, 0, day), 'do');
}

export {
  type DueDay,
  type IsoDate,
  type MonthStart,
  addDaysTo,
  addMonthsTo,
  currentMonthStart,
  dueDateInMonth,
  formatDateMedium,
  formatDayOrdinal,
  formatMonthShort,
  formatMonthYear,
  isDateWithinMonthsAhead,
  isIsoDate,
  isMonthStart,
  isWithinMonthsAhead,
  monthsBetween,
  parseIsoDate,
  toIsoDate,
  todayIn,
  toMonthStart,
};
