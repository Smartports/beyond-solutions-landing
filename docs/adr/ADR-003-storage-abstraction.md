# ADR-003 Storage Abstraction – IndexedDB via Dexie.js in @beyond/core

## Status

Proposed – 28 Jun 2025

## Context

Autosave and offline persistence live in `packages/core/src/storage/*`. The abstraction wraps **Dexie.js** (IndexedDB) and is consumed by both the legacy calculator (vanilla JS) and the React application.

Some modules had historically imported Dexie directly or mocked `localStorage`, causing duplication.

## Decision

- Expose `createDB()` and `autosave(key, data)` helpers from `@beyond/core`.
- Deprecate direct Dexie imports elsewhere; enforce through ESLint rule `no-restricted-imports`.
- Future cloud-sync (Firebase, Supabase) will be layered behind the same interface to avoid breaking changes.

## Consequences

- Unified persistence layer across all UIs.
- Easier migration to alternative storage or encryption.
- Slight indirection cost, negligible performance impact.
