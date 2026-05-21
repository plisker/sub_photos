#!/usr/bin/env bash
# One-shot pipeline for a batch of fresh original JPGs. Auto-routes each photo:
#
#   normal photo    -> compressed P3 JPG + WebP        => "hasAvif": false, "hasWebp": true
#   UltraHDR photo  -> HDR AVIF + compressed SDR JPG   => "hasAvif": true,  "hasWebp": false
#
# HDR photos (Lightroom/iPhone "HDR" exports carrying a gain map) are detected
# automatically. They must NOT be turned into WebP, and their AVIF must be built
# from the ORIGINAL — before compress.sh flattens the gain map — so this script
# makes the AVIF first, then compresses everything, then WebPs only the rest.
#
# Usage:
#   ./process.sh                 # every *.jpg in the current dir
#   ./process.sh a.jpg b.jpg     # only the named files
#
# After running, add the entries to the album's json/photos.json with the flags
# shown in the summary. Requires the sibling scripts + their tools (see README.md).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"

files=("$@"); [ "$#" -eq 0 ] && files=(*.jpg)

is_hdr() {  # carries a gain map? (Adobe/Google UltraHDR via XMP-hdrgm, or Apple, or multi-image MPF)
  local v
  v="$(exiftool -s3 -XMP-hdrgm:Version -HDRGainMapVersion -NumberOfImages "$1" 2>/dev/null | head -1)"
  [ -n "$v" ] && [ "$v" != "1" ]
}

hdr=(); normal=()
for f in "${files[@]}"; do
  if is_hdr "$f"; then hdr+=("$f"); else normal+=("$f"); fi
done

# 1. HDR AVIFs first, from the untouched originals.
for f in "${hdr[@]}"; do "$here/avif-hdr.sh" "$f" >/dev/null; echo "AVIF  ${f%.*}.avif"; done

# 2. Compress every JPG in place (P3-preserving). HDR photos become their SDR fallback.
"$here/compress.sh" "${files[@]}"

# 3. WebP only the non-HDR photos.
[ "${#normal[@]}" -gt 0 ] && "$here/webp.sh" "${normal[@]}"

echo
echo "=== photos.json flags ==="
for f in "${normal[@]}"; do echo "  ${f%.*}: hasAvif=false hasWebp=true"; done
for f in "${hdr[@]}";    do echo "  ${f%.*}: hasAvif=true  hasWebp=false  (HDR — no .webp)"; done
