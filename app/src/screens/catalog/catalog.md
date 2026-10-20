# Pantalla · Catálogo

**Ruta:** `#/catalog` · **Archivo:** `catalog.js` + `catalog.css` · **Tab activo:** Tienda
**Objetivo:** explorar los 14 productos con búsqueda, categoría, color, precio y orden.

## Estructura

| Bloque | Clase | Función |
|---|---|---|
| Encabezado | `.catalog__head` | Título, contador de resultados y botón **Filtros**. |
| Chips de categoría | `.chip-row` | “Todo el catálogo” + las 8 categorías. Scroll horizontal. |
| Barra de resultados | `.catalog__bar` | Orden activo y cantidad encontrada. |
| Grilla | `.product-grid` | Tarjetas de 2 columnas con arte SVG, precio, descuento, rating y favorito. |
| Hoja de filtros | `openSheet()` | Categoría, color, precio máximo y orden. Botón **Aplicar**. |
| Estado vacío | `.empty` | Aparece si los filtros no devuelven productos. |

## Parámetros de URL

| Parámetro | Ejemplo | Efecto |
|---|---|---|
| `cat` | `#/catalog?cat=audifonos` | Filtra por categoría. |
| `q` | `#/catalog?q=iphone` | Búsqueda de texto. |
| `sort` | `#/catalog?sort=priceAsc` | `relevance`, `priceAsc`, `priceDesc`, `rating`. |
| `color` | `#/catalog?color=lime` | Filtra por color disponible. |
| `max` | `#/catalog?max=50000` | Precio máximo en CLP. |
| `panel` | `#/catalog?panel=cats` | Mantiene el tab **Categorías** activo (vista desde el menú). |

Los filtros viven en la URL, así que **atrás/adelante** y recargar conservan el estado.

## Lógica

```js
const filters = {
  q: query.get("q") || "",
  category: query.get("cat") || "",
  color: query.get("color") || "",
  sort: query.get("sort") || "relevance",
  maxPrice: Number(query.get("max") || 0),
};
const items = store.queryProducts(filters);
```

`store.queryProducts()` busca en `name`, `shortName`, `category` y `tags`, y ordena
por relevancia (`sold`), precio o rating. No hay paginación: 14 productos entran en
una sola carga local.

## Interacciones

1. **Chip de categoría** → `navigate()` con `cat`, sin recargar la página.
2. **Filtros** → hoja con controles; **Aplicar** construye la query y navega.
3. **Limpiar** → vuelve a `#/catalog` sin parámetros.
4. **Favorito** → `store.toggleFavorite()`; el corazón se rellena al instante.
5. **Tarjeta** → `#/product/<slug>`.
6. **Volver** → el header muestra flecha solo si se llegó desde otra ruta.

## Datos y rendimiento

- Fuente: `app/data/products.json` (14 productos, 8 categorías).
- El arte se dibuja con `ui/art.js`; no hay peticiones de imágenes.
- La grilla se re-renderiza completa al cambiar filtros (14 nodos, costo despreciable).
- `content-visibility` no se usa para no romper ScrollTrigger.

## Accesibilidad

- Chips con `aria-pressed`.
- Botón de filtros con `aria-expanded` gestionado por la hoja.
- Precio tachado con `aria-label` que incluye el valor anterior.
- Foco devuelto al botón que abrió la hoja al cerrar.

## Equivalencia Android

`CatalogViewModel` expone `StateFlow<CatalogUiState>` con `filters`, `products` e
`isLoading`. La grilla usa `LazyVerticalGrid`; la hoja es `ModalBottomSheet`.
Los filtros se guardan en `SavedStateHandle` para sobrevivir rotación.

## Checklist

- [x] Filtros combinables y persistentes en URL.
- [x] Estado vacío con acción para limpiar.
- [x] Favoritos sincronizados con Home y Favoritos.
- [x] Probado a 390 × 844.
