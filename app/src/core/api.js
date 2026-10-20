/**
 * api.js — capa de transporte.
 *
 * Modos:
 *   ?api=local  (por defecto)  → adaptador local sobre el store. Funciona offline.
 *   ?api=remote                → fetch real a /api/... (api/mock/server.mjs en desarrollo).
 *
 * Las pantallas llaman siempre a `api.*`, nunca a fetch directo.
 * Contrato documentado en /api/openapi.yaml y /Documentd/api.html.
 */

import { uid } from "./format.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createApi(store) {
  const params = new URLSearchParams(location.search);
  const mode = params.get("api") || localStorage.getItem("mega.api") || "local";
  const base = params.get("base") || "/api";

  async function http(path, { method = "GET", body, signal } = {}) {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(detail.message || `API ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
  }

  const local = {
    latency: () => wait(90 + Math.random() * 120),
  };

  return {
    mode,
    base,

    /* ---------- Catálogo ---------- */
    async products(filters = {}) {
      await local.latency();
      if (mode === "remote") {
        const qs = new URLSearchParams(filters).toString();
        return http(`/products${qs ? `?${qs}` : ""}`);
      }
      return store.queryProducts(filters);
    },

    async product(id) {
      await local.latency();
      if (mode === "remote") return http(`/products/${encodeURIComponent(id)}`);
      return store.product(id) ?? null;
    },

    async categories() {
      await local.latency();
      if (mode === "remote") return http("/categories");
      return store.categories;
    },

    /* ---------- Pedidos ---------- */
    async createOrder(payload) {
      await local.latency();
      if (mode === "remote") return http("/orders", { method: "POST", body: payload });
      return store.createOrder(payload);
    },

    async orders() {
      await local.latency();
      if (mode === "remote") return http("/orders");
      return store.orders;
    },

    async updateOrderStatus(id, status) {
      await local.latency();
      if (mode === "remote") return http(`/orders/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } });
      return store.updateOrderStatus(id, status);
    },

    /* ---------- Servicio técnico ---------- */
    async serviceRequest(payload) {
      await local.latency();
      if (mode === "remote") return http("/service-requests", { method: "POST", body: payload });
      const request = { id: uid("SR"), createdAt: new Date().toISOString(), status: "received", ...payload };
      const saved = JSON.parse(localStorage.getItem("mega.serviceRequests") || "[]");
      localStorage.setItem("mega.serviceRequests", JSON.stringify([request, ...saved]));
      return request;
    },

    /* ---------- Admin ---------- */
    async adminStats(days = 7) {
      await local.latency();
      if (mode === "remote") return http(`/admin/stats?days=${days}`);
      return store.stats(days);
    },

    async updateProduct(id, patch) {
      await local.latency();
      if (mode === "remote") return http(`/admin/products/${encodeURIComponent(id)}`, { method: "PATCH", body: patch });
      return store.updateProduct(id, patch);
    },

    async createProduct(data) {
      await local.latency();
      if (mode === "remote") return http("/admin/products", { method: "POST", body: data });
      return store.addProduct(data);
    },
  };
}
