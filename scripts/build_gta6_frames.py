#!/usr/bin/env python3
"""Build 100 real five-second gameplay screenshots from rights-cleared footage."""
import argparse
import csv
import html
import json
import re
import subprocess
from pathlib import Path

COUNT=100
INTERVAL=5
SLUG="gta-6-gone-fishing-100-gameplay-screenshots"
URL="https://paksights.com/articles/"+SLUG+".html"
def stamp(seconds):
    return f"{seconds//60:02}:{seconds%60:02}"
def run(args):
    return subprocess.run(args,check=True,text=True,capture_output=True).stdout
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--video",type=Path)
    p.add_argument("--extract",action="store_true")
    p.add_argument("--build",action="store_true")
    p.add_argument("--permission-confirmed",action="store_true")
    p.add_argument("--source-credit")
    p.add_argument("--source-url")
    p.add_argument("--root",type=Path,default=Path("."))
    a=p.parse_args()
    root=a.root.resolve()
    dest=root/"assets"/"galleries"/SLUG
    captions_file=root/"scripts"/"gone-fishing-100-captions.csv"
    if not a.permission_confirmed:
        p.error("Proof/permission for republishing source game footage is required.")
    if a.extract:
        if not a.video or not a.video.is_file():
            p.error("Provide a local, authorized recording with --video.")
        duration=float(json.loads(run(["ffprobe","-v","error","-show_entries","format=duration","-of","json",str(a.video)]))["format"]["duration"])
        if duration<500:
            p.error("Source must be at least 500 seconds to sample 100 frames 5 seconds apart.")
        if dest.exists() and list(dest.iterdir()):
            p.error("Existing frame files found; refusing to overwrite.")
        dest.mkdir(parents=True,exist_ok=True)
        run(["ffmpeg","-hide_banner","-loglevel","error","-i",str(a.video),
             "-t","500","-an","-vf","fps=1/5,scale=1440:-2:flags=lanczos",
             "-frames:v","100","-c:v","libwebp","-q:v","83",
             "-compression_level","5",str(dest/"frame-%03d.webp")])
        frames=sorted(dest.glob("frame-*.webp"))
        if len(frames)!=COUNT:
            raise SystemExit(f"Expected 100 frames; found {len(frames)}. Do not publish.")
        if not captions_file.exists():
            captions_file.parent.mkdir(parents=True,exist_ok=True)
            with captions_file.open("w",newline="",encoding="utf-8") as f:
                w=csv.writer(f)
                w.writerow(["time_sec","caption"])
                for i in range(COUNT):
                    w.writerow([i*INTERVAL,""])
        print(f"Extracted {len(frames)} real screenshots. Review each and complete {captions_file}.")
        return
    if a.build:
        if not a.source_credit:
            p.error("Provide source attribution with --source-credit.")
        frames=sorted(dest.glob("frame-*.webp"))
        if len(frames)!=COUNT:
            p.error("Extract exactly 100 authorized frame images first.")
        with captions_file.open("r",newline="",encoding="utf-8-sig") as f:
            rows=list(csv.DictReader(f))
        if len(rows)!=COUNT:
            p.error("Need 100 caption rows.")
        for i,row in enumerate(rows):
            if str(row["time_sec"]).strip()!=str(i*INTERVAL) or not row["caption"].strip():
                p.error(f"Write an accurate visual caption for frame {i+1}.")
        source=(f'<a href="{html.escape(a.source_url,quote=True)}" rel="noopener noreferrer" target="_blank">'
                f'{html.escape(a.source_credit)}</a>' if a.source_url else html.escape(a.source_credit))
        cards=[]
        for i,row in enumerate(rows):
            im=f"/assets/galleries/{SLUG}/frame-{i+1:03}.webp"
            caption=html.escape(row["caption"].strip())
            cards.append(f'<figure><a href="{im}" target="_blank" rel="noopener"><img src="{im}" '
                         f'loading="{"eager" if i==0 else "lazy"}" width="1440" height="810" '
                         f'alt="Gone Fishing {stamp(i*INTERVAL)}: {caption}"></a><figcaption>'
                         f'<time>{stamp(i*INTERVAL)}</time><span>{caption}</span></figcaption></figure>')
        template=(root/"articles"/"gta-6-prologue-mission-1-walkthrough.html").read_text(encoding="utf-8")
        header=re.search(r'<a class="skip"[\s\S]*?</header>',template)
        footer=re.search(r'<footer class="site-footer">[\s\S]*?</footer>',template)
        if not header or not footer:
            p.error("Existing site header/footer not found.")
        title="GTA 6 Gone Fishing: 100 Actual Gameplay Screenshots, Every 5 Seconds"
        doc='<!doctype html><html lang="en"><head><meta charset="utf-8">'
        doc+='<meta name="viewport" content="width=device-width, initial-scale=1">'
        doc+=f'<title>{title} | Leonida Ledger</title>'
        doc+=f'<link rel="canonical" href="{URL}"><link rel="stylesheet" href="/assets/style.css">'
        doc+='<style>main{padding-bottom:70px}.gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding-top:30px}'
        doc+='figure{margin:0;background:#fff;border:1px solid #c2d2ba}figure img{width:100%;height:auto;display:block}'
        doc+='figcaption{display:flex;gap:16px;align-items:start;padding:17px}figcaption time{font-weight:900;color:#496c25}'
        doc+='figcaption span{font-size:14px;line-height:1.6}.intro{background:#213528;color:#fff;padding:55px 0}'
        doc+='h1{font:900 clamp(42px,7vw,90px)/.9 var(--display);margin:12px 0}'
        doc+='@media(max-width:680px){.gallery{grid-template-columns:1fr}}</style>'
        doc+='</head><body>'+header.group(0)+'<main id="main">'
        doc+=f'<section class="intro"><div class="container"><h1>{title}</h1>'
        doc+='<strong>100 UNIQUE FRAMES · 00:00–08:15 · 5-SECOND INTERVALS</strong></div></section>'
        doc+='<div class="container gallery">'+''.join(cards)+'</div>'
        doc+=f'<div class="container" style="padding:22px 0;font-size:12px">Authorized recording: {source}</div>'
        doc+='</main>'+footer.group(0)+'</body></html>'
        out=root/"articles"/(SLUG+".html")
        if out.exists():
            p.error("Refusing to replace an existing published gallery.")
        out.write_text(doc,encoding="utf-8")
        print(f"Built {out} with {COUNT} real frames and reviewed captions. Verify before publishing.")
        return
    p.error("Choose --extract or --build.")
if __name__=="__main__":
    main()
