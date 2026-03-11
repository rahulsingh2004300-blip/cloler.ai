import { Badge } from "@cloler/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cloler/ui/components/card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100/70 p-6 md:p-10">
      <div className="mx-auto grid max-w-5xl gap-6">
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Admin</Badge>
              <Badge variant="outline">Internal</Badge>
            </div>
            <CardTitle className="text-3xl tracking-tight">Admin shell</CardTitle>
            <CardDescription>Protected workflows start after auth.</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="gap-2">
              <CardTitle className="text-base">Access</CardTitle>
              <CardDescription>Clerk roles pending</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Empty until Step 4.
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="gap-2">
              <CardTitle className="text-base">Queues</CardTitle>
              <CardDescription>No internal actions yet</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              DND and compliance views come later.
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}