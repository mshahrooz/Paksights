#!/usr/bin/env python3
"""Lightweight CI checks for the static PakSights Worksheet Rescue launch."""
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parent
class Scan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids=[]
        self.links=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if d.get("id"): self.ids.append(d["id"])
        if tag in ("a","img","script","link"):
            val=d.get("src") if tag in ("img","script") else d.get("href")
            if val: self.links.append(val)

for filename in ["index.html","tools/index.html","tools/worksheet-rescue.html"]:
    content=(ROOT/filename).read_text(encoding="utf-8")
    p=Scan()
    p.feed(content)
    dupe={x for x in p.ids if p.ids.count(x)>1}
    assert not dupe, (filename,"duplicate HTML ids",dupe)
    assert "ca-pub-9019132490898610" in content, (filename,"missing AdSense integration")
    assert 'rel="canonical"' in content, (filename,"missing canonical")
    for path in p.links:
        if path.startswith(("https:","http:","//","#","data:","mailto:","tel:")):
            continue
        local=(ROOT/"index.html") if path=="/" else (ROOT/path.lstrip("/") if path.startswith("/") else (ROOT/filename).parent/path)
        assert local.is_file(), (filename,"missing link or asset",path)

html=(ROOT/"tools/worksheet-rescue.html").read_text(encoding="utf-8")
script=(ROOT/"assets/worksheet-rescue.js").read_text(encoding="utf-8")
scan=Scan();scan.feed(html)
known=set(scan.ids)
for name in re.findall(r'\$\("([^"]+)"\)',script):
    assert name in known, ("missing Worksheet Rescue element",name)
assert "assets/logo.webp" in html
assert "client=ca-pub-9019132490898610" in html
assert "paksights.com" == (ROOT/"CNAME").read_text(encoding="utf-8").strip()
assert "pub-9019132490898610" in (ROOT/"ads.txt").read_text(encoding="utf-8")
assert "https://paksights.com/tools/worksheet-rescue.html" in (ROOT/"sitemap.xml").read_text()
print("PakSights tool assets, links, upload/download controls, domain and ads configuration: OK")

# Device Preview: every statically referenced control exists in the homepage.
preview_html=(ROOT/"index.html").read_text(encoding="utf-8")
preview_js=(ROOT/"assets/device-preview.js").read_text(encoding="utf-8")
scan=Scan();scan.feed(preview_html)
for name in re.findall(r'\$\("([^"]+)"\)',preview_js):
    assert name in set(scan.ids), ("device preview control missing from HTML",name)
assert "https://paksights.com/" in (ROOT/"sitemap.xml").read_text(encoding="utf-8")
assert "assets/device-preview.css" in preview_html
assert "assets/device-preview.js" in preview_html
print("PakSights Device Preview controls and assets: OK")
