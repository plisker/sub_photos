# Resolving bird filename codes → species names

Most photos in this site are birds, named on disk by the **4-letter banding alpha
code** (the IBP / AOS "alpha codes"). Resolve each to the full common name for the
`name` field (the lightbox caption).

## How the codes work

- **One-word names**: first 4 letters — `MALL` Mallard, `SORA` Sora.
- **Two-word names**: first 2 of each word — `NOCA` Northern Cardinal, `DOWO`
  Downy Woodpecker, `HOSP` House Sparrow, `RWBL` Red-Winged Blackbird, `SCTA`
  Scarlet Tanager, `SWTH` Swainson's Thrush.
- **Hyphenated / three-word names** follow related conventions (often 1-1-2 or
  1-2-1) — `RCKI` Ruby-Crowned Kinglet, `YBFL` Yellow-Bellied Flycatcher, `BTBW`
  Black-Throated Blue Warbler, `BBWA` Bay-Breasted Warbler, `CSWA` Chestnut-Sided
  Warbler.
- Warblers seen here: `AMRE` American Redstart, `COYE` Common Yellowthroat, `MAWA`
  Magnolia, `WIWA` Wilson's, `PAWA` Palm, `BLBW` Blackburnian, `YEWA` Yellow,
  `NOPA` Northern Parula, `CMWA` Cape May, `CAWA` Canada, `BAWW` Black-and-white,
  `MGWA` MacGillivray's, `KIWA` Kirtland's, `CONW` Connecticut, `PROW`
  Prothonotary, `LOWA` Louisiana Waterthrush, `YRWA` Yellow-Rumped.

## Cautions

- **Codes change.** The AOS revises codes as species are split/lumped. `EAWV` =
  Eastern Warbling Vireo is a 2025 addition (Warbling Vireo split). Write the
  display name without a hyphen ("Eastern Warbling Vireo"). When a code
  looks non-standard, a recent split is a likely reason — a quick web search for
  "<CODE> bird banding alpha code" usually confirms it.
- **Descriptive stems aren't codes.** `goslings`, `yewa-nest-building`, an
  `-f`/`-m` suffix for female/male, or a trailing number are not part of a code.
  Keep any qualifier in the `name` (e.g. "Yellow Warbler, nest building",
  "American Redstart, female") — matching existing entries in the album JSON.
- **When unsure, ask.** A wrong species name is worse than one clarifying
  question. Surface every code you can't resolve confidently in the batched
  question (step 3 of the skill).

## Capitalization

Match the album's existing `photos.json` style: title-case each significant word,
hyphenated compounds capitalized on both sides ("Black-Throated Blue Warbler"),
qualifier appended after a comma.
