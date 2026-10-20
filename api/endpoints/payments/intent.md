# POST /payments/intent

> **Estado:** propuesto. El prototipo no cobra dinero; solo elige un método.
> El mock responde `501 NOT_IMPLEMENTED`.

Crea una intención de pago para una orden existente.

```http
POST /api/payments/intent
Content-Type: application/json

{
  "orderId": "MT-1042",
  "method": "card"
}
```

## Respuesta `201`

```json
{
  "id": "pi_3Oabc123",
  "clientSecret": "pi_3Oabc123_secret_xyz",
  "amount": 265970,
  "currency": "CLP",
  "status": "requires_payment_method"
}
```

| Campo | Uso |
|---|---|
| `id` | ID del proveedor (Stripe/Mercado Pago/Transbank). |
| `clientSecret` | Lo usa el SDK del cliente para confirmar. **Nunca** se guarda. |
| `amount` | Copia del total de la orden; el proveedor cobra esto. |
| `currency` | `CLP`. |
| `status` | `requires_payment_method`, `processing`, `succeeded`, `failed`. |

## Reglas

1. La orden debe existir y estar en `pending`.
2. El monto se toma de la orden en el servidor, no del cliente.
3. Si el método es `cash`, no se crea intención: se responde `{ status: "cash" }`.
4. Si el método es `apple`, se usa el flujo nativo (Apple Pay / Google Pay) y se
   confirma contra el mismo proveedor.
5. `clientSecret` expira; no se reutiliza entre intentos.

## Errores

| HTTP | code | Cuándo |
|---|---|---|
| 404 | `NOT_FOUND` | Orden inexistente. |
| 409 | `CONFLICT` | Orden ya pagada o cancelada. |
| 422 | `VALIDATION` | Método inválido. |
| 502 | `PROVIDER_ERROR` | Falla del proveedor. |

## Flujo completo

```text
shipping → POST /orders (pending)
         → POST /payments/intent
         → SDK confirma en el cliente
         → webhook payment_intent.succeeded
         → PATCH interno: order.status = paid
         → GET /orders muestra "Pagado"
```
