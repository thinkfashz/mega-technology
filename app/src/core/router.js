/**
 * router.js — enrutador hash-based, sin dependencias.
 *
 * Contrato de pantalla (default export):
 *   {
 *     title: "Catálogo",
 *     render(ctx) -> string HTML,
 *     mount(root, ctx) -> void|Promise,
 *     unmount() -> void
 *   }
 *
 * ctx = { params, query, path, navigate, store, api, toast, openSheet }
 */

export function createRouter({ routes, view, buildContext, onBefore, onAfter }) {
  let current = null;
  let currentKey = "";
  let token = 0;
  const scrollMemory = new Map();

  const rawHash = () => location.hash.replace(/^#/, "") || "/home";

  function parse(raw) {
    const [pathname, queryString = ""] = raw.split("?");
    const parts = pathname.split("/").filter(Boolean);
    const path = `/${parts[0] || "home"}`;
    return {
      path,
      parts,
      params: { id: parts[1] ? decodeURIComponent(parts[1]) : undefined },
      query: new URLSearchParams(queryString),
      raw,
    };
  }

  async function render() {
    const raw = rawHash();
    const route = routes.find((r) => r.path === parse(raw).path) ?? routes[0];
    const parsed = parse(raw);
    const myToken = ++token;

    // guarda el scroll de la pantalla que se va
    if (currentKey) scrollMemory.set(currentKey, view.scrollTop);

    let module;
    let screen;
    try {
      module = await route.load();
      screen = module.default;
    } catch (error) {
      console.error("[mega] no se pudo cargar la pantalla", route.path, error);
      view.innerHTML = `<div class="screen-pad" style="padding-top:28px">
        <div class="empty"><div class="empty__icon">!</div>
        <p class="empty__title">No se pudo abrir esta pantalla</p>
        <p class="text-sm">${route.path}</p>
        <a class="btn btn-lime btn-sm" href="#/home">Volver al inicio</a></div></div>`;
      return;
    }

    // Una navegación nueva invalida la anterior (evita carreras).
    if (myToken !== token) return;

    if (current?.unmount) {
      try {
        current.unmount();
      } catch (error) {
        console.warn("[mega] unmount", error);
      }
    }

    current = screen;
    currentKey = raw;
    onBefore?.(route, screen, parsed);

    const ctx = buildContext(parsed, route);

    view.classList.add("is-leaving");
    await new Promise((r) => setTimeout(r, 60));

    let html = "";
    try {
      html = (await screen.render?.(ctx)) ?? "";
    } catch (error) {
      console.error("[mega] render", route.path, error);
      html = `<div class="screen-pad" style="padding-top:28px"><div class="empty">
        <p class="empty__title">Error al renderizar</p>
        <p class="text-sm">${error.message}</p></div></div>`;
    }

    if (myToken !== token) return;

    view.innerHTML = html;
    view.classList.remove("is-leaving");
    view.classList.add("is-entering");
    view.scrollTop = scrollMemory.get(raw) ?? 0;

    try {
      await screen.mount?.(view, ctx);
    } catch (error) {
      console.error("[mega] mount", route.path, error);
    }

    requestAnimationFrame(() => view.classList.remove("is-entering"));
    onAfter?.(route, screen, parsed);
    document.title = `${screen.title || "MEGA TECHNOLOGY"} · MEGA TECHNOLOGY`;
  }

  function navigate(to, { replace = false } = {}) {
    const target = to.startsWith("#") ? to : `#${to.startsWith("/") ? to : `/${to}`}`;
    if (replace) {
      history.replaceState(null, "", target);
      render();
    } else if (location.hash === target) {
      render();
    } else {
      location.hash = target;
    }
  }

  window.addEventListener("hashchange", render);
  window.addEventListener("popstate", render);

  // Recuerda el scroll mientras el usuario se mueve.
  let scrollTimer;
  view.addEventListener(
    "scroll",
    () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (currentKey) scrollMemory.set(currentKey, view.scrollTop);
      }, 120);
    },
    { passive: true },
  );

  render();

  return { navigate, refresh: render, get current() { return currentKey; } };
}
