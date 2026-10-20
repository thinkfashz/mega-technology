/**
 * icons.js — sprite de iconos de MEGA TECHNOLOGY.
 * SVG inline, trazo 1.8, 24×24. Sin dependencias ni webfonts.
 * Uso: icon("cart", { size: 20, cls: "x" })
 */

const P = {
  menu: `<path d="M4 7h16M4 12h16M4 17h16"/>`,
  search: `<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-3.8-3.8"/>`,
  cart: `<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>`,
  home: `<path d="M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/>`,
  store: `<path d="M4 9.5 5.6 4h12.8L20 9.5M4 9.5V20h16V9.5M4 9.5h16"/><path d="M9 20v-5h6v5"/>`,
  grid: `<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>`,
  heart: `<path d="M12 20s-7.2-4.5-7.2-9.2A4.1 4.1 0 0 1 12 8.3a4.1 4.1 0 0 1 7.2 2.5C19.2 15.5 12 20 12 20z"/>`,
  "heart-fill": `<path d="M12 20s-7.2-4.5-7.2-9.2A4.1 4.1 0 0 1 12 8.3a4.1 4.1 0 0 1 7.2 2.5C19.2 15.5 12 20 12 20z" fill="currentColor"/>`,
  user: `<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/>`,
  "arrow-left": `<path d="M19 12H5m6-6-6 6 6 6"/>`,
  "arrow-right": `<path d="M5 12h14m-6-6 6 6-6 6"/>`,
  "chevron-right": `<path d="m9 5 7 7-7 7"/>`,
  "chevron-down": `<path d="m5 9 7 7 7-7"/>`,
  x: `<path d="M6 6l12 12M18 6 6 18"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  minus: `<path d="M5 12h14"/>`,
  filter: `<path d="M4 7h16M7 12h10M10 17h4"/><circle cx="17.5" cy="7" r="1.6"/><circle cx="6.5" cy="12" r="1.6"/>`,
  sliders: `<path d="M4 6h7M15 6h5M4 12h3M11 12h9M4 18h10M18 18h2"/><circle cx="13" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>`,
  call: `<path d="M5 4h4l1.6 4-2.1 1.6a12.5 12.5 0 0 0 5.9 5.9L16 13.4 20 15v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>`,
  pin: `<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/>`,
  building: `<path d="M4 21V5l8-2v18M12 21h8V9h-8"/><path d="M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2"/>`,
  card: `<rect x="2.5" y="5" width="19" height="14" rx="2.6"/><path d="M2.5 10h19M6 15h4"/>`,
  cash: `<rect x="2.5" y="6" width="19" height="12" rx="2.2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.01M18 12h.01"/>`,
  apple: `<path d="M16.4 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7s1.6.7 2.7.7c1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.3-.1 0-2-.8-2-3.6z"/><path d="M14.2 5.9c.6-.7 1-1.7.9-2.7-.9 0-2 .6-2.6 1.3-.6.6-1 1.6-.9 2.6 1 .1 2-.5 2.6-1.2z"/>`,
  truck: `<path d="M3 6.5h11V17H3zM14 10h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/>`,
  box: `<path d="M12 3 3 7.5v9L12 21l9-4.5v-9z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>`,
  check: `<path d="m5 12.5 4.5 4.5L19 7.5"/>`,
  "check-circle": `<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.7 2.7L16.5 9"/>`,
  star: `<path d="M12 3.6l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z" fill="currentColor" stroke="none"/>`,
  share: `<path d="M12 16V3m0 0L8 7m4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>`,
  wrench: `<path d="M15 3a5 5 0 0 0 6 6l-9.5 9.5a2.83 2.83 0 0 1-4-4L15 3z"/><path d="M6.5 17.5h.01"/>`,
  battery: `<rect x="2.5" y="8" width="16" height="8" rx="2"/><path d="M21 11v2M6 11v2M9.5 11v2M13 11v2"/>`,
  screen: `<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M9.5 6.5 12 9l-1.8 1.8 2.6 2.6"/>`,
  plug: `<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>`,
  phone: `<rect x="6.5" y="2.5" width="11" height="19" rx="2.6"/><path d="M10 5.5h4M11 18.5h2"/>`,
  case: `<rect x="6" y="2.5" width="12" height="19" rx="3.4"/><rect x="8.6" y="5" width="6.8" height="5.4" rx="1.6"/><circle cx="9.6" cy="14" r="1.1"/>`,
  buds: `<path d="M7.5 4.5a3.5 3.5 0 0 1 3.5 3.5v4a3 3 0 0 1-6 0V8a3.5 3.5 0 0 1 2.5-3.5z"/><path d="M16.5 4.5A3.5 3.5 0 0 0 13 8v4a3 3 0 0 0 6 0V8a3.5 3.5 0 0 0-2.5-3.5z"/><path d="M8 15v4.5M16 15v4.5"/>`,
  charger: `<rect x="5.5" y="8" width="13" height="10" rx="2.4"/><path d="M9 8V4M15 8V4M9.5 12h5"/>`,
  droplet: `<path d="M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10z"/>`,
  shield: `<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 11.8 2 2 4-4"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>`,
  "badge-check": `<circle cx="12" cy="12" r="9"/><path d="m8.2 12.2 2.6 2.6 5-5.2"/>`,
  whatsapp: `<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z" fill="currentColor" stroke="none"/><path d="M8.6 8.1c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.3 0 .6.5.8 1.2 1.4 2 1.8.3.1.4.1.6-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.2.4.4 0 .8-.4 1.5-1 1.8-.6.3-1.3.4-3.5-.5a9 9 0 0 1-3.8-3.6c-.6-1.2-.6-2.3-.3-3z" fill="#0a0f00" stroke="none"/>`,
  trash: `<path d="M4 7h16M9 7V4.8h6V7M6.5 7l1 14h9l1-14"/>`,
  edit: `<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="m14 6 4 4"/>`,
  chart: `<path d="M4 4v16h16"/><path d="M8 17v-5M12 17V8M16 17v-8"/>`,
  users: `<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.6a3 3 0 0 1 0 5.8M17.5 14a5.5 5.5 0 0 1 3 5"/>`,
  settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 5.6a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V11a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>`,
  logout: `<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>`,
  lock: `<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>`,
  sparkles: `<path d="m12 3 1.7 4.6L18 9.3l-4.3 1.7L12 15.6l-1.7-4.6L6 9.3l4.3-1.7z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>`,
  tag: `<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/>`,
  refresh: `<path d="M20 11a8 8 0 1 0-2.3 6M20 5v6h-6"/>`,
  download: `<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16"/>`,
  bell: `<path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7z"/><path d="M10 21h4"/>`,
  receipt: `<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>`,
  wallet: `<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z"/><path d="M3 8h18M16 13h2"/>`,
  headset: `<path d="M4 13v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="4" height="6" rx="1.6"/><rect x="17" y="13" width="4" height="6" rx="1.6"/><path d="M19 19a3 3 0 0 1-3 3h-2"/>`,
  eye: `<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>`,
  copy: `<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>`,
};

export function icon(name = "sparkles", { size = 22, cls = "", stroke = 1.8, fill = false } = {}) {
  const body = P[name] || P.sparkles;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" class="${cls}" aria-hidden="true" focusable="false" fill="${
    fill ? "currentColor" : "none"
  }" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

/** Marca: monograma M con bloque dorado (el de la referencia). */
export function brandMark(size = 26) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="m-gold-mark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f8e3ad"/><stop offset=".45" stop-color="#d3a94f"/><stop offset="1" stop-color="#91681f"/>
      </linearGradient>
    </defs>
    <path d="M5 31V12l8 8 7-9 7 9 8-8v19h-6V22l-6 7h-6l-6-7v9z" fill="url(#m-gold-mark)"/>
    <rect x="29" y="6" width="6" height="6" rx="1" fill="url(#m-gold-mark)"/>
  </svg>`;
}

/** Estrella de rating rellena */
export const star = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 3.4l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.5l5.8-.8z"/></svg>`;
