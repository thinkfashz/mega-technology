# Módulo 03 · Chrome y navegación

**Tiempo:** 70 min · **Resultado:** header, barra inferior y router funcionando.

## Hash routing

`#/ruta?query`. No necesita rewrites: sirve en cualquier hosting estático.

```js
const routes = [
  { path: "/home", load: () => import("./screens/home/home.js"), tab: "home" },
  { path: "/product", load: () => import("./screens/product/product.js"), tab: "catalog" },
];
```

`import()` carga la pantalla bajo demanda: el primer render solo baja Home.

## El contrato de pantalla

```js
export default {
  title: "Catálogo",
  render(ctx) { return `<section>…</section>`; },
  mount(root, ctx) { /* listeners */ },
  unmount() { /* limpiar */ },
};
```

`ctx` trae `store`, `api`, `navigate`, `params`, `query`, `toast`, `openSheet`,
`ask`. Si una pantalla necesita algo más, ese “algo más” va en el store.

## El ciclo del router

```text
hash cambia
  → parse (path, params, query)
  → carga el módulo (import)
  → unmount() de la pantalla anterior
  → onBefore: cleanup() de GSAP, cerrar hoja, begin(view), setChrome({tab})
  → render() → view.innerHTML
  → mount()
  → onAfter: pageIn, reveal, tiltCards
```

Un **token** incremental invalida navegaciones viejas: si el usuario aprieta dos
veces rápido, la primera carga no pisa a la segunda.

## Chrome (header + tab bar)

`ui/chrome.js` dibuja el header con marca, búsqueda y carrito, y la barra inferior
con cinco destinos. `setChrome({ tab, back })` decide cuál queda activo.

Regla de coherencia: durante el flujo de compra **no hay tab activa**, pero la
barra sigue visible. En Checkout, Pago y Envío la tarea manda.

## Movimiento

```js
setupMotion();          // una vez
begin(view);            // por navegación
pageIn(view);           // entrada
reveal(view);           // secciones con ScrollTrigger
tiltCards(view);        // tilt 3D (solo punteros finos)
cleanup();              // revierte todo
```

Con `prefers-reduced-motion`, todo se muestra sin animación. Y si GSAP no
carga, un `IntersectionObserver` deja el contenido visible: **nunca** una
pantalla en blanco.

## Checklist

- [ ] 13 rutas registradas y lazy.
- [ ] El header cambia entre menú y flecha de “volver”.
- [ ] La barra inferior marca la tab correcta.
- [ ] `unmount()` limpia lo que la pantalla abrió.
- [ ] Volver atrás restaura el scroll.

## Siguiente

[04 · Catálogo y búsqueda](04-catalogo.md)
