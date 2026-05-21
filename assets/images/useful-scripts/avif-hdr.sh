#!/usr/bin/env bash
# Generate a wide-gamut HDR AVIF from an UltraHDR JPEG (an SDR base image + an
# embedded gain map, e.g. a Lightroom/iPhone "HDR" export). The output matches
# cityscapes/san-cristobal.avif: 10-bit, YUV444, full range, Display-P3 primaries,
# PQ transfer (CICP 12/16/6). Color-managed browsers show real HDR on capable
# displays and tone-map to SDR everywhere else.
#
# In photos.json, the entry for this file must use:  "hasAvif": true, "hasWebp": false
# and you should NOT generate a .webp for it (WebP can't carry HDR). Keep an SDR
# .jpg alongside as the fallback (run compress.sh on the same source for that).
#
# Requires: ultrahdr_app (libultrahdr), python3 + numpy, ImageMagick, avifenc/avifdec.
#   brew install libultrahdr libavif imagemagick
#
# Usage: ./avif-hdr.sh input.jpg [output.avif] [width]   (width default 1920)
set -euo pipefail

src="$1"
out="${2:-${src%.*}.avif}"
width="${3:-1920}"

# Bail early if the source isn't actually an UltraHDR file (no gain map = nothing to do).
if ! exiftool -s -s -s -HDRGainMapVersion -MPImage2 "$src" 2>/dev/null | grep -q .; then
  echo "WARN: '$src' has no detectable gain map — it may not be an UltraHDR/HDR JPEG." >&2
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
# Read dims from the first frame only ([0]) — UltraHDR files are multi-image (MPF).
read -r W H < <(identify -format "%w %h\n" "${src}[0]")

# 1. Decode the gain map to PQ-encoded rgba1010102 (packed 10-bit) at full resolution.
ultrahdr_app -m 1 -j "$src" -o 2 -O 5 -z "$tmp/pq.raw" >/dev/null

# 2. Unpack the packed 10-bit channels (R:0-9 G:10-19 B:20-29 A:30-31) to a 16-bit RGB PPM.
python3 - "$tmp/pq.raw" "$W" "$H" "$tmp/pq.ppm" <<'PY'
import sys, numpy as np
raw, W, H, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
v = np.fromfile(raw, dtype='<u4')
assert v.size == W * H, (v.size, W * H)
r, g, b = (v & 0x3FF), (v >> 10) & 0x3FF, (v >> 20) & 0x3FF
rgb16 = ((np.stack([r, g, b], -1).astype(np.uint32) * 65535 + 511) // 1023).astype('>u2')
with open(out, 'wb') as f:
    f.write(f"P6\n{W} {H}\n65535\n".encode())
    f.write(rgb16.tobytes())
PY

# 3. Resize (in the PQ domain) and hand to avifenc as a 16-bit PNG; avifenc does RGB->YUV.
magick "$tmp/pq.ppm" -resize "${width}x" -strip -depth 16 "$tmp/pq.png"

# 4. Encode: Display-P3 primaries (12) / PQ transfer (16) / BT.601 matrix (6), 10-bit, full range.
avifenc -q 80 -s 4 -d 10 -y 444 -r full --cicp 12/16/6 "$tmp/pq.png" "$out" >/dev/null

echo "Wrote $out"
avifdec --info "$out" | grep -iE "depth|range|primaries|transfer|matrix|format"
echo "Reminder: set \"hasAvif\": true, \"hasWebp\": false for this file in photos.json (no .webp)."
