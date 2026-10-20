/**
 * motion.js — movimiento de la app con GSAP + ScrollTrigger.
 * Reglas:
 *  - Todo respeta prefers-reduced-motion.
 *  - Cada pantalla llama a cleanup() en unmount para no dejar triggers vivos.
 *  - Si GSAP no cargó, cae a IntersectionObserver: la app nunca queda en blanco.
 */

import { prefersReducedMotion } from "../core/dom.js";

let gsapCtx = null;
let scrollTrigger = null;
let io = null;
let safetyTimer = null;

function gsapReady() {
  return Boolean(window.gsap && window.ScrollTrigger);
}

export function setupMotion() {
  if (!gsapReady()) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  scrollTrigger = ScrollTrigger;
  // Marca de que GSAP está listo: recién entonces el CSS oculta los bloques
  // para animarlos. Si la librería falla, el contenido queda visible.
  document.documentElement.classList.add("gsap-ready");
}

/**
 * Revela [data-reveal] dentro de `scope`, con stagger por bloque.
 * Red de seguridad: si el trigger no dispara, el contenido se muestra igual.
 */
export function reveal(scope = document) {
  const nodes = Array.from(scope.querySelectorAll("[data-reveal]"));
  if (!nodes.length) return;
  const reduce = prefersReducedMotion();

  if (reduce || !gsapReady()) {
    if (reduce) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }
    // Fallback: IntersectionObserver
    io?.disconnect();
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { root: scope.closest(".view") || null, rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    nodes.forEach((n) => io.observe(n));
    return;
  }

  const view = scope.closest(".view") || scope;
  nodes.forEach((node) => node.classList.add("is-in"));
  gsapCtx?.add(() => {
    const groups = new Map();
    nodes.forEach((node) => {
      const parent = node.parentElement;
      const list = groups.get(parent) || [];
      list.push(node);
      groups.set(parent, list);
    });
    groups.forEach((list) => {
      gsap.fromTo(
        list,
        { opacity: 0, y: 18, scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.62,
          ease: "power3.out",
          stagger: 0.055,
          scrollTrigger: {
            trigger: list[0],
            scroller: view,
            start: "top 92%",
            once: true,
          },
        },
      );
    });
  });

  // Red de seguridad: si ScrollTrigger no dispara, nada queda invisible.
  clearTimeout(safetyTimer);
  safetyTimer = setTimeout(() => {
    nodes.forEach((node) => {
      if (node.style.opacity === "0") {
        window.gsap?.set(node, { opacity: 1, y: 0, scale: 1, clearProps: "transform" });
      }
    });
  }, 1400);
}

/** Entrada de pantalla. */
export function pageIn(scope) {
  if (!scope || prefersReducedMotion() || !gsapReady()) return;
  const { gsap } = window;
  gsapCtx?.add(() => {
    gsap.fromTo(
      scope.querySelectorAll("[data-enter]"),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.06, delay: 0.04 },
    );
  });
}

/** Tilt 3D suave en las tarjetas (solo punteros finos). */
export function tiltCards(scope = document) {
  if (prefersReducedMotion()) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const nodes = scope.querySelectorAll("[data-tilt]");
  nodes.forEach((node) => {
    let raf = 0;
    const move = (event) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        node.style.setProperty("--tx", `${(-y * 8).toFixed(2)}deg`);
        node.style.setProperty("--ty", `${(x * 10).toFixed(2)}deg`);
        node.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
        node.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      node.style.setProperty("--tx", "0deg");
      node.style.setProperty("--ty", "0deg");
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    gsapCtx?.add(() => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    });
  });
}

/** Parallax sutil para el hero (la imagen se mueve más lento que el scroll). */
export function heroParallax(scope, selector = "[data-parallax]") {
  if (prefersReducedMotion() || !gsapReady()) return;
  const { gsap } = window;
  const view = scope.closest(".view") || scope;
  gsapCtx?.add(() => {
    scope.querySelectorAll(selector).forEach((node) => {
      const depth = Number(node.dataset.parallax) || 0.12;
      gsap.to(node, {
        yPercent: depth * 100,
        ease: "none",
        scrollTrigger: { trigger: scope, scroller: view, start: "top top", end: "bottom top", scrub: 0.6 },
      });
    });
  });
}

/** Marca un contexto de animación; llamar antes de animar en cada pantalla. */
export function begin(scope) {
  if (!gsapReady()) return;
  gsapCtx = window.gsap.context(() => {}, scope);
}

/** Limpia animaciones y observers de la pantalla anterior. */
export function cleanup() {
  io?.disconnect();
  io = null;
  clearTimeout(safetyTimer);
  safetyTimer = null;
  if (gsapCtx) {
    try {
      gsapCtx.revert();
    } catch {
      /* noop */
    }
    gsapCtx = null;
  }
  scrollTrigger?.refresh?.();
}
