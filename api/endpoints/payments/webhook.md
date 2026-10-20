# POST /payments/webhook

> **Estado:** propuesto. El mock responde `501 NOT_IMPLEMENTED`.

Recibe eventos del proveedor de pago. Es la **única** fuente de verdad para marcar
una orden como pagada.

```http
POST /api/payments/webhook
Stripe-Signature: t=...,v1=...
Content-Type: application/json
```

## Eventos relevantes

| Evento | Acción |
|---|---|
| `payment_intent.succeeded` | `order.status = paid`, guardar `paidAt` y `providerId`. |
| `payment_intent.payment_failed` | Registrar intento fallido; la orden sigue `pending`. |
| `charge.refunded` | `order.status = cancelled` + reposición de stock. |

## Reglas de seguridad

1. **Verificar firma** con el secreto del webhook antes de parsear.
2. **Idempotencia:** guardar `event.id`; si ya se procesó, responder `200` sin repetir.
3. **Responder rápido:** 2xx en < 5 s; el procesamiento pesado va a una cola.
4. **No confiar en el monto del evento** sin compararlo con la orden.
5. **Reintentos:** el proveedor reintenta ante 5xx; el handler debe tolerarlo.

## Pseudo-handler

```js
const event = verifySignature(rawBody, headers["stripe-signature"]);
if (seen.has(event.id)) return ok();
const intent = event.data.object;
const order = await orders.byPaymentIntent(intent.id);
if (event.type === "payment_intent.succeeded" && order.status === "pending") {
  await orders.markPaid(order.id, intent.id);
}
seen.add(event.id);
ok();
```

## Errores

| HTTP | code | Cuándo |
|---|---|---|
| 400 | `INVALID_SIGNATURE` | Firma inválida o body alterado. |
| 200 | — | Evento aceptado o ya procesado. |

## Nota

Este endpoint **no** se llama desde la app. Lo llama el proveedor de pagos.
