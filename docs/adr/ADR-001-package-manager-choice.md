# ADR-001 Package Manager Choice – Bun Workspaces

## Status

Accepted – 28 Jun 2025

## Context

The repository initially used **npm** for CI and most scripts, but also experimented with **Bun** (see `bun.lock`). Maintaining both tools led to inconsistent lockfiles and reproducibility issues.

## Decision

We standardise on **Bun 1.2.17** with built-in _workspaces_ support.

- Remove `package-lock.json` and any legacy bun lockfiles.
- Maintain a single `bun.lockb` at the repo root.
- Each workspace (`apps/*`, `packages/*`) declares `name` and `version` but does not maintain an independent lockfile.

## Consequences

- CI image uses Bun as the default package manager and script runner.
- Developers avoid confusion about `bun install` vs `bun install`.
- Switching back to bun or another package manager in the future would require a new ADR.
