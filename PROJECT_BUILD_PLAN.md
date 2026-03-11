# cloler.ai Build Plan

## Project Info

- Project name: `cloler.ai`
- Local path: `D:\cloler.ai`
- GitHub repository: [cloler.ai](https://github.com/rahulsingh2004300-blip/cloler.ai.git)
- Primary references:
  - telephony: [InboundAIVoice](https://github.com/toprmrproducer/InboundAIVoice)
  - voice cloning: [resonance](https://github.com/code-with-antonio/resonance)

## Goal

Build a multi-tenant SaaS that lets organizations:

- clone voices from uploaded recordings,
- run AI-powered inbound and outbound voice calls,
- manage agents, prompts, knowledge, and call activity from a dashboard,
- embed a support widget,
- meter usage and bill customers,
- support bulk outbound calling with DND-safe Excel/CSV uploads,
- operate legally and safely in production.

This plan is inspired by `notes.md`, but updated using the two reference repos you asked to follow:

- Telephony/call-agent reference: `InboundAIVoice`
- Voice cloning/TTS reference: `resonance`

The notes are still a strong implementation backbone for the SaaS/dashboard/widget flow, but the telephony path is now explicitly aligned to `InboundAIVoice`, not `Vapi`.

## Reference Codebases We Are Cloning

### 1. Telephony Reference - InboundAIVoice

We will clone the telephony architecture direction from:

- [InboundAIVoice](https://github.com/toprmrproducer/InboundAIVoice)

Observed stack from the repo:

- `Python` agent service
- `LiveKit Agents` worker runtime
- `Vobiz` SIP / telephony routing
- `Sarvam` plugins for STT/TTS
- `FastAPI` dashboard/config server
- `Supabase`-style call log / booking / contact storage
- `Telegram` notifications
- `cal.com` and `Google Calendar` appointment flows
- `Coolify/VPS` style self-hosted deployment path

### 2. Voice Cloning Reference - Resonance

We will clone the voice-cloning and TTS product patterns from:

- [resonance](https://github.com/code-with-antonio/resonance)

Observed direction from the repo:

- `Next.js` app experience for voice cloning and text-to-speech
- `Chatterbox TTS` for generation / cloning
- voice library + voice management
- waveform/audio preview flows
- billing + usage-metering patterns

## Key Architecture Decision

- We are **not** using `Vapi`.
- Telephony will follow an `InboundAIVoice`-style service: `LiveKit + Vobiz + Sarvam + Python/FastAPI`.
- Voice cloning will follow a `Resonance`-style service: `Chatterbox/Resemble-style cloning + TTS`.
- Core SaaS control plane can still remain `Next.js + Clerk + Convex`, because that matches your notes and gives us a better multi-tenant app foundation.
- Telephony operations can use an `InboundAIVoice`-style sidecar service and data model for calls, bookings, recordings, and ops tooling.
- Bulk outbound uploads must be filtered through DND and suppression checks before any number reaches the calling queue.
- In MVP, provider accounts are platform-owned. Customers configure behavior and business rules, but they do not bring their own `LiveKit`, `Vobiz`, `Sarvam`, or LLM API keys.

Important architecture note:

- `InboundAIVoice` is optimized for low-cost phone calls using stock `Sarvam` voices.
- `Resonance` is optimized for custom voice cloning.
- To combine both, we need a `TTS provider abstraction` inside the telephony worker:
- default path: `Sarvam Bulbul v2` for the cheapest operational calls that best match the `~₹2/min` goal
- higher-quality stock path: `Sarvam Bulbul v3` when voice quality matters more than cost
- premium/custom path: `Resonance/Chatterbox` for cloned-voice calls

Inference:

- the `~₹2/min` target fits the stock `Sarvam` telephony path more naturally than the custom cloned-voice path.
- to stay closer to that target, the default phone agent should use `Bulbul v2`, while `Bulbul v3` and cloned voices should be treated as premium quality tiers.
- we should treat cloned-voice live calls as a second benchmark until we test latency and cost.

## Telephony Cost Target

Planning target from your requirements:

- `Vobiz SIP telephony` -> about `₹0.40/min`
- `Sarvam Bulbul v2 TTS` -> about `₹15 per 10K chars` for the cost-optimized default path
- `Sarvam Bulbul v3 TTS` -> higher-quality optional path with higher effective per-call cost
- `Sarvam Saaras v3 STT` -> about `₹20 per 10K chars`
- `Groq` LLM -> effectively free at early volume target
- `Coolify/VPS` -> about `₹600/month` fixed
- target blended cost -> about `₹2/min` when we keep the stock telephony path cost-optimized
- target 5-minute call -> about `₹10` on the stock low-cost path, not the premium cloned-voice path

We will treat these as planning targets unless and until we validate them with live provider accounts.

In MVP, these are platform-owned costs. Customers are billed through our SaaS pricing and do not need to connect or pay for these provider APIs separately.

## Working Assumptions

- Monorepo: `pnpm` + `turborepo`
- Frontend apps: `marketing`, `dashboard`, `admin`, `widget/embed`
- Core backend/data: `Convex`
- Auth/orgs: `Clerk`
- UI base: `shadcn/ui`, Next.js 15, React 19, Tailwind v4
- Voice cloning/TTS service: `Resonance`-style `Chatterbox` deployment on `Modal`
- Cost-optimized stock telephony TTS default: `Sarvam Bulbul v2`
- Premium telephony TTS options: `Sarvam Bulbul v3` and `Resonance` cloned voice
- Telephony service: `InboundAIVoice`-style `Python + LiveKit Agents + Vobiz + Sarvam + FastAPI`
- Telephony ops data: `Supabase/Postgres-compatible` call-log and booking schema for the telephony service, with selected summaries synced into `Convex`
- Provider accounts for `LiveKit`, `Vobiz`, `Sarvam`, `Groq/OpenAI`, `Telegram`, and `cal.com` are platform-managed in MVP; customers configure behavior, not credentials
- Calendar integration: `cal.com` first, `Google Calendar` as supported option
- Notifications: `Telegram Bot API`
- Billing: `Razorpay`
- Deployment: `Vercel` for web apps, `Coolify/VPS` for telephony worker + FastAPI ops UI, hosted `Convex`, hosted `Modal`

## Git Workflow For Every Step

For each step:

1. Create a branch like `codex/step-XX-short-name`
2. Implement only the scoped work for that step
3. Run local verification for affected apps/services
4. Commit with a focused message
5. Push branch to GitHub
6. Open PR
7. Review and merge into `master`
8. Tag or note the milestone in project tracking

Each step below is intentionally sized so we can merge incrementally without mixing unrelated risk.

## Delivery Phases

### Step 01 - Product Blueprint and Repo Foundation

Scope:

- finalize the product architecture from the PDF and the two reference repos,
- define app boundaries and service boundaries,
- create GitHub repo standards,
- install base tooling.

Tasks:

- install and verify `pnpm`
- initialize `turborepo`
- scaffold Next.js apps with shared config
- define service folders for `telephony-agent` and supporting infra
- add linting, formatting, TypeScript, env conventions
- define monorepo folders: `apps/`, `packages/`, `convex/`, `services/`
- create contribution and branching rules
- document the split between `core SaaS`, `voice cloning`, and `telephony`

Deliverable:

- clean monorepo skeleton that runs locally

Merge gate:

- all apps build,
- workspace commands run,
- CI skeleton passes

### Step 02 - Shared UI System and Design Foundation

Scope:

- establish shared UI primitives and app shell patterns.

Tasks:

- set up `shadcn/ui`
- create shared `ui` package
- add base layout primitives, buttons, forms, dialogs, tables
- define theme tokens, spacing, typography, states
- create a starter design system for dashboard/admin/widget consistency

Deliverable:

- reusable shared UI package consumed by all apps

Merge gate:

- one shared component imported into at least two apps,
- no style drift across apps

### Step 03 - Convex Core Backend Foundation

Scope:

- connect the monorepo to Convex and create the main SaaS backend structure.

Tasks:

- create Convex project
- configure local/dev/prod environments
- add base schema for organizations, users, usage events, audit logs
- create reusable auth helpers and data access patterns
- define sync boundaries between `Convex` and the future telephony service store
- resolve lint/build issues around Convex integration

Deliverable:

- working Convex backend wired into the dashboard app

Merge gate:

- schema deploys,
- basic query and mutation work from frontend

### Step 04 - Authentication and Organization Model

Scope:

- enable secure multi-tenant auth and org switching.

Tasks:

- configure Clerk
- connect Clerk with Convex JWT auth
- add sign-in/sign-up flows
- enable organizations
- create organization selection and onboarding flow
- implement auth guards and organization guards
- enforce active-org requirement in middleware

Deliverable:

- authenticated multi-tenant SaaS foundation

Merge gate:

- unauthorized access is blocked,
- users can switch orgs,
- data isolation is enforced

### Step 05 - Observability, Errors, and Environment Safety

Scope:

- add the operational foundation early.

Tasks:

- integrate Sentry for web and backend surfaces
- create test error scenarios
- standardize env validation
- define secret handling patterns
- add structured logging for backend and frontend

Deliverable:

- errors visible in Sentry and logs

Merge gate:

- one controlled error appears in monitoring,
- env validation catches missing secrets

### Step 06 - Dashboard Shell and Core Navigation

Scope:

- build the main dashboard experience before feature depth.

Tasks:

- create dashboard layout
- build sidebar and grouped navigation
- add `UserButton` and organization switcher
- scaffold empty pages for major modules
- implement base responsive behavior
- apply theme polish

Deliverable:

- usable dashboard shell for future modules

Merge gate:

- users can navigate the dashboard without dead ends,
- layout works on desktop and mobile

### Step 07 - Widget Foundation

Scope:

- create embeddable end-user widget shell.

Tasks:

- build widget layout
- create header/footer/frame
- define widget state model
- create session table and session creation flow
- build widget auth or contact-start screen

Deliverable:

- widget opens and creates a valid contact session

Merge gate:

- widget can initialize and persist a session

### Step 08 - Widget Router, Loading, and Validation States

Scope:

- make the widget robust before AI features.

Tasks:

- add Jotai
- define widget screens and atoms
- create screen router
- build loading, error, and validation screens
- add Convex functions to validate org and contact session

Deliverable:

- widget handles valid, invalid, loading, and error paths gracefully

Merge gate:

- invalid org/session never reaches conversation UI

### Step 09 - Conversation Data Model and Basic Inbox

Scope:

- create the base conversation system used by widget and dashboard.

Tasks:

- add `conversations` schema
- create core conversation functions
- build selection/start screen
- create inbox query functions
- add widget inbox UI

Deliverable:

- conversations can be created, listed, and resumed

Merge gate:

- a new widget session can create and later re-open a conversation

### Step 10 - Dashboard Inbox and Chat Workspace

Scope:

- give operators a real workspace for handling conversations.

Tasks:

- create conversation layout and panel
- add dashboard inbox list
- create chat views for active conversation
- fix sidebar/default state issues
- connect dashboard to conversation queries

Deliverable:

- operator can browse conversations and open chat threads in dashboard

Merge gate:

- inbox and conversation detail stay in sync

### Step 11 - Internal Telephony Conversation Engine

Scope:

- build the agent logic in the same spirit as `InboundAIVoice`, but wired to our SaaS data model.

Tasks:

- model agent instructions, greeting rules, and language presets inspired by `agent.py` and `config.json`
- integrate platform-managed `Groq` access as the default agent runtime
- keep `OpenAI` only as an internal fallback or later premium option, not the default cost path
- do not expose LLM, STT, TTS, or telephony credential setup to end users in MVP
- create internal functions for conversation state, tool execution, and transcript storage
- wire agent replies into conversation and call flows used by the widget, dashboard, and telephony worker
- add prompt management for internal/admin use

Deliverable:

- reusable agent logic that can be called by the telephony worker and debugged from internal product surfaces

Merge gate:

- agent responses are generated with platform-owned credentials,
- tenant data stays isolated,
- no customer credential input is required

### Step 12 - AI Tool Calling and Conversation Controls

Scope:

- move from simple replies to workflow-aware assistance.

Tasks:

- add manual status change
- add tool-based status change
- implement prompt enhancement function
- improve operator controls
- add loading and infinite scroll to chat

Deliverable:

- AI can update workflow state and operate with richer context

Merge gate:

- status changes are auditable,
- tool calling does not leak cross-org data

### Step 13 - Knowledge Base and RAG

Scope:

- let orgs upload knowledge and use it in AI responses.

Tasks:

- add file schema and storage flows
- create `addFile`, `deleteFile`, `listFiles`
- generate embeddings
- confirm embedding dimensions and provider compatibility
- build knowledge base table and upload/delete dialogs
- create search tool and improve prompts

Deliverable:

- org-specific retrieval-augmented responses

Merge gate:

- uploaded documents can be indexed and referenced in answers

### Step 14 - Platform Telephony Config and Routing Foundation

Scope:

- prepare the `InboundAIVoice`-style telephony stack inside the SaaS without requiring customer API keys.

Tasks:

- define org telephony behavior and routing model
- store platform-owned `LiveKit`, `Vobiz`, `Sarvam`, `Telegram`, `cal.com`, and LLM secrets securely
- create org settings UI for behavior only: greeting, language, business hours, transfer number, booking rules, and stock voice defaults
- do not expose provider credential fields to customers in MVP
- add per-org telephony config overrides inspired by `config.json` / `configs/default.json`
- define the telephony ops store schema for call logs, contacts, bookings, recordings, suppression lists, and bulk upload jobs
- define how summarized telephony events sync into Convex

Deliverable:

- secure platform-managed telephony configuration foundation

Merge gate:

- platform secret storage is protected,
- org behavior config resolution is documented and tested,
- customers never need to bring provider API keys

### Step 15 - InboundAIVoice Telephony Service Clone

Scope:

- clone the core service architecture from `InboundAIVoice`.

Tasks:

- create `services/telephony-agent` in `Python`
- install and configure `livekit-agents`, `livekit-api`, `livekit-plugins-sarvam`, `fastapi`, and supporting libs
- port or reimplement the config loader and language preset model
- create the agent tool context for call transfer, availability lookup, booking intent, and end-call flows
- build `FastAPI` ops endpoints for config, logs, stats, contacts, outbound dispatch, health, and metrics
- create a browser-demo room flow for internal testing
- add initial call logging and booking persistence in the telephony ops store
- wire `Telegram` notifications and `cal.com` / `Google Calendar` helpers
- connect the worker to platform-managed provider credentials only

Deliverable:

- working telephony microservice aligned to the `InboundAIVoice` architecture

Merge gate:

- LiveKit demo room works,
- FastAPI health endpoint works,
- outbound dispatch endpoint works in a non-production test path,
- Telegram dry run succeeds

### Step 16 - Telephony UX and Tenant Voice Configuration

Scope:

- expose telephony behavior cleanly inside the SaaS UI and widget.

Tasks:

- create telephony settings views in dashboard
- create configuration forms for greeting, business hours, transfer number, language preset, and stock voice selection
- add public widget settings functions
- load org telephony config into widget and dashboard flows
- update selection screen to show stock telephony voice options and language presets
- add contact screen and callback / escalation UX where needed

Deliverable:

- each org can configure how its telephony agent behaves without touching raw service config files or entering provider credentials

Merge gate:

- widget and dashboard reflect org telephony settings safely,
- no tenant sees another tenant's telephony config

### Step 17 - Voice Cloning and Resonance-Style TTS Module

Scope:

- build the true custom voice-cloning layer using the `resonance` direction.

Tasks:

- define the voice-cloning service boundary
- deploy `Chatterbox` / `Resonance`-style TTS on `Modal`
- create voice sample upload flow
- create voice metadata schema
- store sample and voice assets in object storage
- create TTS API proxy layer
- add waveform player and voice preview UX
- add default voice library
- create a `TTS provider abstraction` with at least `sarvam` and `resonance`
- meter character and audio usage separately for stock and cloned voices

Deliverable:

- users can create or choose voices and generate speech from text

Merge gate:

- uploaded sample can produce playable synthesized output,
- usage is recorded per organization,
- telephony layer can call the selected TTS provider behind a common interface

### Step 18 - Real-Time Telephony, SIP, and Cloned-Voice Bridge

Scope:

- complete the real phone-call flow using `InboundAIVoice` telephony plus the optional cloned-voice path.

Tasks:

- configure `Vobiz` SIP trunks and number routing for inbound and outbound flows
- connect `LiveKit` SIP ingress/egress to the agent worker
- implement the real-time `STT -> LLM -> TTS` loop with `Sarvam Saaras v3` and `Groq` as the default LLM path
- keep `OpenAI` only as an optional internal fallback if needed for quality benchmarking
- use `Sarvam Bulbul v2` as the default low-cost telephony voice path that best fits the `~₹2/min` target
- keep `Sarvam Bulbul v3` as an optional higher-quality stock voice tier
- add optional `Resonance/Chatterbox` TTS path when an org selects a custom cloned voice
- persist transcript, status, duration, summary, recording reference, and booking outcomes
- add human-transfer and fallback logic if custom TTS is unavailable or too slow
- benchmark latency and effective cost against the target `~₹2/min` for the stock voice path

Deliverable:

- real phone call flow backed by AI, tenant settings, and selectable voice backends

Merge gate:

- one inbound and one outbound test flow succeed end to end with stock `Sarvam` voice,
- one controlled cloned-voice phone test succeeds if latency is acceptable,
- fallback to stock telephony voice is proven

### Step 19 - Call Logs, Contact Panel, and Live Operations UI

Scope:

- make calling operationally usable.

Tasks:

- create call log views
- create contact panel and related layout
- show status, transcript, booking state, and outcome metadata
- support recording references or playback links where allowed
- add real-time updates where practical
- surface telephony-store records cleanly inside the SaaS dashboard
- create bulk outbound upload flow for `CSV/XLSX` contact sheets
- validate headers, normalize phone numbers, deduplicate rows, and flag bad records
- block DND or suppressed numbers before scheduling calls
- auto-generate a cleaned approved sheet and a rejected sheet with reasons so the user can re-download the corrected file

Deliverable:

- operators can review and manage call activity from the dashboard, including compliant bulk outbound upload results

Merge gate:

- completed calls appear reliably with searchable metadata
- bulk upload jobs produce approved and rejected outputs with clear row-level reasons
- DND or suppressed numbers never enter the dial queue

### Step 20 - Usage Metering and Billing

Scope:

- turn the product into a business-ready SaaS.

Tasks:

- finalize billable events: stock telephony minutes, cloned-voice telephony minutes, TTS characters, storage, and premium features
- bundle platform provider costs into SaaS pricing so customers are not asked to bring their own APIs
- create subscription schema and functions
- add UI protection and API protection
- build billing page
- integrate Razorpay for subscription and/or prepaid model
- implement trial quotas and overage logic
- keep separate cost reporting for `Bulbul v2 stock calls`, `Bulbul v3 stock calls`, and `cloned voice calls`

Deliverable:

- usage-aware billing foundation

Merge gate:

- usage events roll up correctly,
- billing state gates premium features safely,
- telephony cost classes are distinguishable in reports

### Step 21 - Notifications, Analytics, and Admin Panel

Scope:

- add internal visibility and operational oversight.

Tasks:

- create admin app layouts and views
- add organization-level monitoring
- add usage and payment overviews
- integrate Telegram alerts for key events
- add abuse/review workflows for voice or calling issues
- expose call outcomes and business analytics
- track telephony KPIs such as booking rate, average duration, escalation rate, cost per call, and DND rejection rate

Deliverable:

- internal team can monitor customers, payments, calls, and incidents

Merge gate:

- admin sees cross-tenant summaries while tenant isolation remains intact in customer apps

### Step 22 - Compliance, Consent, and Audit Readiness

Scope:

- address the legal-sensitive requirements from the PDF before scale.

Tasks:

- create voice-cloning consent capture
- add call disclosure messaging support
- store consent and audit evidence
- keep DND/suppression audit logs for bulk uploads and blocked outbound attempts
- define data retention/deletion workflows
- add terms, privacy, acceptable-use, and abuse policy surfaces
- document provider-side TRAI / telephony compliance assumptions
- add controls for blocking misuse and suspending orgs
- require bulk outbound imports to pass DND checks and regenerate corrected Excel/CSV outputs when rows are rejected

Deliverable:

- product has enforceable compliance workflows, not just policy text

Merge gate:

- audit trail exists for critical actions,
- consent capture is visible in user flows

### Step 23 - Embed Script and Distribution

Scope:

- make widget deployment easy for customers.

Tasks:

- create `embed` app
- create `embed.ts` script
- create minified production build
- test external-site embedding
- document installation snippet for customers

Deliverable:

- lightweight production embed script that loads the widget on customer sites

Merge gate:

- script loads reliably on a separate test site

### Step 24 - Production Deployment and Release Hardening

Scope:

- ship the stack in a production-ready way.

Tasks:

- deploy marketing, dashboard, admin, and widget apps on `Vercel`
- deploy `Convex` production backend
- deploy `Modal` TTS service
- deploy `telephony-agent` worker and `FastAPI` ops UI on `Coolify/VPS`
- configure domains, SSL, DNS, SIP/webhook endpoints, and monitoring
- run smoke tests across web, widget, cloned voice TTS, and live calls
- finalize CI/CD and environment segregation

Deliverable:

- first production-ready MVP release

Merge gate:

- full smoke test passes on live infrastructure

## Recommended Merge Sequence

If we want the safest build order, I recommend:

1. Steps 01-06 for platform foundation
2. Steps 07-13 for widget, inbox, AI conversation core, and knowledge base
3. Steps 14-16 for telephony config and the `InboundAIVoice` service clone
4. Steps 17-18 for `Resonance` voice cloning and the cloned-voice telephony bridge
5. Steps 19-24 for operations, billing, admin, compliance, embed, and deployment

## Suggested MVP Cuts

If we need staged MVPs:

- Stop after Step 16 for a low-cost `InboundAIVoice`-style telephony SaaS with stock voices
- Stop after Step 18 for the first true `cloned voice + phone call` MVP
- Stop after Step 24 for the full launch candidate

## What Notes.md Already Covers Well

The existing notes are strongest for:

- monorepo setup,
- Convex + Clerk foundation,
- organizations and auth guards,
- Sentry,
- dashboard and widget UI,
- conversations and inbox flows,
- AI agent and tool calling,
- knowledge base and embeddings,
- widget customization,
- subscriptions,
- embed script,
- deployment basics.

## What Changed From The Previous Plan

The biggest changes are:

- removed `Vapi` from the roadmap entirely
- removed any customer bring-your-own-API assumption for telephony, STT, TTS, and LLM in MVP
- replaced telephony assumptions with `InboundAIVoice` architecture
- added `LiveKit + Vobiz + Sarvam + Python/FastAPI` explicitly
- added `cal.com`, `Google Calendar`, `Telegram`, and `Supabase-style` telephony ops flows
- added DND-safe bulk calling uploads with automatic approved/rejected Excel or CSV regeneration
- added a `TTS provider abstraction` so `Resonance` cloned voices can plug into the call stack
- separated `stock low-cost voice calling` from `custom cloned-voice calling` in cost and implementation planning
- changed deployment strategy for telephony to `Coolify/VPS`

## What The PDF Still Adds Beyond Notes.md

The PDF still adds important scope beyond the repo-inspired build notes:

- broader SaaS packaging and launch strategy,
- admin operations and analytics,
- Razorpay-specific billing direction,
- India-focused compliance, consent, and data governance,
- production hosting and domain strategy.

## Repository State

- This repository was cloned into `D:\cloler.ai` from [GitHub](https://github.com/rahulsingh2004300-blip/cloler.ai.git).
- The remote repository is currently empty, so this plan file is the first project artifact in the repo.
- The next work after this file should begin with Step 01 in a feature branch such as `codex/step-01-foundation`.

## Recommended Next Build Step

Start with Step 01 immediately and keep telephony and voice cloning as separate service tracks from day one. That separation will help us clone the two reference repos cleanly without forcing the whole SaaS app into a single backend style too early.
