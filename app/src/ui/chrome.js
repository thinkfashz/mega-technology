/**
 * chrome.js — barra superior, bottom nav, sheets y toasts.
 * Es el único módulo que toca el shell de la app.
 */

import { icon, brandMark } from "./icons.js";
import { qs } from "../core/dom.js";
import { esc } from "../core/format.js";

const TABS = [
  { id: "home", label: "Inicio", href: "#/home", icon: "home" },
  { id: "catalog", label: "Tienda", href: "#/catalog", icon: "store" },
  { id: "categories", label: "Categorías", href: "#/catalog?panel=cats", icon: "grid" },
  { id: "favorites", label: "Favoritos", href: "#/favorites", icon: "heart" },
  { id: "profile", label: "Perfil", href: "#/profile", icon: "user" },
];

let ctx = null;
let activeTab = "home";
let showBack = false;
let count = 0;

const headerEl = () => qs("#app-header");
const navEl = () => qs("#app-nav");
const overlayEl = () => qs("#overlay-root");
const toastEl = () => qs("#toast-root");

/* ---------- Header ---------- */

function renderHeader() {
  const el = headerEl();
  if (!el) return;
  el.innerHTML = `
    <div class="app-bar">
      ${
        showBack
          ? `<button class="app-bar__icon" data-chrome="back" aria-label="Volver">${icon("arrow-left")}</button>`
          : `<button class="app-bar__icon" data-chrome="menu" aria-label="Abrir menú">${icon("menu")}</button>`
      }
      <a class="brand" href="#/home" aria-label="MEGA TECHNOLOGY, ir al inicio">
        <span class="brand__lockup">
          <span class="brand__mark">${brandMark(26)}</span>
          <span class="brand__name">MEGA TECHNOLOGY</span>
        </span>
        <span class="brand__sub">Versión 4 · Phone Shop</span>
      </a>
      <div class="app-bar__actions">
        <button class="app-bar__icon" data-chrome="search" aria-label="Buscar productos">${icon("search")}</button>
        <button class="app-bar__icon cart-button" data-chrome="cart" aria-label="Ver carrito">
          ${icon("cart")}
          <span class="cart-count" data-cart-count ${count ? "" : "hidden"}>${count}</span>
        </button>
      </div>
    </div>`;
}

/* ---------- Bottom nav ---------- */

function renderNav() {
  const el = navEl();
  if (!el) return;
  el.innerHTML = `<div class="bottom-nav">${TABS.map(
    (tab) => `
      <a class="bottom-nav__item ${tab.id === activeTab ? "is-active" : ""}"
         data-tab="${tab.id}" href="${tab.href}"
         ${tab.id === activeTab ? 'aria-current="page"' : ""}>
        ${icon(tab.icon)}
        <span>${tab.label}</span>
      </a>`,
  ).join("")}</div>`;
}

export function mountChrome(context) {
  ctx = context;
  renderHeader();
  renderNav();

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-chrome]");
    if (!trigger) return;
    const action = trigger.dataset.chrome;
    if (action === "back") {
      if (history.length > 1) history.back();
      else ctx.navigate("/home");
    }
    if (action === "search") ctx.navigate("/search");
    if (action === "cart") ctx.navigate("/cart");
    if (action === "menu") openMenu();
  });
}

export function setChrome({ tab = null, back = false } = {}) {
  const tabChanged = tab !== activeTab;
  const backChanged = back !== showBack;
  activeTab = tab ?? activeTab;
  showBack = back;
  if (backChanged) renderHeader();
  if (tabChanged) renderNav();
}

export function updateCartBadge(value) {
  count = Number(value) || 0;
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = count;
    node.hidden = count === 0;
  });
}

/* ---------- Sheets ---------- */

let lastFocus = null;
let closeTimer = null;

export function openSheet({ title = "", body = "", className = "", onMount = null, footer = "" } = {}) {
  closeSheet(true);
  const root = overlayEl();
  if (!root) return null;
  lastFocus = document.activeElement;
  root.style.pointerEvents = "auto";
  root.innerHTML = `
    <div class="sheet-layer">
      <div class="sheet-backdrop" data-sheet-close></div>
      <section class="sheet ${className}" role="dialog" aria-modal="true" aria-label="${esc(title || "Panel")}">
        <div class="sheet__grab" aria-hidden="true"></div>
        <header class="sheet__head">
          <h2 class="sheet__title">${esc(title)}</h2>
          <button class="app-bar__icon" data-sheet-close aria-label="Cerrar panel">${icon("x")}</button>
        </header>
        <div class="sheet__body">${body}</div>
        ${footer ? `<div class="sheet__foot">${footer}</div>` : ""}
      </section>
    </div>`;

  root.querySelectorAll("[data-sheet-close]").forEach((node) =>
    node.addEventListener("click", () => closeSheet()),
  );
  onMount?.(root.querySelector(".sheet"), { close: closeSheet });

  requestAnimationFrame(() => {
    const focusable = root.querySelector(".sheet button, .sheet input, .sheet a");
    focusable?.focus({ preventScroll: true });
  });

  return root.querySelector(".sheet");
}

export function closeSheet(immediate = false) {
  const root = overlayEl();
  if (!root || !root.firstElementChild) return;
  const layer = root.firstElementChild;
  const finish = () => {
    root.innerHTML = "";
    root.style.pointerEvents = "none";
    if (lastFocus?.focus) lastFocus.focus({ preventScroll: true });
  };
  if (immediate) return finish();
  layer.querySelector(".sheet")?.classList.add("is-closing");
  layer.querySelector(".sheet-backdrop")?.classList.add("is-closing");
  clearTimeout(closeTimer);
  closeTimer = setTimeout(finish, 230);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSheet();
});

/* ---------- Menú lateral ---------- */

export function openMenu() {
  const initials = (ctx?.store?.profile?.name || "M")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const links = [
    ["store", "Tienda", "#/catalog"],
    ["heart", "Favoritos", "#/favorites"],
    ["receipt", "Mis pedidos", "#/orders"],
    ["wrench", "Servicio técnico", "#/service"],
    ["chart", "Panel administrador", "#/admin"],
    ["headset", "Ayuda y contacto", "#/service"],
  ];

  const body = `
    <div class="menu-user">
      <div class="menu-user__avatar">${esc(initials)}</div>
      <div class="grow">
        <p class="menu-user__name">${esc(ctx?.store?.profile?.name || "Invitado MEGA")}</p>
        <p class="menu-user__meta">${esc(ctx?.store?.profile?.phone || "Sesión local · versión 4")}</p>
      </div>
      <span class="badge badge--gold">PRO</span>
    </div>
    <nav class="menu-links">
      ${links
        .map(
          ([ic, label, href]) => `<a class="menu-link" href="${href}" data-menu-link>
            <span class="menu-link__icon">${icon(ic)}</span>
            <span class="grow">${label}</span>
            ${icon("chevron-right", { size: 16 })}
          </a>`,
        )
        .join("")}
    </nav>
    <div class="menu-foot">
      <button class="btn btn-ghost btn-sm btn-block" data-menu-reset>${icon("refresh", {
        size: 16,
      })} Reiniciar demo local</button>
      <p class="menu-copy">MEGA TECHNOLOGY · V4 · Hecho en Chile</p>
    </div>`;

  const sheet = openSheet({ title: "Menú", body, className: "sheet--menu" });

  sheet?.querySelectorAll("[data-menu-link]").forEach((a) =>
    a.addEventListener("click", () => closeSheet()),
  );
  sheet?.querySelector("[data-menu-reset]")?.addEventListener("click", () => {
    closeSheet();
    ctx?.store?.reset();
  });
}

/* ---------- Toast ---------- */

export function toast(message, { type = "ok", iconName = null, duration = 2600 } = {}) {
  const root = toastEl();
  if (!root) return;
  const node = document.createElement("div");
  node.className = `toast ${type === "error" ? "toast--error" : ""}`;
  node.innerHTML = `${icon(iconName || (type === "error" ? "x" : "check-circle"))}<span>${esc(message)}</span>`;
  root.appendChild(node);
  setTimeout(() => {
    node.classList.add("is-out");
    setTimeout(() => node.remove(), 260);
  }, duration);
}

/* ---------- Confirmación ---------- */

export function ask({ title = "¿Confirmar?", message = "", confirmText = "Confirmar", cancelText = "Cancelar", tone = "lime" }) {
  return new Promise((resolve) => {
    const body = `
      <p class="text-sm m-muted" style="margin:0 0 16px">${esc(message)}</p>
      <div class="row gap-2">
        <button class="btn btn-ghost grow" data-ask="no">${esc(cancelText)}</button>
        <button class="btn ${tone === "danger" ? "btn-outline" : "btn-lime"} grow" data-ask="yes">${esc(confirmText)}</button>
      </div>`;
    const sheet = openSheet({ title, body, className: "sheet--compact" });
    sheet?.querySelectorAll("[data-ask]").forEach((button) =>
      button.addEventListener("click", () => {
        const yes = button.dataset.ask === "yes";
        closeSheet();
        resolve(yes);
      }),
    );
    sheet?.querySelector("[data-sheet-close]")?.addEventListener("click", () => resolve(false));
  });
}

/* ---------- Atajos ---------- */

export const chrome = {
  set: setChrome,
  cart: updateCartBadge,
  sheet: openSheet,
  close: closeSheet,
  toast,
  ask,
  menu: openMenu,
};
