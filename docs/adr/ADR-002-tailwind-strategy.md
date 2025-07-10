# ADR-002 Tailwind Strategy – Shared Root Config & Static Build

## Status

Accepted – 28 Jun 2025

## Context

The project used two different Tailwind delivery methods:

1. **CDN (`cdn.tailwindcss.com`)** for legacy static HTML pages.
2. **PostCSS build** inside `apps/web` React workspace.

Token drift and duplicate configuration became an issue, and the CSP hardening effort required self-hosted styles.

## Decision

1. Introduce a **single root `tailwind.config.cjs`** exporting the design-system tokens.
2. Static HTML pages consume pre-compiled output `css/tailwind-static.css` (generated via `bun run build:tailwind:static`).
3. React workspaces extend the base config via `require('../../tailwind.config.cjs')`.
4. Remove CDN script and inline `tailwind.config` from static pages (`bun run fix:tailwind-html`).

## Consequences

- Design tokens are now source-of-truth in one place.
- CSP script/style hashes are simpler (`style-src 'self' 'unsafe-inline'`).
- Build step must be run after token changes to refresh `tailwind-static.css`.
