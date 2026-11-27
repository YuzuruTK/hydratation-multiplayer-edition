export interface PeriodRange {
  start: string;
  end: string;
}

type DateParts = { year: number; month: number; day: number };

function getDateParts(date: Date, timeZone: string): DateParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function addCalendarDays(parts: DateParts, days: number): DateParts {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days, 12));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function timeZoneOffsetMs(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instant));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const representedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
  return representedAsUtc - Math.floor(instant / 1000) * 1000;
}

function localMidnightToUtc(parts: DateParts, timeZone: string): string {
  const localMidnightAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day);
  let instant = localMidnightAsUtc - timeZoneOffsetMs(localMidnightAsUtc, timeZone);
  instant = localMidnightAsUtc - timeZoneOffsetMs(instant, timeZone);
  return new Date(instant).toISOString();
}

export function getPeriodRange(
  period: 'day' | 'week' | 'month',
  now: Date,
  timeZone: string,
): PeriodRange {
  const today = getDateParts(now, timeZone);
  let startDate: DateParts;
  let endDate: DateParts;

  if (period === 'day') {
    startDate = today;
    endDate = addCalendarDays(today, 1);
  } else if (period === 'week') {
    const weekday = new Date(Date.UTC(today.year, today.month - 1, today.day, 12)).getUTCDay();
    const daysSinceMonday = (weekday + 6) % 7;
    startDate = addCalendarDays(today, -daysSinceMonday);
    endDate = addCalendarDays(startDate, 7);
  } else {
    startDate = { year: today.year, month: today.month, day: 1 };
    endDate = today.month === 12
      ? { year: today.year + 1, month: 1, day: 1 }
      : { year: today.year, month: today.month + 1, day: 1 };
  }

  return {
    start: localMidnightToUtc(startDate, timeZone),
    end: localMidnightToUtc(endDate, timeZone),
  };
}

export function getTodayRange(now: Date, timeZone: string): PeriodRange {
  return getPeriodRange('day', now, timeZone);
}
