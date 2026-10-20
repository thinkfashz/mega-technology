#!/usr/bin/env node
/**
 * server.mjs — API mock de MEGA TECHNOLOGY.
 *
 * Sin dependencias. Implementa el mismo contrato que usa `core/api.js` en modo
 * remoto (`?api=remote&base=http://127.0.0.1:8788/api`).
 *
 * Uso:
 *   node api/mock/server.mjs            # http://127.0.0.1:8788/api
 *   PORT=9001 node api/mock/server.mjs
 *
 * Datos en memoria: al reiniciar vuelven los seeds. No usar en producción.
 */

import http from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

const here = dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(readFileSync(join(here, "../../app/data/products.json"), "utf8"));

const PORT = Number(process.env.PORT || 8788);
const EXPRESS_COST = 2990;
const FREE_THRESHOLD = 50000;

/* ---------- Estado en memoria ---------- */

let products = structuredClone(seed.products);
const categories = structuredClone(seed.categories);
let orders = createSeedOrders();
const serviceRequests = [];

function createSeedOrders() {
  const people = [
    ["Camila Rojas", "+56 9 8842 1177", "Av. Providencia 1234", "Providencia"],
    ["Diego Fuentes", "+56 9 7712 0044", "511 Av Brasil", "Santiago"],
    ["Valentina Soto", "+56 9 6621 8890", "Los Leones 480", "Providencia"],
    ["Matías Herrera", "+56 9 5533 2211", "Av. Matta 890", "Santiago"],
  ];
  const statuses = ["pending", "paid", "shipped", "delivered"];
  return Array.from({ length: 8 }, (_, i) => {
    const product = products[i % products.length];
    const qty = 1 + (i % 2);
    const subtotal = product.price * qty;
    const shipping = i % 3 === 0 ? EXPRESS_COST : 0;
    const status = statuses[i % statuses.length];
    return {
      id: `MT-${2000 + (8 - i)}`,
      createdAt: new Date(Date.now() - i * 7 * 3600 * 1000).toISOString(),
      status,
      items: [
        {
          productId: product.id,
          name: product.name,
          colorId: product.colors?.[0]?.id ?? "base",
          colorName: product.colors?.[0]?.name ?? "Base",
          price: product.price,
          qty,
          art: product.art,
        },
      ],
      subtotal,
      shipping,
      total: subtotal + shipping,
      customer: {
        name: people[i % people.length][0],
        phone: people[i % people.length][1],
        address: people[i % people.length][2],
        city: people[i % people.length][3],
      },
      payment: i % 3 === 0 ? "cash" : i % 2 === 0 ? "apple" : "card",
      delivery: shipping ? "express" : "free",
      note: "",
      timeline: timeline(status),
    };
  });
}

function timeline(status = "pending") {
  const base = [
    { key: "confirmed", title: "Pedido confirmado", meta: "Pedido recibido" },
    { key: "preparing", title: "En preparación", meta: "Preparando tu pedido" },
    { key: "onway", title: "En camino", meta: "En ruta de entrega" },
    { key: "delivered", title: "Entregado", meta: "Entrega completada" },
  ];
  const index = { pending: 1, paid: 2, shipped: 3, delivered: 4, cancelled: 1 }[status] ?? 1;
  return base.map((step, i) => ({
    ...step,
    done: i < index,
    current: i === index - 1 && !["delivered", "cancelled"].includes(status),
  }));
}

function stats(days = 7) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const valid = orders.filter((order) => order.status !== "cancelled");
  const inRange = valid.filter((order) => new Date(order.createdAt) >= start);
  const daily = Array.from({ length: days }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return {
      date: day.toISOString(),
      value: inRange
        .filter((order) => new Date(order.createdAt).toDateString() === day.toDateString())
        .reduce((sum, order) => sum + order.total, 0),
    };
  });
  const sales = inRange.reduce((sum, order) => sum + order.total, 0);
  const count = inRange.length;
  return {
    sales,
    count,
    avg: count ? Math.round(sales / count) : 0,
    lowStock: products.filter((p) => p.stock <= 5).length,
    pending: orders.filter((o) => ["pending", "paid"].includes(o.status)).length,
    daily,
    top: [...products].sort((a, b) => b.sold - a.sold).slice(0, 4),
    recent: orders.slice(0, 6),
  };
}

/* ---------- Utilidades HTTP ---------- */

const json = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(body);
};

const fail = (res, status, code, message, details) =>
  json(res, status, { code, message, ...(details ? { details } : {}) });

async function readBody(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) throw new Error("PAYLOAD_TOO_LARGE");
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("INVALID_JSON");
  }
}

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const money = (value) => Math.max(0, Math.round(Number(value) || 0));

/* ---------- Router ---------- */

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api/, "").replace(/\/+$/, "") || "/";
  const query = url.searchParams;

  try {
    /* Salud */
    if (req.method === "GET" && path === "/health") {
      return json(res, 200, { ok: true, products: products.length, orders: orders.length });
    }

    /* Catálogo */
    if (req.method === "GET" && path === "/categories") {
      return json(
        res,
        200,
        categories.map((category) => ({
          ...category,
          count: products.filter((product) => product.category === category.id).length,
        })),
      );
    }

    if (req.method === "GET" && path === "/products") {
      const q = (query.get("q") || "").trim().toLowerCase();
      const category = query.get("category") || "";
      const color = query.get("color") || "";
      const sort = query.get("sort") || "relevance";
      const maxPrice = Number(query.get("maxPrice") || 0);

      let list = products.filter((product) => {
        if (category && product.category !== category) return false;
        if (color && !(product.colors || []).some((c) => c.id === color)) return false;
        if (maxPrice && product.price > maxPrice) return false;
        if (!q) return true;
        return [product.name, product.shortName, product.category, ...(product.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(q);
      });

      const sorters = {
        relevance: (a, b) => b.sold - a.sold,
        priceAsc: (a, b) => a.price - b.price,
        priceDesc: (a, b) => b.price - a.price,
        rating: (a, b) => b.rating - a.rating,
      };
      list = [...list].sort(sorters[sort] || sorters.relevance);
      return json(res, 200, list);
    }

    const productMatch = path.match(/^\/products\/([^/]+)$/);
    if (req.method === "GET" && productMatch) {
      const id = decodeURIComponent(productMatch[1]);
      const product = products.find((p) => p.id === id || p.slug === id);
      if (!product) return fail(res, 404, "NOT_FOUND", "Producto no encontrado");
      return json(res, 200, product);
    }

    /* Pedidos */
    if (req.method === "GET" && path === "/orders") {
      const status = query.get("status");
      const limit = Math.min(100, Number(query.get("limit") || 50));
      const list = orders.filter((order) => !status || order.status === status).slice(0, limit);
      return json(res, 200, list);
    }

    if (req.method === "POST" && path === "/orders") {
      const body = await readBody(req);
      if (!body.customer?.name || !body.customer?.phone || !body.customer?.address) {
        return fail(res, 422, "VALIDATION", "Faltan datos del cliente");
      }
      if (!Array.isArray(body.items) || body.items.length === 0) {
        return fail(res, 422, "VALIDATION", "La orden necesita al menos un producto");
      }
      if (!["card", "apple", "cash"].includes(body.payment)) {
        return fail(res, 422, "VALIDATION", "Método de pago inválido");
      }
      if (!["express", "free"].includes(body.delivery)) {
        return fail(res, 422, "VALIDATION", "Método de envío inválido");
      }

      const items = [];
      for (const line of body.items) {
        const product = products.find((p) => p.id === line.productId);
        if (!product) return fail(res, 422, "UNKNOWN_PRODUCT", `Producto ${line.productId} no existe`);
        const qty = Math.max(1, Math.floor(Number(line.qty) || 1));
        if (product.stock < qty) {
          return fail(res, 409, "STOCK_INSUFFICIENT", `No hay stock suficiente de ${product.name}`, {
            productId: product.id,
            available: product.stock,
            requested: qty,
          });
        }
        const color = product.colors?.find((c) => c.id === line.colorId) ?? product.colors?.[0];
        items.push({
          productId: product.id,
          name: product.name,
          colorId: color?.id ?? "base",
          colorName: color?.name ?? "Base",
          price: product.price,
          qty,
          art: { ...product.art, color: color?.hex ?? product.art.color },
        });
      }

      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      const shipping =
        body.delivery === "free" || subtotal >= FREE_THRESHOLD ? 0 : EXPRESS_COST;
      const order = {
        id: `MT-${3000 + orders.length + 1}`,
        createdAt: new Date().toISOString(),
        status: "pending",
        items,
        subtotal,
        shipping,
        total: subtotal + shipping,
        customer: body.customer,
        payment: body.payment,
        delivery: body.delivery,
        note: body.note || "",
        timeline: timeline("pending"),
      };

      items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        product.stock = Math.max(0, product.stock - item.qty);
        product.sold += item.qty;
      });

      orders = [order, ...orders];
      return json(res, 201, order);
    }

    const orderMatch = path.match(/^\/orders\/([^/]+)$/);
    if (orderMatch && req.method === "GET") {
      const order = orders.find((o) => o.id === decodeURIComponent(orderMatch[1]));
      if (!order) return fail(res, 404, "NOT_FOUND", "Pedido no encontrado");
      return json(res, 200, order);
    }

    if (orderMatch && req.method === "PATCH") {
      const order = orders.find((o) => o.id === decodeURIComponent(orderMatch[1]));
      if (!order) return fail(res, 404, "NOT_FOUND", "Pedido no encontrado");
      const body = await readBody(req);
      const allowed = ["pending", "paid", "shipped", "delivered", "cancelled"];
      if (!allowed.includes(body.status)) {
        return fail(res, 422, "VALIDATION", "Estado inválido");
      }
      order.status = body.status;
      order.timeline = timeline(body.status);
      return json(res, 200, order);
    }

    /* Servicio técnico */
    if (req.method === "POST" && path === "/service-requests") {
      const body = await readBody(req);
      if (!body.device || !body.model || !body.issue || !body.name || !body.phone) {
        return fail(res, 422, "VALIDATION", "Completa equipo, modelo, falla, nombre y teléfono");
      }
      if (String(body.phone).replace(/\D/g, "").length < 8) {
        return fail(res, 422, "VALIDATION", "Teléfono inválido");
      }
      const request = {
        id: `SR-${randomUUID().slice(0, 6)}`,
        createdAt: new Date().toISOString(),
        status: "received",
        ...body,
      };
      serviceRequests.unshift(request);
      return json(res, 201, request);
    }

    /* Admin */
    if (req.method === "GET" && path === "/admin/stats") {
      const days = Number(query.get("days") || 7);
      if (![7, 14, 30].includes(days)) {
        return fail(res, 422, "VALIDATION", "days debe ser 7, 14 o 30");
      }
      return json(res, 200, stats(days));
    }

    if (req.method === "POST" && path === "/admin/products") {
      const body = await readBody(req);
      if (!body.name || String(body.name).trim().length < 3) {
        return fail(res, 422, "VALIDATION", "El nombre debe tener al menos 3 caracteres");
      }
      if (money(body.price) <= 0) {
        return fail(res, 422, "VALIDATION", "El precio debe ser mayor que 0");
      }
      const color = body.colors?.[0]?.hex || body.art?.color || "#b7e33b";
      const product = {
        id: `p${Date.now().toString(36)}`,
        slug: slugify(body.name),
        name: String(body.name).trim(),
        shortName: String(body.name).trim().split(" ").slice(0, 2).join(" "),
        category: body.category || "funda-silicona",
        price: money(body.price),
        compareAt: body.compareAt ? money(body.compareAt) : null,
        stock: Math.max(0, Math.floor(Number(body.stock) || 0)),
        sold: 0,
        rating: 5,
        reviews: 0,
        badge: "NUEVO",
        badgeTone: "gold",
        art: body.art || { kind: "case", color },
        colors: body.colors || [{ id: "base", name: "Base", hex: color }],
        description: body.description || "Producto nuevo en MEGA TECHNOLOGY.",
        features: body.features || [],
        freeShipping: true,
        express: EXPRESS_COST,
        tags: [],
      };
      products = [product, ...products];
      return json(res, 201, product);
    }

    const adminProductMatch = path.match(/^\/admin\/products\/([^/]+)$/);
    if (adminProductMatch && req.method === "PATCH") {
      const product = products.find((p) => p.id === decodeURIComponent(adminProductMatch[1]));
      if (!product) return fail(res, 404, "NOT_FOUND", "Producto no encontrado");
      const body = await readBody(req);
      if (body.name !== undefined && String(body.name).trim().length < 3) {
        return fail(res, 422, "VALIDATION", "Nombre inválido");
      }
      if (body.price !== undefined && money(body.price) <= 0) {
        return fail(res, 422, "VALIDATION", "Precio inválido");
      }
      if (body.name !== undefined) product.name = String(body.name).trim();
      if (body.price !== undefined) product.price = money(body.price);
      if (body.stock !== undefined) product.stock = Math.max(0, Math.floor(Number(body.stock) || 0));
      if (body.description !== undefined) product.description = String(body.description);
      return json(res, 200, product);
    }

    /* Propuestos (devuelven 501 para dejar claro que no están implementados) */
    if (
      (path === "/payments/intent" && req.method === "POST") ||
      (path === "/payments/webhook" && req.method === "POST") ||
      (path === "/auth/session" && req.method === "POST") ||
      path === "/shipping/quote"
    ) {
      return fail(res, 501, "NOT_IMPLEMENTED", "Endpoint propuesto: ver api/endpoints y openapi.yaml");
    }

    return fail(res, 404, "NOT_FOUND", `Ruta no encontrada: ${req.method} ${path}`);
  } catch (error) {
    if (error.message === "INVALID_JSON") {
      return fail(res, 400, "INVALID_JSON", "El cuerpo no es JSON válido");
    }
    if (error.message === "PAYLOAD_TOO_LARGE") {
      return fail(res, 413, "PAYLOAD_TOO_LARGE", "El cuerpo supera 1 MB");
    }
    console.error("[api]", error);
    return fail(res, 500, "INTERNAL", "Error interno del mock");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`MEGA API mock · http://127.0.0.1:${PORT}/api`);
  console.log(`Salud: http://127.0.0.1:${PORT}/api/health`);
  console.log("Modo remoto en la app:");
  console.log(`  http://127.0.0.1:8787/app/?api=remote&base=http://127.0.0.1:${PORT}/api#/home`);
});
