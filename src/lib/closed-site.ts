/** Unconditional retirement response. No account, query or path can unlock it. */
export function closedSiteResponse(request: Request): Response {
  return new Response(request.method === "HEAD" ? null : CLOSED_SITE_HTML, {
    status: 410,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'self' https://*.lovable.dev https://*.lovable.app",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "Clear-Site-Data": '"cache"',
    },
  });
}

const CLOSED_SITE_HTML = `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Página eliminada — Nuestro Espacio</title>
<meta name="description" content="Nuestro Espacio ha cerrado de forma permanente. Esta página ya no está disponible.">
<meta property="og:title" content="Página eliminada — Nuestro Espacio">
<meta property="og:description" content="Este espacio ha cerrado de forma permanente.">
<meta property="og:type" content="website"><meta name="twitter:card" content="summary">
<meta name="robots" content="noindex, nofollow, noarchive">
<style>
:root{color-scheme:dark;--background:#160f12;--foreground:#f2e9e9;--muted:#b5a6ab;--accent:#c65d72;--border:#412b33}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--background);color:var(--foreground)}
body{font-family:Arial,sans-serif;letter-spacing:0}main{min-height:100svh;display:flex;align-items:center;justify-content:center;padding:40px 24px}
section{width:100%;max-width:580px;text-align:center}svg{width:64px;height:64px;color:var(--accent);margin-bottom:32px}
.brand{font-size:12px;color:var(--muted);margin:0 0 20px}h1{font-family:Georgia,serif;font-weight:400;font-size:48px;line-height:1.12;margin:0 0 24px;overflow-wrap:break-word}
p{font-size:16px;line-height:1.7;margin:0;color:var(--muted)}.rule{width:48px;height:1px;background:var(--border);margin:32px auto}.status{font-size:12px}
@media(max-width:480px){h1{font-size:36px}}
</style></head><body><main><section aria-labelledby="closed-title">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="13" y="27" width="38" height="29" rx="5"/><path d="M22 27V18a10 10 0 0 1 20 0v9"/><circle cx="32" cy="40" r="2"/><path d="M32 42v6"/></svg>
<p class="brand">Nuestro Espacio</p><h1 id="closed-title">Página eliminada</h1>
<p>Este espacio ha cerrado de forma permanente.<br>La página ya no está disponible y no volverá a abrir.</p>
<div class="rule" aria-hidden="true"></div><p class="status">Cierre definitivo · 410</p>
</section></main></body></html>`;