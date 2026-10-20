# Módulo 01 · Sistema de diseño

**Tiempo:** 60 min · **Resultado:** botones, cards, chips y hojas reutilizables.

## La forma de la marca

- Fondo casi negro (#060606), superficies #111 / #161616, borde #262626.
- **Lima** (#c8f542) = una sola acción principal por pantalla.
- **Dorado** (#d3a94f) = marca y acentos.
- Títulos en mayúsculas con subrayado lima de 2–3 px.
- Botones tipo píldora (99 px), tarjetas de 16–18 px.

## Componentes base

```css
.btn { border-radius: 99px; font-weight: 700; min-height: 44px; }
.btn--lime { background: var(--m-lime); color: var(--m-on-accent); }
.btn--gold { background: linear-gradient(140deg, #f2daa0, #d3a94f 55%, #a67a24); color: #1b1203; }
.card { border: 1px solid var(--m-line); border-radius: 18px; background: linear-gradient(180deg, #121212, #0c0c0c); }
.chip { border-radius: 99px; border: 1px solid var(--m-line-2); padding: 6px 12px; }
```

## Hoja inferior (bottom sheet)

```html
<div class="overlay" id="overlay-root"></div>
```

```js
export function openSheet({ title, body }) {
  const root = document.querySelector("#overlay-root");
  root.innerHTML = `
    <div class="sheet">
      <div class="sheet__handle"></div>
      <header class="sheet__head">
        <h2>${title}</h2>
        <button data-close aria-label="Cerrar">×</button>
      </header>
      <div class="sheet__body">${body}</div>
    </div>`;
  root.classList.add("is-open");
  return root.querySelector(".sheet");
}
```

Tres reglas: devolver el nodo (para enganchar listeners), cerrar con `Esc` y
devolver el foco al elemento que la abrió.

## Iconos

Un solo archivo `ui/icons.js` con SVG inline de 24×24, trazo 1.8:

```js
export function icon(name, { size = 22, cls = "" } = {}) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" class="${cls}" aria-hidden="true">…</svg>`;
}
```

Ventajas: sin webfont, sin request, coloreables con `currentColor`.

## Checklist

- [ ] Botones lima, dorado y ghost.
- [ ] Card con borde y degradado.
- [ ] Chip con estado activo.
- [ ] Hoja que abre, cierra con `Esc` y devuelve el foco.
- [ ] Set de iconos SVG propio.

## Siguiente

[02 · Datos y estado](02-datos.md)
