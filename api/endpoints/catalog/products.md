# GET /products · GET /products/{id}

Catálogo público. No requiere autenticación.

## Listar

```http
GET /api/products?q=iphone&category=telefonos&sort=priceAsc&maxPrice=1000000
```

| Query | Tipo | Default | Descripción |
|---|---|---|---|
| `q` | string | — | Busca en nombre, nombre corto, categoría y tags. |
| `category` | string | — | ID de categoría (`funda-silicona`, `audio`…). |
| `color` | string | — | ID de color disponible (`lime`, `negro`…). |
| `sort` | enum | `relevance` | `relevance` (más vendidos), `priceAsc`, `priceDesc`, `rating`. |
| `maxPrice` | int | 0 | Precio máximo en CLP; 0 = sin límite. |

### Respuesta `200`

```json
[
  {
    "id": "p1",
    "slug": "funda-silicona-iphone-15-pro",
    "name": "Funda Silicona iPhone 15 Pro",
    "shortName": "Funda Silicona",
    "category": "funda-silicona",
    "price": 12990,
    "compareAt": 15990,
    "stock": 24,
    "sold": 24,
    "rating": 4.8,
    "reviews": 124,
    "badge": "BESTSELLER",
    "badgeTone": "lime",
    "art": { "kind": "case", "color": "#b7e33b" },
    "colors": [{ "id": "lime", "name": "Lima", "hex": "#b7e33b" }],
    "description": "Funda de silicona premium…",
    "features": ["Compatible con MagSafe", "Borde elevado"],
    "freeShipping": true,
    "express": 2990,
    "tags": ["funda", "iphone", "silicone"]
  }
]
```

## Detalle

```http
GET /api/products/p1
GET /api/products/funda-silicona-iphone-15-pro
```

Acepta `id` o `slug`.

| HTTP | code | Caso |
|---|---|---|
| 200 | — | Producto encontrado. |
| 404 | `NOT_FOUND` | No existe. |

## Notas de implementación

- El mock lee `app/data/products.json` al arrancar; los cambios de admin viven en memoria.
- El arte es un objeto (`kind`, `color`) que el cliente dibuja con `ui/art.js`; no hay URLs de imagen.
- `compareAt` puede ser `null`. Si es mayor que `price`, la UI muestra el descuento.
- `stock` es la única verdad para limitar cantidades.

## Ejemplo

```bash
curl -s "http://127.0.0.1:8788/api/products?q=funda&sort=priceAsc"
```
