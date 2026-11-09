export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://varnam-gifts-motion.thanish3475.chatgpt.site").replace(/\/$/, "");
const parsed = new URL(siteUrl);
if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be a bare HTTPS origin.");
}
