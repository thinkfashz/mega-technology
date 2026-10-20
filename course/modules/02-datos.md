# Módulo 02 · Datos y estado

**Tiempo:** 75 min · **Resultado:** catálogo real, carrito persistente y métricas.

## El seed

`app/data/products.json` con tres claves:

```json
{
  "meta": { "currency": "CLP", "updatedAt": "2026-10-20" },
  "categories": [{ "id": "funda-silicona", "name": "Funda Silicone", "count": 4 }],
  "products": [{ "id": "p1", "name": "Funda Silicona iPhone 15 Pro", "price": 12990, "stock": 24 }]
}
```

Catorce productos, ocho categorías. El precio está en **pesos enteros**, sin
decimales: Chile no usa centavos en la práctica.

## El store

Un solo objeto con estado, getters derivados y acciones:

```js
export function createStore(seed) {
  const state = { products, categories, cart, favorites, orders, profile, settings, checkout };
  const listeners = new Set();

  function commit() {
    localStorage.setItem("mega.v4", JSON.stringify(state));
    listeners.forEach((fn) => fn());
  }

  return {
    get cartCount() { return state.cart.reduce((n, l) => n + l.qty, 0); },
    get cartSubtotal() { /* suma de líneas */ },
    addToCart(productId, colorId, qty) { /* valida stock y hace commit */ },
    toggleFavorite(id) { /* ... */ },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}
```

### Las cuatro reglas del store

1. Toda mutación pasa por una acción.
2. Toda acción termina en `commit()`.
3. `commit()` persiste y notifica. Nunca se escribe en `localStorage` desde afuera.
4. Los derivados (totales, contadores, métricas) son getters, no campos duplicados.

## El arte en vez de las fotos

`ui/art.js` dibuja el producto con SVG a partir de `{ kind, color }`:

```js
productArt({ kind: "case", color: "#b7e33b" }, { label: "Funda" });
```

Kinds: `case`, `phone`, `buds`, `watch`, `charger`, `cable`. Con esto el admin
puede crear productos sin subir nada.

## Métricas para el panel

```js
stats(days) {
  const inRange = orders.filter(o => o.status !== "cancelled" && new Date(o.createdAt) >= start);
  return { sales, count, avg, lowStock, pending, daily, top, recent };
}
```

`daily` es una serie de `days` puntos, uno por día. Es exactamente lo que dibuja
el gráfico del panel.

## Checklist

- [ ] `products.json` con 14 productos y 8 categorías.
- [ ] `createStore()` con `commit()` y `subscribe()`.
- [ ] `addToCart` respeta el stock.
- [ ] Recargar no pierde carrito ni favoritos.
- [ ] `stats(7)` devuelve la serie diaria.

## Siguiente

[03 · Chrome y navegación](03-navegacion.md)
