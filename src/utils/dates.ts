import { RULES } from './ranking.ts';

export function parseExportDate(value: unknown): Date | null {
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    12,
    0,
    0,
  );
}

export function getCycleDeadline(
  exportedAt: unknown,
  fallbackDate: Date,
): Date {
  const base = parseExportDate(exportedAt) ?? fallbackDate;
  const day = base.getDay();
  const daysUntilSunday = (7 - day) % 7;
  const deadline = new Date(base);
  deadline.setDate(base.getDate() + daysUntilSunday);
  deadline.setHours(RULES.deadlineHour, 0, 0, 0);
  return deadline;
}
