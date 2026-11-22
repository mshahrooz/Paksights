# Leonida Ledger — Unofficial GTA VI editorial publication

A source-checked, responsive editorial website on **https://paksights.com**, published with GitHub Pages.

## Site map

- Home: index.html
- Latest news: news/index.html
- Practical guides: guides/index.html
- World and characters: world/index.html
- Features: features/index.html
- Searchable archive: articles/index.html
- 13 individual source-linked articles, with BlogPosting structured data
- About, contact, editorial policy, media credits and privacy pages
- robots.txt, sitemap.xml, feed.xml, ads.txt

## Deployment

Changes to the main branch automatically publish via .github/workflows/pages.yml. CNAME is set to paksights.com and the site's Google AdSense publisher record was carried forward from the old site. **This build has already replaced the old public site; the previous site is preserved in the backup-paksights-before-gta6-2026-11-21 branch.**

## Image sourcing

Official GTA VI imagery is referenced from Rockstar's website for editorial use; image attribution and an unofficial affiliation disclaimer appear throughout the site. Images are loaded from an external server and could be blocked or moved by the source; an original fallback SVG is included. Please review use rights as appropriate for commercial publication.

## Editorial and advertising

Google AdSense publisher ID: ca-pub-9019132490898610. Auto Ads will display if enabled in your account. The site has informational ad placeholders that are not live ad units. Google-certified CMP requirements must be configured separately for relevant jurisdictions. Google Search Console setup and live ad serving require external account configuration.

Each article is an HTML file with its own canonical URL, metadata and source links. Update dates, claims, image links and links to sources when publishing new editorial content. Do not fabricate walkthrough claims or publish bulk near-duplicate pages for SEO.

## Questions

Use GitHub Issues for corrections and repository management; do not post private data in public issues.

## November 21, 2026 — Interactive player tools

- 5 pages under /tools/: landing hub, schematic region explorer, spoiler-aware code finder, customizable mission tracker, console cheat guide.
- 3 original Port Gellhorn walkthrough pages for Kingpin Bowling, Brooks Boatworks and La Cascara Motel.
- 6 externally reported keypad/safe codes, with source caveats, hint-first reveals and local solved state.
- Officially named regions with a not-to-scale diagram, not fabricated geographical pins. Local visited state.
- Five reported opening mission titles, user-added missions, local state, JSON export. No claim of full coverage.
- Homepage featured tools, navigation throughout site, contextual links, 8 added sitemap entries, JS syntax checking and updated Pages publish file copy.
- Progress is stored only in visitor browser localStorage. Maintain citations and verify source reports before further additions.

## Editorial imagery upgrade — November 21, 2026

- `assets/site.js` now maps each published HTML route to a relevant Rockstar GTA VI hero image and supporting screenshots; it adds image elements after HTML parsing without changing the article text or interactive tool behavior. Existing defer loading covers every page.
- `assets/style.css` includes responsive high-resolution cinematic hero layers with mobile overlays, gallery layout, image captions and accessibility/contrast rules.
- All game images reference Rockstar Games first-party `/VI/_next/static/media` paths and are credited as © Rockstar Games. Responsive srcset hints use 640–1920 widths; supporting images lazy-load, hero eager loads with priority.
- Source gallery: https://www.rockstargames.com/VI/media/screenshots . Game imagery is not claimed as independently licensed. CDN links can change, so verify periodically. Fallback local SVG is used if a Rockstar asset cannot load.
- The new imagery is injected client-side. For previewers or social crawlers without JavaScript, existing server-rendered article feature images and static OG images remain available.

## Research feature: GTA VI All Missions (Nov 21, 2026)

- `/articles/gta-vi-all-missions.html`: original, long-form 91-core-mission guide grouped into five chapters, with mission-by-mission summaries, 14 linked editorial/primary walkthrough references, a 91-vs-93-vs-95 counting explanation, optional mission differences, chapter highlights, spoiler folds and FAQ.
- `assets/mission-article.css`, `assets/mission-article.js`: responsive editorial guide and local, no-login mission search/spoiler toggles.
- New article featured on homepage, guides and search archive; included in RSS and sitemap; unique canonical, Article/Breadcrumb/FAQ structured data.
- Secondary sources used: PC Gamer, Push Square, VGC, PowerPyx published Nov 18–21, 2026. Story mission list remains attributed and can differ from in-game task recap lists. No Leonida Ledger hands-on testing claimed. Sources and spoilers are labeled.

## Prologue illustrated guide — Nov 21, 2026

- `/articles/gta-6-prologue-mission-1-walkthrough.html`: source-backed first-mission walkthrough; Prologue and Gone Fishing naming explained.
- Seven official Rockstar GTA VI trailer/promotional scene frames and three video thumbnails, each explicitly labeled by type with source attribution. The pictures come from third-party remote media hosts and can fail to load; fallback SVG is configured. No creator-owned footage is downloaded or rehosted.
- Three independently verified creator YouTube video IDs: `Zh6VrJuW_i8` (standalone Prologue by GTA Series Videos), `vfJ3BBxrvCQ` (Kephket first hour), `YDNs_sPEcJc` (MKIceAndFire gameplay Part 1). Click-to-load privacy-conscious YouTube embeds with direct links and optional timestamp anchors.
- New gallery filter/lightbox and full responsive Prologue CSS/JS, VideoObject, BreadcrumbList, BlogPosting and FAQ JSON-LD, Open Graph, sitemap, RSS, homepage promotion and guide/archive cards.
- No claim that trailer frames are from the playable prologue or that creator thumbnails are original Leonida Ledger screenshots.

## GTA VI-labeled deep-sea fishing gallery — Nov 21, 2026
- `/articles/gta6-deep-sea-fishing-100-screenshots.html`: 100 distinct 1600×900 sharpened/upscaled WebP frames from the user-supplied 720p fishing gameplay recording. Captured at 5-second steps 03:30–11:45, with 100 time-specific captions.
- The underlying 17m19s full video is reduced from about 173 MiB to 17 MiB (640×360 H.264/AAC) for mobile playback.
- 30 binary segments live in `assets/gta6-deep-sea-fishing/_video-parts/`. GitHub Pages Actions concatenates them in sorted order to form `assets/gta6-deep-sea-fishing/gta6-deep-sea-fishing-ultra.mp4` for visitors. Segment bytes are each 600000 except the final segment; expected complete MP4 size is 17794634 bytes. The deployment removes the unused segments from the published artifact to save bandwidth.
- This is an independent fishing outing in the supplied video, **not** proof of Rockstar's scripted opening Gone Fishing mission. Site copy does not identify it as that mission.
- Images are upscaled with Lanczos and lightly sharpened from the original 1280×720 source, not fabricated native 1600×900 captures.

## Full-length fishing gallery — November 22, 2026

- New accurate gallery: `/articles/gta6-deep-sea-fishing-52-screenshots-20-seconds.html`, based entirely on the uploaded 1038.94-second fishing video.
- 52 genuine unique screenshots at seconds 0,20,...1020, reprocessed as 1920×1080 WebP with mild sharpening from source 1280×720 (no fabricated native pixels).
- All 52 photo descriptions and timestamps are based on inspecting the supplied video, rather than assuming this is the scripted GTA VI story Prologue or Gone Fishing mission.
- Image payload is transferred in 8 SHA-verified GitHub blobs. `scripts/assemble-fishing-frames.py` expands them in the Pages workflow. The workflow also attempts to commit all 52 individual image files back to main and remove source parts; if GitHub blocks this write, deployed Pages images still work.
- Existing ultra-compressed full-duration MP4 remains `/assets/gta6-deep-sea-fishing/gta6-deep-sea-fishing-ultra.mp4` via 30 existing Git chunks; the original 100 partial-run screenshots have been superseded and archive links updated.
