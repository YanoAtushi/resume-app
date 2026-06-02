// Helpers to format ISO date/month values (from native date pickers) into
// Japanese display strings, with graceful fallback for legacy free-text values.

export function formatJpDate(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return value;
  return `${Number(m[1])}年${Number(m[2])}月${Number(m[3])}日`;
}

export function formatJpMonth(value: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return value;
  return `${Number(m[1])}年${Number(m[2])}月`;
}

export function formatPeriod(
  startDate: string,
  endDate: string,
  current: boolean,
  fallback?: string,
): string {
  const start = startDate ? formatJpMonth(startDate) : "";
  const end = current ? "現在" : endDate ? formatJpMonth(endDate) : "";
  if (!start && !end) return fallback ?? "";
  if (start && end) return `${start} 〜 ${end}`;
  if (start) return `${start} 〜`;
  return end;
}
