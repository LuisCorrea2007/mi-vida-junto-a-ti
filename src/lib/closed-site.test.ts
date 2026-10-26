import { test } from "node:test";
import { strict as assert } from "node:assert";
import { closedSiteResponse } from "./closed-site";

test("all pages and server calls are permanently closed without account or URL exceptions", () => {
  for (const path of ["/", "/auth", "/panel", "/dados", "/rituales", "/galeria", "/api/chat", "/api/public/test", "/_serverFn/test", "/missing", "/?admin=true&unlock=true&sw=off"]) {
    for (const method of ["GET", "POST", "PUT", "DELETE", "OPTIONS"]) {
      const response = closedSiteResponse(new Request(`https://example.test${path}`, {
        method,
        headers: { Authorization: "Bearer test-session", Cookie: "unlocked=true" },
      }));
      assert.equal(response.status, 410, `${method} ${path}`);
      assert.equal(response.headers.get("Cache-Control"), "no-store, max-age=0");
    }
  }
});

test("HEAD requests remain closed without a response body", () => {
  const response = closedSiteResponse(new Request("https://example.test/panel", { method: "HEAD" }));
  assert.equal(response.status, 410);
  assert.equal(response.body, null);
});