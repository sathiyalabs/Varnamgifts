import { siteUrl } from "../config/site";
export const dynamic = "force-static";
export default function sitemap() {
  return [{ url: siteUrl + "/" }];
}
