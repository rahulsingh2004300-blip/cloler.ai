import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from "@cloler/ui";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
      <Card className="w-full max-w-2xl shadow-sm">
        <CardHeader className="space-y-3">
          <Badge className="w-fit" variant="secondary">
            Admin
          </Badge>
          <div className="space-y-1">
            <CardTitle>Blank shell</CardTitle>
            <CardDescription>No admin workflows yet.</CardDescription>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            Internal admin surface is reserved for later steps.
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled type="button" variant="outline">
            No actions yet
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
