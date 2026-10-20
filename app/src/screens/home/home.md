# Pantalla · Home

**Ruta:** `#/home` · **Archivo:** `home.js` + `home.css` · **Tab activo:** Inicio
**Objetivo:** presentar la marca y llevar al catálogo en menos de dos toques.

## Estructura

| Bloque | Clase | Función |
|---|---|---|
| Hero 3D | `.hero` | Composición de arte SVG + capa Three.js ambiental. Titular “Nueva serie iPhone 15”, badge de colección y CTA. |
| Categorías | `.cat-scroll` | Accesos directos a las 8 categorías; cada tarjeta muestra arte, nombre y cantidad de artículos. |
| Más vendidos | `.product-grid` | Cuatro productos ordenados por `sold`; incluye favorito y acceso al detalle. |
| Servicio técnico | `.service-banner` | Entrada a `#/service` con diagnóstico gratis. |
| Confianza | `.trust-row` | Pagos, garantía y despacho. |
| Editorial | `.editorial` | Bloque de marca con enlace al catálogo. |

## Datos que consume

- `store.categories` — 8 categorías de `app/data/products.json`.
- `store.queryProducts({ sort: "relevance" })` — recorte de 4 para “Más vendidos”.
- `store.service.meta` — horario y WhatsApp para el bloque de servicio.

## Interacciones

1. **Comprar Ahora** → `#/catalog`.
2. **Categoría** → `#/catalog?cat=<id>`; el catálogo abre con el filtro aplicado.
3. **Producto** → `#/product/<slug>`.
4. **Corazón** → `store.toggleFavorite()` y toast; no navega.
5. **Ver todo** → `#/catalog` con el orden correspondiente.

## Movimiento

- `pageIn()` sobre `[data-enter]`.
- `reveal()` con GSAP ScrollTrigger sobre las secciones `[data-reveal]`.
- `heroParallax()` mueve el arte del hero a distinta velocidad que el scroll.
- Si GSAP no carga, un `IntersectionObserver` deja todo visible; nunca hay pantalla en blanco.

## Three.js

`src/three/stage.js` monta un canvas dentro de `.hero__stage`. Es ambiental: no bloquea
el render ni el scroll. Si no hay WebGL, el CSS de respaldo mantiene el degradado y el arte.

## Estados

- **Carga:** `main.js` muestra skeletons antes de resolver `loadStore()`.
- **Error de datos:** mensaje con instrucción de abrir por HTTP (`serve.sh`).
- **Sin favoritos:** el corazón queda vacío; no hay estado vacío propio en Home.

## Accesibilidad

- Un solo `h1` (“NUEVA SERIE IPHONE 15” es visual; el `h1` accesible es de marca).
- CTAs con texto, no solo icono.
- Imágenes SVG decorativas con `aria-hidden`; el nombre del producto va en texto.
- Área táctil mínima de 44 px en corazones y chips.

## Equivalencia Android

| Web | Compose |
|---|---|
| `.hero` | `HeroBanner` con `Canvas`/`AsyncImage` + `Brush.radialGradient`. |
| `.cat-scroll` | `LazyRow` de `CategoryChip`. |
| `.product-grid` | `LazyVerticalGrid(GridCells.Fixed(2))`. |
| `data-reveal` | `AnimatedVisibility` + `animateItemPlacement`. |
| `heroParallax` | `Modifier.graphicsLayer { translationY = scroll * 0.12f }`. |

## Checklist de entrega

- [x] CTA y categorías navegan.
- [x] Favorito persiste en `localStorage` (`mega.v4`).
- [x] Sin imágenes externas: todo es SVG local.
- [x] Probado a 390 × 844.
