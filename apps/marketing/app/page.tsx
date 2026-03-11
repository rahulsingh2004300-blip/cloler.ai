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
              <Badge variant="secondary">Marketing</Badge>
              <Badge variant="outline">Step 1-3</Badge>
            </div>
            <CardTitle className="text-3xl tracking-tight">cloler.ai</CardTitle>
            <CardDescription>Blank marketing shell</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="gap-2">
              <CardTitle className="text-base">Shared UI</CardTitle>
              <CardDescription>shadcn components wired</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Minimal shell only.
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="gap-2">
              <CardTitle className="text-base">Next</CardTitle>
              <CardDescription>Authentication</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Step 4 starts here.
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}