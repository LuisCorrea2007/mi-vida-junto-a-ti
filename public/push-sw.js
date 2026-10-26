// Retirement cleanup: no offline pages and no fetch handler.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil((async () => {
  try {
    const names = await caches.keys();
    await Promise.allSettled(names.filter((name) => name.startsWith("nuestro-espacio")).map((name) => caches.delete(name)));
    await self.clients.claim();
    const windows = await self.clients.matchAll({ type: "window" });
    await Promise.allSettled(windows.map((client) => client.navigate(client.url)));
  } finally {
    await self.registration.unregister();
  }
})()));
