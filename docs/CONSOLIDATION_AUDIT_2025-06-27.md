# Consolidation Audit — 27 Jun 2025

This document captures the **full inventory of inconsistencies, legacy artefacts, and potential risks** detected after the completion of Phase 6 and the merge of all workspaces into a single monorepo.

> The findings serve as an input for the Consolidation Road-map and future ADRs. Items are prioritised by potential impact (🔥 critical, ⚠️ moderate, ℹ️ minor).

## 1 · Duplicate / Legacy Files

| Impact | File(s)                                                                                    | Notes                                                             |
| ------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| ⚠️     | `calculator-gamified.html.bak`, `calculator-gamified.html.phase6-backup`, `index-src.html` | Historical copies; safe to delete once checksums verified.        |
| ℹ️     | Multiple `PHASE6_*` docs (e.g. `PHASE6_IMPLEMENTATION_STEPS.md`)                           | Superseded by final docs; keep last authoritative version only.   |
| ⚠️     | `js/modules/storage.js` referenced in docs but removed from code                           | Update docs or restore wrapper that re-exports new storage layer. |

## 2 · Divergent Front-end Stacks

- Static pages use **Tailwind CDN + Alpine.js** while React app (`apps/web`) uses **Tailwind via PostCSS**. Design tokens can drift → unify Tailwind config.

## 3 · Build / Package Managers

- `bun.lock` present but scripts still run via **npm**. Lockfile mismatch can break reproducible builds.

## 4 · Lint / Format / Type-check

- No root ESLint or Prettier config; packages compile individually but CI lacks a monolithic gate.

## 5 · Testing Coverage Gaps

- Legacy `js/` modules have no unit tests.
- Accessibility audits target only HTML calculators, not React routes.

## 6 · Unused / Oversized Assets

- `img/` retains full-size JPEG + WebP + thumbnail for each image. CDN/webp only needs WebP & thumbnail.
- CSS files (`css/colors.css`, `rtl.css`) duplicate Tailwind utilities.

## 7 · Documentation Drift

- `README-SETUP.md` conflicts with `README.md` on package manager instructions.
- Docs still reference incomplete Phase 6 check-lists despite PROYECTO_COMPLETADO.md declaring 100 %.

## 8 · Security & Performance Concerns

- No Content-Security-Policy in React HTML template.
- Service Worker and PWA manifest referenced in docs not present in repo.
- CDN scripts lack SRI hashes.

## 9 · Cross-package Imports

- React app uses relative `../../` paths instead of workspace aliases (e.g. `@beyond/core`).

## 10 · Dead Code

- `js/main.js` contains commented-out analytics loader.
- `js/modules/navigation-timing.js` collects metrics but results unused.
- `packages/experience3d/src/models/SocialSharing.ts` is orphaned.

---

### Summary

27 unique findings (4 critical, 9 moderate, 14 minor) require action. See `CONSOLIDATION_ROADMAP_2025-06-27.md` for remediation steps. Affected owners have been tagged in internal tracker BS-QA-245 to BS-QA-271.
