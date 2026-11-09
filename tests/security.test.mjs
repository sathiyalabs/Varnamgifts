import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { collections } from "../lib/catalog.js";
import { safeAnchorProps } from "../lib/safe-links.js";
import handler from "../dist/server/index.js";

const origin = "https://varnam.example";
const get = (pathname, init) => handler.fetch(new Request(origin + pathname, init));

test("public home is accessible without cookies or authentication", async () => {
  const response = await get("/");
  assert.equal(response.status, 200);
  assert.match(await response.text(), /VARNAM GIFTS/);
  assert.equal(response.headers.get("Set-Cookie"), null);
});
test("HTML headers include script policy, framing, HSTS and MIME protections", async () => {
  const r = await get("/");
  assert.match(r.headers.get("Strict-Transport-Security"), /max-age=31536000/);
  assert.equal(r.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(r.headers.get("X-Frame-Options"), "DENY");
  assert.equal(r.headers.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  const csp = r.headers.get("Content-Security-Policy");
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /script-src-attr 'none'/);
  assert.doesNotMatch(csp, /script-src[^;]*(?:unsafe-inline|unsafe-eval)/);
  assert.match(r.headers.get("Permissions-Policy"), /clipboard-write=\(self\)/);
  const body = await r.text();
  for (const [, attributes, contents] of body.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/i.test(attributes) || !contents.trim()) continue;
    assert(csp.includes(createHash("sha256").update(contents).digest("base64")));
  }
});
test("HEAD returns the same headers with no body", async () => {
  const r = await get("/", { method: "HEAD" });
  assert.equal(r.status, 200);
  assert.equal(await r.text(), "");
  assert.equal(r.headers.get("ETag"), (await get("/")).headers.get("ETag"));
});
test("ETag revalidation returns 304", async () => {
  const etag = (await get("/")).headers.get("ETag");
  const r = await get("/", { headers: { "If-None-Match": etag } });
  assert.equal(r.status, 304);
  assert.equal(await r.text(), "");
});
test("images are byte-identical to the export", async () => {
  const r = await get("/images/hero.webp");
  assert.equal(r.headers.get("Content-Type"), "image/webp");
  assert.deepEqual(Buffer.from(await r.arrayBuffer()), await readFile("out/images/hero.webp"));
});
test("unknown paths return a branded 404 instead of a false 200", async () => {
  const r = await get("/missing-page");
  assert.equal(r.status, 404);
  assert.match(await r.text(), /VARNAM GIFTS/);
  assert.equal(r.headers.get("Cache-Control"), "no-store");
});
test("source, environment files and prototype property paths are not exposed", async () => {
  for (const path of ["/.env", "/.git/config", "/package.json", "/lib/catalog.js", "/server/static-handler.mjs", "/constructor", "/__proto__"]) {
    assert.equal((await get(path)).status, 404, path);
  }
});
test("POST, PUT and DELETE cannot mutate the catalogue", async () => {
  for (const method of ["POST", "PUT", "DELETE"]) {
    const r = await get("/", { method });
    assert.equal(r.status, 405);
    assert.equal(r.headers.get("Allow"), "GET, HEAD");
  }
});
test("query strings are not reflected into HTML", async () => {
  const marker = "<script>launchProbe()</script>";
  assert.equal((await get("/?q=" + encodeURIComponent(marker))).status, 200);
  assert(!(await (await get("/?q=" + encodeURIComponent(marker))).text()).includes(marker));
});
test("malformed URI encoding fails safely", async () => assert.equal((await get("/%zz")).status, 400));
test("HTTP redirects to HTTPS on the same host", async () => {
  const r = await handler.fetch(new Request("http://varnam.example/?x=1"));
  assert.equal(r.status, 308);
  assert.equal(r.headers.get("Location"), "https://varnam.example/?x=1");
});
test("index alias has a fixed local redirect", async () => {
  const r = await get("/index.html?redirect=https://invalid.example");
  assert.equal(r.status, 308);
  assert.equal(r.headers.get("Location"), "/");
});
test("sitemap and robots files are available", async () => {
  assert.equal((await get("/robots.txt")).status, 200);
  const r = await get("/sitemap.xml");
  assert.equal(r.status, 200);
  assert.match(await r.text(), /<urlset/);
});
test("all 12 product links contain the exact Varnam WhatsApp draft and 25-item minimum", async () => {
  const html = await (await get("/")).text();
  const cards = [...html.matchAll(/<a\b[^>]*>/g)]
    .map(([tag]) => tag)
    .filter(tag => tag.match(/\bclass="([^"]*)"/)?.[1].split(" ").includes("product-card"));
  assert.equal(cards.length, 12);
  for (const [index, product] of collections.flatMap(collection => collection.products).entries()) {
    const href = cards[index].match(/\bhref="([^"]*)"/)?.[1].replaceAll("&#x27;", "'");
    const url = new URL(href);
    assert.equal(url.origin + url.pathname, "https://wa.me/917305465777");
    assert.equal(url.searchParams.get("text"),
      "Hello Varnam Gifts! I am interested in ordering the '" + product.name +
      "'. The minimum order is 25 items. Could you please share the pricing and bulk availability?");
  }
  assert.equal([...html.matchAll(/class="product-cap">Minimum order: (?:<!-- -->)?25</g)].length, 12);
});

test("every external link opens with opener and referrer isolation", async () => {
  const html = await (await get("/")).text();
  const externalLinks = [...html.matchAll(/<a\b[^>]*\bhref="https?:[^"]*"[^>]*>/g)];
  assert(externalLinks.length >= 12);
  for (const [tag] of externalLinks) {
    assert.match(tag, /href="https:\/\/wa\.me\/917305465777(?:[?"])/);
    assert.match(tag, /target="_blank"/);
    assert.match(tag, /rel="noopener noreferrer"/);
  }
});

test("unsafe link schemes, lookalike hosts and wrong inboxes are rejected", () => {
  for (const href of [
    "javascript:alert(1)", "data:text/html,Hello", "//example.com",
    "https://wa.me.example.com/917305465777", "https://wa.me/917305465778",
    "https://wa.me/917305465777?text=hello&redirect=https://example.com",
  ]) {
    assert.deepEqual(safeAnchorProps(href), {}, href);
  }
  assert.deepEqual(safeAnchorProps("#brass"), { href: "#brass" });
});
