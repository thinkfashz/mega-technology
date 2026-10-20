# Pantalla · Panel administrador

**Ruta:** `#/admin` · **Archivo:** `admin.js` + `admin.css` · **Tab activo:** ninguno
**Objetivo:** operar la tienda con datos reales del mismo store que usa el cliente.

## Pestañas

| Tab | URL | Contenido |
|---|---|---|
| Resumen | `#/admin` | KPIs, gráfico de ventas, top productos y pedidos recientes. |
| Pedidos | `#/admin?tab=orders` | Filtros por estado, cambio de estado y total filtrado. |
| Productos | `#/admin?tab=products` | Stock, precio, edición, alta y filtro de stock bajo. |

## Resumen

### KPIs

| KPI | Cálculo |
|---|---|
| Ventas · N días | Suma de `total` de órdenes no canceladas en el rango. |
| Pedidos | Cantidad de órdenes en el rango. |
| Ticket promedio | `ventas / pedidos` redondeado. |
| Stock bajo | Productos con `stock <= 5`. |

Cada KPI se anima con `countUp()`; el formato monetario usa `money()` (CLP).

### Gráfico

- SVG generado en `chart(stats.daily)` con `viewBox="0 0 330 132"`.
- Área con gradiente lima + línea con `stroke-dasharray` animado.
- Punto final resaltado y `<title>` accesible con el valor del día.
- Etiquetas de día con `weekdayShort()`; el último día va en lima.
- Selector de periodo **7 / 14 / 30 días** (`?days=`).

### Listas

- **Top productos**: 4 por `sold`, con stock y precio.
- **Pedidos recientes**: 6 últimos con estado y total.
- **Acciones**: Nuevo producto, exportar CSV, ir a Pedidos.

## Pedidos

- Filtros: Todos, Pendiente, Pagado, En camino, Entregado.
- Cada fila muestra cliente, total, fecha, cantidad, método de pago.
- `<select>` cambia el estado:

```js
await api.updateOrderStatus(order.id, select.value);
```

`store.updateOrderStatus()` actualiza `order.status` y regenera `timeline`.
El cliente ve el cambio al abrir `#/orders` (mismo `localStorage`).
El total filtrado excluye cancelados.

## Productos

- Filtro “Todo el catálogo” / “Stock bajo” (client-side, sin recargar).
- Botones `−` / `+` ajustan stock con mínimo 0 y re-render.
- **Editar** abre una hoja con nombre, precio, stock y descripción.
- **Nuevo producto** abre una hoja con nombre, categoría, precio, stock, tipo de
  arte y color.
- El arte se elige entre `case`, `phone`, `buds`, `watch`, `charger`, `cable`.
- Al guardar se llama `api.updateProduct()` o `api.createProduct()` y se navega
  con `{ replace: true }` para reflejar el estado.

## CSV

`Exportar CSV` genera un archivo con BOM UTF-8 y estas columnas:

```
pedido, fecha, cliente, telefono, estado, pago, envio, subtotal, total
```

Los valores se escapan duplicando comillas. Se descarga como
`mega-pedidos-AAAA-MM-DD.csv`.

## Datos y métricas

```js
store.stats(days) → {
  sales, count, avg, lowStock, pending,
  daily: [{ date, value }],
  top: Product[],
  recent: Order[],
}
```

Todo se calcula en memoria sobre `state.orders` y `state.products`. En modo
remoto, `api.adminStats(days)` llama a `GET /admin/stats?days=N`.

## Seguridad (producción)

El prototipo no tiene autenticación: el panel es una demo local. Para producción:

1. `GET /admin/*` exige rol `admin` (JWT o sesión).
2. Los cambios de precio/stock se auditan (`admin_audit_log`).
3. El CSV se genera en el servidor si supera 5.000 filas.
4. Nunca se confía en los totales del cliente: se recalculan al crear la orden.

## Accesibilidad

- Tabs con `aria-pressed`; el panel se anuncia con `aria-live`.
- Selects con `aria-label` por pedido.
- Botones `+`/`−` con etiqueta por producto.
- El gráfico tiene `role="img"` y descripción.
- Contraste y foco visibles en inputs y selects.

## Equivalencia Android

`AdminScreen` con `TabRow` (Resumen/Pedidos/Productos), `AndroidView` no es
necesario: el gráfico se dibuja con `Canvas` y `Path`. Los cambios usan
`AdminViewModel` + `AdminRepository`. El CSV se comparte con `FileProvider` y
`ACTION_SEND`.

## Checklist

- [x] Cambiar estado se refleja en Mis pedidos.
- [x] Stock y precio actualizan la tienda.
- [x] Crear producto aparece en catálogo y búsqueda.
- [x] CSV descarga con datos reales.
- [x] Probado a 390 × 844.
