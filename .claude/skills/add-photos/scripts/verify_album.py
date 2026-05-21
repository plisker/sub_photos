#!/usr/bin/env python3
"""Sanity-check one or more albums' photos.json after adding photos.

Checks, per album:
  - photos.json is valid JSON
  - no duplicate "file" stems
  - every entry's referenced assets exist on disk:
      <file>.jpg always; <file>.webp if hasWebp; <file>.avif if hasAvif

Usage (from repo root):  verify_album.py <album> [<album> ...]
Exits non-zero if anything fails.
"""
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]


def check_album(album):
    base = REPO_ROOT / "assets" / "images" / album
    jpath = base / "json" / "photos.json"
    problems = []
    if not jpath.exists():
        return [f"{album}: missing {jpath}"]
    try:
        photos = json.loads(jpath.read_text())["photos"]
    except Exception as e:  # noqa: BLE001
        return [f"{album}: invalid JSON ({e})"]

    seen = {}
    for p in photos:
        f = p["file"]
        if f in seen:
            problems.append(f"{album}: duplicate file '{f}'")
        seen[f] = True
        missing = []
        if not (base / f"{f}.jpg").exists():
            missing.append("jpg")
        if p.get("hasWebp") and not (base / f"{f}.webp").exists():
            missing.append("webp")
        if p.get("hasAvif") and not (base / f"{f}.avif").exists():
            missing.append("avif")
        if missing:
            problems.append(f"{album}: '{f}' missing {missing}")
    if not problems:
        print(f"OK  {album}: {len(photos)} photos, all assets present, no dupes")
    return problems


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: verify_album.py <album> [<album> ...]")
    problems = []
    for album in sys.argv[1:]:
        problems += check_album(album)
    if problems:
        print("\nFAILED:")
        for p in problems:
            print(f"  - {p}")
        sys.exit(1)
    print("\nAll albums verified.")


if __name__ == "__main__":
    main()
