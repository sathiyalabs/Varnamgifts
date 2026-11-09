import { whatsappContact } from "./catalog.js";

export function safeAnchorProps(href) {
  if (typeof href !== "string") return {};
  if (/^(?:#[a-z\d-]*|\/)$/i.test(href)) return { href };

  // The storefront's only external destination is the confirmed order inbox.
  if (href === whatsappContact || href.startsWith(whatsappContact + "?text=")) {
    const url = new URL(href);
    const keys = [...url.searchParams.keys()];
    if (!url.hash && (keys.length === 0 || (keys.length === 1 && keys[0] === "text"))) {
      return { href, target: "_blank", rel: "noopener noreferrer" };
    }
  }
  return {};
}
