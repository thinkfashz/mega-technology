# Módulo 08 · Panel administrador

**Tiempo:** 90 min · **Resultado:** un panel que opera la tienda de verdad.

## Tres pestañas

```text
Resumen   → KPIs + gráfico + top productos + pedidos recientes
Pedidos   → filtros por estado + cambio de estado
Productos → stock, precio, edición, alta y filtro de stock bajo
```

## Los KPIs

```js
const delta = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
```

El delta compara la segunda mitad del período contra la primera. Si no hay base
(0 en la primera mitad), se muestra +100 %.

`countUp(node, to, { format })` anima el número final. Con `prefers-reduced-motion`
el número aparece directo.

## El gráfico

SVG generado a mano, sin librería:

```js
const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
const area = `${line} L${last.x} ${base} L${first.x} ${base} Z`;
```

- `viewBox="0 0 330 132"` con `preserveAspectRatio`.
- Área con gradiente lima, línea con `stroke-dasharray` animado.
- El último punto va relleno y con glow.
- `<title>` en cada punto: el valor accesible del día.

## Cambiar el estado de un pedido

```html
<select class="admin-select" data-status="MT-1042">
  <option value="pending">Pendiente</option>
  <option value="paid">Pagado</option>
</select>
```

```js
await api.updateOrderStatus(id, select.value);
```

El mismo store que usa el cliente: por eso el cambio se ve al instante en “Mis
pedidos”.

## Stock y precio

- `−` y `+` ajustan el stock con mínimo 0.
- Editar abre una hoja con nombre, precio, stock y descripción.
- Crear abre una hoja con nombre, categoría, precio, stock, tipo de arte y color.
- El filtro “Stock bajo” es de cliente: no re-renderiza la lista.

## CSV

```js
const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
```

El BOM hace que Excel abra los acentos bien.

## Checklist

- [ ] KPIs con animación y delta correcto.
- [ ] Gráfico con 7, 14 y 30 días.
- [ ] Cambiar estado se refleja en Mis pedidos.
- [ ] Editar y crear productos funcionan.
- [ ] El CSV descarga con datos reales.

## Siguiente

[09 · API y Android](09-api-android.md)
