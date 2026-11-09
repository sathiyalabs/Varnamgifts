#!/usr/bin/env python3
"""Small, non-destructive public launch checks. Uses no cookies or credentials."""
import argparse
import concurrent.futures
import datetime
import json
from html.parser import HTMLParser
from urllib.parse import parse_qs, urlparse
import ssl
import urllib.error
import urllib.request
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--url", required=True)
parser.add_argument("--output", default="public-checks.json")
args = parser.parse_args()
origin = args.url.rstrip("/")
if not origin.startswith("https://"):
    raise SystemExit("Use the public HTTPS origin.")
required_headers = ["strict-transport-security", "x-content-type-options", "x-frame-options", "content-security-policy", "referrer-policy", "permissions-policy", "cross-origin-opener-policy", "cross-origin-resource-policy"]
cases = [("/", 200), ("/robots.txt", 200), ("/sitemap.xml", 200), ("/images/hero.webp", 200), ("/varnam-mark.svg", 200), ("/launch-missing-page", 404), ("/.env", 404), ("/.git/config", 404), ("/package.json", 404), ("/lib/catalog.js", 404), ("/?q=%3Cscript%3ElaunchProbe()%3C%2Fscript%3E", 200)]

class ProductLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "a" and "product-card" in attrs.get("class", "").split():
            self.links.append(attrs)

def valid_product_link(attrs):
    url = urlparse(attrs.get("href", ""))
    message = parse_qs(url.query).get("text", [""])[0]
    return (
        attrs.get("target") == "_blank"
        and {"noopener", "noreferrer"}.issubset(attrs.get("rel", "").split())
        and (url.scheme, url.netloc, url.path) == ("https", "wa.me", "/917305465777")
        and message.startswith("Hello Varnam Gifts! I am interested in ordering the '")
        and message.endswith("'. The minimum order is 25 items. Could you please share the pricing and bulk availability?")
    )

def check(case):
    route, expected = case
    request = urllib.request.Request(origin + route, headers={"User-Agent": "VarnamLaunchReview/1.0", "Cache-Control": "no-cache"})
    try:
        response = urllib.request.urlopen(request, timeout=30, context=ssl.create_default_context())
    except urllib.error.HTTPError as error:
        response = error
    except (urllib.error.URLError, TimeoutError) as error:
        return {"path": route, "pass": False, "error": str(error)}
    with response:
        body = response.read()
        headers = {key.lower(): value for key, value in response.headers.items()}
        missing = [name for name in required_headers if name not in headers]
        result = {"path": route, "expected_status": expected, "status": response.status, "bytes": len(body), "final_url": response.url, "missing_security_headers": missing, "sets_cookie": "set-cookie" in headers}
        result["framing_denied"] = (
            headers.get("x-frame-options", "").upper() == "DENY"
            and "frame-ancestors 'none'" in headers.get("content-security-policy", "")
        )
        result["pass"] = response.status == expected and not missing and result["framing_denied"]
        if route == "/":
            text = body.decode("utf-8")
            result["public_brand_page"] = "VARNAM GIFTS" in text and "Log in to access" not in text
            result["old_brand_absent"] = ("ves" + "hba") not in text.lower()
            cards = ProductLinks()
            cards.feed(text)
            result["twelve_secure_minimum_order_links"] = (
                len(cards.links) == 12 and len({link.get("href") for link in cards.links}) == 12
                and all(map(valid_product_link, cards.links))
            )
            result["security_headers"] = {key: headers[key] for key in required_headers if key in headers}
            result["pass"] &= result["public_brand_page"] and result["old_brand_absent"] and result["twelve_secure_minimum_order_links"]
        if route.startswith("/?q="):
            result["input_not_reflected"] = b"<script>launchProbe()</script>" not in body
            result["pass"] &= result["input_not_reflected"]
        return result

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(check, cases))
report = {"checked_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(), "origin": origin, "certificate_validation": "Python default TLS certificate verification enabled", "scope": "Anonymous HTTP smoke checks; not a third-party certification or exhaustive penetration test.", "passed": sum(item["pass"] for item in results), "total": len(results), "results": results}
Path(args.output).write_text(json.dumps(report, indent=2), encoding="utf-8")
print(json.dumps({"passed": report["passed"], "total": report["total"], "failures": [r for r in results if not r["pass"]], "report": args.output}, indent=2))
raise SystemExit(0 if report["passed"] == report["total"] else 1)
