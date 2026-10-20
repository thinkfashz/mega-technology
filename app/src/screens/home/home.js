/**
 * home.js — Inicio.
 * Hero + categorías + más vendidos + servicio técnico + confianza.
 */

import { productArt } from "../../ui/art.js";
import { icon } from "../../ui/icons.js";
import { categoryCard, productCard } from "../../ui/product-card.js";
import { bindFavorites } from "../../ui/actions.js";
import { mountStage } from "../../three/stage.js";
import { heroParallax } from "../../ui/motion.js";
import { qs } from "../../core/dom.js";
import { esc } from "../../core/format.js";

let stage = null;

function heroDevices() {
  return `
    <div class="hero__stage" aria-hidden="true">
      <div class="hero__gold"></div>
      <div class="hero__canvas" data-three-stage></div>
      <div class="hero__devices" data-parallax="0.06">
        <span class="dev dev--phone">${productArt({ kind: "phone", color: "#353a41" })}</span>
        <span class="dev dev--case">${productArt({ kind: "case", color: "#b7e33b" })}</span>
        <span class="dev dev--buds">${productArt({ kind: "buds", color: "#b7e33b" })}</span>
        <span class="dev dev--watch">${productArt({ kind: "watch", color: "#d3a94f" })}</span>
        <span class="dev dev--charger">${productArt({ kind: "charger", color: "#d3a94f" })}</span>
        <span class="dev dev--cable">${productArt({ kind: "cable", color: "#8d8d8d" })}</span>
      </div>
      <div class="hero__scrim"></div>
    </div>`;
}

export default {
  title: "Inicio",

  render({ store }) {
    const bestsellers = [store.product("p5"), store.product("p6")].filter(Boolean);
    return `
      <section class="home" data-enter>
        <article class="hero" aria-label="Nueva serie iPhone 15">
          ${heroDevices()}
          <div class="hero__content">
            <p class="hero__kicker">${icon("sparkles", { size: 13 })} Nueva colección 2026</p>
            <h1 class="hero__title">Nueva serie<br /><span>iPhone 15</span></h1>
            <p class="hero__sub">Última tecnología. Accesorios premium.</p>
            <p class="hero__offer">Hasta 20% OFF</p>
            <a class="btn btn-lime btn-pill hero__cta" href="#/catalog">
              Comprar Ahora ${icon("arrow-right", { size: 18, cls: "btn__arrow" })}
            </a>
          </div>
          <div class="hero__dots" aria-hidden="true"><i class="is-active"></i><i></i><i></i></div>
        </article>

        <section class="home-section" aria-labelledby="cats-title">
          <div class="m-section-head">
            <h2 class="m-section-title" id="cats-title">Categorías</h2>
            <a class="m-link" href="#/catalog?panel=cats">Ver todas ${icon("chevron-right", { size: 14 })}</a>
          </div>
          <div class="cat-grid">
            ${store.categories.map((category) => categoryCard(category)).join("")}
          </div>
        </section>

        <section class="home-section" aria-labelledby="best-title">
          <div class="m-section-head">
            <h2 class="m-section-title" id="best-title">Más vendidos</h2>
            <a class="m-link" href="#/catalog?sort=relevance">Ver todo ${icon("chevron-right", { size: 14 })}</a>
          </div>
          <div class="grid-2">
            ${bestsellers
              .map((product) =>
                productCard(product, {
                  favorite: store.isFavorite(product.id),
                  variant: "featured",
                }),
              )
              .join("")}
          </div>
        </section>

        <section class="home-section">
          <a class="service-promo" href="#/service" data-reveal>
            <span class="service-promo__icon">${icon("wrench", { size: 22 })}</span>
            <span class="grow">
              <span class="service-promo__eyebrow">Servicio técnico certificado</span>
              <span class="service-promo__title">Diagnóstico gratis, sin compromiso</span>
              <span class="service-promo__meta">Reparamos tu iPhone en 24–48 h · Garantía 90 días</span>
            </span>
            ${icon("chevron-right", { size: 18 })}
          </a>
        </section>

        <section class="home-trust" aria-label="Beneficios de comprar en MEGA">
          ${[
            ["truck", "Envío 24–48 h"],
            ["shield", "Garantía 90 días"],
            ["lock", "Pago encriptado"],
          ]
            .map(
              ([ic, label]) => `<div class="trust-item">
                <span class="trust-item__icon">${icon(ic, { size: 18 })}</span>
                <span>${esc(label)}</span>
              </div>`,
            )
            .join("")}
        </section>

        <p class="home-foot">MEGA TECHNOLOGY · VERSIÓN 4 · SANTIAGO, CHILE</p>
      </section>`;
  },

  mount(root, ctx) {
    bindFavorites(root, ctx);
    stage = mountStage(qs("[data-three-stage]", root), { particles: 220 });
    heroParallax(root, "[data-parallax]");
  },

  unmount() {
    stage?.destroy();
    stage = null;
  },
};
