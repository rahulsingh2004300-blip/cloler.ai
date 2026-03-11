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
              <Badge>Admin</Badge>
              <Badge variant="outline">Internal</Badge>
            </div>
            <CardTitle className="text-3xl tracking-tight">Admin shell</CardTitle>
            <CardDescription>Protected workflows start after auth.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Empty until authentication and role gating are in place.
          </CardContent>
          <CardFooter className="justify-end border-t">
            <Button variant="outline" type="button" disabled>
              Restricted
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}