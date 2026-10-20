/**
 * checkout.js — Paso 1: datos de compra.
 * Valida en el cliente, guarda el perfil y avanza al pago.
 */

import { icon } from "../../ui/icons.js";
import { orderSummary, flowSteps, emptyCart, paymentMeta } from "../../ui/summary.js";
import { money, esc } from "../../core/format.js";
import { qs } from "../../core/dom.js";

export default {
  title: "Formulario de compra",

  render({ store }) {
    if (!store.cart.length) return emptyCart();
    const profile = store.profile;
    const pay = paymentMeta(store.checkout.payment);

    return `
      <section class="checkout" data-enter>
        <header class="flow-head">
          <h1 class="flow-title">Formulario de compra</h1>
          <p class="flow-sub">Completa tus datos para finalizar la compra</p>
          ${flowSteps(1)}
        </header>

        <form class="checkout-form" novalidate>
          <div class="field" data-field="name">
            <label class="field__label" for="co-name">Nombre:</label>
            <div class="field__box">
              <span class="field__icon">${icon("user", { size: 15 })}</span>
              <input id="co-name" name="name" type="text" autocomplete="name"
                placeholder="Ingresa tu nombre completo" value="${esc(profile.name)}" />
            </div>
            <span class="field__error">Escribe tu nombre completo.</span>
          </div>

          <div class="field" data-field="phone">
            <label class="field__label" for="co-phone">Teléfono:</label>
            <div class="field__box">
              <span class="field__icon">${icon("call", { size: 15 })}</span>
              <input id="co-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel"
                placeholder="+56 9 1234 5678" value="${esc(profile.phone)}" />
            </div>
            <span class="field__error">Ingresa un teléfono de al menos 8 dígitos.</span>
          </div>

          <div class="field" data-field="address">
            <label class="field__label" for="co-address">Dirección:</label>
            <div class="field__box">
              <span class="field__icon">${icon("pin", { size: 15 })}</span>
              <input id="co-address" name="address" type="text" autocomplete="street-address"
                placeholder="Calle, número, depto" value="${esc(profile.address)}" />
            </div>
            <span class="field__error">Ingresa una dirección de entrega.</span>
          </div>

          <div class="field" data-field="city">
            <label class="field__label" for="co-city">Ciudad:</label>
            <div class="field__box">
              <span class="field__icon">${icon("building", { size: 15 })}</span>
              <input id="co-city" name="city" type="text" autocomplete="address-level2"
                placeholder="Santiago" value="${esc(profile.city)}" />
            </div>
            <span class="field__error">Ingresa tu ciudad.</span>
          </div>

          <div class="checkout__payment">
            <p class="field__label">Método de pago:</p>
            <button class="choice is-active" type="button" data-open-payment>
              <span class="choice__icon">${icon(pay.icon, { size: 22 })}</span>
              <span>
                <span class="choice__title" data-pay-title>${pay.title}</span>
                <span class="choice__sub" data-pay-sub>${pay.sub}</span>
              </span>
              <span class="radio-dot" aria-hidden="true"></span>
            </button>
          </div>

          ${orderSummary(store)}

          <button class="btn btn-lime btn-lg btn-block" type="submit" data-confirm>
            Confirmar Compra ${icon("arrow-right", { size: 20, cls: "btn__arrow" })}
          </button>
          <p class="checkout__terms">
            Al confirmar aceptas nuestros
            <a href="#/service">Términos y Condiciones</a> y la política de privacidad.
          </p>
        </form>
      </section>`;
  },

  mount(root, ctx) {
    const { store, navigate, openSheet, closeSheet, toast } = ctx;
    const form = qs(".checkout-form", root);
    const payIcon = root.querySelector("[data-open-payment] .choice__icon");

    root.querySelector("[data-open-payment]")?.addEventListener("click", () => {
      const body = `
        <div class="choice-list">
          ${[
            ["card", "card", "Tarjeta Crédito / Débito", "•••• 4242 · Venc. 12/27"],
            ["apple", "apple", "Apple Pay", "Pago rápido y seguro con Apple Pay"],
            ["cash", "cash", "Pago contra entrega", "Pagas al recibir tu pedido en efectivo"],
          ]
            .map(
              ([id, ic, title, sub]) => `<button class="choice ${
                store.checkout.payment === id ? "is-active" : ""
              }" type="button" data-pick="${id}">
                <span class="choice__icon">${icon(ic, { size: 22 })}</span>
                <span><span class="choice__title">${title}</span><span class="choice__sub">${sub}</span></span>
                <span class="radio-dot" aria-hidden="true"></span>
              </button>`,
            )
            .join("")}
        </div>
        <p class="filter-hint">${icon("lock", {
          size: 14,
        })} El pago se procesa con encriptación SSL de 256 bits.</p>`;

      const sheet = openSheet({ title: "Método de pago", body, className: "sheet--compact" });
      sheet.querySelectorAll("[data-pick]").forEach((button) =>
        button.addEventListener("click", () => {
          const method = button.dataset.pick;
          store.setCheckout({ payment: method });
          const meta = paymentMeta(method);
          root.querySelector("[data-pay-title]").textContent = meta.title;
          root.querySelector("[data-pay-sub]").textContent = meta.sub;
          payIcon.innerHTML = icon(meta.icon, { size: 22 });
          closeSheet();
          toast("Método de pago actualizado", { iconName: "wallet" });
        }),
      );
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const rules = {
        name: (v) => v.trim().length >= 3,
        phone: (v) => v.replace(/\D/g, "").length >= 8,
        address: (v) => v.trim().length >= 5,
        city: (v) => v.trim().length >= 3,
      };

      let firstInvalid = null;
      Object.entries(rules).forEach(([key, valid]) => {
        const field = root.querySelector(`[data-field="${key}"]`);
        const ok = valid(String(data[key] || ""));
        field?.classList.toggle("is-invalid", !ok);
        if (!ok && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.querySelector("input")?.focus();
        toast("Revisa los campos marcados", { type: "error" });
        return;
      }

      store.setProfile({
        name: String(data.name).trim(),
        phone: String(data.phone).trim(),
        address: String(data.address).trim(),
        city: String(data.city).trim(),
      });
      toast(`Datos guardados · ${money(store.cartTotal)}`, { iconName: "check-circle" });
      navigate("/payment");
    });

    // Limpia el error al escribir.
    form.addEventListener("input", (event) => {
      const field = event.target.closest(".field");
      field?.classList.remove("is-invalid");
    });
  },

  unmount() {},
};
