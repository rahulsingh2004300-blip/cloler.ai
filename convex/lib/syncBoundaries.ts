export const TELEPHONY_SYNC_BOUNDARIES = {
  convexOwned: [
    "organizations, plans, and tenant-facing configuration",
    "usage events, audit logs, and dashboard analytics",
    "billing visibility and entitlement history",
    "DND-safe bulk upload outcomes and operator review state",
  ],
  telephonyOwned: [
    "LiveKit worker runtime state and streaming sessions",
    "Vobiz SIP trunk execution and active call control",
    "Sarvam STT/TTS request lifecycles and provider retries",
    "ephemeral real-time buffers, transcripts-in-flight, and media transport",
  ],
  syncIntoConvex: [
    "call_started, call_completed, and call_failed events",
    "cost snapshots for telephony, TTS, and STT usage",
    "booking outcomes, escalation flags, and DND rejections",
    "recording metadata, queue status, and campaign ingestion summaries",
  ],
} as const;
