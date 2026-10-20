# Pantalla · Mis pedidos

**Ruta:** `#/orders` · **Archivo:** `orders.js` + `orders.css` · **Tab activo:** Perfil
**Objetivo:** ver el historial, el estado y repetir una compra.

## Estructura

| Bloque | Clase | Función |
|---|---|---|
| Encabezado | `.orders__head` | Total de pedidos + acceso a ayuda. |
| Banner | `.orders__banner` | Confirmación cuando llega `?ok=MT-####`. |
| Tabs | `.segmented` | Todos / En curso / Entregados. |
| Tarjetas | `.order-card` | ID, fecha, estado, miniaturas, total y progreso. |
| Detalle | `openSheet()` | Timeline, ítems, totales, datos de entrega y **Volver a pedir**. |

## Estados

| Estado | Etiqueta | Color |
|---|---|---|
| `pending` | Pendiente | Ámbar |
| `paid` | Pagado | Azul |
| `shipped` | En camino | Lima |
| `delivered` | Entregado | Verde |
| `cancelled` | Cancelado | Rojo |

El timeline se genera con `buildTimeline(status)` en `store.js` y se actualiza
cuando el panel admin cambia el estado.

## Filtros

- `#/orders` → todos.
- `#/orders?tab=active` → pending, paid y shipped.
- `#/orders?tab=done` → delivered.
- `#/orders?ok=MT-1042` → resalta la orden y muestra el banner; el parámetro se
  limpia con `history.replaceState` para que no se repita al volver.

## Detalle

- Timeline vertical con check, paso actual y pasos futuros.
- Ítems con arte, color, cantidad y precio.
- Subtotal, envío y total.
- **Volver a pedir** agrega todos los ítems al carrito (respetando stock) y navega.
- **Ayuda** → `#/service`.

## Persistencia

Las órdenes viven en `mega.v4` (`state.orders`). Cada orden guarda una copia de
nombre, precio, color y arte para que el historial no dependa del catálogo actual.

## Accesibilidad

- Cada tarjeta es un `<button>` con `aria-label` que incluye el ID.
- El timeline es una lista ordenada con texto de estado.
- El banner usa `role="status"`.
- La hoja de detalle devuelve el foco al cerrar.

## Equivalencia Android

`OrdersScreen` con `TabRow` y `LazyColumn`. El detalle es un `ModalBottomSheet`.
Room guarda órdenes y `OrderStatus` se mapea a un `enum` con color y etiqueta.
“Volver a pedir” llama a `CartRepository.reorder(order)`.

## Checklist

- [x] Filtros y banner funcionan.
- [x] El detalle muestra todos los datos de la orden.
- [x] Volver a pedir respeta stock.
- [x] Probado a 390 × 844.
