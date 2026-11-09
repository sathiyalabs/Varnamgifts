import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { framingPolicy, securityHeaders } from "../config/security.js";

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2" };
const assets = {};
async function collect(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) { await collect(file); continue; }
    const extension = path.extname(file);
    if (!types[extension]) throw new Error(`Unexpected export asset: ${file}`);
    const bytes = await readFile(file);
    const csp = extension === ".html" ? bytes.toString().match(/<meta data-export-csp[^>]*content="([^"]+)"/)?.[1] : null;
    if (extension === ".html" && !csp) throw new Error(`Missing HTML policy: ${file}`);
    assets["/" + path.relative("out", file).split(path.sep).join("/")] = { type: types[extension], data: bytes.toString("base64"), etag: '"' + createHash("sha256").update(bytes).digest("hex") + '"', csp: csp ? csp + "; " + framingPolicy : null };
  }
}
await collect("out");
const handler = await readFile("server/static-handler.mjs", "utf8");
const bundle = `const assets = ${JSON.stringify(assets)};\n${handler}\nexport default createStaticHandler(assets, ${JSON.stringify(securityHeaders)});\n`;
const compressed = gzipSync(bundle).length;
if (compressed > 9_000_000) throw new Error("Worker exceeds the compressed asset budget; move assets to dedicated storage before adding more.");
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await writeFile("dist/server/index.js", bundle);
await writeFile("dist/.openai/hosting.json", await readFile(".openai/hosting.json"));
console.log(`Built read-only HTTPS asset worker: ${Object.keys(assets).length} assets; ${(compressed / 1_000_000).toFixed(2)} MB compressed.`);
