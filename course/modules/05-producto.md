# Módulo 05 · Detalle de producto

**Tiempo:** 70 min · **Resultado:** ficha completa con color, stock y CTA.

## Anatomía

```text
Galería (3 vistas + puntos)
Badge (BESTSELLER / NUEVO / -20%)
Corazón flotante
Precio + precio anterior + ahorro
Rating (estrellas + reseñas)
Color (swatches)
Stock (barra + unidades)
Descripción + características
Relacionados (misma categoría)
CTA fijo: Agregar al carrito
```

## Resolver el producto

```js
const product = store.product(params.slug);   // acepta id o slug
if (!product) return emptyState("Producto no encontrado");
```

## Color

```js
let colorId = product.colors[0]?.id;
```

El swatch elegido cambia el color del arte y el nombre que viaja al carrito.
Cada swatch es un botón con `aria-checked` y nombre visible: nunca solo color.

## Stock

```js
const max = product.stock;
const qty = Math.min(Math.max(1, qty), max);
```

Si `stock === 0`, el CTA se deshabilita y dice “Sin stock”.

## Carrito

```js
store.addToCart(product.id, colorId, qty);
toast("Agregado al carrito", { iconName: "cart" });
```

No se navega: el usuario puede seguir mirando. El badge del header se actualiza
solo, porque el store notifica a los suscriptores.

## La barra fija

```css
.pd-bar {
  position: sticky;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(6, 6, 6, 0.92);
  backdrop-filter: blur(12px);
}
```

Sticky y no `fixed`: evita el scroll horizontal en algunos navegadores y
respeta la barra de Android.

## Checklist

- [ ] Slug inválido muestra estado vacío.
- [ ] Swatch cambia el arte y el nombre del color.
- [ ] El selector de cantidad no supera el stock.
- [ ] El CTA deshabilitado sin stock.
- [ ] Relacionados filtran por categoría.

## Siguiente

[06 · Flujo de compra](06-compra.md)
