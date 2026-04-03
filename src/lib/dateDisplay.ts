/**
 * Calendar dates from the API (`LocalDate` as "YYYY-MM-DD") must not be formatted via
 * `new Date(iso).toLocaleDateString({ timeZone })` — that treats midnight as UTC and can
 * shift the displayed day. Parse year/month/day and format as a civil date.
 */
export function formatIsoDateOnly(
  value: string | undefined | null,
  locale?: string | Intl.LocalesArgument,
): string {
  if (value == null || value === "") return "—";
  const s = String(value).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString(locale, { dateStyle: "medium" });
  }
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);
  return d.toLocaleDateString(locale, { dateStyle: "medium" });
}
