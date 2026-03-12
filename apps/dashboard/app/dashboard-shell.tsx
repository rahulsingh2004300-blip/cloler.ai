"use client";

import { Badge, Button, Card, CardContent, Separator, cn } from "@cloler/ui";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { dashboardNavGroups } from "./dashboard-nav";

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

export function DashboardShell({
  title,
  description,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      <div className="space-y-3 px-5 py-5">
        <Badge className="w-fit" variant="secondary">
          Step 6
        </Badge>
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-[0.28em] text-muted-foreground uppercase">
            cloler.ai
          </p>
          <h2 className="text-lg font-semibold tracking-tight">Dashboard shell</h2>
          <p className="text-sm text-muted-foreground">
            Authenticated control plane for voice, telephony, and billing.
          </p>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {dashboardNavGroups.map((group) => (
          <div className="space-y-2" key={group.label}>
            <p className="px-2 text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = isActivePath(pathname, item.href);

                return (
                  <Button
                    asChild
                    className="h-auto w-full justify-start px-2 py-2.5"
                    key={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    size="sm"
                    variant={isActive ? "secondary" : "ghost"}
                  >
                    <Link href={item.href}>
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg border text-[11px] font-semibold tracking-[0.18em]",
                          isActive
                            ? "border-primary/20 bg-background text-foreground"
                            : "border-border/70 bg-background/60 text-muted-foreground"
                        )}
                      >
                        {item.shortLabel}
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block text-sm font-medium text-foreground">
                          {item.label}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.92))]">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-[290px] shrink-0 lg:block">
          <Card className="sticky top-4 h-[calc(100vh-2rem)] overflow-hidden border-white/70 bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur">
            {nav}
          </Card>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card className="border-white/70 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur">
            <CardContent className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center justify-between gap-3 lg:hidden">
                <Button
                  onClick={() => setMobileNavOpen((value) => !value)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {mobileNavOpen ? "Close menu" : "Open menu"}
                </Button>
                <div className="flex items-center gap-2">
                  <OrganizationSwitcher
                    afterCreateOrganizationUrl="/"
                    afterLeaveOrganizationUrl="/org-selection"
                    hidePersonal
                  />
                  <UserButton />
                </div>
              </div>

              {mobileNavOpen ? (
                <div className="lg:hidden">
                  <Card className="overflow-hidden border-border/70 bg-background/95 shadow-none">
                    {nav}
                  </Card>
                </div>
              ) : null}

              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {activeItem ? activeItem.label : "Dashboard"}
                    </Badge>
                    <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
                      Step 6 foundation
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                      {title}
                    </h1>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                      {description}
                    </p>
                  </div>
                </div>

                <div className="hidden items-center gap-3 lg:flex">
                  <OrganizationSwitcher
                    afterCreateOrganizationUrl="/"
                    afterLeaveOrganizationUrl="/org-selection"
                    hidePersonal
                  />
                  <UserButton />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
