"""Prepare the PakSights static site for independent hosting."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
from html.parser import HTMLParser
import os
import shutil
import sys

root = Path(__file__).resolve().parents[1]
out = Path(sys.argv[1]).resolve()
if out == root or root in out.parents or out in root.parents:
    raise SystemExit("Use a dedicated output directory outside the source checkout")
out.mkdir(parents=True, exist_ok=True)
allowed = {".html", ".htm", ".css", ".js", ".mjs", ".xml", ".txt", ".json", ".ico", ".webmanifest", ".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg", ".gif", ".mp4", ".webm", ".mp3", ".ogg", ".woff", ".woff2", ".ttf", ".otf", ".pdf", ".vtt"}
blocked = {"package.json", "package-lock.json", "wrangler.json", "wrangler.jsonc", "tsconfig.json", "composer.json"}
dirs = {"assets", "articles", "news", "guides", "world", "features", "tools", "images", "videos", "css", "js", "data", "fonts"}
for f in root.iterdir():
    if f.is_file() and not f.is_symlink() and not f.name.startswith(".") and (f.suffix.lower() in allowed or f.name in {"_headers", "_redirects"}) and f.name not in blocked:
        shutil.copy2(f, out / f.name)
    elif f.is_dir() and f.name in dirs:
        for item in f.rglob("*"):
            rel = item.relative_to(root)
            if not item.is_file() or item.is_symlink() or any(p.startswith(".") or p == "node_modules" for p in rel.parts):
                continue
            if item.suffix.lower() not in allowed or item.name in blocked:
                continue
            dest = out / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, dest)
for rel in ["index.html", "articles/index.html", "news/index.html", "articles/gta-6-online-release-date.html", "sitemap.xml", "feed.xml"]:
    if not (out / rel).is_file() or not (out / rel).stat().st_size:
        raise SystemExit("Missing required file: " + rel)
# Log unresolved local links for a human parity review; do not suppress errors.
class Links(HTMLParser):
    def __init__(self, page):
        super().__init__()
        self.page = page
    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name not in {"src", "href", "poster"} or not value or value.startswith(("#", "data:", "mailto:", "tel:", "javascript:")):
                continue
            u = urlsplit(value)
            if u.scheme or u.netloc or not u.path:
                continue
            p = unquote(u.path)
            target = (out / p.lstrip("/")) if p.startswith("/") else (self.page.parent / p)
            if target.is_dir():
                target /= "index.html"
            if not target.exists():
                missing.add((str(self.page.relative_to(out)), value))
missing = set()
for page in out.rglob("*.html"):
    parser = Links(page)
    parser.feed(page.read_text(encoding="utf-8", errors="replace"))
for page, link in sorted(missing):
    print("UNRESOLVED:", page, link)
files = list(p for p in out.rglob("*") if p.is_file())
print(f"Packaged {len(files)} files, {sum(p.stat().st_size for p in files)} bytes; {len(missing)} unresolved local links")
