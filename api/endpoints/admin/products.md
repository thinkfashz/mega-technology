# POST /admin/products · PATCH /admin/products/{id}

Alta y edición de catálogo desde el panel. Requiere rol `admin`.

## Crear

```http
POST /api/admin/products
Content-Type: application/json

{
  "name": "Funda Silicona iPhone 16",
  "category": "funda-silicona",
  "price": 14990,
  "stock": 12,
  "art": { "kind": "case", "color": "#33415c" },
  "colors": [{ "id": "azul", "name": "Azul noche", "hex": "#33415c" }],
  "description": "Funda premium para iPhone 16."
}
```

| Campo | Regla |
|---|---|
| `name` | ≥ 3 caracteres; se usa para generar el `slug`. |
| `category` | Debe existir en `/categories`. |
| `price` | Entero > 0 (CLP). |
| `stock` | Entero ≥ 0. |
| `art.kind` | `case`, `phone`, `buds`, `watch`, `charger`, `cable`. |
| `colors` | ≥ 1; `hex` `#RRGGBB`. |

Respuesta `201` con el producto completo. El mock le asigna `id`, `slug`, `sold: 0`,
`rating: 5`, `badge: NUEVO`.

## Editar

```http
PATCH /api/admin/products/p1
Content-Type: application/json

{ "price": 11990, "stock": 30, "description": "Nueva descripción" }
```

Solo se actualizan los campos enviados. `name`, `price` y `stock` se validan si
aparecen.

## Errores

| HTTP | code | Cuándo |
|---|---|---|
| 401 | `UNAUTHORIZED` | Sin sesión. |
| 403 | `FORBIDDEN` | Sin rol admin. |
| 404 | `NOT_FOUND` | Producto inexistente. |
| 422 | `VALIDATION` | Nombre/precio/stock inválidos. |

## Reglas de producción

1. **Auditoría:** registrar actor, campo, valor anterior y nuevo.
2. **Slug único:** si colisiona, agregar sufijo `-2`.
3. **No borrar productos con órdenes:** desactivar (`active: false`) en vez de eliminar.
4. **Stock:** los ajustes manuales deben quedar en un libro de inventario.
5. **Imágenes:** si se suben fotos, validar tipo/tamaño y servirlas por CDN; el
   prototipo usa arte SVG y no acepta archivos.

## Ejemplo

```bash
curl -s -X PATCH http://127.0.0.1:8788/api/admin/products/p1 \
  -H 'Content-Type: application/json' -d '{"stock":30}'
```
