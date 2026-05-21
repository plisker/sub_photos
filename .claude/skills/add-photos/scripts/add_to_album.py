#!/usr/bin/env python3
"""Add a batch of photos to one album: de-conflict filenames, run the image
pipeline (P3-preserving + HDR-aware), and append photos.json entries.

This bundles the error-prone parts of the add-photos flow so they're done
deterministically every time. The judgment calls (species names, location, album
mapping, HDR confirmation) stay with the caller — this just executes.

Usage (run from the repo root):
    add_to_album.py <album-slug> <manifest.json>

manifest.json is a list of objects:
    [{"src": "photos-to-add/<dir>/<code>.jpg",
      "name": "Northern Cardinal",
      "location": "Montrose Point Bird Sanctuary, Chicago, IL"}, ...]

The final on-disk filename ("file" stem in photos.json) is derived from the src
basename and de-conflicted against the album's existing files, its photos.json,
and the other files in this same batch (e.g. amre -> amre3 when amre/amre2 exist).
Existing files are never overwritten.

Format flags are set from what the pipeline actually produced:
    normal photo -> hasAvif: false, hasWebp: true
    HDR photo    -> hasAvif: true,  hasWebp: false   (HDR AVIF + SDR jpg, no webp)
"""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]  # scripts/add-photos/skills/.claude/<root>


def die(msg):
    sys.exit(f"add_to_album: {msg}")


def next_free_stem(stem, used):
    """First of stem, stem2, stem3, ... not already taken."""
    if stem not in used:
        return stem
    n = 2
    while f"{stem}{n}" in used:
        n += 1
    return f"{stem}{n}"


def main():
    if len(sys.argv) != 3:
        die("usage: add_to_album.py <album-slug> <manifest.json>")
    album, manifest_path = sys.argv[1], sys.argv[2]

    album_dir = REPO_ROOT / "assets" / "images" / album
    json_path = album_dir / "json" / "photos.json"
    process_sh = REPO_ROOT / "assets" / "images" / "useful-scripts" / "process.sh"
    if not album_dir.is_dir():
        albums = sorted(p.name for p in (REPO_ROOT / "assets" / "images").iterdir()
                        if (p / "json" / "photos.json").exists())
        die(f"no album '{album}'. Available: {', '.join(albums)}")
    if not json_path.exists():
        die(f"missing {json_path}")
    if not process_sh.exists():
        die(f"missing {process_sh}")

    manifest = json.loads(Path(manifest_path).read_text())
    if not isinstance(manifest, list) or not manifest:
        die("manifest must be a non-empty JSON list")

    data = json.loads(json_path.read_text())
    photos = data["photos"]

    # Names already in use: photos.json entries + every file already in the dir.
    used = {p["file"] for p in photos}
    for f in album_dir.iterdir():
        if f.is_file() and f.suffix.lower() in (".jpg", ".jpeg", ".webp", ".avif"):
            used.add(f.stem)

    # De-conflict + copy originals into the album dir (originals so the pipeline
    # still sees any HDR gain map).
    planned = []  # (final_stem, name, location)
    for item in manifest:
        for key in ("src", "name", "location"):
            if key not in item:
                die(f"manifest item missing '{key}': {item}")
        src = (REPO_ROOT / item["src"]).resolve() if not os.path.isabs(item["src"]) else Path(item["src"])
        if not src.exists():
            die(f"source not found: {item['src']}")
        stem = next_free_stem(src.stem, used)
        used.add(stem)
        dest = album_dir / f"{stem}.jpg"
        if dest.exists():
            die(f"refusing to overwrite existing {dest}")
        shutil.copy2(src, dest)
        planned.append((stem, item["name"], item["location"]))

    # Run the pipeline on just the new files (auto P3 + HDR routing).
    new_jpgs = [f"{stem}.jpg" for stem, _, _ in planned]
    print(f"Running process.sh on {len(new_jpgs)} file(s) in {album_dir} ...")
    subprocess.run([str(process_sh), *new_jpgs], cwd=album_dir, check=True)

    # Build entries from what was actually produced.
    added = []
    for stem, name, location in planned:
        has_avif = (album_dir / f"{stem}.avif").exists()
        has_webp = (album_dir / f"{stem}.webp").exists()
        if not has_avif and not has_webp:
            die(f"pipeline produced neither .webp nor .avif for {stem} — aborting")
        entry = {"name": name, "file": stem, "location": location,
                 "hasAvif": has_avif, "hasWebp": has_webp}
        photos.append(entry)
        added.append((stem, name, "HDR" if has_avif else "normal", has_avif, has_webp))

    json_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")

    print(f"\nAdded {len(added)} photo(s) to {album}:")
    for stem, name, kind, ha, hw in added:
        print(f"  {stem:<22} {name:<32} [{kind}]  hasAvif={ha} hasWebp={hw}")
    print(f"Updated {json_path.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
