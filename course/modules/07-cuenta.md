# Módulo 07 · Pedidos y perfil

**Tiempo:** 60 min · **Resultado:** historial con seguimiento y preferencias.

## Mis pedidos

Tres pestañas: todos, en curso y entregados. Cada tarjeta muestra ID, fecha,
estado, miniaturas, total y una barra de progreso de 4 pasos.

El detalle se abre en una hoja: timeline, ítems, totales, datos de entrega y
“Volver a pedir”.

```js
order.items.forEach(item => store.addToCart(item.productId, item.colorId, item.qty));
navigate("/cart");
```

“Volver a pedir” respeta el stock: `addToCart` recorta la cantidad.

## El parámetro `ok`

```text
#/orders?ok=MT-1042
```

Resalta la orden recién creada y muestra el banner. Se limpia con
`history.replaceState` para que no se repita al volver atrás.

## El timeline

```js
export function buildTimeline(status) {
  const base = [
    { key: "confirmed", title: "Pedido confirmado" },
    { key: "preparing", title: "En preparación" },
    { key: "onway", title: "En camino" },
    { key: "delivered", title: "Entregado" },
  ];
  const index = { pending: 1, paid: 2, shipped: 3, delivered: 4 }[status] ?? 1;
  return base.map((step, i) => ({ ...step, done: i < index, current: i === index - 1 }));
}
```

Se regenera cuando el admin cambia el estado: el timeline nunca es texto libre.

## Perfil

- Tarjeta con iniciales, nombre, teléfono y nivel MEGA PRO.
- Métricas: pedidos, favoritos, total comprado.
- Preferencias con `role="switch"`: notificaciones, biometría, novedades.
- Exportar mis datos → JSON.
- Reiniciar demo → confirmación con tono de peligro.

## Checklist

- [ ] Filtros de pedidos funcionan.
- [ ] El detalle muestra timeline, ítems y totales.
- [ ] Volver a pedir respeta el stock.
- [ ] Los switches reflejan el estado guardado.
- [ ] Exportar descarga un JSON válido.

## Siguiente

[08 · Panel administrador](08-admin.md)
