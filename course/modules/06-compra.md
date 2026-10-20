# Módulo 06 · Flujo de compra

**Tiempo:** 90 min · **Resultado:** checkout, pago, envío y orden creada.

## Los tres pasos

```text
carrito → /checkout (datos) → /payment (método) → /shipping (envío) → orden
```

Cada paso es una pantalla con su propio estado en `store.checkout`. El indicador
superior (`flowSteps(1|2|3)`) muestra dónde estás.

## Validación

El primer campo inválido recibe foco y borde rojo. El mensaje va **junto al
campo**, no en un toast:

```js
if (name.length < 3) return focusError("#f-name", "Ingresa tu nombre completo");
```

## Persistencia del perfil

`store.setProfile({ name, phone, address, city })` guarda en `mega.v4` y la
próxima compra llega con los datos precargados.

## Crear la orden

```js
const order = await api.createOrder({
  customer: store.profile,
  items: store.cartLines.map(l => ({ productId: l.product.id, colorId: l.color?.id, qty: l.qty })),
  payment: store.checkout.payment,
  delivery: store.checkout.delivery,
});
```

`store.createOrder()`:

1. Calcula subtotal, envío y total.
2. Crea `MT-####` con estado `pending` y timeline.
3. Inserta la orden al principio.
4. **Vacía el carrito.**
5. Persiste y notifica.

Después se abre la hoja de éxito con dos salidas: “Ver seguimiento” y “Seguir
comprando”.

## Regla de oro

> El cliente calcula para mostrar; el servidor calcula para cobrar.

En producción, `POST /orders` ignora los precios que envía el cliente y los
recalcula con el catálogo real.

## Checklist

- [ ] Los cuatro campos del checkout validan.
- [ ] El perfil se reutiliza en la compra siguiente.
- [ ] El total de la orden coincide con el resumen.
- [ ] Crear la orden vacía el carrito una sola vez.
- [ ] El panel admin ve la orden de inmediato.

## Siguiente

[07 · Pedidos y perfil](07-cuenta.md)
