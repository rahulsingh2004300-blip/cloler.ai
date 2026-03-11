import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Textarea,
} from "@cloler/ui";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
      <Card className="w-full max-w-2xl shadow-sm">
        <CardHeader className="space-y-3">
          <Badge className="w-fit" variant="secondary">
            Widget
          </Badge>
          <div className="space-y-1">
            <CardTitle>Blank shell</CardTitle>
            <CardDescription>Shared shadcn form controls only.</CardDescription>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="widget-name">Name</Label>
            <Input id="widget-name" placeholder="Enter name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="widget-message">Message</Label>
            <Textarea id="widget-message" placeholder="Enter message" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-fit" type="button">
            Submit
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
