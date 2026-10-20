/**
 * shipping.js — Paso 3: envío y confirmación.
 * Acá nace la orden: api.createOrder → store (local o remoto).
 */

import { icon } from "../../ui/icons.js";
import { orderSummary, flowSteps, emptyCart } from "../../ui/summary.js";
import { money, esc } from "../../core/format.js";
import { qs, qsa } from "../../core/dom.js";

const EXPRESS = 2990;

export default {
  title: "Métodos de envío",

  render({ store }) {
    if (!store.cart.length) return emptyCart({ message: "No hay productos pendientes de envío." });
    const profile = store.profile;
    const express = store.checkout.delivery === "express";

    return `
      <section class="shipping" data-enter>
        <header class="flow-head">
          <h1 class="flow-title">Métodos de envío</h1>
          <p class="flow-sub">Elige cómo quieres recibir tu pedido</p>
          ${flowSteps(3)}
        </header>

        <div class="ship-address" data-address-card>
          <span class="ship-address__icon">${icon("pin", { size: 22 })}</span>
          <div class="grow">
            <p class="ship-address__label">Dirección de envío:</p>
            <p class="ship-address__value" data-address-value>${esc(profile.address || "Sin dirección")}</p>
            <p class="ship-address__city" data-city-value>${esc(profile.city)}, ${esc(
              profile.region || "Región Metropolitana",
            )}, Chile</p>
          </div>
          <button class="ship-address__edit" type="button" data-edit-address>Editar</button>
        </div>

        <h2 class="ship-section">Opciones de envío:</h2>
        <div class="ship-options" role="radiogroup" aria-label="Opciones de envío">
          <button class="ship-option ${express ? "is-active" : ""}" type="button" role="radio"
            aria-checked="${express}" data-delivery="express">
            <span class="ship-option__icon">${icon("truck", { size: 24 })}</span>
            <span class="grow">
              <span class="ship-option__title">Envío Express</span>
              <span class="ship-option__sub">Entrega en 24–48 horas</span>
            </span>
            <span class="ship-option__price">${money(EXPRESS)}</span>
            <span class="radio-dot" aria-hidden="true"></span>
          </button>

          <button class="ship-option ${!express ? "is-active" : ""}" type="button" role="radio"
            aria-checked="${!express}" data-delivery="free">
            <span class="ship-option__icon">${icon("box", { size: 24 })}</span>
            <span class="grow">
              <span class="ship-option__title">Envío Gratis</span>
              <span class="ship-option__sub">Entrega en 3–5 días hábiles</span>
            </span>
            <span class="ship-option__price m-lime">Gratis</span>
            <span class="radio-dot" aria-hidden="true"></span>
          </button>
        </div>

        <h2 class="ship-section">Estado del envío estimado:</h2>
        <div class="track" aria-label="Seguimiento estimado">
          <div class="track__step is-current">
            <span class="track__dot">${icon("clock", { size: 14 })}</span>
            <span class="track__line" aria-hidden="true"></span>
            <div>
              <p class="track__title">Pedido confirmado</p>
              <p class="track__meta">Se activa al confirmar tu compra</p>
            </div>
          </div>
          <div class="track__step">
            <span class="track__dot">2</span>
            <span class="track__line" aria-hidden="true"></span>
            <div>
              <p class="track__title">En preparación</p>
              <p class="track__meta">Entre 24 y 48 horas hábiles</p>
            </div>
          </div>
          <div class="track__step">
            <span class="track__dot">3</span>
            <span class="track__line" aria-hidden="true"></span>
            <div>
              <p class="track__title">En camino</p>
              <p class="track__meta">${express ? "Estimado: mañana, 14:00 – 18:00" : "Estimado: en 3–5 días hábiles"}</p>
            </div>
          </div>
          <div class="track__step">
            <span class="track__dot">4</span>
            <div>
              <p class="track__title">Entregado</p>
              <p class="track__meta">Te avisamos por notificación</p>
            </div>
          </div>
        </div>

        ${orderSummary(store, { title: "Resumen" })}

        <button class="btn btn-lime btn-lg btn-block ship-cta" type="button" data-confirm-ship>
          Confirmar Envío ${icon("arrow-right", { size: 20, cls: "btn__arrow" })}
        </button>

        <p class="ship-foot">${icon("lock", {
          size: 13,
        })} Pago protegido · Recibirás el comprobante por correo y WhatsApp.</p>
      </section>`;
  },

  mount(root, ctx) {
    const { store, api, toast, openSheet, closeSheet, navigate } = ctx;
    let busy = false;

    qsa("[data-delivery]", root).forEach((button) =>
      button.addEventListener("click", () => {
        const delivery = button.dataset.delivery;
        store.setCheckout({ delivery });
        qsa("[data-delivery]", root).forEach((b) => {
          const active = b === button;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-checked", String(active));
        });
        updateSummary();
      }),
    );

    function updateSummary() {
      const summary = qs(".summary", root);
      if (summary) summary.outerHTML = orderSummary(store, { title: "Resumen" });
    }

    root.querySelector("[data-edit-address]")?.addEventListener("click", () => {
      const body = `
        <div class="field">
          <label class="field__label" for="ship-address">Dirección</label>
          <div class="field__box">
            <span class="field__icon">${icon("pin", { size: 15 })}</span>
            <input id="ship-address" value="${esc(store.profile.address)}" placeholder="Calle y número" />
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="ship-city">Ciudad</label>
          <div class="field__box">
            <span class="field__icon">${icon("building", { size: 15 })}</span>
            <input id="ship-city" value="${esc(store.profile.city)}" placeholder="Santiago" />
          </div>
        </div>
        <button class="btn btn-lime btn-block" type="button" data-save-address>Guardar dirección</button>`;

      const sheet = openSheet({ title: "Editar dirección", body, className: "sheet--compact" });
      sheet.querySelector("[data-save-address]")?.addEventListener("click", () => {
        const address = sheet.querySelector("#ship-address").value.trim();
        const city = sheet.querySelector("#ship-city").value.trim();
        if (address.length < 5 || city.length < 3) {
          toast("Completa dirección y ciudad", { type: "error" });
          return;
        }
        store.setProfile({ address, city });
        qs("[data-address-value]", root).textContent = address;
        qs("[data-city-value]", root).textContent = `${city}, ${store.profile.region || "Región Metropolitana"}, Chile`;
        closeSheet();
        toast("Dirección actualizada", { iconName: "pin" });
      });
    });

    root.querySelector("[data-confirm-ship]")?.addEventListener("click", async (event) => {
      if (busy) return;
      const button = event.currentTarget;
      busy = true;
      button.disabled = true;
      const original = button.innerHTML;
      button.innerHTML = `${icon("refresh", { size: 18 })} Confirmando…`;

      try {
        const order = await api.createOrder({
          customer: store.profile,
          payment: store.checkout.payment,
          delivery: store.checkout.delivery,
          note: store.checkout.note || "",
        });
        if (!order) throw new Error("El carrito está vacío");

        openSheet({
          title: "Pedido confirmado",
          className: "sheet--success",
          body: `
            <div class="success">
              <div class="success__icon">${icon("check", { size: 30 })}</div>
              <h3 class="success__title">¡Gracias por tu compra!</h3>
              <p class="success__sub">Pedido <strong>${order.id}</strong> · ${order.items.length} producto${
                order.items.length === 1 ? "" : "s"
              }</p>
              <div class="success__total">
                <span>Total pagado</span>
                <span class="m-price">${money(order.total)}</span>
              </div>
              <div class="success__timeline">
                <span class="success__dot is-done">${icon("check", { size: 12 })}</span>
                <span class="success__bar"></span>
                <span class="success__dot is-current">${icon("box", { size: 12 })}</span>
                <span class="success__bar"></span>
                <span class="success__dot">${icon("truck", { size: 12 })}</span>
              </div>
              <p class="success__hint">${icon("bell", {
                size: 13,
              })} Te avisaremos cuando el pedido salga a despacho.</p>
              <button class="btn btn-lime btn-block" type="button" data-go-orders>
                Ver seguimiento ${icon("arrow-right", { size: 18 })}
              </button>
              <button class="btn btn-ghost btn-block" type="button" data-continue>Seguir comprando</button>
            </div>`,
          onMount: (sheet) => {
            sheet.querySelector("[data-go-orders]")?.addEventListener("click", () => {
              closeSheet();
              navigate(`/orders?ok=${order.id}`);
            });
            sheet.querySelector("[data-continue]")?.addEventListener("click", () => {
              closeSheet();
              navigate("/home");
            });
          },
        });
      } catch (error) {
        console.error(error);
        toast(error.message || "No se pudo confirmar el pedido", { type: "error" });
        button.disabled = false;
        button.innerHTML = original;
      } finally {
        busy = false;
      }
    });
  },

  unmount() {},
};
