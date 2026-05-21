# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static site for `photos.lisker.me`, deployed via GitHub Pages (see `CNAME`). It is one of several sibling repos under `lisker.me` (main domain, projects, music). No build step, no package manager — edits to HTML/CSS/JS go live as-is when pushed to `main`.

The template is a heavily modified fork of FreeHTML5.co's "Epic" Bootstrap template, though Bootstrap/animate.css have since been dropped in favor of inline minimal CSS. jQuery + Magnific Popup (lightbox) are loaded from `assets/`; Font Awesome is loaded from CDN.

## Architecture

### Page types
- **`index.html`** — homepage. Album tiles are hard-coded `<div class="album">` blocks in a two-column grid (`fh5co-col-1` / `fh5co-col-2`).
- **`albums/<slug>/index.html`** — one per album. The tile grid is rendered at runtime, not hard-coded: each page declares `<div id="photo-grid" class="fh5co-grid" data-json="/assets/images/<slug>/json/photos.json"></div>`, and `photos.js` auto-reads that `data-json` on `DOMContentLoaded`, fetches the JSON, and injects two `.fh5co-col-*` columns into `#photo-grid`.
- **`about/index.html`**, **`404.html`** — static pages.

### Photo grid data flow (`assets/js/photos.js`)
Each album directory has `assets/images/<slug>/json/photos.json` shaped like:
```json
{ "directory": "/assets/images/<slug>/",
  "photos": [ { "name": "...", "file": "basename", "location": "...", "hasAvif": false, "hasWebp": true, "video": "optional-youtube-url", "description": "optional-alt-name" } ] }
```
`populatePhotoGrid` builds a `<picture>` element per entry with `<source>` tags for AVIF/WebP and a JPG `<img>` fallback; the browser picks the format via native `<picture>` negotiation. The `hasAvif` / `hasWebp` flags only decide which single URL is handed to the lightbox (via `pickLightboxFormat`). If a `video` field is present, the lightbox link becomes a YouTube iframe (`mfp-iframe` class); the URL is passed through `sanitizeVideoUrl` so malformed JSON can't inject a script. Photos are split into two columns at `Math.ceil((length - offset) / 2)`.

### Lightbox + deep links (`assets/js/main.js`)
`lightbox()` initializes Magnific Popup on `.image-popup` anchors. `open`/`change`/`close` callbacks sync `window.location.hash` to `#photo=<basename>` (via `extractPhotoId`) so any photo is directly linkable. `$(document).ready` reads the hash on load and auto-opens the matching photo. `getSocials()` and `getFooter()` inject shared social links + footer into `#socials` / `#footer` placeholders — every page that wants them needs those two empty divs.

### Shared head/chrome
Every `index.html` duplicates the same `<head>` (GA tag `G-JERQFZR6JP` via `/assets/js/gtag-init.js`, CSP meta tag, favicons, Google Fonts, preconnects, Magnific Popup CSS, jQuery + Magnific bundle). There is no templating — when changing head content (analytics, fonts, meta, CSP), update **every** `index.html` (root + `about/` + each `albums/*/` + `404.html`).

### Structured data (JSON-LD)
Every page's `<head>` includes a `WebSite` JSON-LD block. Album pages (`albums/*/index.html`) additionally include a `BreadcrumbList` JSON-LD block with two `ListItem`s: Home (`https://photos.lisker.me/`) → album (name + canonical URL). When adding a new album page, copy both blocks from an existing album and update the album name / URL in the `BreadcrumbList`. Breadcrumb rich results are the one visible SERP change this site's structured data produces.

## Adding or updating photos

The fastest path for a batch is the **`add-photos` skill** (`.claude/skills/add-photos/`): drop the new photos into `photos-to-add/<album-folder>/` and ask Claude to add them — it maps folders to albums, resolves names, de-conflicts filenames, runs the pipeline (P3 + HDR), and updates `photos.json`. The manual steps below are what that skill automates.

1. Drop new JPGs into `assets/images/<album>/`, then run the pipeline in `assets/images/useful-scripts/` (see its `README.md` for full details + required tools). From the album dir, pass only the new files so existing optimized photos aren't re-compressed:
   - `../useful-scripts/process.sh new1.jpg new2.jpg …` — one-shot orchestrator. Auto-detects HDR vs normal photos, runs the right tools, and prints the `photos.json` flags to use.
   - Building blocks it calls: `compress.sh` (resize 1920px/q86, **preserves the embedded Display-P3 ICC profile** — do not bare-`-strip`, that mutes wide-gamut color), `webp.sh` (`cwebp -metadata icc`, keeps the profile), `avif-hdr.sh` (UltraHDR JPG → 10-bit Display-P3/PQ HDR AVIF). `og-image.sh` resizes `og-image.jpg` to 1200px and converts it to **sRGB** (social scrapers aren't color-managed).
2. Add an entry to the album's `json/photos.json`:
   - **Normal photo:** `"hasAvif": false, "hasWebp": true`.
   - **HDR photo** (Lightroom/iPhone export with a gain map): `"hasAvif": true, "hasWebp": false` — it ships an HDR AVIF + an SDR `.jpg` fallback and **no `.webp`** (WebP can't carry HDR). See `cityscapes/san-cristobal` for the reference entry.
   `photos.js` emits a `<source>` per format from these flags and hands the modern-format URL to the lightbox.
3. `sitemap.xml` is generated by `scripts/build-sitemap.mjs` during the GitHub Pages deploy (see `.github/workflows/pages.yml`) by enumerating `albums/*/` and each album's `photos.json` — no manual update needed.

## Commit conventions (from user prefs)

- **Always ask before committing.** Staging + diff is fine, `git commit` needs explicit go-ahead.
- Single imperative line, no body, no `Co-Authored-By` trailer.
- Split logically — one concern per commit.
