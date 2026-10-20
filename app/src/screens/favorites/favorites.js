/**
 * favorites.js — Favoritos guardados en el dispositivo.
 */

import { productCard } from "../../ui/product-card.js";
import { bindFavorites } from "../../ui/actions.js";
import { icon } from "../../ui/icons.js";
import { emptyCart } from "../../ui/summary.js";
import { qs, qsa } from "../../core/dom.js";

export default {
  title: "Favoritos",

  render({ store }) {
    const items = store.favoriteProducts;
    if (!items.length) {
      return `<section class="favorites" data-enter>
        <header class="favorites__head"><h1 class="favorites__title">Favoritos</h1></header>
        ${emptyCart({ title: "Todavía no guardaste nada", message: "Toca el corazón de un producto para tenerlo a mano." })}
      </section>`;
    }

    return `
      <section class="favorites" data-enter>
        <header class="favorites__head">
          <div>
            <h1 class="favorites__title">Favoritos</h1>
            <p class="favorites__sub">${items.length} producto${items.length === 1 ? "" : "s"} guardado${
              items.length === 1 ? "" : "s"
            }</p>
          </div>
          <button class="btn btn-outline btn-sm" type="button" data-add-all>
            ${icon("cart", { size: 15 })} Agregar todo
          </button>
        </header>

        <div class="product-grid favorites__grid">
          ${items
            .map((product) => productCard(product, { favorite: true, variant: "catalog", reveal: false }))
            .join("")}
        </div>

        <p class="favorites__hint">${icon("heart", {
          size: 13,
        })} Se guardan en este dispositivo, sin necesidad de cuenta.</p>
      </section>`;
  },

  mount(root, ctx) {
    const { store, toast, navigate } = ctx;
    bindFavorites(root, ctx);

    // Al quitar un favorito, la grilla se reacomoda (o cae al estado vacío).
    root.addEventListener("click", (event) => {
      if (!event.target.closest("[data-fav]")) return;
      setTimeout(() => navigate("/favorites", { replace: true }), 220);
    });

    qs("[data-add-all]", root)?.addEventListener("click", () => {
      store.favoriteProducts.forEach((product) => {
        store.addToCart(product.id, product.colors?.[0]?.id, 1);
      });
      toast(`${store.favoriteProducts.length} productos al carrito`, { iconName: "cart" });
      navigate("/cart");
    });
  },

  unmount() {},
};
