import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/playfair-display/500.css";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "../components/SmoothScroll";
import { siteUrl } from "../config/site";

export const metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  icons: { icon: "/varnam-mark.svg" },
  title: "VARNAM GIFTS | Thoughtful Gifts. Lasting Moments.",
  description: "Explore German Silver, Brass, Trending Gifts, and Corporate Gifts from Varnam Gifts. Enquire on WhatsApp. Minimum order: 25 items per product.",
  referrer: "strict-origin-when-cross-origin",
  openGraph: {
    title: "VARNAM GIFTS | Thoughtful Gifts. Lasting Moments.",
    description: "Thoughtfully selected return gifts for weddings, celebrations, and corporate events.",
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "VARNAM GIFTS",
    images: [{ url: "/images/hero.webp", alt: "Thoughtfully selected gifts from VARNAM GIFTS" }],
  },
};

export default function RootLayout({ children }) {
  return <html lang="en-IN"><body><SmoothScroll>{children}</SmoothScroll></body></html>;
}
