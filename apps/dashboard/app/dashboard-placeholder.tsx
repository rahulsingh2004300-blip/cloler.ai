import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cloler/ui";

type DashboardPlaceholderProps = {
  badge: string;
  title: string;
  description: string;
  highlights: string[];
  checklist?: string[];
};

export function DashboardPlaceholder({
  badge,
  title,
  description,
  highlights,
  checklist = [],
}: DashboardPlaceholderProps) {
  return (
    <div className="space-y-5">
      <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70">
        <CardHeader className="space-y-3">
          <Badge className="w-fit" variant="secondary">
            {badge}
          </Badge>
          <div className="space-y-1">
            <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <Card className="border-white/80 bg-white/92 shadow-sm shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-base">What lands next</CardTitle>
            <CardDescription>These are the first operator-facing surfaces planned for this module.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {highlights.map((highlight) => (
              <div
                className="rounded-2xl border border-border/70 bg-background/85 px-4 py-4"
                key={highlight}
              >
                <p className="text-sm font-medium text-foreground">{highlight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/92 shadow-sm shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-base">Launch checklist</CardTitle>
            <CardDescription>Only the essentials stay visible while we build the real workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(checklist.length ? checklist : ["Route is live", "Layout is stable", "Data hooks land next"]).map(
              (item) => (
                <div
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/85 px-4 py-3"
                  key={item}
                >
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <p className="text-sm text-foreground">{item}</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
