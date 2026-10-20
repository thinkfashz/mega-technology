/**
 * main.js — arranque de MEGA TECHNOLOGY.
 * Orden: datos → store → chrome → router → motion.
 */

import { loadStore } from "./core/store.js";
import { createApi } from "./core/api.js";
import { createRouter } from "./core/router.js";
import { qs } from "./core/dom.js";
import {
  mountChrome,
  setChrome,
  updateCartBadge,
  toast,
  openSheet,
  ask,
  closeSheet,
} from "./ui/chrome.js";
import { setupMotion, begin, cleanup, pageIn, reveal, tiltCards } from "./ui/motion.js";

document.documentElement.classList.add("js");

const view = qs("#view");

const routes = [
  { path: "/home", load: () => import("./screens/home/home.js"), tab: "home", back: false },
  {
    path: "/catalog",
    load: () => import("./screens/catalog/catalog.js"),
    tab: (parsed) => (parsed.query.get("panel") === "cats" ? "categories" : "catalog"),
    back: false,
  },
  { path: "/product", load: () => import("./screens/product/product.js"), tab: "catalog", back: true },
  { path: "/checkout", load: () => import("./screens/checkout/checkout.js"), tab: null, back: true },
  { path: "/payment", load: () => import("./screens/payment/payment.js"), tab: null, back: true },
  { path: "/shipping", load: () => import("./screens/shipping/shipping.js"), tab: null, back: true },
  { path: "/service", load: () => import("./screens/service/service.js"), tab: null, back: true },
  { path: "/cart", load: () => import("./screens/cart/cart.js"), tab: null, back: true },
  { path: "/favorites", load: () => import("./screens/favorites/favorites.js"), tab: "favorites", back: false },
  { path: "/profile", load: () => import("./screens/profile/profile.js"), tab: "profile", back: false },
  { path: "/search", load: () => import("./screens/search/search.js"), tab: null, back: true },
  { path: "/orders", load: () => import("./screens/orders/orders.js"), tab: "profile", back: true },
  { path: "/admin", load: () => import("./screens/admin/admin.js"), tab: null, back: true },
];

async function boot() {
  view.innerHTML = `
    <div class="screen-pad" style="padding-top:22px">
      <div class="skeleton skeleton--hero"></div>
      <div class="row gap-2 mt-4">${"<div class='skeleton skeleton--chip'></div>".repeat(3)}</div>
      <div class="grid-2 mt-4">${"<div class='skeleton skeleton--card'></div>".repeat(4)}</div>
    </div>`;

  let store;
  try {
    store = await loadStore();
  } catch (error) {
    console.error(error);
    view.innerHTML = `<div class="screen-pad" style="padding-top:32px">
      <div class="empty">
        <div class="empty__icon">!</div>
        <p class="empty__title">No se pudo cargar el catálogo</p>
        <p class="text-sm">Abrí la app con <code>bash serve.sh</code> (necesita HTTP, no file://).</p>
      </div></div>`;
    return;
  }

  const api = createApi(store);
  let router;

  const navigate = (to, options) => router?.navigate(to, options);

  mountChrome({ navigate, store });
  setupMotion();

  router = createRouter({
    routes,
    view,
    buildContext: (parsed) => ({
      ...parsed,
      store,
      api,
      navigate,
      toast,
      openSheet,
      ask,
      closeSheet,
    }),
    onBefore: (route, screen, parsed) => {
      cleanup();
      closeSheet(true);
      begin(view);
      const tab = typeof route.tab === "function" ? route.tab(parsed) : route.tab;
      setChrome({ tab, back: Boolean(route.back) });
    },
    onAfter: () => {
      pageIn(view);
      reveal(view);
      tiltCards(view);
      window.ScrollTrigger?.refresh?.();
    },
  });

  updateCartBadge(store.cartCount);
  store.subscribe(() => updateCartBadge(store.cartCount));

  // Atajos de teclado para pruebas y accesibilidad.
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !/input|textarea/i.test(document.activeElement?.tagName || "")) {
      event.preventDefault();
      navigate("/search");
    }
  });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http") && location.search.includes("sw=1")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

boot();
