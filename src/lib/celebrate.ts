/** Lluvia breve de destellos dorados y corazones para celebrar un logro. */
export function celebrate(count = 36) {
  if (typeof document === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.createElement("div");
  layer.className = "celebrate-layer";
  layer.setAttribute("aria-hidden", "true");
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = i % 4 === 0 ? "celebrate-heart" : "celebrate-spark";
    s.style.left = `${Math.random() * 100}%`;
    s.style.setProperty("--drift", `${(Math.random() - 0.5) * 160}px`);
    s.style.animationDelay = `${Math.random() * 400}ms`;
    s.style.animationDuration = `${1400 + Math.random() * 900}ms`;
    layer.appendChild(s);
  }
  document.body.appendChild(layer);
  window.setTimeout(() => layer.remove(), 2800);
}
