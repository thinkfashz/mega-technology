/**
 * store.js — estado de la app (local-first).
 *
 * Reglas:
 *  1. Toda mutación pasa por una acción y termina en commit().
 *  2. commit() persiste en localStorage y notifica a los suscriptores.
 *  3. Las pantallas leen del store; nunca escriben estado suelto.
 *  4. El store es la caché; core/api.js es el transporte (mock o HTTP).
 */

import { uid } from "./format.js";

const KEY = "mega.v4";
const EXPRESS_COST = 2990;

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

function writeStorage(payload) {
  try {
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("[mega] no se pudo persistir:", error);
  }
}

/** Órdenes de ejemplo, relativas a hoy, para que el panel tenga datos vivos. */
function seedOrders(products) {
  const people = [
    ["Camila Rojas", "+56 9 8842 1177", "Av. Providencia 1234", "Providencia"],
    ["Diego Fuentes", "+56 9 7712 0044", "511 Av Brasil", "Santiago"],
    ["Valentina Soto", "+56 9 6621 8890", "Los Leones 480", "Providencia"],
    ["Matías Herrera", "+56 9 5533 2211", "Av. Matta 890", "Santiago"],
    ["Josefa Díaz", "+56 9 9988 7766", "Irarrázaval 2100", "Ñuñoa"],
    ["Benjamín Silva", "+56 9 4455 6677", "Gran Avenida 77", "La Cisterna"],
    ["Antonia Vega", "+56 9 3322 1100", "Barcelona 1990", "Providencia"],
  ];
  const statuses = ["pending", "paid", "shipped", "delivered", "delivered", "delivered", "cancelled"];
  const pick = (i) => products[i % products.length];
  const orders = [];

  for (let i = 0; i < 18; i += 1) {
    const person = people[i % people.length];
    const first = pick(i * 3);
    const second = i % 3 === 0 ? pick(i * 3 + 5) : null;
    const items = [first, second]
      .filter(Boolean)
      .map((product, index) => ({
        productId: product.id,
        name: product.name,
        price: product.price,
        qty: index === 0 ? 1 + (i % 2) : 1,
        colorId: product.colors?.[0]?.id ?? "default",
        colorName: product.colors?.[0]?.name ?? "Estándar",
        art: product.art,
      }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = i % 4 === 0 ? EXPRESS_COST : 0;
    const status = i === 3 ? "paid" : statuses[i % statuses.length];
    const createdAt = new Date(Date.now() - i * 8.5 * 3600 * 1000).toISOString();

    orders.push({
      id: `MT-${1042 - i}`,
      createdAt,
      status,
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      customer: { name: person[0], phone: person[1], address: person[2], city: person[3] },
      payment: i % 5 === 0 ? "cash" : i % 3 === 0 ? "apple" : "card",
      delivery: shipping ? "express" : "free",
      timeline: buildTimeline(status),
    });
  }
  return orders;
}

export function buildTimeline(status = "pending") {
  const base = [
    { key: "confirmed", title: "Pedido confirmado", done: true, meta: "Hoy, 09:41 · Pedido recibido" },
    { key: "preparing", title: "En preparación", done: false, meta: "Hoy, 10:15 · Preparando tu pedido" },
    { key: "onway", title: "En camino", done: false, meta: "Est. mañana, 14:00 – 18:00" },
    { key: "delivered", title: "Entregado", done: false, meta: "Est. 25 sept" },
  ];
  const index = { pending: 1, paid: 2, shipped: 3, delivered: 4, cancelled: 1 }[status] ?? 1;
  return base.map((step, i) => ({
    ...step,
    done: i < index,
    current: i === index - 1 && status !== "delivered" && status !== "cancelled",
  }));
}

export function createStore(seed) {
  const saved = readStorage();
  const products = saved?.products?.length ? saved.products : seed.products;
  const service = seed.service;
  const categories = seed.categories;

  const state = {
    products,
    categories,
    service,
    cart: saved?.cart ?? [
      { productId: "p1", colorId: "lime", qty: 2 },
      { productId: "p6", colorId: "lime", qty: 1 },
    ],
    favorites: saved?.favorites ?? ["p1", "p7"],
    orders: saved?.orders ?? seedOrders(products),
    profile: saved?.profile ?? {
      name: "",
      phone: "",
      email: "",
      address: "511 Av Brasil",
      city: "Santiago",
      region: "Región Metropolitana",
    },
    checkout: saved?.checkout ?? {
      payment: "card",
      delivery: "express",
      cardLast4: "4242",
      cardExp: "12/27",
      note: "",
    },
    settings: saved?.settings ?? {
      notifications: true,
      biometrics: true,
      newsletter: false,
      orderToAdmin: true,
    },
    lastOrderId: saved?.lastOrderId ?? null,
  };

  const listeners = new Set();

  function snapshot() {
    return {
      products: state.products,
      cart: state.cart,
      favorites: state.favorites,
      orders: state.orders,
      profile: state.profile,
      checkout: state.checkout,
      settings: state.settings,
      lastOrderId: state.lastOrderId,
    };
  }

  function commit() {
    writeStorage(snapshot());
    listeners.forEach((fn) => fn(store));
  }

  const store = {
    /* ---------- Lecturas ---------- */
    get products() {
      return state.products;
    },
    get categories() {
      return state.categories;
    },
    get service() {
      return state.service;
    },
    get cart() {
      return state.cart;
    },
    get favorites() {
      return state.favorites;
    },
    get orders() {
      return [...state.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    get profile() {
      return state.profile;
    },
    get checkout() {
      return state.checkout;
    },
    get settings() {
      return state.settings;
    },
    get lastOrderId() {
      return state.lastOrderId;
    },

    get cartCount() {
      return state.cart.reduce((sum, line) => sum + line.qty, 0);
    },
    get cartSubtotal() {
      return store.cartLines.reduce((sum, line) => sum + line.price * line.qty, 0);
    },
    get shippingCost() {
      return state.cart.length === 0 ? 0 : state.checkout.delivery === "express" ? EXPRESS_COST : 0;
    },
    get cartTotal() {
      return store.cartSubtotal + store.shippingCost;
    },

    /** Líneas con producto y color resueltos. */
    get cartLines() {
      return state.cart
        .map((line) => {
          const product = store.product(line.productId);
          if (!product) return null;
          const color = product.colors?.find((c) => c.id === line.colorId) ?? product.colors?.[0];
          return {
            ...line,
            product,
            color,
            price: product.price,
            name: product.name,
            art: { ...product.art, color: color?.hex ?? product.art.color },
          };
        })
        .filter(Boolean);
    },
    get favoriteProducts() {
      return state.favorites.map((id) => store.product(id)).filter(Boolean);
    },
    get lowStock() {
      return state.products.filter((p) => p.stock <= 5);
    },

    product(id) {
      return state.products.find((p) => p.id === id || p.slug === id);
    },
    category(id) {
      return state.categories.find((c) => c.id === id);
    },
    order(id) {
      return state.orders.find((o) => o.id === id);
    },
    isFavorite(id) {
      return state.favorites.includes(id);
    },

    /** Productos filtrados: búsqueda, categoría, color, orden y rango. */
    queryProducts({ q = "", category = "", color = "", sort = "relevance", maxPrice = 0, onlyFav = false } = {}) {
      const text = q.trim().toLowerCase();
      let list = state.products.filter((p) => {
        if (category && p.category !== category) return false;
        if (color && !(p.colors || []).some((c) => c.id === color)) return false;
        if (maxPrice && p.price > maxPrice) return false;
        if (onlyFav && !state.favorites.includes(p.id)) return false;
        if (!text) return true;
        const haystack = [p.name, p.shortName, p.category, ...(p.tags || [])].join(" ").toLowerCase();
        return haystack.includes(text);
      });
      const sorters = {
        relevance: (a, b) => b.sold - a.sold,
        priceAsc: (a, b) => a.price - b.price,
        priceDesc: (a, b) => b.price - a.price,
        rating: (a, b) => b.rating - a.rating,
        newest: (a, b) => Number(b.id.replace(/\D/g, "")) - Number(a.id.replace(/\D/g, "")),
      };
      return list.sort(sorters[sort] || sorters.relevance);
    },

    /* ---------- Carrito ---------- */
    addToCart(productId, colorId, qty = 1) {
      const product = store.product(productId);
      if (!product) return;
      const color = colorId || product.colors?.[0]?.id || "default";
      const line = state.cart.find((l) => l.productId === productId && l.colorId === color);
      if (line) {
        line.qty = Math.min(product.stock || 99, line.qty + qty);
      } else {
        state.cart.push({ productId, colorId: color, qty: Math.min(product.stock || 99, qty) });
      }
      commit();
    },
    setQty(productId, colorId, qty) {
      const line = state.cart.find((l) => l.productId === productId && l.colorId === colorId);
      if (!line) return;
      const product = store.product(productId);
      line.qty = Math.max(1, Math.min(product?.stock || 99, qty));
      commit();
    },
    removeFromCart(productId, colorId) {
      state.cart = state.cart.filter((l) => !(l.productId === productId && l.colorId === colorId));
      commit();
    },
    clearCart() {
      state.cart = [];
      commit();
    },

    /* ---------- Favoritos ---------- */
    toggleFavorite(productId) {
      state.favorites = state.favorites.includes(productId)
        ? state.favorites.filter((id) => id !== productId)
        : [...state.favorites, productId];
      commit();
      return state.favorites.includes(productId);
    },

    /* ---------- Perfil / checkout ---------- */
    setProfile(patch) {
      state.profile = { ...state.profile, ...patch };
      commit();
    },
    setCheckout(patch) {
      state.checkout = { ...state.checkout, ...patch };
      commit();
    },
    setSettings(patch) {
      state.settings = { ...state.settings, ...patch };
      commit();
    },

    /* ---------- Pedidos ---------- */
    createOrder({ customer, payment, delivery, note = "" } = {}) {
      if (state.cart.length === 0) return null;
      const items = store.cartLines.map((line) => ({
        productId: line.productId,
        name: line.name,
        price: line.price,
        qty: line.qty,
        colorId: line.color?.id,
        colorName: line.color?.name,
        art: line.art,
      }));
      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      const shipping = delivery === "express" ? EXPRESS_COST : 0;
      const maxId = state.orders.reduce((max, order) => Math.max(max, Number(order.id.split("-")[1]) || 0), 1041);
      const status = payment === "cash" ? "pending" : "paid";
      const order = {
        id: `MT-${maxId + 1}`,
        createdAt: new Date().toISOString(),
        status,
        items,
        subtotal,
        shipping,
        total: subtotal + shipping,
        customer: { ...state.profile, ...customer },
        payment: payment || state.checkout.payment,
        delivery: delivery || state.checkout.delivery,
        note,
        timeline: buildTimeline(status),
      };
      state.orders = [order, ...state.orders];
      state.lastOrderId = order.id;
      state.cart = [];
      state.profile = { ...state.profile, ...(customer || {}) };
      state.checkout = { ...state.checkout, delivery: order.delivery, payment: order.payment };
      commit();
      return order;
    },
    updateOrderStatus(id, status) {
      const order = state.orders.find((o) => o.id === id);
      if (!order) return;
      order.status = status;
      order.timeline = buildTimeline(status);
      commit();
    },

    /* ---------- Catálogo (admin) ---------- */
    updateProduct(id, patch) {
      state.products = state.products.map((p) => (p.id === id ? { ...p, ...patch } : p));
      commit();
    },
    addProduct(data) {
      const product = {
        id: uid("p"),
        slug: data.slug || uid("producto"),
        name: data.name,
        shortName: data.shortName || data.name.split(" ").slice(0, 2).join(" "),
        category: data.category || "funda-silicona",
        price: Number(data.price) || 0,
        compareAt: data.compareAt ? Number(data.compareAt) : null,
        stock: Number(data.stock) || 0,
        sold: 0,
        rating: 5,
        reviews: 0,
        badge: "NUEVO",
        badgeTone: "gold",
        art: data.art || { kind: "case", color: "#b7e33b" },
        colors: data.colors || [{ id: "lime", name: "Lima", hex: "#b7e33b" }],
        description: data.description || "Producto nuevo en MEGA TECHNOLOGY.",
        features: data.features || [],
        freeShipping: true,
        express: EXPRESS_COST,
        tags: [],
      };
      state.products = [product, ...state.products];
      commit();
      return product;
    },

    /* ---------- Métricas para el panel ---------- */
    stats(days = 7) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (days - 1));
      const valid = state.orders.filter((o) => o.status !== "cancelled");
      const inRange = valid.filter((o) => new Date(o.createdAt) >= start);
      const daily = Array.from({ length: days }, (_, i) => {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        const value = inRange
          .filter((o) => new Date(o.createdAt).toDateString() === day.toDateString())
          .reduce((sum, o) => sum + o.total, 0);
        return { date: day.toISOString(), value };
      });
      const sales = inRange.reduce((sum, o) => sum + o.total, 0);
      const count = inRange.length;
      return {
        sales,
        count,
        avg: count ? Math.round(sales / count) : 0,
        lowStock: state.products.filter((p) => p.stock <= 5).length,
        pending: state.orders.filter((o) => ["pending", "paid"].includes(o.status)).length,
        daily,
        top: [...state.products].sort((a, b) => b.sold - a.sold).slice(0, 4),
        recent: store.orders.slice(0, 6),
      };
    },

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    reset() {
      localStorage.removeItem(KEY);
      location.hash = "#/home";
      location.reload();
    },
  };

  return store;
}

/** Carga catálogo + servicios y crea el store. */
export async function loadStore() {
  const [catalog, service] = await Promise.all([
    fetch("./data/products.json", { cache: "no-cache" }).then((r) => r.json()),
    fetch("./data/service.json", { cache: "no-cache" }).then((r) => r.json()),
  ]);
  return createStore({
    products: catalog.products,
    categories: catalog.categories,
    service,
  });
}
