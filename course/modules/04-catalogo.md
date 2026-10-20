# Módulo 04 · Catálogo y búsqueda

**Tiempo:** 80 min · **Resultado:** grilla con filtros combinables y búsqueda instantánea.

## Los filtros viven en la URL

```text
#/catalog?cat=audio&color=lime&sort=priceAsc&max=50000&q=airpods
```

Ventajas: se puede compartir por WhatsApp, el botón “atrás” funciona y recargar
no pierde el estado.

## La consulta

```js
queryProducts({ q, category, color, sort, maxPrice }) {
  const text = q.trim().toLowerCase();
  let list = products.filter(p => {
    if (category && p.category !== category) return false;
    if (color && !p.colors.some(c => c.id === color)) return false;
    if (maxPrice && p.price > maxPrice) return false;
    if (!text) return true;
    return [p.name, p.shortName, p.category, ...(p.tags || [])]
      .join(" ").toLowerCase().includes(text);
  });
  return list.sort(sorters[sort]);
}
```

Los sorters: `relevance` (más vendidos), `priceAsc`, `priceDesc`, `rating`.

## La tarjeta de producto

```html
<article class="p-card">
  <div class="p-card__media">…arte SVG…<span class="p-card__badge">-20%</span></div>
  <h3 class="p-card__name">Funda Silicona iPhone 15 Pro</h3>
  <p class="p-card__price">$12.990 <s>$15.990</s></p>
  <p class="p-card__meta">24 vendidos · ★ 4.8</p>
</article>
```

Es el mismo componente en catálogo, favoritos y búsqueda. Si el nombre no cabe en
dos líneas, se recorta con `-webkit-line-clamp: 2` y altura mínima fija: la
grilla no puede “bailar”.

## Búsqueda

- `debounce` de 140 ms.
- Historial de 6 términos en `localStorage["mega.searches"]`.
- Atajo `/` para abrir la búsqueda desde cualquier pantalla.
- Categorías de “Explorar” que llevan al catálogo con filtro aplicado.

## Favoritos

`store.toggleFavorite(id)`. El corazón se rellena al instante; la grilla se
reacomoda 220 ms después, cuando termina la animación.

## Checklist

- [ ] Filtros combinables y reflejados en la URL.
- [ ] Estado vacío con acción para limpiar.
- [ ] Búsqueda con debounce e historial.
- [ ] Favoritos persisten y aparecen en su pantalla.
- [ ] Grilla estable: los nombres largos no rompen la alineación.

## Siguiente

[05 · Detalle de producto](05-producto.md)
