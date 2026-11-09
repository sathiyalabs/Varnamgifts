import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";
import { framingPolicy, pagePolicy, securityHeaders } from "./config/security.js";

export default function nextConfig(phase) {
  const common = { poweredByHeader: false, images: { unoptimized: true } };

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    const headers = {
      ...securityHeaders,
      "Content-Security-Policy": `${pagePolicy([], { development: true })}; ${framingPolicy}`,
    };
    return {
      ...common,
      async headers() {
        return [{ source: "/:path*", headers: Object.entries(headers).map(([key, value]) => ({ key, value })) }];
      },
    };
  }

  // The static export has no Next request handler. Its Worker applies the
  // shared production headers and the export's exact script hashes.
  return { ...common, output: "export" };
}
