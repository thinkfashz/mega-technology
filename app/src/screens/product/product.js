/**
 * product.js — Detalle de producto.
 * Color → cambia la ilustración y el stock. Cantidad → carrito y checkout.
 */

import { productArt } from "../../ui/art.js";
import { icon, star } from "../../ui/icons.js";
import { productCard } from "../../ui/product-card.js";
import { bindFavorites, share } from "../../ui/actions.js";
import { money, rating, esc } from "../../core/format.js";
import { qs } from "../../core/dom.js";

export default {
  title: "Producto",

  render({ store, params }) {
    const product = store.product(params.id) || store.products[0];
    if (!product) return `<p class="screen-pad">Producto no encontrado.</p>`;

    const color = product.colors?.[0] || { id: "default", name: "Estándar", hex: product.art.color };
    const related = store.products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 2);
    const favorite = store.isFavorite(product.id);

    return `
      <section class="product" data-enter>
        <div class="product__gallery">
          <div class="product__stage" data-gallery>
            <span class="product__halo" aria-hidden="true"></span>
            <div class="product__art" data-gallery-art>
              ${productArt({ ...product.art, color: color.hex }, { label: product.name })}
            </div>
            <span class="product__badge">${product.badge ? `<span class="badge ${
              product.badgeTone === "gold" ? "badge--gold" : "badge--lime"
            }">${esc(product.badge)}</span>` : ""}</span>
            <button class="p-card__fav product__fav" type="button" data-fav="${product.id}"
              aria-pressed="${favorite}" aria-label="${favorite ? "Quitar de" : "Agregar a"} favoritos">
              ${icon(favorite ? "heart-fill" : "heart", { size: 18 })}
            </button>
          </div>
          <div class="product__dots" role="tablist" aria-label="Vistas del producto">
            ${[0, 1, 2]
              .map(
                (i) =>
                  `<button class="product__dot ${i === 0 ? "is-active" : ""}" role="tab" aria-selected="${
                    i === 0
                  }" data-view="${i}" aria-label="Vista ${i + 1}"></button>`,
              )
              .join("")}
          </div>
        </div>

        <div class="product__panel">
          <div class="product__headline">
            <h1 class="product__name">${esc(product.name)}</h1>
            <div class="product__price-row">
              <p class="product__price m-price">${money(product.price)}</p>
              <span class="rating-pill">${star}<strong>${rating(product.rating)}</strong> <span>(${product.reviews} reseñas)</span></span>
            </div>
            ${
              product.compareAt
                ? `<p class="product__save">Ahorras ${money(product.compareAt - product.price)} <s>${money(
                    product.compareAt,
                  )}</s></p>`
                : ""
            }
          </div>

          <div class="product__block">
            <p class="product__label">Color: <strong data-color-name>${esc(color.name)}</strong></p>
            <div class="swatch-row" role="group" aria-label="Color del producto">
              ${(product.colors || [color])
                .map(
                  (c) => `<button class="swatch" type="button" data-color="${c.id}" data-hex="${c.hex}"
                    style="--sw:${c.hex}" aria-pressed="${c.id === color.id}" aria-label="${esc(c.name)}">
                    <span class="swatch__check">${icon("check", { size: 11 })}</span>
                  </button>`,
                )
                .join("")}
            </div>
          </div>

          <div class="product__block">
            <p class="product__label">Stock:</p>
            <p class="product__stock ${product.stock <= 5 ? "is-low" : ""}" data-stock>
              ${product.stock > 0 ? `Disponible: ${product.stock} unidades` : "Agotado por ahora"}
            </p>
            <div class="stock-bar ${product.stock <= 5 ? "is-low" : ""}" aria-hidden="true">
              <i style="width:${Math.min(100, (product.stock / 30) * 100)}%"></i>
            </div>
          </div>

          <div class="product__block">
            <p class="product__label">Descripción:</p>
            <p class="product__description">${esc(product.description)}</p>
            <ul class="product__features">
              ${(product.features || [])
                .map(
                  (feature) => `<li>${icon("check-circle", { size: 14 })}<span>${esc(feature)}</span></li>`,
                )
                .join("")}
            </ul>
          </div>

          <div class="product__qty">
            <span class="product__label">Cantidad:</span>
            <div class="stepper" data-stepper>
              <button type="button" data-qty="-1" aria-label="Quitar uno">−</button>
              <output data-qty-value>1</output>
              <button type="button" data-qty="1" aria-label="Agregar uno">+</button>
            </div>
          </div>

          <button class="btn btn-lime btn-lg btn-block product__cta" type="button" data-buy>
            Comprar Ahora ${icon("arrow-right", { size: 20, cls: "btn__arrow" })}
          </button>

          <div class="product__actions">
            <button class="btn btn-ghost btn-sm grow" type="button" data-add="${product.id}">
              ${icon("cart", { size: 16 })} Agregar al carrito
            </button>
            <button class="btn btn-ghost btn-sm" type="button" data-share>
              ${icon("share", { size: 16 })} Compartir
            </button>
          </div>

          <div class="product__shipping">
            <span>${icon("truck", { size: 16 })}</span>
            <p><strong>Envío gratis</strong> en 3–5 días · Express 24–48 h por ${money(2990)}</p>
          </div>
        </div>

        ${
          related.length
            ? `<section class="product__related">
                <div class="m-section-head">
                  <h2 class="m-section-title">También te gusta</h2>
                  <a class="m-link" href="#/catalog?cat=${product.category}">Ver más ${icon("chevron-right", {
                    size: 14,
                  })}</a>
                </div>
                <div class="grid-2">
                  ${related
                    .map((item) =>
                      productCard(item, { favorite: store.isFavorite(item.id), variant: "catalog", reveal: false }),
                    )
                    .join("")}
                </div>
              </section>`
            : ""
        }
      </section>`;
  },

  mount(root, ctx) {
    const { store, params, navigate, toast } = ctx;
    const product = store.product(params.id) || store.products[0];
    if (!product) return;

    bindFavorites(root, ctx);

    let qty = 1;
    let colorId = product.colors?.[0]?.id || "default";
    let colorHex = product.colors?.[0]?.hex || product.art.color;

    const qtyOutput = qs("[data-qty-value]", root);
    const galleryArt = qs("[data-gallery-art]", root);

    root.querySelectorAll("[data-qty]").forEach((button) =>
      button.addEventListener("click", () => {
        qty = Math.max(1, Math.min(product.stock || 99, qty + Number(button.dataset.qty)));
        qtyOutput.textContent = qty;
        qtyOutput.animate?.(
          [{ transform: "scale(1.18)" }, { transform: "scale(1)" }],
          { duration: 160, easing: "ease-out" },
        );
      }),
    );

    root.querySelectorAll("[data-color]").forEach((button) =>
      button.addEventListener("click", () => {
        colorId = button.dataset.color;
        colorHex = button.dataset.hex;
        root.querySelectorAll("[data-color]").forEach((b) => b.setAttribute("aria-pressed", "false"));
        button.setAttribute("aria-pressed", "true");
        const color = product.colors.find((c) => c.id === colorId);
        qs("[data-color-name]", root).textContent = color?.name || "";
        galleryArt.innerHTML = productArt({ ...product.art, color: colorHex }, { label: product.name });
        galleryArt.classList.remove("is-swapping");
        void galleryArt.offsetWidth;
        galleryArt.classList.add("is-swapping");
      }),
    );

    root.querySelectorAll("[data-view]").forEach((dot, index) =>
      dot.addEventListener("click", () => {
        root.querySelectorAll("[data-view]").forEach((d) => {
          d.classList.remove("is-active");
          d.setAttribute("aria-selected", "false");
        });
        dot.classList.add("is-active");
        dot.setAttribute("aria-selected", "true");
        const art = qs(".product-art", galleryArt);
        if (art) {
          art.style.transform =
            index === 1 ? "rotateY(18deg) rotateX(-4deg) scale(.96)" : index === 2 ? "scale(1.12)" : "";
        }
      }),
    );

    root.querySelector("[data-add]")?.addEventListener("click", () => {
      store.addToCart(product.id, colorId, qty);
      toast(`${qty} × ${product.shortName} en el carrito`, { iconName: "cart" });
    });

    qs("[data-buy]", root)?.addEventListener("click", () => {
      if (!product.stock) {
        toast("Producto agotado por ahora", { type: "error" });
        return;
      }
      store.addToCart(product.id, colorId, qty);
      navigate("/checkout");
    });

    qs("[data-share]", root)?.addEventListener("click", () =>
      share({ title: `${product.name} · ${money(product.price)}` }, toast),
    );
  },

  unmount() {},
};
