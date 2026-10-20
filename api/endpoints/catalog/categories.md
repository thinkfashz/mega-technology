# GET /categories

Categorías del catálogo con el conteo real de productos.

```http
GET /api/categories
```

## Respuesta `200`

```json
[
  {
    "id": "funda-silicona",
    "name": "Funda Silicone",
    "count": 4,
    "art": { "kind": "case", "color": "#b7e33b" }
  },
  {
    "id": "audio",
    "name": "Audio",
    "count": 3,
    "art": { "kind": "buds", "color": "#b7e33b" }
  }
]
```

| Campo | Tipo | Uso |
|---|---|---|
| `id` | string | Filtro `?category=` y chips de Home. |
| `name` | string | Texto visible. |
| `count` | int | Contador de la tarjeta. |
| `art` | object | Arte SVG de la categoría (`kind` + `color`). |

## Notas

- El seed trae 8 categorías: fundas (silicona, cuero, transparente, MagSafe), audio,
  telefonos, cargadores y cables.
- `count` se calcula en el servidor/mock; en modo local lo deriva el store.
- No hay CRUD de categorías en el panel: es una lista controlada por el seed.

## Ejemplo

```bash
curl -s http://127.0.0.1:8788/api/categories
```
