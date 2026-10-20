/**
 * service.js — Servicio técnico.
 * Cada servicio abre una solicitud real (api.serviceRequest) y se guarda local.
 */

import { icon } from "../../ui/icons.js";
import { money, esc } from "../../core/format.js";
import { qs } from "../../core/dom.js";

export default {
  title: "Servicio técnico",

  render({ store }) {
    const service = store.service;
    return `
      <section class="service" data-enter>
        <header class="service__head">
          <h1 class="service__title">Servicio técnico</h1>
          <p class="service__sub">${esc(service.meta.title ? "Reparaciones rápidas y garantía incluida" : "")}</p>
        </header>

        <div class="service__badge">
          ${icon("wrench", { size: 19 })}
          <span>${esc(service.meta.diagnosis)}</span>
        </div>

        <h2 class="service__section">Servicios disponibles:</h2>
        <div class="service__list">
          ${service.services
            .map(
              (item) => `<button class="service-card" type="button" data-service="${item.id}">
                <span class="service-card__icon">${icon(item.icon, { size: 26 })}</span>
                <span class="service-card__body">
                  <span class="service-card__title">${esc(item.name)}</span>
                  <span class="service-card__desc">${esc(item.description)}</span>
                </span>
                <span class="service-card__aside">
                  <span class="service-card__price">Desde ${money(item.from)}</span>
                  ${icon("chevron-right", { size: 18, cls: "service-card__arrow" })}
                </span>
              </button>`,
            )
            .join("")}
        </div>

        <h2 class="service__section">¿Por qué elegirnos?</h2>
        <div class="service__reasons">
          ${service.reasons
            .map(
              (reason) => `<div class="reason">
                <span class="reason__icon">${icon(reason.icon, { size: 24 })}</span>
                <span>${esc(reason.label)}</span>
              </div>`,
            )
            .join("")}
        </div>

        <button class="btn btn-lime btn-lg btn-block service__cta" type="button" data-request>
          Solicitar Servicio ${icon("arrow-right", { size: 20, cls: "btn__arrow" })}
        </button>

        <div class="service__foot">
          <p>${icon("clock", { size: 13 })} Horario: ${esc(service.meta.schedule)}</p>
          <a href="${service.meta.whatsappUrl}" target="_blank" rel="noopener">
            ${icon("whatsapp", { size: 15 })} WhatsApp: ${esc(service.meta.whatsapp)}
          </a>
        </div>

        <p class="service__legal">Diagnóstico sin costo · Garantía ${service.meta.warrantyDays} días en repuestos y mano de obra.</p>
      </section>`;
  },

  mount(root, ctx) {
    const { store, api, openSheet, closeSheet, toast } = ctx;
    const service = store.service;

    root.querySelectorAll("[data-service]").forEach((card) =>
      card.addEventListener("click", () => openRequest(card.dataset.service)),
    );
    qs("[data-request]", root)?.addEventListener("click", () => openRequest(service.services[0].id));

    function openRequest(preselected) {
      const body = `
        <form class="service-form" novalidate>
          <div class="field">
            <label class="field__label" for="sv-service">Servicio</label>
            <div class="field__box field__box--select">
              <span class="field__icon">${icon("wrench", { size: 15 })}</span>
              <select id="sv-service" name="service">
                ${service.services
                  .map(
                    (item) =>
                      `<option value="${item.id}" ${item.id === preselected ? "selected" : ""}>${esc(
                        item.name,
                      )} · desde ${money(item.from)}</option>`,
                  )
                  .join("")}
              </select>
              ${icon("chevron-down", { size: 16 })}
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="sv-model">Modelo</label>
            <div class="field__box field__box--select">
              <span class="field__icon">${icon("phone", { size: 15 })}</span>
              <select id="sv-model" name="model">
                ${service.models.map((model) => `<option>${esc(model)}</option>`).join("")}
              </select>
              ${icon("chevron-down", { size: 16 })}
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="sv-name">Nombre</label>
            <div class="field__box">
              <span class="field__icon">${icon("user", { size: 15 })}</span>
              <input id="sv-name" name="name" value="${esc(store.profile.name)}" placeholder="Tu nombre" />
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="sv-phone">Teléfono</label>
            <div class="field__box">
              <span class="field__icon">${icon("call", { size: 15 })}</span>
              <input id="sv-phone" name="phone" type="tel" value="${esc(store.profile.phone)}" placeholder="+56 9 1234 5678" />
            </div>
          </div>

          <div class="field">
            <label class="field__label" for="sv-issue">¿Qué le pasa a tu equipo?</label>
            <div class="field__box field__box--area">
              <span class="field__icon">${icon("edit", { size: 15 })}</span>
              <textarea id="sv-issue" name="issue" placeholder="Ej: la pantalla se rompió y el táctil no responde"></textarea>
            </div>
          </div>

          <button class="btn btn-lime btn-block" type="submit">Enviar solicitud ${icon("arrow-right", {
            size: 18,
          })}</button>
          <p class="service-form__legal">${icon("lock", {
            size: 12,
          })} Tus datos se usan solo para coordinar el servicio.</p>
        </form>`;

      const sheet = openSheet({ title: "Solicitar servicio", body });
      const form = sheet.querySelector(".service-form");

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        if (String(data.name).trim().length < 3 || String(data.phone).replace(/\D/g, "").length < 8) {
          toast("Completa nombre y teléfono", { type: "error" });
          return;
        }
        const button = form.querySelector("button[type=submit]");
        button.disabled = true;
        button.textContent = "Enviando…";
        try {
          const request = await api.serviceRequest({
            ...data,
            priceFrom: service.services.find((s) => s.id === data.service)?.from,
          });
          form.innerHTML = `<div class="success">
            <div class="success__icon">${icon("check", { size: 30 })}</div>
            <h3 class="success__title">Solicitud recibida</h3>
            <p class="success__sub">Folio <strong>${request.id}</strong> · ${esc(
              service.services.find((s) => s.id === data.service)?.name || "Servicio técnico",
            )}</p>
            <p class="success__hint">${icon("clock", {
              size: 13,
            })} Te contactamos en menos de 2 horas hábiles al ${esc(data.phone)}.</p>
            <a class="btn btn-lime btn-block" href="${service.meta.whatsappUrl}" target="_blank" rel="noopener">
              ${icon("whatsapp", { size: 18 })} Escribir por WhatsApp
            </a>
            <button class="btn btn-ghost btn-block" type="button" data-done>Cerrar</button>
          </div>`;
          form.querySelector("[data-done]")?.addEventListener("click", closeSheet);
          toast("Solicitud de servicio enviada", { iconName: "wrench" });
        } catch (error) {
          toast(error.message || "No se pudo enviar la solicitud", { type: "error" });
          button.disabled = false;
          button.textContent = "Enviar solicitud";
        }
      });
    }
  },

  unmount() {},
};
