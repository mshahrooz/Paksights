#!/usr/bin/env python3
"""Verify and extract the 52 uploaded HD fishing frames on GitHub Actions."""
from pathlib import Path
import hashlib,zipfile
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/"assets/gallery/gta6-fishing-20s"
FILES=sorted(DEST.glob("gone-fishing-*.webp"))
if len(FILES)==52 and all(p.stat().st_size>5000 for p in FILES):
    print("52 expanded screenshot assets already present")
else:
    parts=sorted((ROOT/"assets/media-source/gta6-fishing").glob("gallery-*.part"))
    if len(parts)!=8:
        raise SystemExit(f"Expected 8 screenshot source parts, found {len(parts)}")
    raw=b"".join(p.read_bytes() for p in parts)
    sha=hashlib.sha256(raw).hexdigest()
    if sha!="31e97e2f824d502dbb3a2d77c7d6eb3ee15004268d5bcd2438ae2b1877e44d5e":
        raise SystemExit("Screenshot archive checksum mismatch")
    import io
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        members=z.namelist()
        if len(members)!=52 or any(not name.startswith("assets/gallery/gta6-fishing-20s/") or ".." in name or not name.endswith(".webp") for name in members):
            raise SystemExit("Archive contains unexpected filenames")
        z.extractall(ROOT)
    FILES=sorted(DEST.glob("gone-fishing-*.webp"))
    if len(FILES)!=52:
        raise SystemExit("Extraction incomplete")
    for p in FILES:
        b=p.read_bytes()
        if len(b)<5000 or b[:4]!=b"RIFF" or b[8:12]!=b"WEBP":
            raise SystemExit("Invalid WebP screenshot "+p.name)
    print("Verified and extracted 52 enhanced WebP screenshots")
