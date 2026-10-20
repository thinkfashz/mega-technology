/**
 * docs.js — navegación compartida de Documentd.
 * Genera la barra lateral, marca la página activa, el botón móvil y los
 * botones "copiar" de los bloques de código.
 */

const PAGES = [
  {
    title: "Empezar",
    links: [
      ["index.html", "Inicio"],
      ["screens.html", "Pantallas"],
      ["course.html", "Curso"],
    ],
  },
  {
    title: "Diseño",
    links: [["design-system.html", "Sistema de diseño"]],
  },
  {
    title: "Sistema",
    links: [
      ["architecture.html", "Arquitectura"],
      ["diagram.html", "Conexiones"],
      ["api.html", "API y endpoints"],
      ["android.html", "Android / Kotlin"],
    ],
  },
];

const MARK = `<svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true">
  <defs><linearGradient id="dg-gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f8e3ad"/><stop offset=".45" stop-color="#d3a94f"/><stop offset="1" stop-color="#91681f"/>
  </linearGradient></defs>
  <path d="M5 31V12l8 8 7-9 7 9 8-8v19h-6V22l-6 7h-6l-6-7v9z" fill="url(#dg-gold)"/>
  <rect x="29" y="6" width="6" height="6" rx="1" fill="url(#dg-gold)"/>
</svg>`;

const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();

const nav = PAGES.map(
  (group) => `
    <div class="docs-nav__group">
      <p class="docs-nav__title">${group.title}</p>
      ${group.links
        .map(
          ([href, label]) =>
            `<a href="./${href}"${href === current ? ' aria-current="page"' : ""}>${label}</a>`,
        )
        .join("")}
    </div>`,
).join("");

const mount = document.querySelector("[data-docs-nav]");
if (mount) {
  mount.innerHTML = `
    <aside class="docs-sidebar" id="docs-sidebar" aria-label="Documentación">
      <a class="docs-brand" href="./index.html">
        ${MARK}
        <span><strong>MEGA TECHNOLOGY</strong><span>DOCUMENTD · V4</span></span>
      </a>
      <nav class="docs-nav">${nav}</nav>
      <div class="docs-side-foot">
        <strong>PROTOTIPO LOCAL</strong>
        App + panel admin + API mock. Sin backend obligatorio.
        <p style="margin:8px 0 0"><a href="../app/">Abrir la app →</a></p>
      </div>
    </aside>
    <div class="nav-backdrop" data-close-nav></div>
    <button class="docs-toggle" type="button" aria-label="Abrir menú de documentación" aria-expanded="false" data-toggle-nav>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <path d="M4 7h16M4 12h16M4 17h16"/>
      </svg>
    </button>`;
}

const body = document.body;
const toggle = document.querySelector("[data-toggle-nav]");

function setNav(open) {
  body.classList.toggle("nav-open", open);
  toggle?.setAttribute("aria-expanded", String(open));
}

toggle?.addEventListener("click", () => setNav(!body.classList.contains("nav-open")));
document.querySelector("[data-close-nav]")?.addEventListener("click", () => setNav(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setNav(false);
});

/* Copiar bloques de código */
document.querySelectorAll("pre").forEach((pre) => {
  const button = document.createElement("button");
  button.className = "copy";
  button.type = "button";
  button.textContent = "Copiar";
  button.addEventListener("click", async () => {
    const text = pre.querySelector("code")?.innerText ?? pre.innerText;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copiado";
      setTimeout(() => (button.textContent = "Copiar"), 1400);
    } catch {
      button.textContent = "No disponible";
    }
  });
  pre.appendChild(button);
});

/* Fecha de build visible si la página la declara */
document.querySelectorAll("[data-build]").forEach((node) => {
  node.textContent = new Date().toISOString().slice(0, 10);
});
