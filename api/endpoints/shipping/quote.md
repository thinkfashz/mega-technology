# GET /shipping/quote

> **Estado:** propuesto. El prototipo calcula el envío localmente.

Cotiza el costo y el plazo de entrega antes de crear la orden.

```http
GET /api/shipping/quote?subtotal=25980&method=express&city=Providencia
```

| Query | Tipo | Regla |
|---|---|---|
| `subtotal` | int | ≥ 0, en CLP. |
| `method` | enum | `express`, `free`. |
| `city` | string | Opcional; permite tarifas por zona. |

## Respuesta `200`

```json
{
  "cost": 2990,
  "currency": "CLP",
  "eta": "24-48 h",
  "freeThreshold": 50000
}
```

## Reglas del prototipo

- `free`: costo 0, plazo 3–5 días hábiles.
- `express`: $2.990, plazo 24–48 h.
- Si `subtotal >= 50000`, el express se bonifica (costo 0).
- El total de la orden se recalcula en `POST /orders`; esta cotización es informativa.

## Producción

- Tarifas por comuna/zona y peso volumétrico.
- Integración con courier (Chilexpress, Starken, Correos).
- Código de seguimiento real al pasar a `shipped`.
- Cachear cotizaciones 5–10 min por `city + method + subtotal`.

## Errores

| HTTP | code | Cuándo |
|---|---|---|
| 422 | `VALIDATION` | `subtotal` negativo o método inválido. |
| 502 | `COURIER_ERROR` | El courier no responde; usar tarifa de respaldo. |
