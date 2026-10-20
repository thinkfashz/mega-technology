/**
 * profile.js — Perfil local (sin cuenta): datos, pedidos, preferencias y admin.
 */

import { icon } from "../../ui/icons.js";
import { money, esc } from "../../core/format.js";
import { qs } from "../../core/dom.js";

function initials(name = "MEGA") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "M"
  );
}

export default {
  title: "Perfil",

  render({ store, api }) {
    const profile = store.profile;
    const orders = store.orders;
    const spent = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
    const points = Math.round(spent / 1000);

    const row = (href, iconName, label, extra = "") => `
      <a class="profile-row" href="${href}">
        <span class="profile-row__icon">${icon(iconName, { size: 18 })}</span>
        <span class="grow">${label}</span>
        ${extra}
        ${icon("chevron-right", { size: 16, cls: "profile-row__arrow" })}
      </a>`;

    const toggle = (key, label, sub, active) => `
      <div class="profile-row profile-row--static">
        <span class="profile-row__icon">${icon(key, { size: 18 })}</span>
        <span class="grow">
          <span class="profile-row__label">${label}</span>
          <span class="profile-row__sub">${sub}</span>
        </span>
        <button class="switch" type="button" role="switch" aria-checked="${active}" data-toggle="${key}"
          aria-label="${label}"><span class="switch__dot"></span></button>
      </div>`;

    return `
      <section class="profile" data-enter>
        <header class="profile__head">
          <div class="profile__avatar">${esc(initials(profile.name))}</div>
          <div class="grow">
            <h1 class="profile__name">${esc(profile.name || "Invitado MEGA")}</h1>
            <p class="profile__meta">${esc(profile.phone || "Completá tu perfil para comprar más rápido")}</p>
            <span class="badge badge--gold profile__level">MEGA PRO · ${points} pts</span>
          </div>
          <button class="profile__edit" type="button" data-edit-profile aria-label="Editar perfil">
            ${icon("edit", { size: 16 })}
          </button>
        </header>

        <div class="profile__stats">
          <a class="profile-stat" href="#/orders"><strong>${orders.length}</strong><span>Pedidos</span></a>
          <a class="profile-stat" href="#/favorites"><strong>${store.favorites.length}</strong><span>Favoritos</span></a>
          <div class="profile-stat"><strong>${money(spent)}</strong><span>Comprado</span></div>
        </div>

        <div class="profile__group">
          <p class="profile__group-title">Compras</p>
          ${row("#/orders", "receipt", "Mis pedidos", `<span class="profile-row__badge">${orders.length}</span>`)}
          ${row("#/favorites", "heart", "Favoritos", `<span class="profile-row__badge">${store.favorites.length}</span>`)}
          <button class="profile-row" type="button" data-edit-address>
            <span class="profile-row__icon">${icon("pin", { size: 18 })}</span>
            <span class="grow">
              <span class="profile-row__label">Dirección de entrega</span>
              <span class="profile-row__sub">${esc(profile.address || "Sin dirección")}, ${esc(profile.city || "")}</span>
            </span>
            ${icon("chevron-right", { size: 16, cls: "profile-row__arrow" })}
          </button>
        </div>

        <div class="profile__group">
          <p class="profile__group-title">Servicios</p>
          ${row("#/service", "wrench", "Servicio técnico", `<span class="badge badge--soft">24–48 h</span>`)}
          ${row("#/service", "headset", "Ayuda y contacto", "")}
          <a class="profile-row" href="${store.service.meta.whatsappUrl}" target="_blank" rel="noopener">
            <span class="profile-row__icon">${icon("whatsapp", { size: 18 })}</span>
            <span class="grow">WhatsApp MEGA</span>
            ${icon("chevron-right", { size: 16, cls: "profile-row__arrow" })}
          </a>
        </div>

        <div class="profile__group">
          <p class="profile__group-title">Administración</p>
          ${row("#/admin", "chart", "Panel administrador", `<span class="badge badge--lime">LIVE</span>`)}
        </div>

        <div class="profile__group">
          <p class="profile__group-title">Preferencias</p>
          ${toggle("bell", "Notificaciones", "Avisos de pedidos y ofertas", store.settings.notifications)}
          ${toggle("lock", "Biometría", "Desbloqueo con huella", store.settings.biometrics)}
          ${toggle("sparkles", "Novedades", "Lanzamientos y descuentos", store.settings.newsletter)}
        </div>

        <div class="profile__group">
          <p class="profile__group-title">Datos y sesión</p>
          <button class="profile-row" type="button" data-export>
            <span class="profile-row__icon">${icon("download", { size: 18 })}</span>
            <span class="grow">Exportar mis datos</span>
            ${icon("chevron-right", { size: 16, cls: "profile-row__arrow" })}
          </button>
          <button class="profile-row profile-row--danger" type="button" data-reset>
            <span class="profile-row__icon">${icon("refresh", { size: 18 })}</span>
            <span class="grow">Reiniciar demo local</span>
            ${icon("chevron-right", { size: 16, cls: "profile-row__arrow" })}
          </button>
        </div>

        <p class="profile__mode">${icon("eye", { size: 12 })} Modo de datos: <strong>${api.mode}</strong> · v4.0 · Santiago, Chile</p>
      </section>`;
  },

  mount(root, ctx) {
    const { store, toast, openSheet, closeSheet, ask } = ctx;

    // Toggles
    root.querySelectorAll("[data-toggle]").forEach((button) =>
      button.addEventListener("click", () => {
        const key = button.dataset.toggle;
        const map = { bell: "notifications", lock: "biometrics", sparkles: "newsletter" };
        const setting = map[key];
        const value = !store.settings[setting];
        store.setSettings({ [setting]: value });
        button.setAttribute("aria-checked", String(value));
        toast(`${setting === "notifications" ? "Notificaciones" : setting === "biometrics" ? "Biometría" : "Novedades"} ${
          value ? "activadas" : "desactivadas"
        }`, { iconName: key });
      }),
    );

    const openEditor = () => {
      const profile = store.profile;
      const body = `
        <div class="field">
          <label class="field__label" for="pf-name">Nombre completo</label>
          <div class="field__box"><span class="field__icon">${icon("user", { size: 15 })}</span>
            <input id="pf-name" value="${esc(profile.name)}" placeholder="Tu nombre" /></div>
        </div>
        <div class="field">
          <label class="field__label" for="pf-phone">Teléfono</label>
          <div class="field__box"><span class="field__icon">${icon("call", { size: 15 })}</span>
            <input id="pf-phone" type="tel" value="${esc(profile.phone)}" placeholder="+56 9 1234 5678" /></div>
        </div>
        <div class="field">
          <label class="field__label" for="pf-email">Correo</label>
          <div class="field__box"><span class="field__icon">${icon("receipt", { size: 15 })}</span>
            <input id="pf-email" type="email" value="${esc(profile.email || "")}" placeholder="tu@correo.cl" /></div>
        </div>
        <div class="field">
          <label class="field__label" for="pf-address">Dirección</label>
          <div class="field__box"><span class="field__icon">${icon("pin", { size: 15 })}</span>
            <input id="pf-address" value="${esc(profile.address)}" placeholder="Calle y número" /></div>
        </div>
        <div class="field">
          <label class="field__label" for="pf-city">Ciudad</label>
          <div class="field__box"><span class="field__icon">${icon("building", { size: 15 })}</span>
            <input id="pf-city" value="${esc(profile.city)}" placeholder="Santiago" /></div>
        </div>
        <button class="btn btn-lime btn-block" type="button" data-save-profile>Guardar cambios</button>`;

      const sheet = openSheet({ title: "Editar perfil", body });
      sheet.querySelector("[data-save-profile]").addEventListener("click", () => {
        const data = {
          name: sheet.querySelector("#pf-name").value.trim(),
          phone: sheet.querySelector("#pf-phone").value.trim(),
          email: sheet.querySelector("#pf-email").value.trim(),
          address: sheet.querySelector("#pf-address").value.trim(),
          city: sheet.querySelector("#pf-city").value.trim(),
        };
        if (!data.name || !data.phone) {
          toast("Nombre y teléfono son obligatorios", { type: "error" });
          return;
        }
        store.setProfile(data);
        closeSheet();
        toast("Perfil actualizado", { iconName: "check-circle" });
        ctx.navigate("/profile", { replace: true });
      });
    };

    root.querySelector("[data-edit-profile]")?.addEventListener("click", openEditor);

    root.querySelector("[data-edit-address]")?.addEventListener("click", () => {
      const body = `
        <div class="field">
          <label class="field__label" for="ad-address">Dirección</label>
          <div class="field__box"><span class="field__icon">${icon("pin", { size: 15 })}</span>
            <input id="ad-address" value="${esc(store.profile.address)}" /></div>
        </div>
        <div class="field">
          <label class="field__label" for="ad-city">Ciudad</label>
          <div class="field__box"><span class="field__icon">${icon("building", { size: 15 })}</span>
            <input id="ad-city" value="${esc(store.profile.city)}" /></div>
        </div>
        <button class="btn btn-lime btn-block" type="button" data-save-address>Guardar dirección</button>`;
      const sheet = openSheet({ title: "Dirección de entrega", body });
      sheet.querySelector("[data-save-address]").addEventListener("click", () => {
        const address = sheet.querySelector("#ad-address").value.trim();
        const city = sheet.querySelector("#ad-city").value.trim();
        if (address.length < 5 || city.length < 3) {
          toast("Completa dirección y ciudad", { type: "error" });
          return;
        }
        store.setProfile({ address, city });
        closeSheet();
        toast("Dirección actualizada", { iconName: "pin" });
        ctx.navigate("/profile", { replace: true });
      });
    });

    root.querySelector("[data-export]")?.addEventListener("click", () => {
      const payload = {
        exportedAt: new Date().toISOString(),
        profile: store.profile,
        orders: store.orders,
        favorites: store.favorites,
        cart: store.cart,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mega-technology-datos-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 800);
      toast("Datos exportados en JSON", { iconName: "download" });
    });

    root.querySelector("[data-reset]")?.addEventListener("click", async () => {
      const yes = await ask({
        title: "Reiniciar demo",
        message: "Se borran carrito, favoritos, pedidos y cambios del panel en este dispositivo.",
        confirmText: "Reiniciar",
        tone: "danger",
      });
      if (yes) store.reset();
    });
  },

  unmount() {},
};
