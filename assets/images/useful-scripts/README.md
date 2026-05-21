# Image pipeline scripts

Helpers for preparing album photos. Run them from inside an album image dir
(`assets/images/<album>/`) on the **original** full-res JPGs.

## Tools

- ImageMagick (`magick`), `cwebp` (webp), `avifenc`/`avifdec` + `ultrahdr_app`
  (libavif / libultrahdr) for HDR, `exiftool`, `python3` + `numpy`.
- macOS: `brew install imagemagick webp libavif libultrahdr exiftool`.

## Color handling (important)

Gallery photos are kept in their embedded **Display P3** profile end to end —
stripping the profile (the old behavior) made wide-gamut colors look muted
because browsers then read P3 pixel values as sRGB. So:

- `compress.sh` keeps the ICC profile (`+profile '!icc,*'`) while dropping
  EXIF/GPS/thumbnail bloat.
- `webp.sh` carries the profile through (`cwebp -metadata icc`).
- OG/share images are the exception — `og-image.sh` converts P3 → sRGB, because
  social scrapers aren't color-managed.

## Usual workflow

```sh
# from assets/images/<album>/ , passing only the NEW files:
../useful-scripts/process.sh new1.jpg new2.jpg ...
```

`process.sh` auto-detects HDR vs normal photos and routes each one, then prints
the `photos.json` flags to use. It calls the building blocks below; you can also
run them directly:

| script         | does                                                            | photos.json |
| -------------- | --------------------------------------------------------------- | ----------- |
| `process.sh`   | orchestrates the below; auto-detects HDR                        | prints them |
| `compress.sh`  | resize to 1920px, q86, keep ICC (P3)                            | —           |
| `webp.sh`      | JPG → WebP, keep ICC                                            | —           |
| `avif-hdr.sh`  | UltraHDR JPG → 10-bit Display-P3/PQ HDR AVIF (CICP 12/16/6)     | —           |
| `og-image.sh`  | resize `og-image.jpg` to 1200px, convert to sRGB               | —           |

Pass no args to process the whole directory, or filenames to process only those
(prefer the latter for new photos — re-running over the whole dir re-compresses
already-optimized files and degrades them).

## Normal vs HDR photos

- **Normal photo** → `compress.sh` + `webp.sh`. JSON: `"hasAvif": false, "hasWebp": true`.
- **HDR photo** (a Lightroom/iPhone export with a gain map) → `avif-hdr.sh` for the
  HDR AVIF, plus `compress.sh` for an SDR `.jpg` fallback; **no WebP** (WebP can't
  carry HDR). JSON: `"hasAvif": true, "hasWebp": false`.
  - Build the AVIF from the **original** before compressing — `compress.sh`
    flattens the gain map. `process.sh` already orders this correctly.
  - The AVIF matches `cityscapes/san-cristobal.avif`: 10-bit, YUV444, full range,
    Display-P3 primaries, PQ transfer. Real HDR on capable displays, tone-mapped
    to SDR elsewhere.

The grid (`photos.js`) emits an `<source>` per format from these flags, so the
browser picks AVIF / WebP / JPG via `<picture>` negotiation.
