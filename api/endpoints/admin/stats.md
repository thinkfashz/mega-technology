# GET /admin/stats

Métricas del panel. Requiere rol `admin` en producción.

```http
GET /api/admin/stats?days=7
```

| Query | Valores | Default |
|---|---|---|
| `days` | `7`, `14`, `30` | `7` |

## Respuesta `200`

```json
{
  "sales": 2131660,
  "count": 16,
  "avg": 133229,
  "lowStock": 3,
  "pending": 7,
  "daily": [
    { "date": "2026-10-14T00:00:00.000Z", "value": 25980 },
    { "date": "2026-10-15T00:00:00.000Z", "value": 12990 }
  ],
  "top": [{ "id": "p1", "name": "Funda Silicona iPhone 15 Pro", "sold": 24, "price": 12990 }],
  "recent": [{ "id": "MT-1042", "status": "pending", "total": 265970 }]
}
```

| Campo | Cálculo |
|---|---|
| `sales` | Suma de `total` de órdenes no canceladas en el rango. |
| `count` | Cantidad de órdenes en el rango. |
| `avg` | `round(sales / count)`; 0 si no hay órdenes. |
| `lowStock` | Productos con `stock <= 5`. |
| `pending` | Órdenes en `pending` o `paid`. |
| `daily` | Serie de `days` puntos, uno por día, en orden ascendente. |
| `top` | 4 productos por `sold` descendente. |
| `recent` | Últimas 6 órdenes, sin importar el rango. |

## Zona horaria

El mock agrupa por día local del servidor (`toDateString`). Producción debe
agrupar en `America/Santiago` y devolver `date` como `YYYY-MM-DD` para evitar
ambigüedad.

## Errores

| HTTP | code | Cuándo |
|---|---|---|
| 401 | `UNAUTHORIZED` | Sin sesión. |
| 403 | `FORBIDDEN` | Sesión sin rol admin. |
| 422 | `VALIDATION` | `days` fuera de 7/14/30. |

## Notas

- El gráfico del panel consume exactamente `daily`.
- Los KPIs se animan en el cliente; el valor final viene de acá.
- En producción, cachear 30–60 s y evitar escanear toda la tabla en cada request
  (índice por `created_at`).
