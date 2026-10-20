/**
 * actions.js — acciones de UI compartidas por varias pantallas.
 * Centraliza favoritos, carrito y compartir para no duplicar lógica.
 */

import { on } from "../core/dom.js";
import { icon } from "./icons.js";
import { money } from "../core/format.js";

/** Botones [data-fav] → toggle + feedback visual inmediato. */
export function bindFavorites(root, { store, toast }) {
  on(root, "click", "[data-fav]", (event, button) => {
    event.preventDefault();
    event.stopPropagation();
    const id = button.dataset.fav;
    const active = store.toggleFavorite(id);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", `${active ? "Quitar de" : "Agregar a"} favoritos`);
    button.innerHTML = icon(active ? "heart-fill" : "heart", { size: 18 });
    if (active) {
      button.classList.add("is-pop");
      setTimeout(() => button.classList.remove("is-pop"), 320);
    }
    toast(active ? "Guardado en favoritos" : "Quitado de favoritos", {
      iconName: active ? "heart-fill" : "heart",
    });
  });
}

/** Botones [data-add] → agrega al carrito el color activo de la pantalla. */
export function bindAddToCart(root, { store, toast, getColor = () => null, onAdded = null }) {
  on(root, "click", "[data-add]", (event, button) => {
    event.preventDefault();
    const id = button.dataset.add;
    const color = button.dataset.color || getColor(id);
    store.addToCart(id, color, 1);
    const product = store.product(id);
    toast(`${product?.shortName || "Producto"} agregado · ${money(product?.price || 0)}`, {
      iconName: "cart",
    });
    if (navigator.vibrate) navigator.vibrate(12);
    onAdded?.(id);
  });
}

/** Compartir con Web Share API y fallback a portapapeles. */
export async function share(payload, toast) {
  const url = location.href;
  try {
    if (navigator.share) {
      await navigator.share({ url, ...payload });
      return;
    }
    await navigator.clipboard.writeText(`${payload.title}\n${url}`);
    toast("Enlace copiado al portapapeles", { iconName: "copy" });
  } catch {
    toast("No se pudo compartir en este navegador", { type: "error" });
  }
}
