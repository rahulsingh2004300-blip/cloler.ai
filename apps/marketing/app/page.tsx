import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@cloler/ui";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Badge className="w-fit" variant="secondary">
            Marketing
          </Badge>
          <CardTitle>Blank shell</CardTitle>
          <CardDescription>No marketing UI yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Shared shadcn card from @cloler/ui.</p>
        </CardContent>
      </Card>
    </main>
  );
}
