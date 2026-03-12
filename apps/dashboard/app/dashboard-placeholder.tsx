import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cloler/ui";

type DashboardPlaceholderProps = {
  title: string;
  description: string;
  highlights: string[];
  checklist?: string[];
};

export function DashboardPlaceholder({
  title,
  description,
  highlights,
  checklist = [],
}: DashboardPlaceholderProps) {
  return (
    <div className="space-y-4">
      <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <Card className="border-white/80 bg-white/92 shadow-sm shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-base">Modules</CardTitle>
            <CardDescription>Reserved areas for the next layer of product functionality.</CardDescription>
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
            <CardTitle className="text-base">Status</CardTitle>
            <CardDescription>Minimal placeholder state until the live workflow lands.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(checklist.length ? checklist : ["Route ready", "Data hooks pending", "Live actions coming next"]).map(
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
