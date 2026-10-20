# Pantalla · Carrito

**Ruta:** `#/cart` · **Archivo:** `cart.js` + `cart.css` · **Tab activo:** ninguno
**Objetivo:** revisar líneas, cantidades y totales antes de pagar.

## Estructura

| Bloque | Clase | Función |
|---|---|---|
| Encabezado | `.cart__head` | Título + “Seguir comprando”. |
| Aviso de envío | `.cart__ship` | Resume el método elegido y permite cambiarlo en `#/shipping`. |
| Líneas | `.cart-line` | Arte, nombre, color, stock, precio, contador y eliminar. |
| Resumen | `.summary` | Subtotal, envío, total y ahorro. |
| CTA | `.cart__cta` | **Ir a pagar** → `#/checkout`. |
| Confianza | `.trust-row` | Pago seguro, cambios y garantía. |

## Lógica

- `store.cartLines` resuelve producto y color; descarta líneas huérfanas.
- `store.cartCount` = suma de `qty` (badge del header).
- `store.cartSubtotal`, `store.shippingCost` (0 o $2.990) y `store.cartTotal`.
- Si el carrito está vacío se usa `emptyCart()` con CTA al catálogo.

### Mutaciones

| Acción | Método | Persistencia |
|---|---|---|
| Sumar | `store.setQty(productId, colorId, qty + 1)` | `mega.v4` |
| Restar | `store.setQty(..., qty - 1)`; a 0 elimina | `mega.v4` |
| Eliminar | `store.removeFromCart(...)` | `mega.v4` |
| Vaciar | `store.clearCart()` desde el menú | `mega.v4` |

Los cambios se emiten por `store.subscribe()`; el header actualiza el badge sin
recargar la pantalla.

## Reglas de negocio

1. No se puede superar `product.stock`.
2. Envío gratis si el subtotal supera el umbral definido en `service.json`.
3. Express cuesta $2.990 salvo que el umbral lo bonifique.
4. El total se recalcula siempre en el servidor al crear la orden (el cliente es solo espejo).

## Interacciones

1. **Cantidad** → actualiza línea, subtotal y badge; toast discreto.
2. **Eliminar** → confirmación `ask()` con tono danger.
3. **Cambiar envío** → `#/shipping`; al volver se conserva la selección.
4. **Ir a pagar** → `#/checkout` (paso 1 de 3).
5. **Seguir comprando** → `#/catalog`.

## Accesibilidad

- Contadores con `aria-label` (“Quitar una unidad de…”).
- Resumen como `<dl>`/filas con etiqueta y valor.
- El CTA mide 52 px de alto; el total se anuncia con `aria-live="polite"`.

## Equivalencia Android

`CartViewModel` expone `CartUiState(lines, subtotal, shipping, total)`. Las líneas
usan `LazyColumn` con `key = productId+colorId`. El badge del `NavigationBar` se
alimenta del mismo `StateFlow`.

## Checklist

- [x] Totales cuadran con el resumen de pago y la orden.
- [x] Stock respetado en el contador.
- [x] Vaciar carrito pide confirmación.
- [x] Probado a 390 × 844.
