import { Badge, Card, CardContent, CardHeader, CardTitle } from "@cloler/ui";

type DashboardPlaceholderProps = {
  badge: string;
  title: string;
  description: string;
  highlights: string[];
};

export function DashboardPlaceholder({
  badge,
  title,
  description,
  highlights,
}: DashboardPlaceholderProps) {
  return (
    <div className="space-y-6">
      <Card className="border-white/70 bg-white/90 shadow-lg shadow-slate-200/60">
        <CardHeader>
          <Badge className="w-fit" variant="secondary">
            {badge}
          </Badge>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((highlight) => (
          <Card
            className="border-white/70 bg-white/90 shadow-sm shadow-slate-200/60"
            key={highlight}
          >
            <CardContent className="px-6 py-5">
              <p className="text-sm font-medium text-foreground">{highlight}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
