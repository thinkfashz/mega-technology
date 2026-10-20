/**
 * format.js — formato y utilidades puras (sin DOM, sin estado).
 * Todo lo que se muestra con números o fechas pasa por acá.
 */

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const clpCompact = new Intl.NumberFormat("es-CL", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dayShort = new Intl.DateTimeFormat("es-CL", { weekday: "short" });
const dateLong = new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short" });
const timeShort = new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" });

/** $12.990 */
export const money = (n) => clp.format(Number(n) || 0);

/** $1,2 M (para ejes de gráficos) */
export const moneyCompact = (n) => "$" + clpCompact.format(Number(n) || 0).replace(" mil", "k");

/** 4.8 */
export const rating = (n) => (Number(n) || 0).toFixed(1);

/** "Hoy, 09:41" / "12 oct" */
export function dateLabel(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return `Hoy, ${timeShort.format(d)}`;
  return dateLong.format(d);
}

export function weekdayShort(date) {
  const s = dayShort.format(date).replace(".", "");
  return s.charAt(0).toUpperCase() + s.slice(1, 3);
}

export function timeLabel(iso) {
  return timeShort.format(new Date(iso));
}

/** Días transcurridos desde hoy (0 = hoy) */
export function dayOffset(date) {
  const a = new Date(date);
  a.setHours(0, 0, 0, 0);
  const b = new Date();
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / 86400000);
}

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const esc = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const slugify = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const uid = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

/** Normaliza texto para búsqueda sin tildes. */
export const norm = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
