export type DashboardNavItem = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
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
        shortLabel: "OV",
        description: "Organization status and usage",
      },
      {
        href: "/agents",
        label: "Agents",
        shortLabel: "AG",
        description: "Prompts, voice behavior, and guardrails",
      },
      {
        href: "/knowledge",
        label: "Knowledge",
        shortLabel: "KB",
        description: "Files, retrieval, and context sources",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        href: "/calls",
        label: "Calls",
        shortLabel: "CL",
        description: "Live activity, logs, and telephony flow",
      },
      {
        href: "/contacts",
        label: "Contacts",
        shortLabel: "CT",
        description: "Leads, sessions, and outbound readiness",
      },
    ],
  },
  {
    label: "Revenue",
    items: [
      {
        href: "/billing",
        label: "Billing",
        shortLabel: "BL",
        description: "Usage, plans, and payment state",
      },
      {
        href: "/settings",
        label: "Settings",
        shortLabel: "ST",
        description: "Organization defaults and platform controls",
      },
    ],
  },
];
