import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pagePolicy } from "../config/security.js";

// A static export has no request-time nonce. Hash the exact inline scripts
// emitted by Next, and place the policy before any executable content.
async function protect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await protect(file); continue; }
    if (!file.endsWith(".html")) continue;
    let html = await readFile(file, "utf8");
    html = html.replace(/<meta data-export-csp[^>]*>/g, "");
    const hashes = new Set();
    for (const [, attributes, contents] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=/i.test(attributes) || !contents.trim()) continue;
      hashes.add(`'sha256-${createHash("sha256").update(contents).digest("base64")}'`);
    }
    const policy = pagePolicy([...hashes]);
    if (!html.includes("<head>")) throw new Error(`Missing head: ${file}`);
    html = html.replace("<head>", `<head><meta data-export-csp http-equiv="Content-Security-Policy" content="${policy}">`);
    await writeFile(file, html);
  }
}
await protect("out");
console.log("Export protected with per-page CSP script hashes.");
