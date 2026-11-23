# PakSights / Leonida Ledger — SEO publishing system

_Last updated November 23, 2026._

## Production URL and publication identity
- Canonical site: https://paksights.com/
- Publication: Leonida Ledger
- Owner/site label: PakSights
- Google Search Console verification tag is preserved in `index.html`.

## Automatically regenerated on every successful GitHub Pages build
- `sitemap.xml` — full set of indexable HTML pages, local editorial images, truthful original last-modified dates
- `sitemap-news.xml` — NewsArticle pages published in the preceding **48 hours only**
- `sitemap-index.xml` — references both sitemaps
- `feed.xml` — complete articles RSS feed, with media, bylines, full text and AI-assisted disclosure
- `feed-news.xml` — dedicated reporting-only RSS for news readers
- `atom.xml` — Atom feed
- `feed.json` — JSON Feed 1.1
- `robots.txt` — advertises sitemaps and allows search crawling
- `site.webmanifest` — Android home-screen metadata
- Every HTML page — SEO title, description, canonical, social image/metadata, appropriate JSON-LD and feed-discovery links.

The build is implemented by `node scripts/build-seo.mjs public` in `.github/workflows/pages.yml`.
There is no paid SEO service or account key required for the generation process.

## Adding or editing an article
1. Create a real self-contained `articles/<slug>.html` with a distinct article title, visible editorial byline, publication date, cited sources and clearly labeled image credits.
2. Include an `article:published_time` meta tag or `NewsArticle/BlogPosting.datePublished` structured data. Preserve the original date when editing; use `dateModified` only when content changes substantially.
3. For editorial SEO fine-tuning, add the article's title, description, subject tags and category to `scripts/seo-page-data.json`. **This is optional**: new HTML is discovered automatically and receives sensible defaults.
4. Push to `main`. GitHub Pages rebuilds HTML, all feeds and all sitemaps. The IndexNow notifier submits changed pages to participating search engines.
5. Never tag an article as verified if it is not verified. Label original AI fan-art imagery separately from official game screenshots and real gameplay.

## Google News and Discover
Google News has used automatic publication discovery since 2025; manual Publisher Center publication submission does not guarantee inclusion. Google Search Console ownership and indexing, original reporting, visible dates, identifiable editorial contributors and meaningful contact information matter. The site's existing editorial standards, about and contact pages support transparency.

Only stories no older than 48 hours belong in the news sitemap. An empty news sitemap is normal when no fresh stories exist. The GitHub scheduled workflow rebuilds this daily **while GitHub scheduling remains active**; GitHub may disable schedules for repositories with long inactivity, so monitor Actions.

## One-time external-account tasks
- **Google Search Console:** verify ownership with the existing meta tag, submit `sitemap-index.xml` and `sitemap-news.xml`, then inspect the homepage and newly published articles. Search Console account access is not present in the connected OpenSEO project.
- **Bing Webmaster Tools:** optional for performance/IndexNow reporting. IndexNow notifications are already automated and use a root-verified public key.
- **Microsoft Start / MSN Partner Hub:** application/partner onboarding is separate; use `feed-news.xml` and review the AI-assisted category and content guidelines.
- **Apple News:** publisher/channel access and approval are separate; feeds alone do not mean the site has been accepted.
- **Flipboard and RSS apps:** use `feed.xml` or `feed-news.xml`; some publisher/creator features have eligibility criteria.

## Editorial credibility
Do not invent named authors, a company address, an editorial email, reporting experience, awards or rankings. The current Research Desk is an organizational byline; a public author identity and verifiable newsroom contact details would strengthen news-publisher transparency once genuine details are supplied. Independent news coverage must remain sourced and clearly distinguish reported claims from confirmed facts.

## Verification
The GitHub deploy job checks JS syntax and parses all generated XML feeds/sitemaps and the JSON feed. OpenSEO technical crawls on November 23, 2026 improved from 48 informational issues to zero across 39 crawled pages. Audit findings can change as content changes; rankings and inclusion are never guaranteed.

Google does not use the `meta keywords` tag to rank pages. The topic metadata exists for organization and secondary consumers, not as a ranking shortcut.
