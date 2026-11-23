# PakSights Cloudflare migration (staging only)

This branch prepares the **complete current website** for Cloudflare Workers Static Assets, without changing the live GitHub Pages deployment or DNS.

## Existing source

Repository: https://github.com/mshahrooz/Paksights
Current production: https://paksights.com
Existing production GitHub Actions: `.github/workflows/pages.yml` (unchanged)

The production job assembles a split 17,794,634-byte MP4 file, verifies 52 WebP screenshots, and generates sitemap/news sitemap/feeds and SEO. Do not point Cloudflare directly to the source repository root: use the generated `public/` folder.

## Build

From the repository root, in a standard Node.js + Python 3 environment:

```sh
bash scripts/build-cloudflare.sh
```

This should produce `public/`, including all media and generated SEO files. The 17.8 MB video remains below the Workers Static Assets 25 MiB per-file limit; review Cloudflare limits if assets change.

## Deployment using Cloudflare Workers Builds

Cloudflare Dashboard → Workers & Pages → Create Worker → Connect Git repository → choose `mshahrooz/Paksights`.

**Use the migration branch first**, not `main`. Build command: `bash scripts/build-cloudflare.sh`. Deploy using the recommended Cloudflare CLI for a static output directory: `cf deploy ./public`. In a build environment where `cf` is not preinstalled, install `cf@latest` as part of the setup or build command. Confirm the command in Cloudflare's current Workers Builds settings before enabling automatic deployment. Use the default Workers preview domain initially; do not associate the live custom domain.

If using a local CLI, follow https://developers.cloudflare.com/cf/agents/ and Cloudflare's Workers Static Assets deployment instructions.

## Pre-cutover acceptance checks

1. Home and every navigation destination loads; verify all existing published article URLs.
2. The 52 screenshot gallery and the reconstructed 17.8 MB MP4 play as expected.
3. Images, CSS, JavaScript, tools and interactive features work on desktop and mobile.
4. `/robots.txt`, `/ads.txt`, `/sitemap.xml`, `/sitemap-news.xml`, `/sitemap-index.xml`, `/feed.xml`, `/feed-news.xml`, `/atom.xml`, `/feed.json` return correctly.
5. Google verification and canonical metadata remain on the final paksights.com domain.
6. Compare page counts, sitemap URLs, caching rules, HTML responses, and custom 404 handling.
7. Keep GitHub Pages live while testing; switch DNS only after complete verification, then enable Cloudflare deployments from `main`.

## DNS status

As of the initial audit, the connected Cloudflare account did not include a `paksights.com` zone. Associating the real domain requires adding the domain to Cloudflare and updating authoritative nameservers at the domain registrar if not already on Cloudflare. This step has NOT been performed.

## Important

Cloudflare Static Assets serve the built `public/` directory; the old workflow is not reusable verbatim for Workers because it ends with `actions/deploy-pages`. Do not remove the GitHub Pages workflow until the Cloudflare production deployment and rollback path are proven.
