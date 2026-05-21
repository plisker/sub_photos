#!/usr/bin/env bash
# Resize og-image.jpg to 1200px wide for social/share cards.
#
# Unlike the gallery photos, OG images are CONVERTED to sRGB (not kept in P3):
# the scrapers that render share cards (iMessage, Slack, Facebook, X) are usually
# not color-managed, so a P3 or untagged-P3 image shows up muted/wrong there.
# `-profile <sRGB.icc>` does a real P3->sRGB conversion (using the embedded source
# profile); `-strip` then drops all metadata, leaving universally-correct sRGB.
#
# The sRGB profile path below is macOS (ColorSync). On Linux use e.g.
# /usr/share/color/icc/sRGB.icc, or any sRGB ICC you have.
set -euo pipefail
SRGB="/System/Library/ColorSync/Profiles/sRGB Profile.icc"
magick og-image.jpg -resize 1200x -profile "$SRGB" -strip -quality 86 og-image.jpg
