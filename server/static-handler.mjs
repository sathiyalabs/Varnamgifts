// Read-only asset service. No filesystem, origin fetches, cookies or credentials.
export function createStaticHandler(assets, security) {
  const decoded = new Map();
  return {
    async fetch(request) {
      const url = new URL(request.url);
      if (url.protocol !== "https:") {
        url.protocol = "https:";
        return new Response(null, { status: 308, headers: { ...security, Location: url.href } });
      }
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method not allowed", { status: 405, headers: { ...security, Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" } });
      }
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); }
      catch { return new Response(null, { status: 400, headers: security }); }
      if (pathname === "/index.html") return new Response(null, { status: 308, headers: { ...security, Location: "/" } });
      if (pathname === "/") pathname = "/index.html";
      const found = Object.hasOwn(assets, pathname);
      const asset = found ? assets[pathname] : assets["/404.html"];
      const status = found && !["/404.html", "/_not-found.html"].includes(pathname) ? 200 : 404;
      const headers = new Headers(security);
      headers.set("Content-Type", asset.type);
      headers.set("ETag", asset.etag);
      if (asset.csp) headers.set("Content-Security-Policy", asset.csp);
      if (status === 200) headers.set("Cache-Control", pathname.startsWith("/_next/static/") ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate");
      if (status === 200 && request.headers.get("If-None-Match") === asset.etag) return new Response(null, { status: 304, headers });
      if (request.method === "HEAD") return new Response(null, { status, headers });
      if (!decoded.has(asset.etag)) decoded.set(asset.etag, Uint8Array.from(atob(asset.data), (character) => character.charCodeAt(0)));
      return new Response(decoded.get(asset.etag), { status, headers });
    },
  };
}
