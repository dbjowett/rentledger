import {
  addDaysTo,
  addMonthsTo,
  currentMonthStart,
  dueDateInMonth,
  formatDayOrdinal,
  formatMonthShort,
  formatMonthYear,
  isDateWithinMonthsAhead,
  isIsoDate,
  isMonthStart,
  isWithinMonthsAhead,
  monthsBetween,
  todayIn,
  toMonthStart,
} from './dates';

describe('dates', () => {
  beforeEach(() => {
    // 2026-10-01 02:00 UTC is still Sep 30 in Toronto and Vancouver.
    jest.useFakeTimers({ now: new Date('2026-10-01T02:00:00Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reads today in the given time zone', () => {
    expect(todayIn('UTC')).toBe('2026-10-01');
    expect(todayIn('America/Toronto')).toBe('2026-09-30');
    expect(todayIn('America/Vancouver')).toBe('2026-09-30');
  });

  it('reads the current month in the given time zone', () => {
    expect(currentMonthStart('UTC')).toBe('2026-10-01');
    expect(currentMonthStart('America/Toronto')).toBe('2026-09-01');
  });

  it('validates month starts', () => {
    expect(isMonthStart('2026-10-01')).toBe(true);
    expect(isMonthStart('2026-10-14')).toBe(false);
    expect(isMonthStart('2026-13-01')).toBe(false);
    expect(isMonthStart('Oct 2026')).toBe(false);
  });

  it('validates calendar dates', () => {
    expect(isIsoDate('2026-10-14')).toBe(true);
    expect(isIsoDate('2028-02-29')).toBe(true);
    expect(isIsoDate('2027-02-29')).toBe(false);
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('2026-10-1')).toBe(false);
  });

  it('moves days and limits dates to months ahead', () => {
    expect(addDaysTo('2026-10-14', -90)).toBe('2026-07-16');
    expect(addDaysTo('2026-12-31', 1)).toBe('2027-01-01');
    expect(isDateWithinMonthsAhead('2027-10-01', 12, 'UTC')).toBe(true);
    expect(isDateWithinMonthsAhead('2027-10-02', 12, 'UTC')).toBe(false);
  });

  it('does month arithmetic across years', () => {
    expect(toMonthStart('2026-10-14')).toBe('2026-10-01');
    expect(addMonthsTo('2026-11-01', 3)).toBe('2027-02-01');
    expect(addMonthsTo('2026-01-01', -1)).toBe('2025-12-01');
    expect(monthsBetween('2026-10-01', '2027-01-01')).toBe(3);
    expect(monthsBetween('2027-01-01', '2026-10-01')).toBe(-3);
  });

  it('allows months up to the limit ahead and any past month', () => {
    expect(isWithinMonthsAhead('2027-10-01', 12, 'UTC')).toBe(true);
    expect(isWithinMonthsAhead('2027-11-01', 12, 'UTC')).toBe(false);
    expect(isWithinMonthsAhead('2020-01-01', 12, 'UTC')).toBe(true);
  });

  it('resolves "last day" to each month’s real last day', () => {
    expect(dueDateInMonth('2027-02-01', { type: 'last' })).toBe('2027-02-28');
    expect(dueDateInMonth('2028-02-01', { type: 'last' })).toBe('2028-02-29');
    expect(dueDateInMonth('2026-04-01', { type: 'last' })).toBe('2026-04-30');
    expect(dueDateInMonth('2026-10-01', { type: 'last' })).toBe('2026-10-31');
  });

  it('resolves a fixed due day', () => {
    expect(dueDateInMonth('2026-10-01', { type: 'day', day: 1 })).toBe('2026-10-01');
    expect(dueDateInMonth('2027-02-01', { type: 'day', day: 28 })).toBe('2027-02-28');
  });

  it('formats months and ordinals', () => {
    expect(formatMonthYear('2026-10-01')).toBe('October 2026');
    expect(formatMonthShort('2026-10-01')).toBe('Oct');
    expect(formatDayOrdinal(1)).toBe('1st');
    expect(formatDayOrdinal(2)).toBe('2nd');
    expect(formatDayOrdinal(3)).toBe('3rd');
    expect(formatDayOrdinal(11)).toBe('11th');
    expect(formatDayOrdinal(22)).toBe('22nd');
  });
});
