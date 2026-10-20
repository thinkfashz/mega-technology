/**
 * orders.js — Historial y seguimiento de pedidos.
 */

import { icon } from "../../ui/icons.js";
import { productArt } from "../../ui/art.js";
import { money, esc, dateLabel } from "../../core/format.js";
import { emptyCart } from "../../ui/summary.js";
import { qs, qsa } from "../../core/dom.js";

const STATUS = {
  pending: { label: "Pendiente", cls: "pending" },
  paid: { label: "Pagado", cls: "paid" },
  shipped: { label: "En camino", cls: "shipped" },
  delivered: { label: "Entregado", cls: "delivered" },
  cancelled: { label: "Cancelado", cls: "cancelled" },
};

const PAYMENT = { card: "Tarjeta ··· 4242", apple: "Apple Pay", cash: "Contra entrega" };

function progress(order) {
  const index = { pending: 1, paid: 2, shipped: 3, delivered: 4, cancelled: 1 }[order.status] ?? 1;
  return `<div class="order-progress" aria-hidden="true">${[1, 2, 3, 4]
    .map((step) => `<span class="order-progress__dot ${step <= index ? "is-done" : ""}"></span>`)
    .join('<span class="order-progress__line"></span>')}</div>`;
}

export default {
  title: "Mis pedidos",

  render({ store, query }) {
    const tab = query.get("tab") || "all";
    const ok = query.get("ok");
    const all = store.orders;
    const filtered = all.filter((order) => {
      if (tab === "active") return ["pending", "paid", "shipped"].includes(order.status);
      if (tab === "done") return order.status === "delivered";
      return true;
    });

    return `
      <section class="orders" data-enter>
        <header class="orders__head">
          <div>
            <h1 class="orders__title">Mis pedidos</h1>
            <p class="orders__sub">${all.length} pedido${all.length === 1 ? "" : "s"} en este dispositivo</p>
          </div>
          <a class="orders__help" href="#/service">${icon("headset", { size: 16 })} Ayuda</a>
        </header>

        ${
          ok
            ? `<div class="orders__banner">
                <span class="orders__banner-icon">${icon("check", { size: 16 })}</span>
                <div class="grow">
                  <p class="orders__banner-title">Pedido ${esc(ok)} confirmado</p>
                  <p class="orders__banner-sub">Te avisaremos cuando salga a despacho.</p>
                </div>
              </div>`
            : ""
        }

        <div class="segmented orders__tabs">
          <button type="button" data-tab="all" aria-pressed="${tab === "all"}">Todos (${all.length})</button>
          <button type="button" data-tab="active" aria-pressed="${tab === "active"}">En curso</button>
          <button type="button" data-tab="done" aria-pressed="${tab === "done"}">Entregados</button>
        </div>

        ${
          filtered.length
            ? `<div class="orders__list">
                ${filtered
                  .map((order) => {
                    const status = STATUS[order.status] || STATUS.pending;
                    return `<button class="order-card ${ok === order.id ? "is-highlight" : ""}" type="button"
                      data-order="${order.id}" aria-label="Ver pedido ${order.id}">
                      <div class="order-card__top">
                        <span class="order-card__id">${order.id}</span>
                        <span class="status status--${status.cls}">${status.label}</span>
                      </div>
                      <p class="order-card__date">${dateLabel(order.createdAt)} · ${order.items.length} producto${
                        order.items.length === 1 ? "" : "s"
                      }</p>
                      <div class="order-card__thumbs">
                        ${order.items
                          .slice(0, 3)
                          .map(
                            (item) => `<span class="order-thumb">${productArt(
                              { ...(item.art || {}), color: item.colorId ? undefined : item.art?.color },
                              { label: item.name },
                            )}</span>`,
                          )
                          .join("")}
                        <span class="grow"></span>
                        <span class="order-card__total m-price">${money(order.total)}</span>
                      </div>
                      ${progress(order)}
                    </button>`;
                  })
                  .join("")}
              </div>
              <p class="orders__foot">${icon("lock", {
                size: 12,
              })} Los pedidos se guardan localmente hasta conectar el backend.</p>`
            : emptyCart({
                title: tab === "done" ? "Sin entregas todavía" : "Sin pedidos en curso",
                message: "Cuando compres, el seguimiento aparece acá.",
              })
        }
      </section>`;
  },

  mount(root, ctx) {
    const { store, query, navigate, openSheet, toast } = ctx;

    qsa("[data-tab]", root).forEach((button) =>
      button.addEventListener("click", () => {
        navigate(`/orders?tab=${button.dataset.tab}`);
      }),
    );

    qsa("[data-order]", root).forEach((button) =>
      button.addEventListener("click", () => {
        const order = store.order(button.dataset.order);
        if (!order) return;
        const status = STATUS[order.status] || STATUS.pending;

        const body = `
          <div class="order-detail">
            <div class="order-detail__top">
              <div>
                <p class="order-detail__id">${order.id}</p>
                <p class="order-detail__date">${dateLabel(order.createdAt)}</p>
              </div>
              <span class="status status--${status.cls}">${status.label}</span>
            </div>

            <div class="track order-detail__track">
              ${(order.timeline || [])
                .map(
                  (step, index) => `<div class="track__step ${step.done ? "is-done" : ""} ${
                    step.current ? "is-current" : ""
                  }">
                    <span class="track__dot">${step.done ? icon("check", { size: 13 }) : index + 1}</span>
                    <span class="track__line" aria-hidden="true"></span>
                    <div><p class="track__title">${step.title}</p><p class="track__meta">${step.meta}</p></div>
                  </div>`,
                )
                .join("")}
            </div>

            <div class="order-detail__items">
              ${order.items
                .map(
                  (item) => `<div class="order-item">
                    <span class="order-item__art">${productArt(item.art || {}, { label: item.name })}</span>
                    <span class="grow">
                      <span class="order-item__name">${esc(item.name)}</span>
                      <span class="order-item__meta">${item.colorName || "Estándar"} · x${item.qty}</span>
                    </span>
                    <span class="order-item__price">${money(item.price * item.qty)}</span>
                  </div>`,
                )
                .join("")}
            </div>

            <div class="summary order-detail__summary">
              <div class="summary__row"><span>Subtotal</span><span>${money(order.subtotal)}</span></div>
              <div class="summary__row"><span>Envío</span><span>${
                order.shipping ? money(order.shipping) : "Gratis"
              }</span></div>
              <div class="summary__total"><span>Total</span><span class="m-price">${money(order.total)}</span></div>
            </div>

            <div class="order-detail__info">
              <p><span>${icon("user", { size: 13 })} ${esc(order.customer?.name || "Invitado")}</span>
              <span>${icon("call", { size: 13 })} ${esc(order.customer?.phone || "—")}</span></p>
              <p><span>${icon("pin", { size: 13 })} ${esc(order.customer?.address || "—")}, ${esc(
                order.customer?.city || "",
              )}</span>
              <span>${icon("wallet", { size: 13 })} ${PAYMENT[order.payment] || "Tarjeta"}</span></p>
            </div>

            <div class="row gap-2">
              <button class="btn btn-lime grow" type="button" data-again>Volver a pedir</button>
              <a class="btn btn-ghost" href="#/service" data-help>Ayuda</a>
            </div>
          </div>`;

        const sheet = openSheet({ title: "Detalle del pedido", body });
        sheet.querySelector("[data-again]")?.addEventListener("click", () => {
          order.items.forEach((item) => store.addToCart(item.productId, item.colorId, item.qty));
          ctx.closeSheet();
          toast("Productos agregados al carrito", { iconName: "cart" });
          navigate("/cart");
        });
      }),
    );

    if (query.get("ok")) {
      setTimeout(() => toast(`Pedido ${query.get("ok")} registrado`, { iconName: "check-circle" }), 350);
      // limpia el parámetro para que no se repita al volver
      const params = new URLSearchParams(query);
      params.delete("ok");
      history.replaceState(null, "", `#/orders${params.toString() ? `?${params}` : ""}`);
    }
  },

  unmount() {},
};
