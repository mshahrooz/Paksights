# PakSights — Overseas Pakistanis Guide

A **complete static, multi-page website**, designed for `paksights.com` and GitHub Pages. No Node, framework, database, login or paid hosting is required.

**Launch contents (10 November 2026):**

- 25 original practical guides, organized into five topics.
- 5 standalone topic landing pages, all-guides directory and fast full-site search.
- 3 working browser tools: document guide finder, remittance quote calculator and local-only property due-diligence checklist.
- Official source directory with 30 linked public authority pages.
- Editorial policy, about, privacy, disclaimer, terms, corrections/contact and custom 404 page.
- SEO: actual pre-rendered HTML pages, unique titles/descriptions, JSON-LD structured data, canonical links, internal linking, sitemap, robots and RSS feed.
- Responsive light interface in white, blue (#2563eb) and pale blue (#f0f5ff). Built-in favicon and social sharing image.

## 1. Preview on your computer

Extract the ZIP fully. Open **`index.html`** in a browser. The core pages, CSS, search, guide finder and calculators use local files and require no server or external account.

**Keep folder names exactly as supplied.** Do not upload just the index file.

## 2. Publish on GitHub Pages — recommended: automatic content builds

1. Create a GitHub repository (or use the repository for this site).
2. Upload **all extracted files and folders**, including the hidden `.github` folder and `.nojekyll` file. Commit to branch **`main`**.
3. Open the repository's **Settings → Pages** and select **GitHub Actions** under *Build and deployment / Source*.
4. The included workflow `.github/workflows/pages.yml` regenerates the pages from `content/articles.json`, runs the link/content audit, and publishes the finished static files. Future commits to `main` trigger another build.
5. Set the **Custom domain** in Settings → Pages to `paksights.com`. Do this **before** changing DNS, following GitHub's security guidance.
6. At your domain DNS provider, configure the apex **A records** to GitHub Pages (as currently documented):

   | Type | Host | Value |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |

   Optionally, point the `www` CNAME to `YOUR-GITHUB-USERNAME.github.io` **without the repository name**. For all DNS changes, use the [latest GitHub Pages custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Verify the DNS and enable **Enforce HTTPS** when available.

**Alternative:** In Settings → Pages select **Deploy from a branch**, `main`, `/ (root)`. All HTML pages are already generated, so this works too. **However, when you change `content/articles.json` in this mode, you must run `python build.py` and commit the resulting HTML first.** The workflow method is more convenient.

**Important:** If you are replacing an existing site at this domain, first back up the old site, take inventory of pages currently getting search traffic, and decide whether important old URLs need migration or redirects. GitHub Pages does not provide native server-side 301 rules. Changing a site's topic can affect rankings and search traffic.

## 3. Add or update an article

All source articles are in **`content/articles.json`**. Each object has:

- `slug` — unique filename-friendly URL, e.g. `get-nicop-from-usa`
- `title`, `category`, `deck` — unique search title, one of `identity`, `money`, `property`, `family`, `support`, and summary
- `answer` — the clear first answer
- `context` — original explanatory paragraphs
- `steps` — array of `{ "title": "...", "body": "..." }`
- `checklist` — preparation items
- `watch` — mistakes and warnings
- `faqs` — array of `{ "q": "...", "a": "..." }`
- `sources` — IDs referencing `content/sources.json`
- `tags`, `published`, `reviewed`

For a new article, add an object to the JSON array, ensure its official source IDs exist in `content/sources.json`, update its **actual** `published` and `reviewed` dates, and push to GitHub. With the included Actions workflow, the new HTML page, category, directory, search index, sitemap and RSS entry are regenerated automatically.

For local editing, run:

```sh
python build.py
python qa.py
```

There are no Python package dependencies. `qa.py` checks internal paths, page headings, canonicals, a basic content-length threshold, and source presence.

**Editorial rules:** Confirm procedures with the responsible official authority; explain eligibility caveats; avoid fixed fee or processing promises without current proof; distinguish practical suggestions from legal requirements; do not reuse others' copyrighted text; recheck time-sensitive items after policy changes. The 10 Nov 2026 review date is a real initial research date, **not** a promise that every policy remains current.

## 4. Configure contact / advertising

**Contact:** Edit `assets/js/site-config.js`, replacing `contactEmail: ''` with a real inbox **you own and have tested**. The public contact page automatically reveals a working email link. Do not publish an unverified address.

**AdSense:** The site does **not** embed an invented publisher ID, ad unit, consent banner, or analytics account. Once you have your actual AdSense publisher code, add it according to Google's current policies. Before using personalized advertising, evaluate cookie consent/CMP requirements for the countries you target and update `privacy.html` accordingly. Existing AdSense approval for a domain is **not a guarantee** that a newly rebuilt site or its content will meet continuing policies or earn a particular amount.

**Google Search Console:** After publishing, verify the website and submit `https://paksights.com/sitemap.xml`. The generated site includes a feed at `https://paksights.com/feed.xml`.

## 5. Site architecture

```
index.html
about.html / editorial-policy.html / contact.html / privacy.html / terms.html / disclaimer.html
sources.html / 404.html
guides/index.html + 25 individual .html articles
topics/index.html + five topic .html landing pages
tools/index.html + documents.html + remittance-cost.html + property-checklist.html
assets/css/style.css
assets/js/main.js + tools.js + search-index.js + site-config.js
assets/img/favicon.svg + social-card.png
content/articles.json + categories.json + sources.json
build.py / qa.py
.github/workflows/pages.yml
sitemap.xml / feed.xml / robots.txt / CNAME / .nojekyll
```

## 6. Limitations and important notes

- PakSights is independent, not an official government website. The articles are general information, not individualized legal, tax, financial or immigration advice.
- The remittance calculator **does not fetch live exchange rates**. Visitors type their own provider quotes. Results compare final rupees and PKR received per unit of total spending.
- The property checklist uses only browser `localStorage`. It does not collect identity or banking information, but clearing browser data will reset the progress.
- The content is focused on Pakistan-related cross-border tasks, for Pakistanis living in many countries. Host-country immigration and tax rules require their own jurisdiction-specific research before publishing.
- No SEO ranking, traffic or AdSense earnings can be guaranteed.

Built as a practical long-term publishing system rather than a mass-produced directory of thin pages.


## Editorial blog redesign (November 2026)

The site uses the `#66cc01` editorial theme in `assets/css/editorial.css` and real, illustrative Unsplash photo thumbnails (loaded from Unsplash CDN when the site is online). Articles, details, checklists, tools, sources and SEO pages remain intact. The homepage now uses a familiar blog/news layout.

For regeneration after editing `content/articles.json`, run:

```bash
python editorial_rebuild.py
```

`editorial_rebuild.py` first runs the original `build.py`, then applies the editorial visual layout, full-site AdSense Auto Ads script and the root `ads.txt` file. **Do not run only `build.py`** if you want the new design to persist.

### Advertising

The Auto Ads script uses `ca-pub-9019132490898610`. Verify the publisher ID and make sure `https://paksights.com/ads.txt` contains:

```
google.com, pub-9019132490898610, DIRECT, f08c47fec0942fa0
```

Google controls whether, where and when Auto Ads appear. Consent Management Platform configuration may be required for EEA, UK and Switzerland traffic; configure an appropriate Google-certified CMP and review your regional privacy duties before going live. The site intentionally does not attempt to bypass consent collection.

### Photographs

Real illustrative photographs load from the Unsplash CDN; online connectivity is needed for them to display when previewing the site locally. Photo source: https://unsplash.com/license . Do not portray images as proof of a particular government service.
