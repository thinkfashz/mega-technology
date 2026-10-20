/**
 * search.js — Búsqueda instantánea sobre el catálogo local.
 */

import { productCard } from "../../ui/product-card.js";
import { bindFavorites } from "../../ui/actions.js";
import { icon } from "../../ui/icons.js";
import { debounce, qs, qsa } from "../../core/dom.js";
import { esc } from "../../core/format.js";

const HISTORY_KEY = "mega.searches";

const readHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]").slice(0, 6);
  } catch {
    return [];
  }
};

const saveHistory = (term) => {
  const clean = term.trim();
  if (clean.length < 2) return;
  const list = [clean, ...readHistory().filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
};

export default {
  title: "Buscar",

  render() {
    const history = readHistory();
    return `
      <section class="search" data-enter>
        <div class="search__bar">
          <span class="search__icon">${icon("search", { size: 20 })}</span>
          <input id="search-input" class="search__input" type="search" placeholder="Buscar fundas, iPhone, audio…"
            autocomplete="off" enterkeyhint="search" aria-label="Buscar productos" />
          <button class="search__clear" type="button" data-clear-input aria-label="Limpiar búsqueda" hidden>${icon("x", {
            size: 14,
          })}</button>
        </div>

        <div class="search__suggest" data-suggest>
          ${
            history.length
              ? `<div class="search__block">
                  <div class="row-between">
                    <p class="search__label">Búsquedas recientes</p>
                    <button class="search__reset" type="button" data-clear-history>Limpiar</button>
                  </div>
                  <div class="chip-row">
                    ${history
                      .map(
                        (term) =>
                          `<button class="chip chip--ghost" type="button" data-term="${esc(term)}">${icon(
                            "clock",
                            { size: 12 },
                          )} ${esc(term)}</button>`,
                      )
                      .join("")}
                  </div>
                </div>`
              : ""
          }
          <div class="search__block">
            <p class="search__label">Explorar</p>
            <div class="search__trends">
              ${[
                ["funda-silicona", "Fundas", "case", "#b7e33b"],
                ["audifonos", "Audio", "buds", "#b7e33b"],
                ["telefonos", "iPhone", "phone", "#3a3f46"],
                ["cargadores", "Carga", "charger", "#d3a94f"],
              ]
                .map(
                  ([cat, label, ic, color]) =>
                    `<button class="trend" type="button" data-cat="${cat}" style="--tint:${color}">
                      <span class="trend__icon">${icon(ic, { size: 20 })}</span>
                      <span>${label}</span>
                    </button>`,
                )
                .join("")}
            </div>
          </div>
        </div>

        <div class="search__results" data-results hidden>
          <div class="row-between search__count-row">
            <p class="search__label" data-count>0 resultados</p>
            <a class="search__catalog-link" href="#/catalog">Ver en catálogo ${icon("chevron-right", {
              size: 13,
            })}</a>
          </div>
          <div class="product-grid" data-grid></div>
          <div class="search__empty" data-empty hidden>
            <div class="empty">
              <div class="empty__icon">${icon("search", { size: 24 })}</div>
              <p class="empty__title">Sin coincidencias</p>
              <p class="text-sm">Probá con “funda”, “iPhone” o “audio”.</p>
            </div>
          </div>
        </div>
      </section>`;
  },

  mount(root, ctx) {
    const { store, navigate } = ctx;
    bindFavorites(root, ctx);

    const input = qs("#search-input", root);
    const grid = qs("[data-grid]", root);
    const results = qs("[data-results]", root);
    const suggest = qs("[data-suggest]", root);
    const empty = qs("[data-empty]", root);
    const count = qs("[data-count]", root);
    const catalogLink = qs(".search__catalog-link", root);
    const clearButton = qs("[data-clear-input]", root);

    function paint(query) {
      const term = query.trim();
      clearButton.hidden = !term;
      if (!term) {
        results.hidden = true;
        suggest.hidden = false;
        return;
      }
      const found = store.queryProducts({ q: term });
      results.hidden = false;
      suggest.hidden = true;
      count.textContent = `${found.length} resultado${found.length === 1 ? "" : "s"} para “${term}”`;
      catalogLink.href = `#/catalog?q=${encodeURIComponent(term)}`;
      empty.hidden = found.length > 0;
      grid.hidden = found.length === 0;
      grid.innerHTML = found
        .slice(0, 8)
        .map((product) => productCard(product, { favorite: store.isFavorite(product.id), reveal: false }))
        .join("");
    }

    const onType = debounce(() => paint(input.value), 140);
    input.addEventListener("input", onType);
    input.addEventListener("search", () => paint(input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      saveHistory(input.value);
      paint(input.value);
    });

    clearButton.addEventListener("click", () => {
      input.value = "";
      paint("");
      input.focus();
    });

    root.querySelectorAll("[data-term]").forEach((button) =>
      button.addEventListener("click", () => {
        input.value = button.dataset.term;
        paint(input.value);
        input.focus();
      }),
    );

    root.querySelector("[data-clear-history]")?.addEventListener("click", (event) => {
      localStorage.removeItem(HISTORY_KEY);
      event.currentTarget.closest(".search__block")?.remove();
    });

    root.querySelectorAll("[data-cat]").forEach((button) =>
      button.addEventListener("click", () => navigate(`/catalog?cat=${button.dataset.cat}`)),
    );

    setTimeout(() => input.focus({ preventScroll: true }), 120);
  },

  unmount() {},
};
