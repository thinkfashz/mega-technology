# POST /service-requests

Solicitud de diagnóstico para servicio técnico.

```http
POST /api/service-requests
Content-Type: application/json
```

## Request

```json
{
  "device": "iPhone",
  "model": "iPhone 14 Pro",
  "issue": "Pantalla rota, táctil intermitente",
  "name": "Camila Rojas",
  "phone": "+56 9 8842 1177"
}
```

| Campo | Regla |
|---|---|
| `device` | `iPhone`, `Android`, `iPad`, `Otro`. |
| `model` | ≥ 2 caracteres. |
| `issue` | ≥ 10 caracteres. |
| `name` | ≥ 3 caracteres. |
| `phone` | ≥ 8 dígitos. |

## Respuesta `201`

```json
{
  "id": "SR-8f2a1b",
  "createdAt": "2026-10-20T14:30:00.000Z",
  "status": "received",
  "device": "iPhone",
  "model": "iPhone 14 Pro",
  "issue": "Pantalla rota, táctil intermitente",
  "name": "Camila Rojas",
  "phone": "+56 9 8842 1177"
}
```

## Errores

| HTTP | code | Cuándo |
|---|---|---|
| 422 | `VALIDATION` | Falta un campo o teléfono inválido. |
| 429 | `RATE_LIMITED` | Producción: más de 5 solicitudes/hora por IP. |

## Producción

- Guardar en `service_requests` con estado `received`.
- Notificar al taller (email/Telegram) con un resumen.
- Devolver un enlace de seguimiento `GET /service-requests/{id}` (propuesto).
- No prometer precio: el diagnóstico es gratis, la reparación se cotiza.
- Datos personales: retención mínima y borrado a pedido.

## Ejemplo

```bash
curl -s -X POST http://127.0.0.1:8788/api/service-requests \
  -H 'Content-Type: application/json' \
  -d '{"device":"iPhone","model":"14 Pro","issue":"Pantalla rota y táctil fallando","name":"Camila Rojas","phone":"+56988421177"}'
```
