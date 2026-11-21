GTA VI Gone Fishing — real 100-image gallery preparatory workflow

STATUS: Code prepared; nothing published or added to the live site.

The user wants 100 distinct actual gameplay frames every 5 seconds, with 100 captions.
Do NOT substitute repeated YouTube thumbnails. Do NOT extract a third-party
creator's full video and republish it on ad-supported PakSights without permission.

Research source: https://www.youtube.com/watch?v=ejIdp8axfhY
This video is identifiable as Gone Fishing gameplay, but reuse rights for a
100-frame downloadable gallery have NOT been established. Its link is not a
content-reuse license. Rockstar's published fan policy is not an automatic
permission for monetized digital publishing.

When an authorized local video is provided, use Python 3.10+ and ffmpeg:
    python scripts/build_gta6_frames.py --video authorized.mp4 --extract --permission-confirmed
The command generates 100 actual WebP files from 00:00 through 08:15 and a CSV
with one empty caption row per frame. Review screenshots and write precise,
interesting, original, truthful captions for each row.
    python scripts/build_gta6_frames.py --build --permission-confirmed --source-credit "Recording owner"
After generation inspect every image and caption, then add the output HTML/images
to GitHub and add internal links, sitemap, RSS as appropriate. Do not publish
the pre-production script itself through the GitHub Pages published directory.

This preparatory code does not claim to establish ownership or legal rights.
