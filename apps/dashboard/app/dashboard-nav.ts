export type DashboardIcon =
  | "home"
  | "voice"
  | "spark"
  | "leads"
  | "campaign"
  | "phone"
  | "wallet"
  | "settings";

export type DashboardNavItem = {
  href: string;
  label: string;
  description: string;
  icon: DashboardIcon;
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        href: "/",
        label: "Overview",
        description: "Live activity, spend, and rollout status",
        icon: "home",
      },
      {
        href: "/voices",
        label: "Voices",
        description: "Recorded samples, clone jobs, and previews",
        icon: "voice",
      },
      {
        href: "/agents",
        label: "Agents",
        description: "Prompt behavior, tone, and guardrails",
        icon: "spark",
      },
    ],
  },
  {
    label: "Outbound",
    items: [
      {
        href: "/leads",
        label: "Leads",
        description: "Qualified contacts and follow-up state",
        icon: "leads",
      },
      {
        href: "/campaigns",
        label: "Campaigns",
        description: "Bulk calling batches and queue health",
        icon: "campaign",
      },
      {
        href: "/calls",
        label: "Calls",
        description: "Live queue, outcomes, and transcripts",
        icon: "phone",
      },
    ],
  },
  {
    label: "Business",
    items: [
      {
        href: "/billing",
        label: "Billing",
        description: "Usage, wallet state, and Razorpay readiness",
        icon: "wallet",
      },
      {
        href: "/settings",
        label: "Settings",
        description: "Organization defaults, routing, and Telegram",
        icon: "settings",
      },
    ],
  },
];
