/**
 * art.js — ilustraciones SVG de producto (sin fotos, sin red).
 * Cada producto declara { kind, color, ... } y acá se dibuja.
 * Los ids de gradiente son únicos por instancia para evitar colisiones.
 */

let seq = 0;

function shade(hex, amount) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const glow = (id, color) => `
  <radialGradient id="${id}-glow" cx="50%" cy="45%" r="55%">
    <stop offset="0" stop-color="${color}" stop-opacity=".38"/>
    <stop offset=".55" stop-color="${color}" stop-opacity=".12"/>
    <stop offset="1" stop-color="${color}" stop-opacity="0"/>
  </radialGradient>`;

const sheen = (id) => `
  <linearGradient id="${id}-sheen" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".30"/>
    <stop offset=".42" stop-color="#fff" stop-opacity=".05"/>
    <stop offset=".7" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>`;

function caseSvg(id, spec) {
  const c = spec.color || "#b7e33b";
  const light = shade(c, 30);
  const dark = shade(c, -26);
  const deep = shade(c, -50);
  const clear = Boolean(spec.clear);
  const leather = Boolean(spec.leather);

  return `
  <defs>
    <linearGradient id="${id}-body" x1="0" y1="0" x2=".9" y2="1">
      <stop offset="0" stop-color="${light}"/>
      <stop offset=".42" stop-color="${c}"/>
      <stop offset="1" stop-color="${dark}"/>
    </linearGradient>
    <linearGradient id="${id}-cam" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${shade(c, -38)}"/>
      <stop offset="1" stop-color="${deep}"/>
    </linearGradient>
    ${sheen(id)}
    ${glow(id, c)}
  </defs>
  <ellipse cx="100" cy="199" rx="54" ry="10" fill="#000" opacity=".5"/>
  <circle cx="100" cy="104" r="86" fill="url(#${id}-glow)"/>
  <g>
    <rect x="57" y="15" width="86" height="178" rx="27" fill="url(#${id}-body)" stroke="${clear ? "rgba(255,255,255,.42)" : shade(c, 18)}" stroke-opacity=".55"/>
    <rect x="59.5" y="17.5" width="81" height="173" rx="25" fill="none" stroke="#000" stroke-opacity="${clear ? ".18" : ".22"}"/>
    <rect x="72" y="29" width="45" height="49" rx="14" fill="url(#${id}-cam)"/>
    <rect x="72" y="29" width="45" height="49" rx="14" fill="none" stroke="#fff" stroke-opacity=".12"/>
    <circle cx="85" cy="43" r="8.6" fill="#101010" stroke="${shade(c, -60)}" stroke-width="1.4"/>
    <circle cx="85" cy="43" r="5.2" fill="#1d2430"/>
    <circle cx="83.4" cy="41.4" r="1.6" fill="#9fd8ff" opacity=".85"/>
    <circle cx="105" cy="43" r="8.6" fill="#101010" stroke="${shade(c, -60)}" stroke-width="1.4"/>
    <circle cx="105" cy="43" r="5.2" fill="#1d2430"/>
    <circle cx="103.4" cy="41.4" r="1.6" fill="#9fd8ff" opacity=".85"/>
    <circle cx="85" cy="63" r="6.4" fill="#101010"/>
    <circle cx="85" cy="63" r="3.4" fill="#20262e"/>
    <circle cx="104" cy="63" r="2.6" fill="#f4e2a1" opacity=".55"/>
    <path d="M63 46c0-14 9-25 23-27l-7 152c-9-3-14-10-15-19z" fill="url(#${id}-sheen)"/>
    ${
      spec.magsafe
        ? `<circle cx="100" cy="132" r="29" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2.4"/>
           <circle cx="100" cy="132" r="20" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1.4"/>
           <circle cx="100" cy="103" r="3" fill="rgba(255,255,255,.55)"/>`
        : ""
    }
    ${
      leather
        ? `<rect x="66" y="90" width="68" height="92" rx="18" fill="none" stroke="rgba(255,238,205,.32)" stroke-width="1" stroke-dasharray="3 4"/>
           <path d="M66 120h68M66 150h68" stroke="rgba(0,0,0,.12)" stroke-width="1"/>`
        : ""
    }
    ${
      clear
        ? `<path d="M72 34 116 24 92 188 66 182z" fill="#fff" opacity=".10"/>
           <path d="M126 28 138 58 122 176" stroke="#fff" stroke-opacity=".18" stroke-width="2" fill="none"/>`
        : ""
    }
    <rect x="142" y="62" width="3" height="24" rx="1.5" fill="${deep}"/>
    <rect x="142" y="96" width="3" height="15" rx="1.5" fill="${deep}"/>
    <rect x="55" y="58" width="3" height="20" rx="1.5" fill="${deep}"/>
  </g>`;
}

function phoneSvg(id, spec) {
  const c = spec.color || "#3a3f46";
  const light = shade(c, 28);
  const dark = shade(c, -30);
  return `
  <defs>
    <linearGradient id="${id}-body" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${light}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${dark}"/>
    </linearGradient>
    <linearGradient id="${id}-screen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1c2229"/><stop offset=".6" stop-color="#0a0d11"/><stop offset="1" stop-color="#232a33"/>
    </linearGradient>
    ${sheen(id)}
    ${glow(id, "#d3a94f")}
  </defs>
  <ellipse cx="100" cy="200" rx="52" ry="9" fill="#000" opacity=".55"/>
  <circle cx="100" cy="104" r="88" fill="url(#${id}-glow)"/>
  <rect x="56" y="12" width="88" height="184" rx="24" fill="url(#${id}-body)" stroke="${shade(c, 40)}" stroke-opacity=".5"/>
  <rect x="59" y="15" width="82" height="178" rx="21" fill="none" stroke="#000" stroke-opacity=".3"/>
  <rect x="61" y="17" width="78" height="174" rx="20" fill="url(#${id}-screen)"/>
  <rect x="69" y="26" width="48" height="52" rx="13" fill="${shade(c, -20)}" stroke="#fff" stroke-opacity=".1"/>
  <circle cx="83" cy="41" r="9" fill="#0b0d10" stroke="#3a3f45"/>
  <circle cx="83" cy="41" r="5.6" fill="#151c26"/><circle cx="81.4" cy="39.4" r="1.7" fill="#89c8ff" opacity=".8"/>
  <circle cx="104" cy="41" r="9" fill="#0b0d10" stroke="#3a3f45"/>
  <circle cx="104" cy="41" r="5.6" fill="#151c26"/><circle cx="102.4" cy="39.4" r="1.7" fill="#89c8ff" opacity=".8"/>
  <circle cx="83" cy="63" r="7" fill="#0b0d10" stroke="#3a3f45"/>
  <circle cx="83" cy="63" r="3.8" fill="#151c26"/>
  <rect x="94" y="58" width="9" height="9" rx="2" fill="#f4e2a1" opacity=".45"/>
  <path d="M66 42c0-13 8-22 20-24l-5 152c-8-3-13-10-14-19z" fill="url(#${id}-sheen)"/>
  <circle cx="100" cy="128" r="13" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1.4"/>
  <path d="M95 133c0-4 2-7 5-7s5 3 5 7" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="1.2"/>
  <rect x="143" y="58" width="3" height="26" rx="1.5" fill="${shade(c, -40)}"/>
  <rect x="143" y="94" width="3" height="18" rx="1.5" fill="${shade(c, -40)}"/>`;
}

function budsSvg(id, spec) {
  const c = spec.color || "#b7e33b";
  const light = shade(c, 34);
  const dark = shade(c, -30);
  return `
  <defs>
    <linearGradient id="${id}-body" x1="0" y1="0" x2=".8" y2="1">
      <stop offset="0" stop-color="${light}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${dark}"/>
    </linearGradient>
    ${sheen(id)}
    ${glow(id, c)}
  </defs>
  <ellipse cx="100" cy="190" rx="56" ry="10" fill="#000" opacity=".5"/>
  <circle cx="100" cy="112" r="82" fill="url(#${id}-glow)"/>
  <rect x="46" y="58" width="108" height="96" rx="38" fill="url(#${id}-body)" stroke="${shade(c, 20)}" stroke-opacity=".55"/>
  <rect x="49" y="61" width="102" height="90" rx="35" fill="none" stroke="#000" stroke-opacity=".18"/>
  <path d="M50 96c18 4 32 6 50 6s32-2 50-6" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1.6"/>
  <path d="M54 66c8-7 16-8 24-8" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round" fill="none"/>
  <circle cx="100" cy="138" r="2.6" fill="#0a1200" opacity=".0"/>
  <circle cx="100" cy="87" r="2.4" fill="#0d1400" opacity=".55"/>
  <path d="M132 58c8 6 12 15 12 25v30" stroke="#fff" stroke-opacity=".18" stroke-width="2" fill="none"/>
  ${
    spec.case
      ? `<path d="M150 92c10 2 14 8 10 14-3 5-10 4-12-2" fill="none" stroke="${shade(c, -20)}" stroke-width="3"/>
         <circle cx="158" cy="88" r="7" fill="none" stroke="#d3a94f" stroke-width="2.4"/>`
      : ""
  }`;
}

function watchSvg(id, spec) {
  const c = spec.color || "#d3a94f";
  return `
  <defs>
    <linearGradient id="${id}-body" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${shade(c, 36)}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -34)}"/>
    </linearGradient>
    <linearGradient id="${id}-screen" x1="0" y1="0" x2=".6" y2="1">
      <stop offset="0" stop-color="#14181c"/><stop offset="1" stop-color="#04070a"/>
    </linearGradient>
    ${glow(id, c)}
    ${sheen(id)}
  </defs>
  <ellipse cx="100" cy="202" rx="44" ry="8" fill="#000" opacity=".55"/>
  <circle cx="100" cy="108" r="80" fill="url(#${id}-glow)"/>
  <rect x="74" y="14" width="52" height="84" rx="16" fill="${shade(c, -40)}"/>
  <rect x="74" y="126" width="52" height="76" rx="16" fill="${shade(c, -46)}"/>
  <rect x="62" y="60" width="76" height="96" rx="26" fill="url(#${id}-body)" stroke="#fff" stroke-opacity=".14"/>
  <rect x="68" y="68" width="64" height="80" rx="19" fill="url(#${id}-screen)"/>
  <path d="M78 106h10l5-12 7 26 5-14h17" fill="none" stroke="#c8f542" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="100" cy="84" r="2" fill="#c8f542" opacity=".6"/>
  <rect x="138" y="92" width="5" height="16" rx="2.5" fill="${shade(c, -18)}"/>
  <rect x="138" y="114" width="5" height="10" rx="2.5" fill="${shade(c, -24)}"/>
  <path d="M70 78c2-6 6-10 12-11" stroke="#fff" stroke-opacity=".3" stroke-width="2" fill="none"/>`;
}

function cableSvg(id, spec) {
  const c = spec.color || "#8d8d8d";
  return `
  <defs>
    <linearGradient id="${id}-wire" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${shade(c, 50)}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -40)}"/>
    </linearGradient>
    ${glow(id, "#d3a94f")}
  </defs>
  <ellipse cx="100" cy="192" rx="56" ry="10" fill="#000" opacity=".5"/>
  <circle cx="100" cy="110" r="80" fill="url(#${id}-glow)"/>
  <path d="M60 74c30-22 78-18 84 12 5 26-20 46-44 44-22-2-38 10-30 28 8 17 40 16 58 4 8-6 12-13 20-14"
        fill="none" stroke="url(#${id}-wire)" stroke-width="9" stroke-linecap="round"/>
  <path d="M60 74c30-22 78-18 84 12" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2.4" stroke-linecap="round"/>
  <rect x="52" y="62" width="22" height="26" rx="6" fill="${shade(c, -20)}" stroke="#fff" stroke-opacity=".18"/>
  <rect x="57" y="66" width="12" height="18" rx="3" fill="#15181b"/>
  <rect x="146" y="140" width="24" height="15" rx="5" fill="${shade(c, -20)}" stroke="#fff" stroke-opacity=".18"/>
  <path d="M150 144h16" stroke="#0b0d0f" stroke-width="3" stroke-linecap="round"/>`;
}

function chargerSvg(id, spec) {
  const c = spec.color || "#d3a94f";
  return `
  <defs>
    <radialGradient id="${id}-puck" cx="40%" cy="35%" r="70%">
      <stop offset="0" stop-color="${shade(c, 50)}"/><stop offset=".6" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -38)}"/>
    </radialGradient>
    ${glow(id, c)}
  </defs>
  <ellipse cx="100" cy="186" rx="54" ry="10" fill="#000" opacity=".55"/>
  <circle cx="100" cy="104" r="80" fill="url(#${id}-glow)"/>
  <ellipse cx="100" cy="132" rx="47" ry="16" fill="${shade(c, -46)}"/>
  <rect x="53" y="108" width="94" height="26" rx="13" fill="${shade(c, -36)}"/>
  <ellipse cx="100" cy="108" rx="47" ry="17" fill="url(#${id}-puck)" stroke="#fff" stroke-opacity=".18"/>
  <ellipse cx="100" cy="108" rx="32" ry="11" fill="none" stroke="#fff" stroke-opacity=".16"/>
  <path d="M52 120c-18 10-24 26-14 38" fill="none" stroke="${shade(c, -20)}" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="100" cy="107" rx="20" ry="6" fill="#fff" opacity=".08"/>`;
}

const KINDS = {
  case: caseSvg,
  phone: phoneSvg,
  buds: budsSvg,
  watch: watchSvg,
  cable: cableSvg,
  charger: chargerSvg,
};

/**
 * Devuelve el SVG de un producto.
 * @param {{kind:string,color:string,clear?:boolean,leather?:boolean,magsafe?:boolean,case?:boolean}} spec
 */
export function productArt(spec = {}, { className = "", label = "" } = {}) {
  const id = `ma${++seq}`;
  const kind = KINDS[spec.kind] ? spec.kind : "case";
  const body = KINDS[kind](id, spec);
  return `<svg class="product-art ${className}" viewBox="0 0 200 220" role="img" aria-label="${label || "Producto MEGA TECHNOLOGY"}">
    ${body}
  </svg>`;
}
