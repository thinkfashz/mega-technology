# POST /orders

Crea una orden. Es el endpoint más importante: **el servidor recalcula todo**.

```http
POST /api/orders
Content-Type: application/json
Idempotency-Key: 8f2a1b...   (producción)
```

## Request

```json
{
  "customer": {
    "name": "Camila Rojas",
    "phone": "+56 9 8842 1177",
    "email": "camila@example.cl",
    "address": "Av. Providencia 1234",
    "city": "Providencia",
    "region": "Región Metropolitana"
  },
  "items": [
    { "productId": "p1", "colorId": "lime", "qty": 2 },
    { "productId": "p6", "colorId": "lime", "qty": 1 }
  ],
  "payment": "card",
  "delivery": "express",
  "note": ""
}
```

| Campo | Regla |
|---|---|
| `customer.name` | ≥ 3 caracteres. |
| `customer.phone` | ≥ 8 dígitos. |
| `customer.address` | ≥ 5 caracteres. |
| `items` | ≥ 1; `qty` ≥ 1. |
| `payment` | `card`, `apple`, `cash`. |
| `delivery` | `express`, `free`. |

El cliente **no envía precios ni totales**: si los manda, se ignoran.

## Lógica del servidor

1. Resolver cada `productId` y `colorId`.
2. Verificar stock de todas las líneas antes de escribir nada.
3. Calcular `subtotal = Σ price × qty`.
4. Calcular envío: gratis si `delivery=free` o `subtotal ≥ 50000`; si no, $2.990.
5. Crear `MT-####` con estado `pending` y timeline.
6. Descontar stock y sumar `sold` en una transacción.
7. Devolver la orden completa.

## Respuesta `201`

```json
{
  "id": "MT-3009",
  "createdAt": "2026-10-20T14:22:00.000Z",
  "status": "pending",
  "items": [
    {
      "productId": "p1",
      "name": "Funda Silicona iPhone 15 Pro",
      "colorId": "lime",
      "colorName": "Lima",
      "price": 12990,
      "qty": 2,
      "art": { "kind": "case", "color": "#b7e33b" }
    }
  ],
  "subtotal": 25980,
  "shipping": 2990,
  "total": 28970,
  "customer": { "name": "Camila Rojas", "phone": "+56 9 8842 1177", "address": "Av. Providencia 1234", "city": "Providencia" },
  "payment": "card",
  "delivery": "express",
  "timeline": [
    { "key": "confirmed", "title": "Pedido confirmado", "done": true, "current": true }
  ]
}
```

## Errores

| HTTP | code | Cuándo |
|---|---|---|
| 409 | `STOCK_INSUFFICIENT` | Alguna línea supera el stock. Incluye `available` y `requested`. |
| 422 | `VALIDATION` | Falta cliente, ítems, pago o envío. |
| 422 | `UNKNOWN_PRODUCT` | `productId` inexistente. |
| 500 | `INTERNAL` | Fallo al persistir. |

## Idempotencia (producción)

Repetir el POST con la misma `Idempotency-Key` debe devolver la misma orden, no
crear otra. Guardar la clave durante 24 h.

## Ejemplo

```bash
curl -s -X POST http://127.0.0.1:8788/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"customer":{"name":"Camila Rojas","phone":"+56988421177","address":"Av. Providencia 1234","city":"Providencia"},"items":[{"productId":"p1","colorId":"lime","qty":2}],"payment":"card","delivery":"express"}'
```
