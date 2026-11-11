# PakSights — Free Responsive Website Preview

Primary live tool: https://paksights.com/

PakSights is a static GitHub Pages site with a browser-based responsive device preview and the existing Worksheet Rescue, trip-budget and packing-list tools. The user-provided logo, domain `paksights.com`, root CNAME, AdSense Auto Ads and ads.txt remain unchanged.

## Device preview features

- 26 viewport presets across phones, tablets, laptops and desktops; searchable categories.
- Single-device view or compare up to four simultaneously.
- Portrait/landscape rotation, reload, fit/50/75/100/125% zoom.
- Custom width and height, save custom device presets locally.
- Preview an embeddable HTTP(S) website directly in an iframe, with shareable URL setups.
- Preview uploaded/pasted standalone HTML in a restricted iframe. JavaScript disabled by default and requires opt-in.
- Sample responsive demo for first-time visitors.

### Important limitations

This is a CSS **viewport simulator**, not an emulator of iOS, Android, Safari or real touch devices. Many websites prohibit embedding via `X-Frame-Options` or CSP `frame-ancestors`; browser restrictions cannot be bypassed from static GitHub Pages. HTTP pages may be blocked as mixed content on HTTPS. Cross-origin website screenshots cannot be captured or exported from a normal browser iframe. Local standalone HTML previews may need inline assets or absolute URLs; separate relative files will not automatically resolve. We do not claim complete browser testing.

## Privacy & storage

The URL preview loads directly in the visitor's browser (not through a PakSights proxy). Pasted/uploaded HTML stays local and does not get added to share URLs. Recent URLs and custom devices are optionally saved in browser localStorage. Third-party sites and Google AdSense make their own network requests.

## Hosting and editing

The existing `.github/workflows/pages.yml` copies checked-in static pages and assets and deploys to the **existing** GitHub Pages site. Site source is `index.html`, `assets/device-preview.css`, and `assets/device-preview.js`. Other tools and old article URLs remain available. Keep `CNAME`, `ads.txt`, and `.nojekyll` at the repo root.

## Next improvements

Test on physical mobile devices, review broken iframe and local HTML edge cases, and add persistent per-device comparison options if supported by user feedback. Verified SEO demand is not yet established and traffic is not guaranteed.
