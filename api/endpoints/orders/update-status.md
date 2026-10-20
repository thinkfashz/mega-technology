# PATCH /orders/{id}

Cambia el estado de una orden desde el panel administrador.

```http
PATCH /api/orders/MT-1042
Content-Type: application/json

{ "status": "shipped" }
```

## Estados y transiciones

```text
pending ──► paid ──► shipped ──► delivered
   │          │          │
   └──────────┴──────────┴──────► cancelled
```

| Desde | Permitido |
|---|---|
| `pending` | `paid`, `cancelled` |
| `paid` | `shipped`, `cancelled` |
| `shipped` | `delivered`, `cancelled` |
| `delivered` | — (solo devolución, flujo aparte) |
| `cancelled` | — |

El mock acepta cualquier estado válido para facilitar la demo. Producción debe
aplicar la tabla anterior y responder `409 CONFLICT` si no corresponde.

## Respuesta `200`

La orden completa con `status` y `timeline` actualizados.

```json
{
  "id": "MT-1042",
  "status": "shipped",
  "timeline": [
    { "key": "confirmed", "title": "Pedido confirmado", "done": true, "current": false },
    { "key": "preparing", "title": "En preparación", "done": true, "current": false },
    { "key": "onway", "title": "En camino", "done": true, "current": true },
    { "key": "delivered", "title": "Entregado", "done": false, "current": false }
  ]
}
```

## Errores

| HTTP | code | Cuándo |
|---|---|---|
| 404 | `NOT_FOUND` | Orden inexistente. |
| 409 | `CONFLICT` | Transición no permitida. |
| 422 | `VALIDATION` | Estado desconocido. |
| 401 | `UNAUTHORIZED` | Sin rol admin. |

## Efectos secundarios (producción)

1. Notificación push/email al cliente.
2. Registro de auditoría (`order_id`, `from`, `to`, `actor`, `timestamp`).
3. Si se cancela: reponer stock y, si estaba pagada, iniciar reembolso.
4. Webhook saliente `order.status_changed` para integraciones.

## Ejemplo

```bash
curl -s -X PATCH http://127.0.0.1:8788/api/orders/MT-2008 \
  -H 'Content-Type: application/json' -d '{"status":"shipped"}'
```
