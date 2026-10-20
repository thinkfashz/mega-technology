/**
 * admin.js — Panel administrador.
 *
 * Resumen (KPIs + gráfico + top productos), pedidos (cambio de estado)
 * y productos (stock, precio, alta). Todo escribe sobre el mismo store
 * y pasa por core/api.js, que en modo local persiste en el dispositivo.
 */

import { icon } from "../../ui/icons.js";
import { productArt } from "../../ui/art.js";
import { money, esc, dateLabel, weekdayShort } from "../../core/format.js";
import { qs, qsa, countUp } from "../../core/dom.js";

const STATUS = {
  pending: { label: "Pendiente", cls: "pending" },
  paid: { label: "Pagado", cls: "paid" },
  shipped: { label: "En camino", cls: "shipped" },
  delivered: { label: "Entregado", cls: "delivered" },
  cancelled: { label: "Cancelado", cls: "cancelled" },
};

const STATUS_OPTIONS = [
  ["pending", "Pendiente"],
  ["paid", "Pagado"],
  ["shipped", "En camino"],
  ["delivered", "Entregado"],
  ["cancelled", "Cancelado"],
];

const TABS = [
  ["overview", "Resumen"],
  ["orders", "Pedidos"],
  ["products", "Productos"],
];

function chart(daily) {
  const width = 330;
  const height = 132;
  const padX = 10;
  const padY = 14;
  const values = daily.map((d) => d.value);
  const max = Math.max(...values, 1);
  const stepX = daily.length > 1 ? (width - padX * 2) / (daily.length - 1) : 0;
  const points = daily.map((d, index) => ({
    x: padX + index * stepX,
    y: height - padY - (d.value / max) * (height - padY * 2),
    value: d.value,
    label: weekdayShort(new Date(d.date)),
  }));

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${points[points.length - 1].x.toFixed(1)} ${height - padY} L${points[0].x.toFixed(
    1,
  )} ${height - padY} Z`;
  const grid = [0.25, 0.5, 0.75]
    .map((p) => `<line x1="${padX}" x2="${width - padX}" y1="${(height - padY * 2) * p + padY}" y2="${
      (height - padY * 2) * p + padY
    }" class="sales-chart__grid"/>`)
    .join("");

  return `
    <div class="sales-chart__wrap">
      <svg class="sales-chart" viewBox="0 0 ${width} ${height}" role="img"
        aria-label="Ventas de los últimos ${daily.length} días">
        <defs>
          <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#c8f542" stop-opacity=".28"/>
            <stop offset="1" stop-color="#c8f542" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="sales-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#a8d62e"/><stop offset="1" stop-color="#d6ff58"/>
          </linearGradient>
        </defs>
        ${grid}
        <path d="${area}" fill="url(#sales-fill)"/>
        <path d="${line}" fill="none" stroke="url(#sales-line)" stroke-width="2.4"
          stroke-linecap="round" stroke-linejoin="round" class="sales-chart__line"/>
        ${points
          .map(
            (p, index) =>
              `<circle cx="${p.x}" cy="${p.y}" r="${index === points.length - 1 ? 4 : 2.3}"
                class="sales-chart__dot ${index === points.length - 1 ? "is-last" : ""}">
                <title>${p.label}: ${money(p.value)}</title>
              </circle>`,
          )
          .join("")}
      </svg>
      <div class="sales-chart__x" aria-hidden="true">
        ${points
          .map(
            (p, index) =>
              `<span class="${index === points.length - 1 ? "is-last" : ""}">${p.label}</span>`,
          )
          .join("")}
      </div>
    </div>`;
}

function overview(store, stats, days) {
  const half = Math.floor(stats.daily.length / 2) || 1;
  const firstHalf = stats.daily.slice(0, half).reduce((sum, d) => sum + d.value, 0);
  const secondHalf = stats.daily.slice(half).reduce((sum, d) => sum + d.value, 0);
  const delta = firstHalf ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : 100;
  const top = stats.top;

  const kpi = (label, value, iconName, extra = "", moneyFormat = true) => `
    <article class="kpi">
      <p class="kpi__label">${icon(iconName, { size: 12 })} ${label}</p>
      <p class="kpi__value" data-count="${value}" data-format="${moneyFormat ? "money" : "int"}">${
        moneyFormat ? money(0) : "0"
      }</p>
      ${extra}
    </article>`;

  return `
    <div class="admin__actions">
      <button class="btn btn-gold btn-sm" type="button" data-new-product>
        ${icon("plus", { size: 15 })} Nuevo producto
      </button>
      <button class="btn btn-ghost btn-sm" type="button" data-export>
        ${icon("download", { size: 15 })} CSV
      </button>
      <a class="btn btn-ghost btn-sm" href="#/admin?tab=orders">
        ${icon("receipt", { size: 15 })} Pedidos
      </a>
    </div>

    <div class="kpi-grid">
      ${kpi(`Ventas · ${days} d`, stats.sales, "wallet", `
        <span class="kpi__delta ${delta < 0 ? "is-down" : ""}">
          ${icon(delta < 0 ? "chevron-down" : "chart", { size: 11 })} ${delta >= 0 ? "+" : ""}${delta}% vs. mitad previa
        </span>`)}
      ${kpi("Pedidos", stats.count, "receipt", `<span class="kpi__delta">${stats.pending} por despachar</span>`, false)}
      ${kpi("Ticket promedio", stats.avg, "chart", `<span class="kpi__delta">${stats.count} órdenes</span>`)}
      ${kpi("Stock bajo", stats.lowStock, "box", `<span class="kpi__delta ${stats.lowStock ? "is-down" : ""}">${
        stats.lowStock ? "Reponer pronto" : "Todo en orden"
      }</span>`, false)}
    </div>

    <article class="card chart-card" data-reveal>
      <div class="chart-card__head">
        <div>
          <p class="chart-card__label">Ventas últimos ${days} días</p>
          <p class="chart-card__value">${money(stats.sales)}</p>
        </div>
        <div class="chart-legend"><span><i></i> Ingresos</span></div>
      </div>
      ${chart(stats.daily)}
    </article>

    <section class="admin__section">
      <div class="m-section-head">
        <h2 class="m-section-title">Top productos</h2>
        <a class="m-link" href="#/admin?tab=products">Gestionar ${icon("chevron-right", { size: 13 })}</a>
      </div>
      <div class="admin-list">
        ${top
          .map(
            (product, index) => `<a class="admin-order" href="#/product/${product.id}">
              <span class="admin-order__id">${String(index + 1).padStart(2, "0")}</span>
              <span class="grow">
                <span class="admin-order__title">${esc(product.shortName || product.name)}</span>
                <span class="admin-order__meta">${product.sold} vendidos · stock ${product.stock}</span>
              </span>
              <span class="admin-order__total">${money(product.price)}</span>
            </a>`,
          )
          .join("")}
      </div>
    </section>

    <section class="admin__section">
      <div class="m-section-head">
        <h2 class="m-section-title">Pedidos recientes</h2>
        <a class="m-link" href="#/admin?tab=orders">Ver todos ${icon("chevron-right", { size: 13 })}</a>
      </div>
      <div class="admin-list">
        ${stats.recent
          .map((order) => {
            const status = STATUS[order.status] || STATUS.pending;
            return `<a class="admin-order" href="#/admin?tab=orders">
              <span class="admin-order__id">${order.id.split("-")[1]}</span>
              <span class="grow">
                <span class="admin-order__title">${esc(order.customer?.name || "Invitado")}</span>
                <span class="admin-order__meta">${dateLabel(order.createdAt)} · ${order.items.length} prod.</span>
              </span>
              <span class="admin-order__right">
                <span class="admin-order__total">${money(order.total)}</span>
                <span class="status status--${status.cls}">${status.label}</span>
              </span>
            </a>`;
          })
          .join("")}
      </div>
    </section>

    <p class="admin__foot">${icon("lock", {
      size: 12,
    })} Datos locales · el panel escribe en el mismo store que la tienda.</p>`;
}

function ordersTab(store, query) {
  const filter = query.get("status") || "all";
  const orders = store.orders.filter((order) => filter === "all" || order.status === filter);
  const total = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);

  return `
    <div class="admin__filters">
      <div class="segmented">
        ${[["all", `Todos (${store.orders.length})`], ...STATUS_OPTIONS.slice(0, 4)]
          .map(
            ([value, label]) =>
              `<button type="button" data-status-filter="${value}" aria-pressed="${
                filter === value
              }">${label}</button>`,
          )
          .join("")}
      </div>
      <span class="admin__sum">${money(total)}</span>
    </div>

    <div class="admin-list admin-list--orders">
      ${orders
        .map((order) => {
          const status = STATUS[order.status] || STATUS.pending;
          return `<article class="admin-order admin-order--edit">
            <span class="admin-order__id">${order.id.split("-")[1]}</span>
            <span class="grow">
              <span class="admin-order__title">${esc(order.customer?.name || "Invitado")} · ${money(
                order.total,
              )}</span>
              <span class="admin-order__meta">${dateLabel(order.createdAt)} · ${order.items.length} productos · ${
                order.payment === "cash" ? "Contra entrega" : order.payment === "apple" ? "Apple Pay" : "Tarjeta"
              }</span>
              <span class="admin-order__statusline">
                <span class="status status--${status.cls}" data-status-pill>${status.label}</span>
                <select class="admin-select" data-status="${order.id}" aria-label="Cambiar estado de ${order.id}">
                  ${STATUS_OPTIONS.map(
                    ([value, label]) =>
                      `<option value="${value}" ${order.status === value ? "selected" : ""}>${label}</option>`,
                  ).join("")}
                </select>
              </span>
            </span>
          </article>`;
        })
        .join("")}
      ${
        orders.length
          ? ""
          : `<div class="empty"><div class="empty__icon">${icon("receipt", {
              size: 22,
            })}</div><p class="empty__title">Sin pedidos en este estado</p></div>`
      }
    </div>
    <p class="admin__foot">${icon("refresh", {
      size: 12,
    })} El cambio de estado actualiza el seguimiento del cliente al instante.</p>`;
}

function productsTab(store) {
  return `
    <div class="admin__filters">
      <div class="segmented">
        <button type="button" aria-pressed="true" data-products-all>Todo el catálogo (${store.products.length})</button>
        <button type="button" data-products-low aria-pressed="false">Stock bajo (${store.lowStock.length})</button>
      </div>
      <button class="btn btn-gold btn-sm" type="button" data-new-product>${icon("plus", { size: 14 })} Nuevo</button>
    </div>

    <div class="admin-list admin-list--products" data-product-list>
      ${store.products
        .map(
          (product) => `<article class="admin-product ${product.stock <= 5 ? "is-low" : ""}" data-product-row
            data-stock="${product.stock}" data-id="${product.id}">
            <span class="admin-product__art">${productArt(product.art, { label: product.name })}</span>
            <span class="grow">
              <span class="admin-product__name">${esc(product.name)}</span>
              <span class="admin-product__meta">${esc(store.category(product.category)?.name || product.category)} · ${
                product.sold
              } vendidos</span>
              <span class="stock-bar ${product.stock <= 5 ? "is-low" : ""}">
                <i style="width:${Math.min(100, (product.stock / 30) * 100)}%"></i>
              </span>
            </span>
            <span class="admin-product__right">
              <span class="admin-product__price">${money(product.price)}</span>
              <span class="admin-product__stock">${product.stock} un.</span>
              <span class="admin-product__controls">
                <button type="button" data-stock-minus="${product.id}" aria-label="Restar stock">−</button>
                <button type="button" data-stock-plus="${product.id}" aria-label="Sumar stock">+</button>
                <button type="button" data-edit-product="${product.id}" aria-label="Editar ${esc(product.name)}">
                  ${icon("edit", { size: 13 })}
                </button>
              </span>
            </span>
          </article>`,
        )
        .join("")}
    </div>
    <p class="admin__foot">${icon("box", {
      size: 12,
    })} Los cambios de stock se reflejan en la tienda y en el carrito.</p>`;
}

export default {
  title: "Panel administrador",

  render({ store, query }) {
    const tab = query.get("tab") || "overview";
    const days = Number(query.get("days") || 7);
    const stats = store.stats(days);

    return `
      <section class="admin" data-enter>
        <header class="admin__head">
          <div>
            <p class="admin__eyebrow"><span class="live-dot"></span> En vivo · ${
              store.orders.length
            } pedidos · ${store.products.length} productos</p>
            <h1 class="admin__title">Panel</h1>
          </div>
          <a class="admin__store" href="#/home" aria-label="Ver tienda">${icon("store", { size: 18 })}</a>
        </header>

        <div class="admin__tabs">
          <div class="segmented">
            ${TABS.map(
              ([id, label]) =>
                `<button type="button" data-tab="${id}" aria-pressed="${tab === id}">${label}</button>`,
            ).join("")}
          </div>
          ${
            tab === "overview"
              ? `<div class="segmented admin__period">
                  ${[7, 14, 30]
                    .map(
                      (value) =>
                        `<button type="button" data-days="${value}" aria-pressed="${
                          days === value
                        }">${value}d</button>`,
                    )
                    .join("")}
                </div>`
              : ""
          }
        </div>

        ${
          tab === "orders"
            ? ordersTab(store, query)
            : tab === "products"
            ? productsTab(store)
            : overview(store, stats, days)
        }
      </section>`;
  },

  mount(root, ctx) {
    const { store, api, query, navigate, openSheet, closeSheet, toast } = ctx;

    qsa("[data-tab]", root).forEach((button) =>
      button.addEventListener("click", () => navigate(`/admin?tab=${button.dataset.tab}`)),
    );

    qsa("[data-days]", root).forEach((button) =>
      button.addEventListener("click", () => navigate(`/admin?tab=overview&days=${button.dataset.days}`)),
    );

    qsa("[data-status-filter]", root).forEach((button) =>
      button.addEventListener("click", () => {
        const value = button.dataset.statusFilter;
        navigate(`/admin?tab=orders${value === "all" ? "" : `&status=${value}`}`);
      }),
    );

    // KPIs animados
    qsa("[data-count]", root).forEach((node) => {
      const to = Number(node.dataset.count);
      countUp(node, to, {
        duration: 850,
        format: node.dataset.format === "money" ? (value) => money(Math.round(value)) : (value) => Math.round(value),
      });
    });

    // Export CSV
    root.querySelector("[data-export]")?.addEventListener("click", () => {
      const rows = [
        ["pedido", "fecha", "cliente", "telefono", "estado", "pago", "envio", "subtotal", "total"],
        ...store.orders.map((order) => [
          order.id,
          order.createdAt,
          order.customer?.name || "",
          order.customer?.phone || "",
          order.status,
          order.payment,
          order.delivery,
          order.subtotal,
          order.total,
        ]),
      ];
      const csv = rows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `mega-pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 800);
      toast("CSV de pedidos exportado", { iconName: "download" });
    });

    // Cambiar estado de un pedido
    qsa("[data-status]", root).forEach((select) => {
      select.addEventListener("change", async () => {
        const id = select.dataset.status;
        const value = select.value;
        const pill = select.closest(".admin-order")?.querySelector("[data-status-pill]");
        try {
          await api.updateOrderStatus(id, value);
          const meta = STATUS[value];
          if (pill) {
            pill.className = `status status--${meta.cls}`;
            pill.textContent = meta.label;
          }
          toast(`${id} → ${meta.label}`, { iconName: "check-circle" });
        } catch (error) {
          toast(error.message || "No se pudo actualizar", { type: "error" });
        }
      });
    });

    // Filtro stock bajo (cliente, sin re-render)
    const lowButton = root.querySelector("[data-products-low]");
    const allButton = root.querySelector("[data-products-all]");
    const toggleLow = (onlyLow) => {
      qsa("[data-product-row]", root).forEach((row) => {
        row.hidden = onlyLow && !row.classList.contains("is-low");
      });
      lowButton?.setAttribute("aria-pressed", String(onlyLow));
      allButton?.setAttribute("aria-pressed", String(!onlyLow));
    };
    lowButton?.addEventListener("click", () => toggleLow(true));
    allButton?.addEventListener("click", () => toggleLow(false));

    // Stock +/- desde la lista
    qsa("[data-stock-plus]", root).forEach((button) =>
      button.addEventListener("click", () => {
        const product = store.product(button.dataset.stockPlus);
        if (!product) return;
        api.updateProduct(product.id, { stock: product.stock + 1 }).then(() => {
          toast(`${product.shortName}: stock ${product.stock + 1}`, { iconName: "box" });
          navigate(`/admin?tab=products`, { replace: true });
        });
      }),
    );
    qsa("[data-stock-minus]", root).forEach((button) =>
      button.addEventListener("click", () => {
        const product = store.product(button.dataset.stockMinus);
        if (!product) return;
        const next = Math.max(0, product.stock - 1);
        api.updateProduct(product.id, { stock: next }).then(() => {
          toast(`${product.shortName}: stock ${next}`, { iconName: "box" });
          navigate(`/admin?tab=products`, { replace: true });
        });
      }),
    );

    // Editar producto
    qsa("[data-edit-product]", root).forEach((button) =>
      button.addEventListener("click", () => {
        const product = store.product(button.dataset.editProduct);
        if (!product) return;
        const body = `
          <div class="field">
            <label class="field__label" for="ap-name">Nombre</label>
            <div class="field__box"><span class="field__icon">${icon("tag", { size: 15 })}</span>
              <input id="ap-name" value="${esc(product.name)}" /></div>
          </div>
          <div class="admin-form-grid">
            <div class="field">
              <label class="field__label" for="ap-price">Precio (CLP)</label>
              <div class="field__box"><span class="field__icon">${icon("wallet", { size: 15 })}</span>
                <input id="ap-price" type="number" min="0" step="100" value="${product.price}" /></div>
            </div>
            <div class="field">
              <label class="field__label" for="ap-stock">Stock</label>
              <div class="field__box"><span class="field__icon">${icon("box", { size: 15 })}</span>
                <input id="ap-stock" type="number" min="0" step="1" value="${product.stock}" /></div>
            </div>
          </div>
          <div class="field">
            <label class="field__label" for="ap-desc">Descripción</label>
            <div class="field__box field__box--area"><span class="field__icon">${icon("edit", {
              size: 15,
            })}</span><textarea id="ap-desc">${esc(product.description)}</textarea></div>
          </div>
          <button class="btn btn-lime btn-block" type="button" data-save-product>Guardar cambios</button>`;
        const sheet = openSheet({ title: product.shortName || "Editar producto", body });
        sheet.querySelector("[data-save-product]").addEventListener("click", async () => {
          const patch = {
            name: sheet.querySelector("#ap-name").value.trim(),
            price: Number(sheet.querySelector("#ap-price").value),
            stock: Number(sheet.querySelector("#ap-stock").value),
            description: sheet.querySelector("#ap-desc").value.trim(),
          };
          if (!patch.name || patch.price <= 0) {
            toast("Nombre y precio válidos son obligatorios", { type: "error" });
            return;
          }
          await api.updateProduct(product.id, patch);
          closeSheet();
          toast("Producto actualizado", { iconName: "check-circle" });
          navigate(`/admin?tab=products`, { replace: true });
        });
      }),
    );

    // Nuevo producto
    qsa("[data-new-product]", root).forEach((button) =>
      button.addEventListener("click", () => {
        const body = `
          <div class="field">
            <label class="field__label" for="np-name">Nombre</label>
            <div class="field__box"><span class="field__icon">${icon("tag", { size: 15 })}</span>
              <input id="np-name" placeholder="Funda Silicona iPhone 16" /></div>
          </div>
          <div class="field">
            <label class="field__label" for="np-cat">Categoría</label>
            <div class="field__box field__box--select"><span class="field__icon">${icon("grid", {
              size: 15,
            })}</span>
              <select id="np-cat">${store.categories
                .map((cat) => `<option value="${cat.id}">${esc(cat.name)}</option>`)
                .join("")}</select>${icon("chevron-down", { size: 15 })}</div>
          </div>
          <div class="admin-form-grid">
            <div class="field">
              <label class="field__label" for="np-price">Precio (CLP)</label>
              <div class="field__box"><span class="field__icon">${icon("wallet", { size: 15 })}</span>
                <input id="np-price" type="number" min="0" step="100" value="12990" /></div>
            </div>
            <div class="field">
              <label class="field__label" for="np-stock">Stock</label>
              <div class="field__box"><span class="field__icon">${icon("box", { size: 15 })}</span>
                <input id="np-stock" type="number" min="0" step="1" value="10" /></div>
            </div>
          </div>
          <div class="admin-form-grid">
            <div class="field">
              <label class="field__label" for="np-kind">Tipo de arte</label>
              <div class="field__box field__box--select"><span class="field__icon">${icon("sparkles", {
                size: 15,
              })}</span>
                <select id="np-kind">
                  <option value="case">Funda</option><option value="phone">iPhone</option>
                  <option value="buds">Audio</option><option value="watch">Reloj</option>
                  <option value="charger">Cargador</option><option value="cable">Cable</option>
                </select>${icon("chevron-down", { size: 15 })}</div>
            </div>
            <div class="field">
              <label class="field__label" for="np-color">Color</label>
              <div class="field__box"><span class="field__icon">${icon("droplet", { size: 15 })}</span>
                <input id="np-color" value="#b7e33b" /></div>
            </div>
          </div>
          <button class="btn btn-lime btn-block" type="button" data-create-product>Crear producto</button>`;
        const sheet = openSheet({ title: "Nuevo producto", body });
        sheet.querySelector("[data-create-product]").addEventListener("click", async () => {
          const name = sheet.querySelector("#np-name").value.trim();
          const price = Number(sheet.querySelector("#np-price").value);
          if (name.length < 3 || price <= 0) {
            toast("Completa nombre y precio", { type: "error" });
            return;
          }
          const color = sheet.querySelector("#np-color").value.trim() || "#b7e33b";
          await api.createProduct({
            name,
            category: sheet.querySelector("#np-cat").value,
            price,
            stock: Number(sheet.querySelector("#np-stock").value),
            art: { kind: sheet.querySelector("#np-kind").value, color },
            colors: [{ id: "base", name: "Base", hex: color }],
          });
          closeSheet();
          toast("Producto creado y publicado", { iconName: "sparkles" });
          navigate(`/admin?tab=products`, { replace: true });
        });
      }),
    );

    if (query.get("tab") === "orders") {
      // deja el filtro visible sin recargar
      qsa("[data-status-filter]", root).forEach((button) =>
        button.setAttribute("aria-pressed", String(button.dataset.statusFilter === (query.get("status") || "all"))),
      );
    }
  },

  unmount() {},
};
