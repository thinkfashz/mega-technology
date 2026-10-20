# Pantalla · Favoritos

**Ruta:** `#/favorites` · **Archivo:** `favorites.js` + `favorites.css` · **Tab activo:** Favoritos
**Objetivo:** guardar productos para volver a ellos sin cuenta.

## Estructura

| Bloque | Clase | Función |
|---|---|---|
| Encabezado | `.favorites__head` | Título, contador y **Agregar todo**. |
| Grilla | `.favorites__grid` | Tarjetas con corazón activo. |
| Estado vacío | `emptyCart()` | Explica cómo guardar y lleva al catálogo. |
| Nota | `.favorites__hint` | Aclara que se guardan en el dispositivo. |

## Datos

- `store.favorites` es un array de IDs persistido en `mega.v4`.
- `store.favoriteProducts` resuelve los productos y descarta IDs huérfanos.
- `store.isFavorite(id)` pinta el corazón.
- El badge de la tab no existe; el contador vive en el encabezado y en Perfil.

## Interacciones

1. **Corazón** → `store.toggleFavorite(id)`; la pantalla se re-renderiza a los
   220 ms para reacomodar la grilla o caer al estado vacío.
2. **Agregar todo** → agrega una unidad de cada favorito con su primer color y
   navega al carrito.
3. **Tarjeta** → `#/product/<slug>`.
4. **Estado vacío** → botón **Explorar catálogo**.

## Reglas

- No se guardan cantidades: el favorito es solo el producto.
- Si un producto se elimina del catálogo, el ID se ignora sin romper la grilla.
- Agregar todo respeta stock: `store.addToCart()` recorta la cantidad disponible.

## Accesibilidad

- Corazón con `aria-pressed` y `aria-label` (“Quitar de favoritos”).
- El contador se actualiza en texto, no solo visualmente.
- La grilla mantiene el foco en la tarjeta al re-renderizar (mejora pendiente:
  restaurar foco por `data-id`).

## Equivalencia Android

`FavoritesScreen` observa `FavoritesRepository.ids` y combina con el catálogo.
La grilla usa `LazyVerticalGrid`; “Agregar todo” itera y llama
`CartRepository.add(productId, firstColorId, 1)`.

## Checklist

- [x] Persistencia tras recargar.
- [x] Estado vacío correcto.
- [x] Agregar todo respeta stock.
- [x] Probado a 390 × 844.
