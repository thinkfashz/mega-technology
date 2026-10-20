/**
 * catalog.js — Catálogo con filtros en URL (compartible y reversible).
 * Params: cat, q, color, sort, max.
 */

import { productCard } from "../../ui/product-card.js";
import { bindFavorites } from "../../ui/actions.js";
import { icon } from "../../ui/icons.js";
import { esc } from "../../core/format.js";

const PAGE_SIZE = 6;

const SORTS = [
  ["relevance", "Más vendidos"],
  ["priceAsc", "Menor precio"],
  ["priceDesc", "Mayor precio"],
  ["rating", "Mejor valorados"],
  ["newest", "Novedades"],
];

const COLORS = [
  ["lime", "Lima", "#b7e33b"],
  ["negro", "Negro", "#1b1b1b"],
  ["azul", "Azul", "#33415c"],
  ["rosa", "Rosa", "#f4a7b9"],
  ["cafe", "Café", "#9a6b2f"],
  ["clear", "Cristal", "#cfd6dc"],
];

function filtersFrom(query) {
  return {
    category: query.get("cat") || "",
    q: query.get("q") || "",
    color: query.get("color") || "",
    sort: query.get("sort") || "relevance",
    maxPrice: Number(query.get("max") || 0),
  };
}

function countLabel(total) {
  return `${total} artículo${total === 1 ? "" : "s"} encontrado${total === 1 ? "" : "s"}`;
}

export default {
  title: "Catálogo",

  render({ store, query }) {
    const filters = filtersFrom(query);
    const results = store.queryProducts(filters);
    const shown = Math.min(Number(query.get("page") || 1) * PAGE_SIZE, results.length);
    const visible = results.slice(0, shown);
    const category = filters.category ? store.category(filters.category) : null;

    return `
      <section class="catalog" data-enter>
        <header class="catalog__head">
          <h1 class="catalog__title">Catálogo</h1>
          <button class="catalog__filter" type="button" data-open-filters aria-label="Abrir filtros">
            <span>Filtros</span>
            ${icon("sliders", { size: 18 })}
            ${icon("filter", { size: 18 })}
          </button>
        </header>

        ${
          filters.q
            ? `<div class="catalog__searchline">
                <span class="catalog__query">${icon("search", { size: 13 })} “${esc(filters.q)}”</span>
                <a class="catalog__clear" href="#/catalog">Limpiar</a>
              </div>`
            : ""
        }

        <div class="catalog__meta">
          ${
            category
              ? `<span class="active-filter">
                  Categorías · ${esc(category.name)}
                  <button type="button" data-clear-cat aria-label="Quitar filtro de categoría">${icon("x", {
                    size: 12,
                  })}</button>
                </span>`
              : `<span class="catalog__micro">${filters.q ? "Resultados" : "Todo el catálogo"}</span>`
          }
          <span class="catalog__count">${countLabel(results.length)}</span>
        </div>

        ${
          visible.length
            ? `<div class="product-grid catalog__grid">
                ${visible
                  .map((product) =>
                    productCard(product, {
                      favorite: store.isFavorite(product.id),
                      variant: "catalog",
                    }),
                  )
                  .join("")}
              </div>
              <div class="catalog__foot">
                <p class="catalog__showing">Mostrando 1–${shown} de ${results.length} artículos</p>
                ${
                  shown < results.length
                    ? `<button class="btn btn-ghost btn-sm" data-load-more>${icon("plus", {
                        size: 15,
                      })} Cargar más</button>`
                    : `<a class="btn btn-outline btn-sm" href="#/catalog">Ver todo</a>`
                }
              </div>`
            : `<div class="empty catalog__empty">
                <div class="empty__icon">${icon("search", { size: 24 })}</div>
                <p class="empty__title">Sin resultados</p>
                <p class="text-sm">No encontramos productos con esos filtros.</p>
                <a class="btn btn-lime btn-sm" href="#/catalog">Limpiar filtros</a>
              </div>`
        }
      </section>`;
  },

  mount(root, ctx) {
    const { store, query, navigate, openSheet, closeSheet } = ctx;
    bindFavorites(root, ctx);

    const current = filtersFrom(query);

    root.querySelector("[data-clear-cat]")?.addEventListener("click", () => {
      const params = new URLSearchParams(query);
      params.delete("cat");
      params.delete("page");
      navigate(`/catalog?${params.toString()}`);
    });

    root.querySelector("[data-load-more]")?.addEventListener("click", () => {
      const params = new URLSearchParams(query);
      params.set("page", String(Number(query.get("page") || 1) + 1));
      navigate(`/catalog?${params.toString()}`);
    });

    root.querySelector("[data-open-filters]")?.addEventListener("click", () => openFilters());

    function openFilters() {
      const draft = { ...current };
      const body = `
        <div class="filter-block">
          <p class="filter-label">Categoría</p>
          <div class="chip-wrap">
            <button class="chip" type="button" data-cat="" aria-pressed="${!draft.category}">Todas</button>
            ${store.categories
              .map(
                (cat) => `<button class="chip" type="button" data-cat="${cat.id}" aria-pressed="${
                  draft.category === cat.id
                }">${esc(cat.name)}</button>`,
              )
              .join("")}
          </div>
        </div>

        <div class="filter-block">
          <p class="filter-label">Color</p>
          <div class="filter-colors">
            <button class="filter-color ${!draft.color ? "is-active" : ""}" data-color="" type="button">
              <span class="filter-color__dot filter-color__dot--any">${icon("x", { size: 12 })}</span>
              <span>Cualquiera</span>
            </button>
            ${COLORS.map(
              ([id, name, hex]) => `<button class="filter-color ${draft.color === id ? "is-active" : ""}"
                data-color="${id}" type="button">
                <span class="filter-color__dot" style="--c:${hex}"></span><span>${name}</span>
              </button>`,
            ).join("")}
          </div>
        </div>

        <div class="filter-block">
          <p class="filter-label">Ordenar por</p>
          <div class="chip-wrap">
            ${SORTS.map(
              ([id, label]) =>
                `<button class="chip" type="button" data-sort="${id}" aria-pressed="${draft.sort === id}">${label}</button>`,
            ).join("")}
          </div>
        </div>

        <div class="filter-block">
          <p class="filter-label">Precio</p>
          <div class="chip-wrap">
            ${[
              ["0", "Todos"],
              ["20000", "Hasta $20.000"],
              ["300000", "Hasta $300.000"],
            ]
              .map(
                ([max, label]) =>
                  `<button class="chip" type="button" data-max="${max}" aria-pressed="${
                    draft.maxPrice === Number(max)
                  }">${label}</button>`,
              )
              .join("")}
          </div>
        </div>

        <p class="filter-hint">${icon("sparkles", { size: 14 })} Se aplican al instante, sin recargar.</p>
        <div class="row gap-2 filter-actions">
          <button class="btn btn-ghost grow" type="button" data-reset>Limpiar</button>
          <button class="btn btn-lime grow" type="button" data-apply>Ver resultados</button>
        </div>`;

      const sheet = openSheet({ title: "Filtros", body, className: "sheet--filters" });

      sheet.querySelectorAll("[data-cat]").forEach((button) =>
        button.addEventListener("click", () => {
          draft.category = button.dataset.cat;
          sheet.querySelectorAll("[data-cat]").forEach((b) => b.setAttribute("aria-pressed", "false"));
          button.setAttribute("aria-pressed", "true");
        }),
      );

      sheet.querySelectorAll("[data-color]").forEach((button) =>
        button.addEventListener("click", () => {
          draft.color = button.dataset.color;
          sheet.querySelectorAll("[data-color]").forEach((b) => b.classList.remove("is-active"));
          button.classList.add("is-active");
        }),
      );

      sheet.querySelectorAll("[data-sort]").forEach((button) =>
        button.addEventListener("click", () => {
          draft.sort = button.dataset.sort;
          sheet.querySelectorAll("[data-sort]").forEach((b) => b.setAttribute("aria-pressed", "false"));
          button.setAttribute("aria-pressed", "true");
        }),
      );

      sheet.querySelectorAll("[data-max]").forEach((button) =>
        button.addEventListener("click", () => {
          draft.maxPrice = Number(button.dataset.max);
          sheet.querySelectorAll("[data-max]").forEach((b) => b.setAttribute("aria-pressed", "false"));
          button.setAttribute("aria-pressed", "true");
        }),
      );

      sheet.querySelector("[data-reset]")?.addEventListener("click", () => {
        closeSheet();
        navigate("/catalog");
      });

      sheet.querySelector("[data-apply]")?.addEventListener("click", () => {
        const params = new URLSearchParams();
        if (draft.q) params.set("q", draft.q);
        if (draft.category) params.set("cat", draft.category);
        if (draft.color) params.set("color", draft.color);
        if (draft.sort && draft.sort !== "relevance") params.set("sort", draft.sort);
        if (draft.maxPrice) params.set("max", String(draft.maxPrice));
        closeSheet();
        navigate(`/catalog${params.toString() ? `?${params}` : ""}`);
      });
    }

    // `?panel=cats` abre el selector de categorías (tab Categorías del nav).
    if (query.get("panel") === "cats") {
      const params = new URLSearchParams(query);
      params.delete("panel");
      history.replaceState(null, "", `#/catalog${params.toString() ? `?${params}` : ""}`);

      const body = `<div class="cat-picker">${store.categories
        .map(
          (cat) => `<a class="cat-picker__item" href="#/catalog?cat=${cat.id}">
            <span class="cat-picker__icon">${icon("tag", { size: 18 })}</span>
            <span class="grow">
              <span class="cat-picker__name">${esc(cat.name)}</span>
              <span class="cat-picker__count">${cat.count} artículos</span>
            </span>
            ${icon("chevron-right", { size: 16 })}
          </a>`,
        )
        .join("")}</div>`;
      openSheet({ title: "Categorías", body });
    }
  },

  unmount() {},
};
