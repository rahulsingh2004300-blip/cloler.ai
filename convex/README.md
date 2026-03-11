# cloler.ai Convex backend

This folder holds the control-plane backend for `cloler.ai`.

## What Convex owns

- organizations, plans, and tenant-facing configuration
- users, roles, and future auth-linked workspace records
- usage events, audit logs, and billing-visible analytics
- operator review outcomes for DND-safe bulk uploads

## What the telephony worker owns

- LiveKit session state and active media streams
- Vobiz SIP execution details while a call is in flight
- Sarvam STT/TTS request lifecycles and provider retry handling
- ephemeral buffers that do not need long-term SaaS storage

## Sync boundary

The future Python telephony service will push durable business events into Convex:

- call started, completed, failed
- cost snapshots for telephony, TTS, and STT
- booking, escalation, and transfer outcomes
- campaign import summaries and DND rejections

## Environment files

Local values stay in ignored files such as `.env.local`.
Commit only examples.

Required variables:

- `CONVEX_DEPLOYMENT`
- `CONVEX_URL`
- `CONVEX_SITE_URL`
- `NEXT_PUBLIC_CONVEX_URL`

## Useful commands

- `pnpm convex:dev`
- `pnpm convex:codegen`
- `pnpm convex:deploy`
