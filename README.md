# cloler.ai

Monorepo foundation for the `cloler.ai` voice cloning and AI calling SaaS.

## Workspace layout

- `apps/marketing` - public website
- `apps/dashboard` - customer workspace
- `apps/admin` - internal admin workspace
- `apps/widget` - widget preview and embed development surface
- `packages/ui` - shared React UI primitives
- `packages/observability` - shared structured logging and env validation helpers
- `packages/typescript-config` - shared TypeScript settings
- `packages/eslint-config` - shared ESLint settings
- `services/telephony-agent` - Python service placeholder for LiveKit/Vobiz/Sarvam integration
- `services/voice-cloning` - placeholder for the Resonance-inspired voice pipeline
- `convex` - control-plane backend for SaaS data, usage, and audit functions

## Architecture split

- Core SaaS: `apps/*` plus `convex/*`
- Telephony runtime: `services/telephony-agent/*`
- Voice cloning runtime: `services/voice-cloning/*`

This separation keeps the low-cost call stack and premium cloned-voice stack independently deployable.

## Scripts

- `pnpm dev` - run all app dev servers through Turborepo
- `pnpm env:check` - validate required environment variables for Step 4 and Step 5
- `pnpm build` - build all workspaces
- `pnpm lint` - lint all workspaces
- `pnpm typecheck` - typecheck all workspaces
- `pnpm convex:dev` - push Convex functions to the active deployment
- `pnpm convex:codegen` - regenerate Convex client/server types

## Local surfaces

- `http://localhost:3000` - marketing
- `http://localhost:3001` - dashboard
- `http://localhost:3002` - admin
- `http://localhost:3003` - widget

## Monitoring and observability

- Sentry is wired into all four Next.js surfaces via app-level instrumentation files.
- Dashboard includes a controlled test surface at `/monitoring-test`.
- Convex backend functions emit structured JSON logs for key auth/onboarding flows.

## Workflow

- branch per step using `codex/step-XX-short-name`
- validate with `pnpm env:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`
- merge each step into `main` before starting the next step

Detailed delivery sequencing lives in `PROJECT_BUILD_PLAN.md`.
