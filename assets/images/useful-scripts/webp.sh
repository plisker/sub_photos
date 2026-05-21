#!/usr/bin/env bash
# Convert JPGs to WebP.
#
# `-metadata icc` carries the embedded ICC color profile (e.g. Display P3) into
# the WebP; cwebp strips all metadata by default, which would mute wide-gamut
# colors. Run AFTER compress.sh so the source JPGs already carry the profile.
#
# Do NOT run this on an HDR photo — WebP can't carry HDR; those use an AVIF
# (avif-hdr.sh) with "hasWebp": false instead.
#
# Usage:
#   ./webp.sh                # every *.jpg in the current dir
#   ./webp.sh a.jpg b.jpg    # only the named files
set -euo pipefail
files=("$@"); [ "$#" -eq 0 ] && files=(*.jpg)
for file in "${files[@]}"; do
  cwebp -quiet -metadata icc "$file" -o "${file%.*}.webp"
done
