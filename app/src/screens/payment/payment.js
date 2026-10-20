/**
 * payment.js — Paso 2: método de pago.
 * La elección se persiste en el store y viaja a la orden.
 */

import { icon } from "../../ui/icons.js";
import { orderSummary, flowSteps, emptyCart, paymentMeta } from "../../ui/summary.js";
import { money } from "../../core/format.js";
import { qsa } from "../../core/dom.js";

const METHODS = [
  ["card", "card", "Tarjeta Crédito / Débito", "•••• 4242 · Venc. 12/27"],
  ["apple", "apple", "Apple Pay", "Pago rápido y seguro con Apple Pay"],
  ["cash", "cash", "Pago contra entrega", "Pagas al recibir tu pedido en efectivo"],
];

export default {
  title: "Métodos de pago",

  render({ store }) {
    if (!store.cart.length) return emptyCart({ message: "Agregá un producto para elegir el pago." });
    const selected = store.checkout.payment;

    return `
      <section class="payment" data-enter>
        <header class="flow-head">
          <h1 class="flow-title">Métodos de pago</h1>
          <p class="flow-sub">Selecciona tu método de pago preferido</p>
          ${flowSteps(2)}
        </header>

        <div class="choice-list" role="radiogroup" aria-label="Método de pago">
          ${METHODS.map(
            ([id, ic, title, sub]) => `
              <button class="choice ${selected === id ? "is-active" : ""}" type="button"
                role="radio" aria-checked="${selected === id}" data-method="${id}">
                <span class="choice__icon">${icon(ic, { size: 22 })}</span>
                <span>
                  <span class="choice__title">${title}</span>
                  <span class="choice__sub">${sub}</span>
                </span>
                <span class="radio-dot" aria-hidden="true"></span>
              </button>`,
          ).join("")}
        </div>

        <h2 class="payment__section">Resumen del pedido:</h2>
        ${orderSummary(store, { title: "Detalle" })}

        <button class="btn btn-lime btn-lg payment__cta" type="button" data-pay>
          Comprar Ahora ${icon("arrow-right", { size: 20, cls: "btn__arrow" })}
        </button>

        <p class="payment__secure">${icon("lock", { size: 14 })} Tu pago está protegido con encriptación SSL</p>
        <p class="payment__note">${icon("shield", {
          size: 16,
        })} <span>MEGA TECHNOLOGY no almacena los datos de tu tarjeta. El cobro se procesa en la pasarela segura y la orden queda registrada a tu nombre.</span></p>
      </section>`;
  },

  mount(root, ctx) {
    const { store, navigate, toast } = ctx;

    qsa("[data-method]", root).forEach((button) =>
      button.addEventListener("click", () => {
        const method = button.dataset.method;
        store.setCheckout({ payment: method });
        qsa("[data-method]", root).forEach((b) => {
          const active = b === button;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-checked", String(active));
        });
        toast(`Pago con ${paymentMeta(method).title}`, { iconName: paymentMeta(method).icon });
      }),
    );

    root.querySelector("[data-pay]")?.addEventListener("click", () => {
      if (!store.cart.length) {
        toast("El carrito está vacío", { type: "error" });
        return;
      }
      toast(`Método listo · ${money(store.cartTotal)}`, { iconName: "check-circle" });
      navigate("/shipping");
    });
  },

  unmount() {},
};
