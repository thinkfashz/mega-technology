/**
 * cart.js — Carrito.
 * Cantidades y eliminación con re-render local (sin recargar la app).
 */

import { productArt } from "../../ui/art.js";
import { icon } from "../../ui/icons.js";
import { orderSummary, emptyCart } from "../../ui/summary.js";
import { bindFavorites } from "../../ui/actions.js";
import { money, esc } from "../../core/format.js";
import { qsa } from "../../core/dom.js";

export default {
  title: "Mi carrito",

  render({ store }) {
    if (!store.cart.length) return emptyCart();

    return `
      <section class="cart" data-enter>
        <header class="cart__head">
          <div>
            <h1 class="cart__title">Mi carrito</h1>
            <p class="cart__sub">${store.cartCount} unidad${store.cartCount === 1 ? "" : "es"} · ${
              store.cartLines.length
            } producto${store.cartLines.length === 1 ? "" : "s"}</p>
          </div>
          <a class="cart__continue" href="#/catalog">Seguir comprando</a>
        </header>

        <div class="cart__free">
          ${icon("truck", { size: 16 })}
          <span>${store.shippingCost === 0 ? "Envío gratis seleccionado" : "Envío express 24–48 h seleccionado"}</span>
          <a href="#/shipping">Cambiar</a>
        </div>

        <div class="cart__lines">
          ${store.cartLines
            .map(
              (line) => `<article class="cart-line">
                <a class="cart-line__media" href="#/product/${line.product.id}" aria-label="${esc(line.name)}">
                  <span class="cart-line__halo"></span>
                  ${productArt(line.art, { label: line.name })}
                </a>
                <div class="cart-line__body">
                  <div class="row-between gap-2">
                    <h3 class="cart-line__name"><a href="#/product/${line.product.id}">${esc(line.name)}</a></h3>
                    <button class="cart-line__remove" type="button" data-remove="${line.productId}"
                      data-color="${line.colorId}" aria-label="Quitar ${esc(line.name)}">${icon("trash", {
                        size: 16,
                      })}</button>
                  </div>
                  <p class="cart-line__meta">Color: ${esc(line.color?.name || "Estándar")} · ${
                    line.product.stock
                  } disponibles</p>
                  <div class="row-between gap-2 cart-line__foot">
                    <span class="cart-line__price m-price">${money(line.price * line.qty)}</span>
                    <div class="stepper stepper--sm">
                      <button type="button" data-minus="${line.productId}" data-color="${line.colorId}" aria-label="Quitar uno">−</button>
                      <output>${line.qty}</output>
                      <button type="button" data-plus="${line.productId}" data-color="${line.colorId}" aria-label="Agregar uno">+</button>
                    </div>
                  </div>
                </div>
              </article>`,
            )
            .join("")}
        </div>

        ${orderSummary(store, { title: "Total del carrito" })}

        <button class="btn btn-lime btn-lg btn-block cart__cta" type="button" data-go-checkout>
          Ir a pagar ${icon("arrow-right", { size: 20, cls: "btn__arrow" })}
        </button>

        <div class="cart__trust">
          <span>${icon("lock", { size: 13 })} Pago seguro</span>
          <span>${icon("refresh", { size: 13 })} 30 días de cambio</span>
          <span>${icon("shield", { size: 13 })} Garantía 90 días</span>
        </div>

        <button class="btn btn-quiet cart__clear" type="button" data-clear>Vaciar carrito</button>
      </section>`;
  },

  mount(root, ctx) {
    const { store, navigate, toast, ask } = ctx;

    const refresh = () => navigate("/cart", { replace: true });

    qsa("[data-plus]", root).forEach((button) =>
      button.addEventListener("click", () => {
        const line = store.cart.find(
          (l) => l.productId === button.dataset.plus && l.colorId === button.dataset.color,
        );
        store.setQty(button.dataset.plus, button.dataset.color, (line?.qty || 1) + 1);
        refresh();
      }),
    );

    qsa("[data-minus]", root).forEach((button) =>
      button.addEventListener("click", () => {
        const line = store.cart.find(
          (l) => l.productId === button.dataset.minus && l.colorId === button.dataset.color,
        );
        if ((line?.qty || 1) <= 1) {
          store.removeFromCart(button.dataset.minus, button.dataset.color);
          toast("Producto quitado del carrito", { iconName: "trash" });
        } else {
          store.setQty(button.dataset.minus, button.dataset.color, line.qty - 1);
        }
        refresh();
      }),
    );

    qsa("[data-remove]", root).forEach((button) =>
      button.addEventListener("click", () => {
        store.removeFromCart(button.dataset.remove, button.dataset.color);
        toast("Producto quitado del carrito", { iconName: "trash" });
        refresh();
      }),
    );

    root.querySelector("[data-go-checkout]")?.addEventListener("click", () => navigate("/checkout"));

    root.querySelector("[data-clear]")?.addEventListener("click", async () => {
      const yes = await ask({
        title: "Vaciar carrito",
        message: "Se quitarán todos los productos. Esta acción no se puede deshacer.",
        confirmText: "Sí, vaciar",
        tone: "danger",
      });
      if (!yes) return;
      store.clearCart();
      toast("Carrito vacío", { iconName: "cart" });
      navigate("/home");
    });

    bindFavorites(root, ctx);
  },

  unmount() {},
};
