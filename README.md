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
