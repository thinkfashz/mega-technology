# GET /orders · GET /orders/{id}

Historial de pedidos. En producción filtra por el usuario autenticado; el rol
`admin` puede ver todos.

```http
GET /api/orders?status=active&limit=20
GET /api/orders/MT-1042
```

| Query | Tipo | Default | Descripción |
|---|---|---|---|
| `status` | enum | — | `pending`, `paid`, `shipped`, `delivered`, `cancelled`. |
| `limit` | int | 50 | 1–100. |

## Respuesta `200`

```json
[
  {
    "id": "MT-1042",
    "createdAt": "2026-10-20T04:23:00.000Z",
    "status": "pending",
    "items": [{ "productId": "p1", "name": "Funda Silicona iPhone 15 Pro", "price": 12990, "qty": 2, "colorName": "Lima" }],
    "subtotal": 25980,
    "shipping": 0,
    "total": 25980,
    "customer": { "name": "Camila Rojas", "phone": "+56 9 8842 1177", "address": "Av. Providencia 1234", "city": "Providencia" },
    "payment": "cash",
    "delivery": "free",
    "timeline": [
      { "key": "confirmed", "title": "Pedido confirmado", "done": true, "current": true },
      { "key": "preparing", "title": "En preparación", "done": false, "current": false }
    ]
  }
]
```

## Detalle

`GET /orders/{id}` devuelve una sola orden.

| HTTP | code | Caso |
|---|---|---|
| 200 | — | Encontrada. |
| 404 | `NOT_FOUND` | No existe o no pertenece al usuario. |
| 401 | `UNAUTHORIZED` | Sin sesión (producción). |

## Reglas

- Orden descendente por `createdAt`.
- Un cliente nunca recibe órdenes de otro: el filtro por usuario va en el servidor,
  no en el cliente.
- La copia de ítems (nombre, precio, arte) es histórica: no se recalcula con el
  catálogo actual.
- `timeline` se regenera al cambiar el estado; no se guarda como texto libre.

## Mock

El mock devuelve las órdenes en memoria, sin autenticación. Se reinician al
reiniciar el proceso.
