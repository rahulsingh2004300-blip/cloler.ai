"use client";

import { Button, Card, CardContent, Separator, cn } from "@cloler/ui";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { dashboardNavGroups, type DashboardIcon } from "./dashboard-nav";

type DashboardShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function DashboardNavIcon({ icon }: { icon: DashboardIcon }) {
  const shared = "size-4";

  switch (icon) {
    case "home":
      return (
        <svg aria-hidden="true" className={shared} fill="none" viewBox="0 0 24 24">
          <path d="M4 10.5 12 4l8 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M6.5 9.5V20h11V9.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "voice":
      return (
        <svg aria-hidden="true" className={shared} fill="none" viewBox="0 0 24 24">
          <rect height="10" rx="5" stroke="currentColor" strokeWidth="1.8" width="8" x="8" y="4" />
          <path d="M12 14v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M7 11a5 5 0 0 0 10 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M9 20h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "spark":
      return (
        <svg aria-hidden="true" className={shared} fill="none" viewBox="0 0 24 24">
          <path d="m12 3 1.8 4.8L19 9.5l-4 3.1L16.2 18 12 15.2 7.8 18 9 12.6 5 9.5l5.2-1.7L12 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "leads":
      return (
        <svg aria-hidden="true" className={shared} fill="none" viewBox="0 0 24 24">
          <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3.5 19c1.4-2.8 4.1-4.2 5.5-4.2S13.1 16.2 14.5 19" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M16 8h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M18 6v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "campaign":
      return (
        <svg aria-hidden="true" className={shared} fill="none" viewBox="0 0 24 24">
          <path d="M4 8.5h5l7-3v13l-7-3H4v-7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M9 15.5v3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M18.5 8.5c1.2 1 2 2.2 2 3.5s-.8 2.5-2 3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "phone":
      return (
        <svg aria-hidden="true" className={shared} fill="none" viewBox="0 0 24 24">
          <path d="M7.6 4h2.7l1.3 4.1-1.7 1.7a13 13 0 0 0 4.2 4.2l1.7-1.7L20 13.6v2.7c0 .9-.7 1.7-1.6 1.7A14.4 14.4 0 0 1 4 5.6C4 4.7 4.7 4 5.6 4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      );
    case "wallet":
      return (
        <svg aria-hidden="true" className={shared} fill="none" viewBox="0 0 24 24">
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v1.5H6.5A2.5 2.5 0 0 0 4 11v6A2.5 2.5 0 0 0 6.5 19H20V9.5" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M15.5 14h4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "settings":
      return (
        <svg aria-hidden="true" className={shared} fill="none" viewBox="0 0 24 24">
          <path d="M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.5 1a7.2 7.2 0 0 0-2-.9L14 3h-4l-.4 2.9a7.2 7.2 0 0 0-2 .9l-2.5-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.5-1a7.2 7.2 0 0 0 2 .9L10 21h4l.4-2.9a7.2 7.2 0 0 0 2-.9l2.5 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
        </svg>
      );
  }
}

function SidebarToggle({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <Button onClick={onClick} size="icon" type="button" variant="outline">
      <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
        {collapsed ? (
          <path d="m9 5 6 7-6 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        ) : (
          <path d="m15 5-6 7 6 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        )}
      </svg>
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}

export function DashboardShell({
  title,
  description,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeItem = useMemo(() => {
    for (const group of dashboardNavGroups) {
      for (const item of group.items) {
        if (isActivePath(pathname, item.href)) {
          return item;
        }
      }
    }

    return dashboardNavGroups[0]?.items[0] ?? null;
  }, [pathname]);

  const nav = (
    <div className="flex h-full flex-col">
      <div className={cn("space-y-4 px-4 py-4", sidebarCollapsed && "px-3") }>
        <div className="flex items-center justify-between gap-3">
          <div className={cn(sidebarCollapsed && "hidden") }>
            <p className="text-xs font-semibold tracking-[0.26em] text-slate-500 uppercase">
              cloler.ai
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
              Dashboard
            </h2>
          </div>
          {sidebarCollapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-950">
              C
            </div>
          ) : null}
          <div className="hidden xl:block">
            <SidebarToggle
              collapsed={sidebarCollapsed}
              onClick={() => setSidebarCollapsed((value) => !value)}
            />
          </div>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {dashboardNavGroups.map((group) => (
          <div className="space-y-2" key={group.label}>
            {!sidebarCollapsed ? (
              <p className="px-2 text-[11px] font-medium tracking-[0.24em] text-slate-400 uppercase">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = isActivePath(pathname, item.href);

                return (
                  <Button
                    asChild
                    className={cn(
                      "h-auto w-full justify-start rounded-2xl px-3 py-3",
                      sidebarCollapsed && "justify-center px-2"
                    )}
                    key={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    size="sm"
                    variant={isActive ? "secondary" : "ghost"}
                  >
                    <Link href={item.href}>
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                          isActive
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-border/70 bg-background text-muted-foreground"
                        )}
                      >
                        <DashboardNavIcon icon={item.icon} />
                      </span>
                      {!sidebarCollapsed ? (
                        <span className="min-w-0 flex-1 text-left">
                          <span className="block text-sm font-medium text-foreground">
                            {item.label}
                          </span>
                          <span className="block text-xs leading-5 text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                      ) : null}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Separator />

      <div className={cn("space-y-3 px-3 py-4", sidebarCollapsed && "px-2") }>
        <div className={cn("rounded-2xl border border-slate-200 bg-slate-50 p-3", sidebarCollapsed && "p-2") }>
          <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center") }>
            <UserButton />
            {!sidebarCollapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-950">Account</p>
                <p className="text-xs text-slate-500">Signed in</p>
              </div>
            ) : null}
          </div>
        </div>
        {!sidebarCollapsed ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-2">
            <OrganizationSwitcher
              afterCreateOrganizationUrl="/"
              afterLeaveOrganizationUrl="/org-selection"
              hidePersonal
            />
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_24%),linear-gradient(180deg,_#f8fafc,_#eef2ff_42%,_#f8fafc)]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] gap-4 px-3 py-3 sm:px-4 lg:px-6">
        <aside
          className={cn(
            "hidden shrink-0 xl:block",
            sidebarCollapsed ? "w-[92px]" : "w-[300px]"
          )}
        >
          <Card className="sticky top-3 h-[calc(100vh-1.5rem)] overflow-hidden border-white/80 bg-white/92 shadow-xl shadow-slate-200/70 backdrop-blur">
            {nav}
          </Card>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70 backdrop-blur">
            <CardContent className="flex flex-col gap-4 px-4 py-4 sm:px-5">
              <div className="flex items-center justify-between gap-3 xl:hidden">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setMobileNavOpen((value) => !value)}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
                      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                    </svg>
                    <span className="sr-only">Open navigation</span>
                  </Button>
                  <p className="text-sm font-semibold tracking-tight text-slate-950">cloler.ai</p>
                </div>
                <UserButton />
              </div>

              {mobileNavOpen ? (
                <div className="xl:hidden">
                  <Card className="overflow-hidden border-border/70 bg-background/95 shadow-none">
                    {nav}
                  </Card>
                </div>
              ) : null}

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  {title}
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {description}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
