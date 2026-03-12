# cloler.ai Build Plan

## Project Info

- Project name: `cloler.ai`
- Local path: `D:\cloler.ai`
- GitHub repository: [cloler.ai](https://github.com/rahulsingh2004300-blip/cloler.ai.git)
- Primary references:
  - telephony: [InboundAIVoice](https://github.com/toprmrproducer/InboundAIVoice)
  - voice cloning: [resonance](https://github.com/code-with-antonio/resonance)

## Product Direction

`cloler.ai` is a dashboard-first SaaS for agencies, solo founders, and operators who want to:

- clone a business voice from uploaded recordings,
- generate speech and previews with cloned or stock voices,
- run inbound and outbound AI calls using platform-managed telephony,
- launch compliant bulk calling campaigns with DND-safe uploads,
- monitor leads, calls, bookings, transcripts, and outcomes from one dashboard,
- receive operational alerts and assistant updates through Telegram,
- bill customers with pay-as-you-go pricing through Razorpay,
- keep the unit economics close to the low-cost Indian telephony path.

Important correction from the earlier roadmap:

- the core product is **not** widget-first.
- the core product is **dashboard-first**.
- the most important user journey is:
  - business logs into dashboard,
  - uploads voice samples,
  - configures AI calling agent,
  - imports leads or connects call flows,
  - monitors calls and outcomes,
  - receives notifications in Telegram,
  - pays based on usage.

## Reference Codebases We Are Cloning

### 1. Telephony Reference - InboundAIVoice

We are cloning the telephony architecture direction from:

- [InboundAIVoice](https://github.com/toprmrproducer/InboundAIVoice)

Observed direction from the repo:

- `Python` call-agent service
- `LiveKit Agents` worker runtime
- `Vobiz` SIP / telephony routing
- `Sarvam` STT/TTS integration
- `FastAPI` control or ops surface
- call automation and call dispatch utilities
- `Telegram` notifications and operator workflow support
- deployment path designed around self-hosted service control

### 2. Voice Cloning Reference - Resonance

We are cloning the voice-cloning and TTS product direction from:

- [resonance](https://github.com/code-with-antonio/resonance)

Observed direction from the repo:

- `Next.js` protected product experience
- voice library management
- text-to-speech workflow
- billing and usage-aware product structure
- voice upload, preview, and generation patterns

## Core Architecture Decision

- We are **not** using `Vapi`.
- We are **not** making the widget the center of the product.
- We are building a `dashboard-first SaaS` with an `InboundAIVoice`-style telephony sidecar and a `Resonance`-style voice product layer.
- Telephony follows `LiveKit + Vobiz + Sarvam + Python/FastAPI`.
- Voice cloning follows a `Resonance`-style `Next.js + voice library + TTS` product model.
- Core SaaS control plane remains `Next.js + Clerk + Convex`.
- Provider credentials are platform-managed in MVP and early paid product versions.
- Customers configure business behavior, agents, voices, lead lists, campaigns, and routing behavior. They do not bring their own `LiveKit`, `Vobiz`, `Sarvam`, or LLM keys.

## Product Surfaces

### Core Surfaces

These are required for the product we are actually selling:

- `marketing` site for positioning, pricing, and conversion
- `dashboard` for agencies, solo founders, and operators
- `telephony-agent` service for AI calling runtime
- `voice cloning / TTS` service for cloned voice generation and previews
- `Telegram` integration for notifications and assistant handoff visibility

### Optional Later Surfaces

These are **not** core to the current product direction and should not drive the roadmap early:

- `widget/embed`
- `admin`

Reason:

- neither reference repo is centered on a public support widget as the main product,
- your actual product goal is voice cloning + AI calling + dashboard monitoring + Telegram + billing,
- widget and admin are useful expansion tracks, but they should not slow down the core agency product.

## Telephony Cost and Pricing Direction

Planning target from your requirements:

- `Vobiz SIP telephony` -> about `Rs 0.40/min`
- `Sarvam Bulbul v2 TTS` -> cost-optimized default stock voice path
- `Sarvam Bulbul v3 TTS` -> higher-quality optional stock voice path
- `Sarvam Saaras v3 STT` -> speech recognition path
- `Groq` -> default low-cost reasoning path
- `Coolify/VPS` -> fixed infra layer
- target blended stock-call cost -> about `Rs 2/min`
- target 5-minute stock call -> about `Rs 10`

Product monetization direction:

- sell to agencies and solo founders on a `pay-as-you-go` model,
- use `Razorpay` for wallet top-ups, usage payments, or metered subscription plans,
- separate reporting for:
  - stock low-cost calls,
  - higher-quality stock calls,
  - cloned-voice calls,
- keep cloned-voice calling as a premium tier because it is unlikely to match the cheapest stock voice economics at first.

## Working Assumptions

- Monorepo: `pnpm` + `turborepo`
- Core apps: `marketing`, `dashboard`
- Optional later apps: `widget`, `admin`
- Core backend/data: `Convex`
- Auth/orgs: `Clerk`
- UI base: `shadcn/ui`, Next.js 16, React 19, Tailwind v4
- Voice cloning/TTS service: `Resonance`-style voice library and generation service, likely using `Modal`
- Cost-optimized stock telephony path: `Sarvam Bulbul v2`
- Premium stock telephony path: `Sarvam Bulbul v3`
- Premium custom voice path: `Resonance`-style cloned voices
- Telephony service: `InboundAIVoice`-style `Python + LiveKit Agents + Vobiz + Sarvam + FastAPI`
- Telephony ops data: call logs, contacts, bookings, recordings, suppression lists, bulk-upload jobs, and campaign outcomes
- Notifications: `Telegram Bot API`
- Billing: `Razorpay`
- Deployment: `Vercel` for web apps, `Coolify/VPS` for telephony worker + FastAPI ops UI, hosted `Convex`, hosted `Modal`

## Git Workflow For Every Step

For each step:

1. Create a branch like `codex/step-XX-short-name`
2. Implement only the scoped work for that step
3. Run local verification for affected apps and services
4. Commit with a focused message
5. Push branch to GitHub
6. Open PR
7. Review and merge into `main`
8. Note the milestone in project tracking

## Delivery Phases

### Step 01 - Product Blueprint and Repo Foundation

Scope:

- finalize architecture from the PDF and reference repos,
- define app and service boundaries,
- set monorepo standards.

Tasks:

- install and verify `pnpm`
- initialize `turborepo`
- scaffold Next.js apps and shared config
- define `apps/`, `packages/`, `convex/`, `services/`
- create linting, formatting, TypeScript, env conventions
- document the split between `dashboard`, `voice cloning`, and `telephony-agent`

Deliverable:

- clean monorepo skeleton

Merge gate:

- all apps build,
- workspace commands run,
- CI skeleton passes

### Step 02 - Shared UI System and Design Foundation

Scope:

- establish shared UI primitives and design language.

Tasks:

- set up `shadcn/ui`
- create shared `ui` package
- add base layout primitives, buttons, forms, dialogs, and tables
- define theme tokens, spacing, typography, and states
- create shared dashboard and marketing building blocks

Deliverable:

- reusable UI package consumed by product surfaces

Merge gate:

- one shared component imported into at least two apps,
- visual consistency established

### Step 03 - Convex Core Backend Foundation

Scope:

- connect the monorepo to Convex and create the main SaaS backend structure.

Tasks:

- create Convex project
- configure local, dev, and prod environments
- add base schema for organizations, users, usage events, audit logs
- create auth helpers and data access patterns
- define sync boundaries between `Convex` and telephony service data

Deliverable:

- working Convex backend wired into dashboard

Merge gate:

- schema deploys,
- basic query and mutation work from frontend

### Step 04 - Authentication and Organization Model

Scope:

- enable secure multi-tenant auth and org switching.

Tasks:

- configure Clerk
- connect Clerk with Convex JWT auth
- add sign-in and sign-up flows
- enable organizations
- create organization selection and onboarding
- implement auth guards and organization guards

Deliverable:

- authenticated multi-tenant SaaS foundation

Merge gate:

- unauthorized access is blocked,
- users can switch orgs,
- data isolation is enforced

### Step 05 - Observability, Errors, and Environment Safety

Scope:

- add early operational safety.

Tasks:

- integrate Sentry for web and backend surfaces
- create test error scenarios
- standardize env validation
- define secret handling patterns
- add structured logging

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
- implement responsive behavior
- apply theme polish

Deliverable:

- usable dashboard shell for future modules

Merge gate:

- users can navigate the dashboard without dead ends,
- layout works on desktop and mobile

### Step 07 - Voice Workspace and Navigation Modules

Scope:

- turn the dashboard shell into a product workspace centered on voices and calling.

Tasks:

- define primary dashboard sections for voices, agents, calls, leads, campaigns, billing, and settings
- create page-level placeholders and module entry points
- shape the dashboard information architecture around agency workflows, not widget workflows
- add top-level status cards for voice count, active campaigns, recent calls, and spend

Deliverable:

- dashboard navigation reflects the actual sellable product

Merge gate:

- main user journeys are visible from the dashboard shell,
- no core product area feels missing from navigation

### Step 08 - Voice Library Data Model and Upload Foundation

Scope:

- create the base voice management system.

Tasks:

- add schema for voice profiles, samples, generations, and voice status
- create upload flow for reference audio
- store voice metadata and files
- build dashboard UI for voice library listing and voice detail
- prepare background job hooks for cloning and generation

Deliverable:

- orgs can upload and manage voice assets

Merge gate:

- a voice profile can be created from the dashboard,
- files and metadata persist correctly per organization

### Step 09 - Voice Cloning and TTS Generation Pipeline

Scope:

- build the true `Resonance`-style voice workspace for stock and cloned calling voices.

Tasks:

- deploy or wire the cloning and TTS service boundary
- create clone job lifecycle states
- support stock voice and custom cloned voice modes
- support uploading or recording reference audio inside the dashboard
- add theme-based presets such as sales opener, negotiation, appointment booking, support, payment reminder, and local outreach
- add generation controls for creativity, expressiveness, pace, stability, and warmth
- support text-to-speech generation with preview audio
- add waveform-style preview and preview history in dashboard
- save reusable voice preset and script defaults per voice profile
- meter generated output for billing later

Deliverable:

- users can create a stock or cloned voice profile, record or upload samples, tune the voice behavior, and generate playable previews from the dashboard

Merge gate:

- at least one voice path can generate preview audio successfully,
- cloned voice flow can accept reference samples and move through training states,
- usage is recorded per organization

### Step 10 - Leads, Contacts, and Campaign Data Foundation

Scope:

- create the dashboard-side data model for agency calling workflows.

Tasks:

- add contacts schema
- add campaign schema
- add lead status and outcome model
- create suppression list and DND result model
- define relationship between contacts, calls, campaigns, and voice selection

Deliverable:

- dashboard has a usable foundation for bulk calling and lead monitoring

Merge gate:

- leads and campaigns can be created and queried safely per organization

### Step 11 - Dashboard Leads Inbox and Contact Workspace

Scope:

- give users a real place to monitor and act on leads.

Tasks:

- create contacts table and lead detail panel
- add filters for status, campaign, and last outcome
- add empty-state and no-dead-end flows
- create operator-ready call and lead monitoring workspace

Deliverable:

- agencies and founders can monitor leads directly from dashboard

Merge gate:

- lead list and detail state stay in sync,
- contact workflows are usable on desktop and mobile

### Step 12 - Internal Telephony Conversation Engine

Scope:

- build the agent logic in the spirit of `InboundAIVoice`, wired to our SaaS model.

Tasks:

- model instructions, greeting rules, and language presets inspired by `agent.py` and `config.json`
- integrate platform-managed `Groq` as the default reasoning path
- keep `OpenAI` only as an internal fallback or premium option later
- do not expose provider credentials to customers
- create internal functions for conversation state, tool execution, and transcript storage
- add prompt management for internal and tenant-safe use

Deliverable:

- reusable agent logic for the telephony worker and dashboard debug flows

Merge gate:

- agent responses are generated with platform-owned credentials,
- tenant data stays isolated

### Step 13 - AI Tool Calling and Workflow Controls

Scope:

- move from simple replies to workflow-aware automation.

Tasks:

- add manual status change
- add tool-based status change
- implement prompt enhancement
- improve operator controls
- support richer transcript and state handling

Deliverable:

- AI can update workflow state with auditability

Merge gate:

- status changes are auditable,
- tool calling does not leak cross-org data

### Step 14 - Knowledge Base and RAG

Scope:

- let organizations upload knowledge and use it during calls.

Tasks:

- add file schema and storage flows
- create file management functions
- generate embeddings
- build knowledge base table and upload/delete dialogs
- create search tool and improve prompts

Deliverable:

- org-specific retrieval-augmented responses

Merge gate:

- uploaded documents can be indexed and referenced in answers

### Step 15 - Platform Telephony Config and Routing Foundation

Scope:

- prepare the `InboundAIVoice`-style telephony stack inside the SaaS.

Tasks:

- define org telephony behavior and routing model
- store platform-owned `LiveKit`, `Vobiz`, `Sarvam`, `Telegram`, `Razorpay`, and LLM secrets securely
- create dashboard settings UI for behavior only: greeting, language, business hours, transfer number, booking rules, voice defaults, and campaign defaults
- add per-org telephony config overrides inspired by `config.json`
- define how summarized telephony events sync into Convex

Deliverable:

- secure platform-managed telephony configuration foundation

Merge gate:

- platform secret storage is protected,
- customers never need to bring provider API keys

### Step 16 - InboundAIVoice Telephony Service Clone

Scope:

- clone the core service architecture from `InboundAIVoice`.

Tasks:

- create `services/telephony-agent` in `Python`
- install and configure `livekit-agents`, `livekit-api`, `livekit-plugins-sarvam`, `fastapi`, and support libs
- port or reimplement config loader and language preset model
- create tool context for call transfer, availability lookup, booking intent, and end-call flows
- build `FastAPI` ops endpoints for config, logs, stats, contacts, outbound dispatch, health, and metrics
- create browser-demo room flow for internal testing

Deliverable:

- working telephony microservice aligned to `InboundAIVoice`

Merge gate:

- LiveKit demo room works,
- FastAPI health endpoint works,
- outbound dispatch endpoint works in test mode

### Step 17 - Sarvam Voice Tiers and Cloned-Voice Bridge

Scope:

- unify stock Sarvam voices and cloned voices behind one telephony-facing abstraction.

Tasks:

- create TTS provider abstraction with `sarvam` and `resonance` style backends
- define default stock voice path using `Bulbul v2`
- define premium stock path using `Bulbul v3`
- define premium custom path using cloned voices
- connect dashboard voice selection to the telephony worker config

Deliverable:

- telephony can choose between stock and cloned voice paths behind one contract

Merge gate:

- voice provider choice resolves correctly per organization,
- stock fallback works if cloned voice is unavailable

### Step 18 - Real-Time SIP, Inbound, and Outbound Call Flow

Scope:

- complete the real phone-call loop.

Tasks:

- configure `Vobiz` SIP trunks and number routing
- connect `LiveKit` SIP ingress and egress to the agent worker
- implement `STT -> LLM -> TTS` loop with `Sarvam Saaras v3` and default `Groq`
- persist transcript, status, duration, summary, recording reference, and booking outcomes
- add human transfer and fallback logic
- benchmark latency and effective cost against the `Rs 2/min` stock path target

Deliverable:

- real inbound and outbound AI call flow with selectable voice backend

Merge gate:

- one inbound and one outbound test succeed end to end with stock Sarvam voice,
- one controlled cloned-voice test succeeds if latency is acceptable

### Step 19 - Bulk Outbound Uploads and DND-Safe Calling

Scope:

- make bulk calling usable and compliant for agencies.

Tasks:

- create bulk upload flow for `CSV/XLSX` lead sheets
- validate headers and normalize phone numbers
- deduplicate rows
- block DND or suppressed numbers before scheduling calls
- auto-generate approved and rejected output sheets with row-level reasons
- queue valid rows into campaign-ready outbound jobs

Deliverable:

- compliant bulk calling preparation flow from dashboard

Merge gate:

- approved and rejected sheets are generated reliably,
- DND or suppressed numbers never enter the dial queue

### Step 20 - Call Logs, Lead Monitoring, and Telegram Ops

Scope:

- make calling operationally useful for the real customer.

Tasks:

- create call log views
- create lead and contact detail panels
- show transcript, booking state, status, duration, and outcomes
- support recording links where allowed
- integrate Telegram alerts for call outcomes, failures, transfers, bookings, and campaign milestones
- support assistant-to-operator monitoring through Telegram messages

Deliverable:

- agencies and solo founders can monitor leads and calls from dashboard and Telegram

Merge gate:

- completed calls appear reliably with searchable metadata,
- Telegram notifications work for key events

### Step 21 - Usage Metering and Razorpay Billing

Scope:

- turn the product into a business-ready SaaS.

Tasks:

- finalize billable events: stock telephony minutes, cloned-voice telephony minutes, TTS characters, storage, and premium features
- bundle provider costs into SaaS pricing so customers are not asked to bring APIs
- create subscription, wallet, or usage ledger schema
- build billing page
- integrate Razorpay for pay-as-you-go charging and top-up or metered workflows
- implement quotas and overage logic
- keep separate cost reporting for `Bulbul v2`, `Bulbul v3`, and cloned voice calls

Deliverable:

- pay-as-you-go billing foundation for agencies and solo founders

Merge gate:

- usage events roll up correctly,
- Razorpay flow works in test mode,
- premium vs standard usage classes are distinguishable

### Step 22 - Compliance, Consent, and Audit Readiness

Scope:

- address the legal-sensitive requirements before scale.

Tasks:

- create voice-cloning consent capture
- add call disclosure support
- store consent and audit evidence
- keep DND and suppression audit logs for bulk uploads and blocked outbound attempts
- define retention and deletion workflows
- add terms, privacy, acceptable-use, and abuse policy surfaces
- document provider-side TRAI and telephony compliance assumptions

Deliverable:

- enforceable compliance workflows

Merge gate:

- audit trail exists for critical actions,
- consent capture is visible in user flows

### Step 23 - Optional Public Widget and Embed Script

Scope:

- add a widget only if we later need public website lead capture.

Tasks:

- create `widget` or `embed` app only after core dashboard product is stable
- create lightweight embed script
- support contact capture or callback request entry
- document installation snippet

Deliverable:

- optional public-facing entry layer for customer websites

Merge gate:

- script loads on a separate test site,
- widget does not complicate the core dashboard product

### Step 24 - Optional Admin Surface and Production Hardening

Scope:

- add platform-internal tooling only after the customer product is solid.

Tasks:

- create internal admin views for cross-tenant monitoring
- add payment and usage oversight
- add abuse and compliance review tools
- finalize deployment and CI/CD hardening
- deploy marketing and dashboard on `Vercel`
- deploy `Convex`, `Modal`, and `telephony-agent` production services
- configure domains, DNS, SSL, SIP endpoints, and monitoring
- run final smoke tests across cloning, dashboard, bulk calling, Telegram, billing, and live calls

Deliverable:

- production-ready launch candidate

Merge gate:

- full smoke test passes on live infrastructure,
- internal admin tooling is optional but safe

## Recommended Merge Sequence

For the safest build order:

1. Steps 01-06 for platform foundation and dashboard shell
2. Steps 07-11 for voice workspace, cloning foundation, leads, and dashboard monitoring
3. Steps 12-18 for agent logic, telephony config, telephony service clone, and real calls
4. Steps 19-22 for bulk calling, Telegram ops, billing, and compliance
5. Steps 23-24 only if we need widget embed or internal admin expansion

## Suggested Launch Cuts

If we need staged launches:

- Stop after Step 11 for a voice-cloning plus lead-management beta
- Stop after Step 18 for a true cloned-voice and stock-voice calling product
- Stop after Step 22 for the main commercial launch
- Treat Steps 23-24 as optional expansion tracks, not launch blockers

## What Notes.md Still Covers Well

The notes remain strongest for:

- monorepo setup,
- Convex + Clerk foundation,
- organizations and auth guards,
- Sentry,
- dashboard UI,
- AI agent and tool calling,
- knowledge base and embeddings,
- subscriptions,
- deployment basics.

## What Changed In This Cleaned-Up Plan

The biggest cleanups are:

- removed `widget` as a core product dependency
- moved `admin` out of the main build path
- re-centered the product around `dashboard + voice cloning + telephony + Telegram + billing`
- made the roadmap better match `resonance` and `InboundAIVoice`
- added explicit agency and solo-founder workflow focus
- elevated `bulk calling + DND-safe uploads` as a first-class product capability
- elevated `Razorpay pay-as-you-go billing` as a core commercial requirement
- kept `Sarvam` stock voice tiers and `cloned voice` tiers clearly separated in economics and product structure

## Repository State

- This repository lives at `D:\cloler.ai`
- The active implementation should follow this cleaned-up roadmap from here onward
- `widget` and `admin` can remain in the repo as optional later surfaces, but they should not drive near-term delivery decisions

## Recommended Next Build Step

Proceed from the dashboard-first product path:

- Step 06 done: dashboard shell
- next high-value product step: `Step 07 - Voice Workspace and Navigation Modules`
- after that, move directly into voice upload, cloning, leads, and bulk-calling workflows


