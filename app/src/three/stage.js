/**
 * stage.js — campo de luz 3D para el hero (Three.js).
 * Un solo renderer, baja densidad, pausa fuera de pantalla.
 * Si WebGL no está disponible o el usuario pide menos movimiento,
 * la escena queda en CSS y la app sigue igual.
 */

import { prefersReducedMotion } from "../core/dom.js";

export function mountStage(container, { particles = 210 } = {}) {
  const noop = { destroy() {} };
  if (!container) return noop;
  if (!window.THREE || prefersReducedMotion()) {
    container.classList.add("is-fallback");
    return noop;
  }

  let renderer;
  try {
    renderer = new window.THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
  } catch {
    container.classList.add("is-fallback");
    return noop;
  }

  const THREE = window.THREE;
  const mobile = window.matchMedia("(max-width: 600px)").matches;
  const total = mobile ? Math.round(particles * 0.62) : particles;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 40);
  camera.position.set(0, 0, 7.2);

  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const lime = new THREE.Color("#c8f542");
  const gold = new THREE.Color("#d3a94f");
  const dim = new THREE.Color("#5c6470");

  for (let i = 0; i < total; i += 1) {
    const radius = 2.2 + Math.random() * 3.6;
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius * (0.7 + Math.random() * 0.6);
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6.2;
    positions[i * 3 + 2] = Math.sin(angle) * radius * 0.5 - Math.random() * 1.4;
    const pick = Math.random();
    const color = pick > 0.72 ? lime : pick > 0.42 ? gold : dim;
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: mobile ? 0.045 : 0.038,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const ringGeo = new THREE.TorusGeometry(1.85, 0.006, 3, 90);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xd3a94f,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.set(1.15, -0.25, 0.2);
  scene.add(ring);

  const target = { x: 0, y: 0 };
  let frame = 0;
  let visible = true;
  let disposed = false;

  function resize() {
    const { clientWidth, clientHeight } = container;
    if (!clientWidth || !clientHeight) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }

  function loop(time) {
    if (disposed) return;
    if (!visible) {
      frame = requestAnimationFrame(loop);
      return;
    }
    const t = time * 0.00012;
    points.rotation.y = t * 1.4;
    points.rotation.x = Math.sin(t * 1.8) * 0.06;
    ring.rotation.z += 0.0015;
    camera.position.x += (target.x * 0.45 - camera.position.x) * 0.03;
    camera.position.y += (-target.y * 0.3 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(loop);
  }

  const onPointer = (event) => {
    const rect = container.getBoundingClientRect();
    target.x = (event.clientX - rect.left) / rect.width - 0.5;
    target.y = (event.clientY - rect.top) / rect.height - 0.5;
  };

  const onVisibility = () => {
    visible = !document.hidden;
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
    },
    { threshold: 0.02 },
  );
  observer.observe(container);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  container.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);

  resize();
  frame = requestAnimationFrame(loop);

  return {
    destroy() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
