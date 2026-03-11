import { Badge } from "@cloler/ui/components/badge";
import { Button } from "@cloler/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@cloler/ui/components/card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100/70 p-6 md:p-10">
      <div className="mx-auto grid max-w-3xl gap-6">
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Marketing</Badge>
              <Badge variant="outline">Step 1-3</Badge>
            </div>
            <CardTitle className="text-3xl tracking-tight">cloler.ai</CardTitle>
            <CardDescription>Blank marketing shell</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Shared shadcn shell only. No marketing content yet.
          </CardContent>
          <CardFooter className="justify-end border-t">
            <Button variant="outline" type="button" disabled>
              Content later
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}