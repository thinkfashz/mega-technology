# API · MEGA TECHNOLOGY

Contrato REST del ecommerce. La app nunca llama a `fetch` directo: usa
`app/src/core/api.js`, que implementa dos modos con la misma firma.

| Modo | Cómo se activa | Dónde responde |
|---|---|---|
| Local | por defecto o `?api=local` | `store` + `localStorage` |
| Remoto | `?api=remote&base=http://127.0.0.1:8788/api` | `api/mock/server.mjs` o backend real |

## Arrancar el mock

```sh
node api/mock/server.mjs
# MEGA API mock · http://127.0.0.1:8788/api
```

Probar:

```sh
curl -s http://127.0.0.1:8788/api/products | head -c 400
curl -s http://127.0.0.1:8788/api/admin/stats?days=7
```

## Convenciones

- Base: `/api`.
- JSON UTF-8, `Content-Type: application/json`.
- Fechas ISO 8601 (`2026-10-20T14:22:00.000Z`).
- Dinero en pesos chilenos, enteros, sin decimales.
- IDs de pedido `MT-####`; de servicio `SR-xxxxxx`; de producto `p1…`.
- Errores: `{ code, message, details? }`.

## Códigos de error

| HTTP | code | Cuándo |
|---|---|---|
| 400 | `INVALID_JSON` | Body mal formado. |
| 401 | `UNAUTHORIZED` | Falta sesión o rol (propuesto). |
| 404 | `NOT_FOUND` | Producto/pedido inexistente. |
| 409 | `STOCK_INSUFFICIENT` | No alcanza el stock. |
| 409 | `CONFLICT` | Transición de estado inválida. |
| 413 | `PAYLOAD_TOO_LARGE` | Body > 1 MB. |
| 422 | `VALIDATION` | Campos inválidos o faltantes. |
| 500 | `INTERNAL` | Error del servidor. |
| 501 | `NOT_IMPLEMENTED` | Endpoint propuesto, aún no implementado. |

## Índice de endpoints

### Implementados

| Método | Ruta | Doc |
|---|---|---|
| GET | `/products` | [catalog/products.md](./endpoints/catalog/products.md) |
| GET | `/products/{id}` | [catalog/products.md](./endpoints/catalog/products.md) |
| GET | `/categories` | [catalog/categories.md](./endpoints/catalog/categories.md) |
| GET | `/orders` | [orders/list.md](./endpoints/orders/list.md) |
| POST | `/orders` | [orders/create.md](./endpoints/orders/create.md) |
| GET | `/orders/{id}` | [orders/list.md](./endpoints/orders/list.md) |
| PATCH | `/orders/{id}` | [orders/update-status.md](./endpoints/orders/update-status.md) |
| POST | `/service-requests` | [service/create.md](./endpoints/service/create.md) |
| GET | `/admin/stats` | [admin/stats.md](./endpoints/admin/stats.md) |
| POST | `/admin/products` | [admin/products.md](./endpoints/admin/products.md) |
| PATCH | `/admin/products/{id}` | [admin/products.md](./endpoints/admin/products.md) |

### Propuestos (documentados, no implementados)

| Método | Ruta | Doc |
|---|---|---|
| POST | `/payments/intent` | [payments/intent.md](./endpoints/payments/intent.md) |
| POST | `/payments/webhook` | [payments/webhook.md](./endpoints/payments/webhook.md) |
| GET | `/shipping/quote` | [shipping/quote.md](./endpoints/shipping/quote.md) |
| POST | `/auth/session` | [auth/session.md](./endpoints/auth/session.md) |

## Reglas de negocio transversales

1. **El servidor manda.** Precios, stock y totales se recalculan al crear la orden.
2. **Stock atómico.** Descontar stock y crear la orden debe ser una transacción.
3. **Idempotencia.** `POST /orders` acepta `Idempotency-Key` en producción.
4. **Pagos.** La orden nace `pending`; el webhook la pasa a `paid`.
5. **Privacidad.** Un cliente solo ve sus pedidos; el admin ve todos.
6. **Auditoría.** Cada cambio de precio/stock registra actor, antes y después.

## OpenAPI

El contrato completo está en [`api/openapi.yaml`](../openapi.yaml). Se puede abrir
con Swagger Editor o generar un cliente con `openapi-generator`.
