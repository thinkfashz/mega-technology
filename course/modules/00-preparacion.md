# Módulo 00 · Preparar el terreno

**Tiempo:** 30 min · **Resultado:** el esqueleto de la app sirviéndose por HTTP.

## Por qué HTTP y no abrir el archivo

La app usa módulos ES (`import`), `fetch` de JSON y manifest. Con `file://` el
navegador bloquea todo eso por política de origen. Un servidor de una línea lo
resuelve:

```sh
python3 -m http.server 8787
# o
npx serve .
```

## Estructura de carpetas

```
app/
├── index.html            # une todo
├── manifest.webmanifest  # PWA
├── styles/
│   ├── tokens.css        # color, tipo, forma, movimiento
│   ├── base.css          # reset + layout
│   └── components.css    # botones, cards, chips, hojas
├── src/
│   ├── main.js           # arranque
│   ├── core/             # store, api, router, format, dom
│   ├── ui/               # chrome, cards, arte, motion, icons
│   ├── screens/          # una carpeta por pantalla
│   └── three/            # escena 3D opcional
└── data/                 # products.json, service.json
```

**Regla:** `screens/<pantalla>/` con `<pantalla>.js`, `<pantalla>.css` y
`<pantalla>.md`. Si una pantalla crece demasiado, se divide en componentes dentro
de `ui/`, no en subcarpetas de pantalla.

## Tokens primero

Antes de escribir un solo componente, define los tokens en `styles/tokens.css`:

```css
:root {
  --m-bg: #060606;
  --m-surface: #111111;
  --m-line: #262626;
  --m-text: #f7f7f3;
  --m-text-2: #ababa6;
  --m-lime: #c8f542;
  --m-gold: #d3a94f;
  --m-radius: 18px;
  --m-ease: cubic-bezier(0.22, 1, 0.36, 1);
}
```

Con eso, el tema oscuro, los botones y el panel salen del mismo lugar.

## Checklist

- [ ] `python3 -m http.server 8787` levanta la carpeta.
- [ ] `index.html` carga y se ve el fondo oscuro.
- [ ] `tokens.css` existe y ninguna pantalla escribe hex sueltos.
- [ ] La app responde en `http://127.0.0.1:8787/app/`.

## Siguiente

[01 · Sistema de diseño](01-diseno.md)
