/**
 * product-card.js — tarjeta de producto reutilizable.
 * Variantes: "catalog" (grilla 2 col) y "featured" (más grande, precio centrado).
 */

import { productArt } from "./art.js";
import { icon, star } from "./icons.js";
import { money, rating, esc } from "../core/format.js";

export function productCard(product, { favorite = false, variant = "catalog", reveal = true } = {}) {
  const href = `#/product/${product.id}`;
  const badge = product.badge
    ? `<span class="badge ${product.badgeTone === "gold" ? "badge--gold" : "badge--lime"}">${esc(product.badge)}</span>`
    : "";

  return `
    <article class="p-card p-card--${variant}" ${reveal ? "data-reveal" : ""}>
      <div class="p-card__media" data-tilt>
        <a href="${href}" class="p-card__link" aria-label="Ver ${esc(product.name)}">
          <span class="p-card__halo" aria-hidden="true"></span>
          ${productArt(product.art, { label: product.name })}
        </a>
        ${badge}
        <button class="p-card__fav" type="button" data-fav="${product.id}"
          aria-pressed="${favorite}" aria-label="${favorite ? "Quitar de" : "Agregar a"} favoritos">
          ${icon(favorite ? "heart-fill" : "heart", { size: 18 })}
        </button>
      </div>
      <div class="p-card__body">
        <h3 class="p-card__name"><a href="${href}">${esc(product.name)}</a></h3>
        <p class="p-card__price m-price">${money(product.price)}${
          product.compareAt ? ` <s class="m-strike">${money(product.compareAt)}</s>` : ""
        }</p>
        <p class="p-card__meta">
          <span>${product.sold} vendidos</span>
          <span class="dot" aria-hidden="true">·</span>
          <span class="rating">${star}${rating(product.rating)}</span>
        </p>
      </div>
    </article>`;
}

export function categoryCard(category) {
  return `
    <a class="cat-card" href="#/catalog?cat=${encodeURIComponent(category.id)}" data-reveal>
      <span class="cat-card__media">
        <span class="cat-card__halo" aria-hidden="true"></span>
        ${productArt(category.art, { label: category.name })}
      </span>
      <span class="cat-card__name">${esc(category.name)}</span>
      <span class="cat-card__count">${category.count} artículos</span>
    </a>`;
}

export function addToCartButton(product, { className = "btn btn-lime btn-block btn-lg" } = {}) {
  return `<button class="${className}" type="button" data-add="${product.id}">
    ${icon("cart", { size: 18 })} Agregar al carrito
  </button>`;
}
