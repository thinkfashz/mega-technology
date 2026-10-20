# Pantalla · Producto

**Ruta:** `#/product/:slug` · **Archivo:** `product.js` + `product.css` · **Tab activo:** Tienda
**Objetivo:** convertir con información clara y un CTA fijo.

## Estructura

| Bloque | Clase | Función |
|---|---|---|
| Galería | `.pd-gallery` | Tres vistas del arte SVG (frente, detalle, contexto) con puntos de paginación. |
| Badge | `.badge--gold` | “BESTSELLER”, “NUEVO”, “-20%” según el producto. |
| Favorito | `.pd-fav` | Corazón flotante; persiste en el dispositivo. |
| Precio | `.pd-price` | Precio actual, precio anterior y ahorro calculado. |
| Rating | `.pd-rating` | Estrellas, nota y número de reseñas. |
| Color | `.color-row` | Swatches; cambian el color del arte y el nombre del color. |
| Stock | `.stock-bar` | Unidades disponibles y barra proporcional. |
| Descripción | `.pd-desc` | Texto y bullets de características. |
| CTA fijo | `.pd-bar` | **Agregar al carrito** con total actualizado. |
| Relacionados | `.product-grid` | Cuatro productos de la misma categoría. |

## Lógica

- `params.slug` resuelve con `store.product(slug)` (acepta `id` o `slug`).
- Si no existe, se muestra estado “Producto no encontrado” con enlace al catálogo.
- El color elegido se guarda en estado local y se pasa a `store.addToCart(productId, colorId, qty)`.
- Cantidad con `−` / `+`, mínimo 1 y máximo `stock`.
- El CTA deshabilitado si `stock === 0` (texto “Sin stock”).

## Interacciones

1. **Agregar al carrito** → toast + badge del header; no navega (permite seguir mirando).
2. **Comprar ahora** (si existe) → agrega y va a `#/checkout`.
3. **Color** → actualiza arte, nombre y `aria-checked`.
4. **Favorito** → alterna y sincroniza con Favoritos.
5. **Relacionado** → nueva ruta de producto; ScrollTrigger se limpia con `cleanup()`.

## Arte SVG

`ui/art.js` recibe `{ kind, color, case, magsafe }` y devuelve el dibujo. Los `kind`
soportados son `case`, `phone`, `buds`, `watch`, `charger` y `cable`. Esto permite
crear productos nuevos desde el panel sin subir fotos.

## Accesibilidad

- Galería con `aria-label` por vista y dots como botones.
- Swatches con nombre de color, no solo color.
- El CTA fijo respeta `env(safe-area-inset-bottom)`.
- El precio anterior se anuncia como “antes”.

## Equivalencia Android

`ProductScreen` recibe `slug`; `ProductViewModel` combina `product` + `selectedColor`
en `StateFlow`. El CTA usa `Scaffold(bottomBar = ...)`. Los swatches son
`FilterChip` circulares con `contentDescription`.

## Checklist

- [x] Stock y color limitan la compra.
- [x] Favorito y carrito persisten.
- [x] Relacionados filtran por categoría.
- [x] Probado a 390 × 844.
