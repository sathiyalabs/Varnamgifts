import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { collections } from "../lib/catalog.js";

const html = await readFile("out/index.html", "utf8");
assert.match(html, /VARNAM GIFTS/);
assert.equal(collections.length, 4);
assert.equal(collections.reduce((sum, c) => sum + c.products.length, 0), 12);
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.has(fragment), `Broken anchor: ${fragment}`);
for (const collection of collections) {
  assert(ids.has(collection.id));
  for (const product of collection.products) assert((await stat(`public${product.image}`)).size > 0);
}
for (const [, url] of html.matchAll(/(?:src|href)="(\/(?!\/)[^"?#]+)[^"]*"/g)) {
  assert((await stat(path.join("out", url))).isFile(), `Missing asset: ${url}`);
}
const policy = html.match(/<meta data-export-csp[^>]*content="([^"]+)"/)?.[1];
assert(policy, "Missing content security policy");
assert(!policy.includes("unsafe-eval"));
assert(!policy.match(/script-src[^;]*unsafe-inline/));
for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (/\bsrc\s*=/i.test(attrs) || !body.trim()) continue;
  assert(policy.includes(createHash("sha256").update(body).digest("base64")), "Inline script hash mismatch");
}
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await inspect(file); continue; }
    if (!/\.(?:html|js|css|svg|txt|json)$/.test(file)) continue;
    const contents = await readFile(file, "utf8");
    // Reconstruct the retired name so the audit code itself stays brand-clean.
    assert(!new RegExp(["ves", "hba"].join(""), "i").test(contents), `Retired branding in ${file}`);
    assert(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(contents), `Private key in ${file}`);
    assert(!/\b(?:sk_live_|sk_test_|AKIA)[A-Za-z0-9]{16,}\b/.test(contents), `Possible credential in ${file}`);
  }
}
await inspect("out");
const rawHtmlProp = ["dangerously", "SetInnerHTML"].join("");
for (const directory of ["app", "components", "lib"]) {
  for (const file of await readdir(directory, { recursive: true })) {
    if (!/\.(?:js|jsx)$/.test(file)) continue;
    const source = await readFile(path.join(directory, file), "utf8");
    assert(!source.includes(rawHtmlProp), `Raw HTML rendering in ${directory}/${file}`);
  }
}
console.log("PASS: branding, 4 collections, 12 catalogue images, anchors, exported assets, CSP hashes, and credential-pattern scan.");
