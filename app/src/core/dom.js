/**
 * dom.js — helpers de DOM mínimos. Nada de framework, nada de magia.
 */

export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** Delegación de eventos: on(view, "click", "[data-action]", handler) */
export function on(root, type, selector, handler) {
  root.addEventListener(type, (event) => {
    const target = event.target.closest(selector);
    if (!target || !root.contains(target)) return;
    handler(event, target);
  });
}

export function setHTML(root, html) {
  root.innerHTML = html;
  return root;
}

/** Anima un número de 0 a `to` (para KPIs). */
export function countUp(node, to, { duration = 900, format = (v) => String(Math.round(v)) } = {}) {
  if (!node) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    node.textContent = format(to);
    return;
  }
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    node.textContent = format(to * eased);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export function debounce(fn, wait = 180) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
