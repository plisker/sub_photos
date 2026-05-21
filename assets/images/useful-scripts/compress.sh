#!/usr/bin/env bash
# Resize JPGs to 1920px wide at quality 86, in place.
#
# `+profile '!icc,*'` keeps ONLY the embedded ICC color profile and drops
# everything else (EXIF, GPS, XMP, embedded thumbnail, HDR gain-map MPF image).
# This preserves wide-gamut color (e.g. Display P3 Lightroom exports) — plain
# `-strip` removes the profile too, so P3 pixels get read as sRGB and look muted.
# (For an HDR photo this also flattens it to its SDR base — that's the intended
#  SDR fallback; make the HDR AVIF separately with avif-hdr.sh.)
#
# Usage:
#   ./compress.sh                # every *.jpg in the current dir
#   ./compress.sh a.jpg b.jpg    # only the named files (use this for new photos
#                                #  so you don't re-compress already-optimized ones)
# Run BEFORE webp.sh so the WebP inherits the profile.
set -euo pipefail
files=("$@"); [ "$#" -eq 0 ] && files=(*.jpg)
for X in "${files[@]}"; do
  magick "$X" -resize 1920x -quality 86 +profile '!icc,*' "$X"
done
