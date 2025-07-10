# Consolidation Road-map — 27 Jun 2025

> Objective: eliminate technical debt, harmonise the multi-stack codebase, and formalise architecture for long-term maintenance **without regressing any Phase 1-6 functionality**.

## Phase Overview

| Phase | Goal                     | Key Tasks                                                     | Owners         |
| ----- | ------------------------ | ------------------------------------------------------------- | -------------- |
| 0     | Preconditions            | • Branch freeze<br/>• CI gates (lint, typecheck, test, build) | Dev-Ops        |
| 1     | Clean-up & Deduplication | Remove backups, prune dead modules, optimise img/             | Front-end team |
| 2     | Unified Package Manager  | Decide bun ↔ bun, update lockfile, workspace scripts         | Dev-Ops        |
| 3     | Tooling Baseline         | ESLint + Prettier mono-config, root tsconfig.base, Husky      | Platform       |
| 4     | Tailwind Harmonisation   | Shared config, generated CSS for static pages                 | UI/Design      |
| 5     | Testing Matrix           | Vitest + RTL, axe on React, dep-check                         | QA             |
| 6     | Docs & ADRs              | Merge READMEs, write ADR-001..003                             | Tech-Writing   |
| 7     | Runtime Hardening        | CSP, Vite PWA plugin, code-split heavy chunks                 | Security       |
| 8     | Namespacing & Imports    | ts-paths aliases, codemod relative → alias                    | Platform       |
| 9     | CI / CD                  | GH Actions matrix, gh-pages deploy                            | Dev-Ops        |
| 10    | Regression Audit         | Lighthouse CI, bundlesize, axe-core                           | QA             |

## Detailed Tasks per Phase

### Phase 0 – Preconditions

1. `git checkout -b consolidation-phase`
2. Add GitHub Action `ci.yml` that runs `bun run lint && bun run typecheck && bun run test && bun run build`.

### Phase 1 – Clean-up & Deduplication

- Delete legacy files listed in Audit §1 once checksum verified.
- Run `npx depcheck` then archive/remove unused modules.
- Optimise images via `npx sharp-cli` (resize + WebP).

### Phase 2 – Unified Package Manager

- (Recommended) Standardise on **npm** for universal CI support.
- Remove `bun.lock`; regenerate `package-lock.json` with `bun i`.
- Add root `scripts`: `lint`, `format`, `typecheck`, `test`, `build`, `start`.
- Package manager migration: project now uses **Bun 1.2.17** workspaces; CI updated, README updated, `.bun-version` added.

### Phase 3 – Tooling Baseline

- Install ESLint, Prettier, Tailwind plugin, eslint-plugin-security.
- Create `.eslintrc.cjs` extending shared rules; inherit in each package.
- `tsconfig.base.json` extends `strict: true`; packages extend base.
- Add Husky pre-commit running `bun run lint && bun run typecheck`.

### Phase 4 – Tailwind Harmonisation

- Move `tailwind.config.js` to repo root; export preset object.
- Static HTML: remove CDN link, import generated `tailwind-static.css`.
- Update PurgeCSS `content` paths to include `*.html` and React `src/**/*`.

### Phase 5 – Testing Matrix

- Add Vitest config to root; package tests co-located.
- Integrate `vitest-axe` for accessibility unit tests.
- Extend existing `test/` scripts for React routes.

### Progress Update 28 Jun 2025

- Phase 5 – Testing Matrix: baseline configuration with Vitest + React Testing Library in place, CI-ready. Initial axe-a11y test passes (StepContainer).
- Phase 7 – PWA groundwork: vite-plugin-pwa added to apps/web with auto-update service worker and manifest scaffold.

Update 28 Jun 2025 (evening)

- CSP meta injected into React build via custom Vite plugin.
- Static HTML pages updated with identical CSP using `bun run fix:csp` helper script.

Next up: add PWA icon assets, merge README docs, and draft ADR-001/002/003.

### Phase 6 – Docs & ADRs

- Merge `README-SETUP.md` into `README.md` (append Bun appendix).
- Create `docs/adr/` with:
  - ADR-001 Package Manager Choice
  - ADR-002 Tailwind Strategy
  - ADR-003 Storage Abstraction
- Archive superseded PHASE6 docs.

### Phase 7 – Runtime Hardening

- Use `vite-plugin-html` to inject CSP meta + SRI for CDN links.
- Add `@vite-pwa/plugin` to generate `sw.js` & `manifest.webmanifest`.
- Refactor dynamic imports for maps/3D/finance to enable code splitting.

### Phase 8 – Namespacing & Imports

- Add aliases to `tsconfig.base.json`:

```json
{
  "paths": {
    "@beyond/core/*": ["packages/core/src/*"],
    "@beyond/ui/*": ["packages/ui/src/*"],
    "@beyond/geo/*": ["packages/geo/src/*"],
    "@beyond/maps/*": ["packages/maps/src/*"],
    "@beyond/finance/*": ["packages/finance/src/*"],
    "@beyond/experience3d/*": ["packages/experience3d/src/*"]
  }
}
```

- Run codemod (`jscodeshift`) replacing relative imports.

### Phase 9 – CI / CD

- Set up GitHub Action cache for `~/.npm`.
- Matrix Node 18 & 20.
- Deploy `apps/web/dist` + static HTML to `gh-pages` branch via `peaceiris/actions-gh-pages`.

### Phase 10 – Regression Audit

- Lighthouse-CI config targeting home & `/app` routes.
- bundlesize budgets: JS ≤ 500 KB (critical), First LCP ≤ 2.0 s.
- axe-core + pa11y on build artifacts.

## Acceptance Criteria

- All CI checks green on consolidation branch.
- `bun run build && bun run preview` renders without console warnings.
- Lighthouse scores: ≥ 90 (PWA, A11y, Best-Practices, Performance).
- 0 high-severity vulnerabilities (`bun audit`).
- No duplicated images > 200 KB in `img/`.

- Import alias codemod script `bun run fix:imports` (replaces relative package paths with `@beyond/*`).

---

_Approved by:_ Core-maintainers Guild · 27 Jun 2025
