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
    <main className="min-h-screen bg-muted/40 py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6">
        <Card>
          <CardHeader className="gap-3">
            <Badge className="w-fit" variant="secondary">
              Admin
            </Badge>
            <div className="space-y-1">
              <CardTitle>Admin shell</CardTitle>
              <CardDescription>Shared shadcn surface only.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Review queue</CardTitle>
                <CardDescription>Empty placeholder</CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Platform health</CardTitle>
                <CardDescription>Empty placeholder</CardDescription>
              </CardHeader>
            </Card>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="button">Primary action</Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
