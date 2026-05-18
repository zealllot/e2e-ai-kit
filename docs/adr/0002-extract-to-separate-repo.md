# Extract Product into its own repository

At extraction time, only one substrate (mcd-website) existed, and the
Product portion was developing alongside the substrate in the same
repo. Keeping them together "works" but makes the Product/Substrate
boundary (per [ADR-0001](./0001-product-substrate-output.md))
enforceable only by convention, not by file system. B2 portability is
not falsifiable without an extraction — the only test of "Product can
be moved" is moving it.

**Decision**: extract Product into `github.com/zealllot/e2e-ai-kit`.
mcd-website becomes substrate #1 that consumes this kit (initially by
vendored copy, eventually by npm package). v0.1 is an internal
preview — no backwards-compatibility commitment until v1.0.

## Considered options

- **(A) Extract now** (chosen): forces the Product/Substrate boundary
  to be honored by file system; enables versioning; makes B2
  falsifiable.
- **(B) Structural prep within mcd-website**: move all Product files
  under one directory in mcd-website, defer extraction. Rejected —
  defers the verification of B2 indefinitely; the longer extraction is
  delayed, the more substrate-coupled drift accumulates in "Product"
  files; ONBOARDING.md and lints would be written with mcd-website
  assumptions baked in and need rework on real extraction.
- **(C) Never extract**: tacitly abandons B2 portability. Rejected —
  contradicts the Product's stated purpose.

## Consequences

- Two repos to coordinate; mcd-website needs a vendor/install
  mechanism for `skills/maintenance/SKILL.md` (Claude expects it at
  `.claude/skills/maintenance/SKILL.md` in the substrate).
- Until a second substrate onboards via this kit, B2 remains a
  hypothesis even with extraction done. Extraction is **necessary but
  not sufficient** for the Portability success criterion.
- The kit can later be open-sourced; external review keeps the design
  honest and forces the Product/Substrate boundary to stay clean
  (someone outside theplant cannot read substrate code, so any
  substrate assumption that leaked into Product docs becomes
  immediately visible).
- A v0.1 → v1.0 path requires at least one second-substrate onboarding
  + revisions to ONBOARDING.md and the three contracts driven by what
  the second substrate uncovers.
