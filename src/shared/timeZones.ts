function isValidTimeZone(timeZone: string): boolean {
  if (timeZone.trim() === '') return false;
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone }).resolvedOptions().timeZone !== '';
  } catch {
    return false;
  }
}

/** "America/Argentina/Buenos_Aires" → "Buenos Aires" */
function timeZoneCity(timeZone: string): string {
  return (timeZone.split('/').at(-1) ?? timeZone).replaceAll('_', ' ');
}

/** "Asia/Seoul" → "GMT+9" for the current date (DST-aware). Falls back to the id. */
function timeZoneOffset(timeZone: string, at: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    }).formatToParts(at);
    return parts.find((part) => part.type === 'timeZoneName')?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

function deviceTimeZone(): string | null {
  try {
    const { timeZone } = new Intl.DateTimeFormat().resolvedOptions();
    return isValidTimeZone(timeZone) ? timeZone : null;
  } catch {
    return null;
  }
}

export { deviceTimeZone, isValidTimeZone, timeZoneCity, timeZoneOffset };
