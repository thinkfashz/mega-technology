# Pantalla · Envío

**Ruta:** `#/shipping` · **Archivo:** `shipping.js` + `shipping.css` · **Tab activo:** ninguno
**Objetivo:** elegir entrega y **crear la orden** (paso 3 de 3).

## Estructura

| Bloque | Clase | Función |
|---|---|---|
| Cabecera | `.flow-head` | “Métodos de envío” + `flowSteps(3)`. |
| Dirección | `.ship-address` | Dirección del perfil, editable en una hoja. |
| Opciones | `.ship-options` | Express $2.990 / Gratis 3–5 días. |
| Seguimiento estimado | `.track` | Explica los 4 hitos antes de confirmar. |
| Resumen | `.summary` | Total con el envío elegido. |
| CTA | `[data-confirm-ship]` | **Confirmar Envío** → crea la orden. |

## Creación de la orden

```js
const order = await api.createOrder({
  customer: store.profile,
  items: store.cartLines.map(({ product, color, qty }) => ({
    productId: product.id,
    name: product.name,
    colorId: color?.id,
    colorName: color?.name,
    price: product.price,
    qty,
    art: product.art,
  })),
  payment: store.checkout.payment,
  delivery: store.checkout.delivery,
  note: "",
});
```

`store.createOrder()`:

1. Calcula subtotal, envío y total en el cliente (el backend debe recalcular).
2. Genera `MT-####` y `timeline` con el estado `pending`.
3. Inserta la orden al inicio de `store.orders`.
4. Vacía el carrito y guarda `lastOrderId`.
5. Persiste en `mega.v4` y notifica a los suscriptores.

Después se abre la **hoja de éxito** con el número de orden, total y dos salidas:
**Ver seguimiento** (`#/orders?ok=MT-####`) y **Seguir comprando**.

## Reglas

- Si el carrito está vacío, `emptyCart()` evita crear órdenes fantasma.
- El envío gratis se aplica si el subtotal supera el umbral; Express se bonifica
  cuando corresponde.
- La orden guarda una copia del nombre, precio y arte: el historial no se rompe si
  el producto cambia o se elimina del catálogo.
- El estado inicial es `pending`; el panel admin lo mueve a `paid`, `shipped` o
  `delivered`.

## Interacciones

1. **Express / Gratis** → actualiza total y resumen al instante.
2. **Editar dirección** → hoja con dirección y ciudad; valida y guarda en el perfil.
3. **Confirmar Envío** → deshabilita el botón mientras `createOrder` corre (latencia
   simulada de 90–210 ms) y evita doble submit.
4. **Ver seguimiento** → `#/orders?ok=...` con banner de confirmación.

## Accesibilidad

- Opciones con `role="radio"` y `aria-checked`.
- El botón pasa a `aria-busy="true"` durante la creación.
- La hoja de éxito tiene `role="dialog"` y foco en el título.
- El timeline se anuncia como lista ordenada.

## API

`POST /orders` — ver `api/endpoints/orders/create.md`.
Respuesta `201` con la orden completa. Errores esperados: `409` stock insuficiente,
`422` datos inválidos.

## Equivalencia Android

`ShippingScreen` con `RadioButton` para entrega y `Button` con
`enabled = !isSubmitting`. La orden se crea en `OrdersRepository.create()` y se
guarda en Room para funcionar offline; la cola de sincronización usa WorkManager.

## Checklist

- [x] Crear orden vacía el carrito una sola vez.
- [x] El total de la orden coincide con el resumen.
- [x] El panel admin ve la orden de inmediato.
- [x] Probado a 390 × 844.
