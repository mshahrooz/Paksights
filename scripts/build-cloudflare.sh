#!/usr/bin/env bash
# Build an exact Cloudflare-ready copy without modifying the live GitHub Pages site.
set -euo pipefail
cd "$(dirname "$0")/.."

# Confirm the existing screenshot gallery, rebuilding from its stored parts when necessary.
python3 scripts/assemble-fishing-frames.py
node --check scripts/build-seo.mjs
node --check assets/site.js
node --check assets/home-video.js

rm -rf public
mkdir -p public
cp -R assets articles news guides world features tools public/
cp ./*.html ./*.xml ./*.txt public/
cp .nojekyll public/

# The original 17.8 MB video is stored as split Git blobs.
parts=(public/assets/gta6-deep-sea-fishing/_video-parts/part-*.bin)
if [ "${#parts[@]}" -eq 0 ] || [ ! -f "${parts[0]}" ]; then
  echo "Missing video source parts" >&2
  exit 1
fi
cat "${parts[@]}" > public/assets/gta6-deep-sea-fishing/gta6-deep-sea-fishing-ultra.mp4
test "$(wc -c < public/assets/gta6-deep-sea-fishing/gta6-deep-sea-fishing-ultra.mp4 | tr -d ' ')" = 17794634
rm -rf public/assets/gta6-deep-sea-fishing/_video-parts
rm -rf public/assets/media-source

# Generate the same canonical URLs, site maps, news feeds and SEO as production.
node scripts/build-seo.mjs public

python3 - <<'PY'
from pathlib import Path
import json
import xml.etree.ElementTree as ET
root=Path("public")
required=["index.html","404.html","robots.txt","ads.txt","sitemap.xml","sitemap-news.xml","sitemap-index.xml","feed.xml","feed-news.xml","atom.xml","articles/gta-6-prologue-mission-1-walkthrough.html","articles/gta6-deep-sea-fishing-52-screenshots-20-seconds.html"]
for name in required:
    if not (root/name).is_file():
        raise SystemExit(f"Missing published file: {name}")
for name in ["sitemap.xml","sitemap-news.xml","sitemap-index.xml","feed.xml","feed-news.xml","atom.xml"]:
    ET.parse(root/name)
assert len(json.loads((root/"feed.json").read_text())["items"]) >= 15
assert len(list((root/"assets/gallery/gta6-fishing-20s").glob("gone-fishing-*.webp"))) == 52
assert (root/"assets/gta6-deep-sea-fishing/gta6-deep-sea-fishing-ultra.mp4").stat().st_size == 17794634
assert '<meta name="google-site-verification"' in (root/"index.html").read_text()
print("Cloudflare build validated: pages, gallery, video, SEO, feeds.")
PY

# GitHub Pages' CNAME is not a routing configuration for Cloudflare.
rm -f public/CNAME
echo "Cloudflare-ready output: ./public"
