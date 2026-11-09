# Varnam Gifts release checks

## Navigation and motion

Chromium tested the production export at desktop 1363px, tablet 768px, mobile portrait 320px and 390px, and mobile landscape 667 × 375px. The navbar was visible at scrollY 0, hidden after leaving the top and again visible on return to 0. On desktop, reversing from scrollY 859 to 819 kept it hidden and inert. A direct link to Corporate Gifts loaded with the navbar hidden.

On mobile, the open drawer closed on the first downward page scroll and stayed closed after returning to the top. The drawer fit within the narrow portrait and short landscape viewports, Escape closed it, and the tested widths had no horizontal overflow. The root uses overscroll-behavior-y: none. These were Chromium viewport tests. Physical iOS Safari address-bar and touch behavior were outside the test scope.

The export loaded React Lenis and retained its GSAP-driven hero masks, themed collection reveals and desktop gift cursor. The product effect uses Framer Motion 3D transforms, an overlay glare and a spring WhatsApp drawer. The browser console showed no site errors during the checks.

## Application and delivery security

- The production build, asset and CSP-hash validation, and 16 automated tests passed.
- The public HTTPS probe checks headers, framing denial, status codes, non-reflection of query payloads and blocked access to source, Git and environment files. Its results are in verification/public-checks.json.
- Production CSP binds inline Next.js scripts to their SHA-256 hashes, denies inline event handlers, and permits inline style attributes for animation transforms. The production worker serves it as an HTTP header with framing denial. It serves the static catalogue without an application origin, login, payment API, or writable endpoint.
- Source and export checks covered unsafe HTML rendering, credential patterns, and isolated, allowlisted external links. All 12 product links target the supplied WhatsApp number and use the confirmed 25-item minimum in the draft.
- npm audit reported zero known vulnerabilities in the audited dependency tree. See verification/npm-audit.json. The application uses Next.js 16.4.5 and disables runtime image optimization.

The checks cover the storefront and its deployment. They do not constitute independent penetration testing. WhatsApp delivery and recipient ownership were outside scope.
