# Contributing to cloler.ai

## Branching model

- Create one branch per roadmap step.
- Use the branch format `codex/step-XX-short-name`.
- Keep each branch scoped to a single step or cleanup slice.
- Merge into `main` only after validation passes.

## Delivery flow

1. Start from an up-to-date `main`.
2. Create a step branch.
3. Implement only the scoped step deliverable.
4. Run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
5. Push the branch and review the diff.
6. Merge the step branch into `main`.

## Workspace commands

- `pnpm dev` runs all app dev servers through Turborepo.
- `pnpm lint` checks the monorepo lint rules.
- `pnpm typecheck` validates TypeScript packages and apps.
- `pnpm build` verifies production builds for the web apps.
- `pnpm convex:dev` pushes local Convex changes to the active deployment.

## Architecture split

- `apps/*` holds the core SaaS surfaces.
- `convex/*` holds the control-plane backend for tenant data, usage, and audit history.
- `services/telephony-agent/*` is reserved for the LiveKit + Vobiz + Sarvam runtime.
- `services/voice-cloning/*` is reserved for the Resonance-inspired voice pipeline.

## Environment rules

- Commit example files only.
- Keep real values in ignored `.env.local` files.
- Prefer environment-driven defaults over hardcoded demo identities in app code.
