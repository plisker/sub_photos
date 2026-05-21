---
name: add-photos
description: >-
  Add new photos to the photos.lisker.me albums (the sub_photos repo). Use this
  whenever the user has dropped images into a photos-to-add/ folder, or asks to
  "add photos / new photos / a new batch to the album(s)", import photos, or
  publish bird/album photos to the site — even if they don't name this skill.
  Handles the whole flow: mapping each drop folder to its album, resolving photo
  names (e.g. 4-letter bird banding codes → species), de-conflicting filenames,
  compressing/converting (preserving Display P3, and emitting HDR AVIFs for
  gain-map photos), updating each album's photos.json, and verifying in-browser.
---

# Adding photos to the album site

This repo (`sub_photos`, served at `photos.lisker.me`) drives each album's tile
grid from a per-album `photos.json` at runtime. Adding photos means: get
optimized image files into `assets/images/<album>/`, and add matching entries to
`assets/images/<album>/json/photos.json`. There is **no build step** — pushing to
`main` deploys. The sitemap regenerates itself on deploy; never hand-edit it.

The user's normal handoff is a `photos-to-add/` folder at the repo root, with one
subfolder per album, each holding full-res JPGs named by a short code (for birds,
the 4-letter banding alpha code, e.g. `noca.jpg` → Northern Cardinal). Your job is
to turn that into committed, correctly-named, color-correct photos plus JSON.

## The flow

Work through these in order. The fiddly, error-prone parts (de-confliction, the
image pipeline, JSON editing) are bundled into `scripts/add_to_album.py` so you
don't have to redo them by hand — your job is the judgment calls (names, mapping,
HDR/location confirmation) and verification.

### 1. Orient

From the repo root, list `photos-to-add/` and the existing albums:

```sh
ls photos-to-add/*/                 # the drop folders + their files
ls albums/ assets/images/           # existing album slugs
```

Each drop subfolder maps to one album. The folder name often differs from the
album slug — e.g. `backyard_birds/` → the `backyards` album. Match by meaning, and
**confirm any mapping that isn't obvious** before touching files; putting photos
in the wrong album is annoying to undo once committed.

### 2. Resolve a display name for every photo

The filename stem is a code, not the final name. For birds it's the standard
4-letter banding alpha code — resolve it to the full species name as it should
appear in the lightbox caption:

- `noca` → Northern Cardinal, `dowo` → Downy Woodpecker, `rcki` → Ruby-Crowned
  Kinglet, `amre` → American Redstart, `coye` → Common Yellowthroat, etc.
- Some stems are descriptive, not codes (`goslings`, `yewa-nest-building`); use a
  sensible caption ("Canada Goose goslings", "Yellow Warbler, nest building").
- Codes get split/added over time (e.g. `eawv` → Eastern Warbling Vireo, a 2025
  AOS addition). **If you can't resolve a code with confidence, ask the user
  rather than guessing** — they'd rather answer one question than ship a
  mislabeled bird. See `references/bird-codes.md` for resolution tips.

Match the capitalization style already in that album's `photos.json` (these files
title-case species and put qualifiers in the name, e.g. "American Redstart,
female", "Louisiana Waterthrush, juvenile").

### 3. Confirm the shared details up front (one batched question)

Before processing, settle anything that applies to the whole batch, in a single
`AskUserQuestion` rather than drip-feeding:

- **Location** — the `location` string for these photos (e.g. "Montrose Point Bird
  Sanctuary, Chicago, IL"). Often shared across the whole batch. Don't assume;
  the same album mixes many locations.
- **Ambiguous names/mappings** — any codes you couldn't resolve, or folder→album
  mappings you're unsure of.
- **HDR** — note (see step 5) that any gain-map photos will become HDR AVIFs;
  this is automatic, but flag it so the user knows what to expect.

### 4. De-confliction is automatic — don't pre-rename

Albums reuse codes, so a new `amre.jpg` may collide with an existing one. **You do
not need to rename anything by hand** — `add_to_album.py` checks each incoming
stem against the album's existing files, its `photos.json`, and the other files in
the same batch, and appends the next free number when needed (`amre` → `amre3`
when `amre`/`amre2` exist). It never overwrites an existing file. (Doing this by
hand is exactly where the original session burned time and hit a zsh
word-splitting bug — let the script do it.)

### 5. Process + register, per album

For each album, build a small JSON manifest of the photos and hand it to the
helper. The helper de-conflicts, runs the image pipeline, and appends the
`photos.json` entries — all in one deterministic pass.

Manifest is a list of `{src, name, location}` (the final `file` stem is derived
from `src` and de-conflicted automatically):

```json
[
  {"src": "photos-to-add/backyard_birds/noca.jpg", "name": "Northern Cardinal",
   "location": "Montrose Point Bird Sanctuary, Chicago, IL"},
  {"src": "photos-to-add/backyard_birds/scta.jpg", "name": "Scarlet Tanager",
   "location": "Montrose Point Bird Sanctuary, Chicago, IL"}
]
```

Run it (paths relative to repo root):

```sh
python3 .claude/skills/add-photos/scripts/add_to_album.py backyards /tmp/backyards.json
```

What it does, and why it matters:

- Copies each source into `assets/images/<album>/` under its de-conflicted stem,
  then runs `assets/images/useful-scripts/process.sh` on the new files only.
- `process.sh` **preserves the embedded Display P3 profile** (in both JPG and
  WebP). This is critical: a bare `-strip` drops the profile and browsers then
  render the wide-gamut pixels as sRGB, which looks badly muted/desaturated.
  Never compress these photos with a plain `magick -strip`.
- It **auto-detects HDR photos** (a Lightroom/iPhone export carrying a gain map)
  and routes them differently: an HDR AVIF (`avif-hdr.sh`, 10-bit Display-P3/PQ,
  matching `cityscapes/san-cristobal`) plus an SDR `.jpg` fallback and **no
  WebP** — because WebP can't carry HDR.
- Appends one `photos.json` entry per photo, setting the format flags from what
  was actually produced: normal → `"hasAvif": false, "hasWebp": true`; HDR →
  `"hasAvif": true, "hasWebp": false`.

The helper prints a summary (final filenames, which were HDR, JSON entries added).
Read it — that's your record of what landed where.

### 6. Verify before declaring done

1. JSON + asset integrity (the helper writes valid JSON, but confirm every
   referenced file exists and there are no duplicate `file` keys):
   ```sh
   python3 .claude/skills/add-photos/scripts/verify_album.py <album> [<album> ...]
   ```
2. In the browser — the user usually has a local server (ask if unsure; default
   `python3 -m http.server 9999`). Use the Chrome DevTools MCP to load
   `http://localhost:<port>/albums/<album>/`, confirm every new tile renders with
   no broken images and no console errors, and open at least one new photo (and
   any HDR photo) in the lightbox. For an HDR photo, eyeball the AVIF — if it
   looks wrong (off color, washed out), stop and tell the user; the libultrahdr
   reconstruction occasionally needs a Lightroom-exported AVIF instead.

### 7. Commit discipline

Do **not** commit without an explicit go-ahead — this is a hard rule for this
repo (see CLAUDE.md). Staging and showing the diff is fine. When the user does say
to commit: one focused commit per album, single imperative subject line, no body,
no `Co-Authored-By` trailer. Leave `photos-to-add/` untracked (it's the user's
scratch input); ask before removing it.

## Notes / gotchas baked in from experience

- **Display P3, always.** These are wide-gamut Lightroom exports. Preserve the
  profile end to end (`process.sh` does). The single most damaging mistake here is
  stripping it and shipping muted photos.
- **OG images are the exception** — they're converted to sRGB (`og-image.sh`),
  because social scrapers aren't color-managed. Not part of this flow unless the
  user is replacing an album's `og-image.jpg`.
- **Display order = array order** in `photos.json`. The helper appends to the end;
  the user often reorders by hand afterward, so don't fuss over placement.
- **No HTML edits.** The grid is JSON-driven and the album page's `BreadcrumbList`
  JSON-LD already exists; you only add images + JSON for an existing album.
  (Creating a brand-new album is a different, larger task — see CLAUDE.md.)
