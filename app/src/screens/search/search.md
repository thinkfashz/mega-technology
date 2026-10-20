# Pantalla · Búsqueda

**Ruta:** `#/search` · **Archivo:** `search.js` + `search.css` · **Tab activo:** ninguno
**Objetivo:** encontrar un producto en menos de 3 segundos.

## Estructura

| Bloque | Clase | Función |
|---|---|---|
| Barra | `.search__bar` | Input con lupa, limpiar y foco automático. |
| Historial | `.search__block` | Últimas 6 búsquedas (mínimo 2 caracteres). |
| Explorar | `.search__trends` | Fundas, Audio, iPhone y Carga. |
| Resultados | `.search__results` | Contador, enlace al catálogo y grilla de hasta 8 productos. |
| Vacío | `.search__empty` | Sugerencias cuando no hay coincidencias. |

## Comportamiento

- **Debounce** de 140 ms para no filtrar en cada tecla.
- `store.queryProducts({ q })` busca en nombre, nombre corto, categoría y tags.
- El historial se guarda al presionar **Enter** o el botón de búsqueda del teclado.
- **Limpiar historial** borra `localStorage["mega.searches"]` y el bloque.
- El botón de limpiar input aparece solo con texto (atributo `hidden` inicial).

## Atajos

| Tecla | Acción |
|---|---|
| `/` (fuera de un input) | Abre `#/search` desde cualquier pantalla. |
| `Enter` | Guarda el término y ejecuta. |
| `Esc` | Limpia el input (comportamiento nativo del `type="search"` en algunos navegadores). |

## Navegación

- Resultado → `#/product/<slug>`.
- Categoría de “Explorar” → `#/catalog?cat=<id>`.
- “Ver en catálogo” → `#/catalog?q=<término>` (búsqueda completa, sin recorte de 8).
- La flecha del header vuelve a la pantalla anterior.

## Accesibilidad

- `aria-label="Buscar productos"` y `enterkeyhint="search"`.
- Contador con `aria-live="polite"`.
- Resultados son enlaces reales; funcionan con teclado.
- El foco entra al input a los 120 ms sin hacer scroll.

## Equivalencia Android

`SearchScreen` con `SearchBar` de Material 3 y `debounce` en el `ViewModel`.
Historial en `DataStore`. Los resultados usan la misma `ProductCard` que el
catálogo y `LazyVerticalGrid`.

## Checklist

- [x] Búsqueda instantánea y tolerante a mayúsculas.
- [x] Historial persistente y borrable.
- [x] Estado vacío con sugerencias.
- [x] Probado a 390 × 844.
