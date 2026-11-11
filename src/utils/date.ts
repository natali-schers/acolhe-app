const locale = "pt-BR";

/** Data de hoje no horário informado (ISO). */
export function todayAt(hours: number, minutes = 0): string {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

/** Data relativa a hoje: daysFromToday(-2, 9, 30) = anteontem às 09:30. */
export function daysFromToday(days: number, hours = 12, minutes = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
}

export function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export function formatWeekdayHeader(date = new Date()) {
  return date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
}

/** "Hoje", "Amanhã", "Ontem" ou a data curta. */
export function formatRelativeDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.round((new Date(d.toDateString()).getTime() - new Date(today.toDateString()).getTime()) / 86_400_000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  return d.toLocaleDateString(locale, { day: "2-digit", month: "short" }).replace(".", "");
}

export function formatDayAndTime(iso: string) {
  return `${formatRelativeDay(iso)}, ${formatTime(iso)}`;
}

/** "Há 8 minutos", "Há 2 horas"... */
export function formatTimeAgo(iso: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "Agora";
  if (minutes < 60) return `Há ${minutes} minuto${minutes > 1 ? "s" : ""}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Há ${hours} hora${hours > 1 ? "s" : ""}`;
  const days = Math.round(hours / 24);
  return `Há ${days} dia${days > 1 ? "s" : ""}`;
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} min ${String(s).padStart(2, "0")} s` : `${s} s`;
}
