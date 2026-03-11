# cloler.ai

Monorepo foundation for the `cloler.ai` voice cloning and AI calling SaaS.

## Workspace layout

- `apps/marketing` - public website
- `apps/dashboard` - customer workspace
- `apps/admin` - internal admin workspace
- `apps/widget` - widget preview and embed development surface
- `packages/ui` - shared React UI primitives
- `packages/typescript-config` - shared TypeScript settings
- `packages/eslint-config` - shared ESLint settings
- `services/telephony-agent` - Python service placeholder for LiveKit/Vobiz/Sarvam integration
- `convex` - reserved backend folder for Convex schema and functions

## Scripts

- `pnpm dev` - run all app dev servers through Turborepo
- `pnpm build` - build all workspaces
- `pnpm lint` - lint all workspaces
- `pnpm typecheck` - typecheck all workspaces

The delivery roadmap lives in `PROJECT_BUILD_PLAN.md`.
