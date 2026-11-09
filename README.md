# Varnam Gifts

A festive gift catalogue built with the Next.js App Router, Tailwind CSS, Framer Motion, GSAP and Lenis. Product cards open WhatsApp with the named item and the 25-item minimum order.

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Run `npm run build` to export the site to `out/`, generate per-page CSP hashes, build the HTTPS asset worker in `dist/`, and run the test suite. For production, deploy the generated worker to serve the export with its full HTTP security policy. When using another static host, configure equivalent response headers at that host. Set `NEXT_PUBLIC_SITE_URL` to your HTTPS origin before building for another domain.

## Source map

| File | Responsibility |
| --- | --- |
| components/SmoothScroll.jsx | React Lenis at 0.05 lerp, a shared GSAP ticker, and reduced-motion handling |
| components/BrandMark.jsx | Shared header and footer monogram using public/varnam-mark.svg |
| components/Navbar.jsx | Absolute-top glass header, product search, viewport-bounded collection drawer, and magnetic actions |
| components/HeroCinematic.jsx | Carousel, GSAP text masks, Ken Burns zoom, and pause controls |
| components/ProductCard3D.jsx | Pointer tilt, sheen, spring drawer, quantity badge, and exact WhatsApp draft |
| components/HomePage.jsx | Search filtering and scoped GSAP section animations |
| components/CategorySection.jsx | Semantic section markup and responsive product grids |
| components/Footer.jsx | Varnam Gifts contact details, collection links, and WhatsApp call to action |
| components/CustomCursor.jsx | GSAP gift cursor with interactive scale and rotation |
| lib/catalog.js | Four collections, 12 products, minimum order, and menu order links |
| app/globals.css | Responsive layout, seasonal palette, and animation presentation |
| next.config.js and config/security.js | Next.js and shared environment-specific HTTP security policies |
| lib/safe-links.js | Same-origin navigation and allowlisted, isolated WhatsApp links |
| server/static-handler.mjs | Public HTTPS delivery, CSP, response headers, cache and 404 handling |

## Images and ordering

Catalogue photos ship locally. A bundled 720 × 900 Unsplash photo supplies the 4:5 fallback. Set `NEXT_PUBLIC_USE_UNSPLASH_PLACEHOLDERS=1` in `.env.local` to render the placeholder across the product grid. Image source: https://images.unsplash.com/photo-1513201099705-a9746e1e201f

Each card displays a minimum order of 25 items and opens a product-specific WhatsApp draft at +91 7305465777. Shoppers can edit their drafts before sending, so confirm the minimum when accepting orders in WhatsApp.

## Checks

Run `npm run check` to validate an existing export. The production build additionally exercises the worker and verifies all 12 rendered WhatsApp drafts. Run the public smoke checks after deployment with:

```sh
python3 scripts/check-live.py --url https://varnam-gifts-motion.thanish3475.chatgpt.site/
```

See TEST_REPORT.md for the release checks and their scope.
