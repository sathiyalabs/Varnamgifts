export const framingPolicy = "frame-ancestors 'none'";

export const securityHeaders = {
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), clipboard-read=(), clipboard-write=(self)",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-DNS-Prefetch-Control": "off",
  "Content-Security-Policy": `default-src 'none'; ${framingPolicy}; base-uri 'none'; form-action 'none'`,
  "Cache-Control": "no-store",
};

export function pagePolicy(scriptHashes = [], { development = false } = {}) {
  const scripts = development ? ["'unsafe-inline'", "'unsafe-eval'"] : scriptHashes;
  return [
    "default-src 'self'",
    ["script-src 'self'", ...scripts].join(" "),
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    development ? "style-src-elem 'self' 'unsafe-inline'" : "style-src-elem 'self'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    development ? "connect-src 'self' ws: wss:" : "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-src 'none'",
    "worker-src 'none'",
  ].join("; ");
}
