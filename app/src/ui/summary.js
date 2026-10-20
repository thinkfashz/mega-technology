/**
 * summary.js — piezas compartidas del flujo de compra.
 * Un solo lugar para el resumen, los pasos y el carrito vacío.
 */

import { icon } from "./icons.js";
import { money, esc } from "../core/format.js";

export function orderSummary(store, { title = "Resumen del pedido" } = {}) {
  const lines = store.cartLines;
  const first = lines[0];
  if (!first) return "";
  const extra = lines.length - 1;
  const label = `${esc(first.name)}${extra > 0 ? ` <span class="summary__more">+${extra} más</span>` : ""}`;

  return `
    <div class="summary">
      <p class="summary__title">${esc(title)}</p>
      <div class="summary__row">
        <span>${label}</span>
        <span class="m-price">${money(first.price * first.qty)}</span>
      </div>
      ${
        extra > 0
          ? `<div class="summary__row"><span>${lines.length} productos · ${store.cartCount} unidades</span><span></span></div>`
          : ""
      }
      <div class="summary__row">
        <span>Envío ${store.checkout.delivery === "express" ? "express" : "estándar"}</span>
        <span class="${store.shippingCost === 0 ? "m-lime" : "m-price"}">${
          store.shippingCost === 0 ? "Gratis" : money(store.shippingCost)
        }</span>
      </div>
      <div class="summary__total">
        <span>Total</span>
        <span class="m-price">${money(store.cartTotal)}</span>
      </div>
    </div>`;
}

export function flowSteps(current = 1) {
  const steps = ["Datos", "Pago", "Envío"];
  return `<ol class="flow-steps" aria-label="Pasos de la compra">
    ${steps
      .map(
        (step, index) => `<li class="flow-step ${index + 1 < current ? "is-done" : ""} ${
          index + 1 === current ? "is-current" : ""
        }">
          <span class="flow-step__dot">${index + 1 < current ? icon("check", { size: 10 }) : index + 1}</span>
          <span>${step}</span>
        </li>`,
      )
      .join("")}
  </ol>`;
}

export function emptyCart({ title = "Tu carrito está vacío", message = "Agregá un producto para continuar." } = {}) {
  return `<div class="empty screen-pad" style="margin-top:28px">
    <div class="empty__icon">${icon("cart", { size: 24 })}</div>
    <p class="empty__title">${esc(title)}</p>
    <p class="text-sm">${esc(message)}</p>
    <a class="btn btn-lime btn-sm" href="#/catalog">Explorar catálogo</a>
  </div>`;
}

export function paymentMeta(method = "card") {
  const map = {
    card: { icon: "card", title: "Tarjeta Crédito / Débito", sub: "•••• 4242 · Venc. 12/27" },
    apple: { icon: "apple", title: "Apple Pay", sub: "Pago rápido y seguro con Apple Pay" },
    cash: { icon: "cash", title: "Pago contra entrega", sub: "Pagas al recibir tu pedido en efectivo" },
  };
  return map[method] || map.card;
}
