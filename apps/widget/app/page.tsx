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
import { Input } from "@cloler/ui/components/input";
import { Label } from "@cloler/ui/components/label";
import { Textarea } from "@cloler/ui/components/textarea";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-muted/40 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6">
        <Card>
          <CardHeader className="gap-3">
            <Badge className="w-fit" variant="secondary">
              Widget
            </Badge>
            <div className="space-y-1">
              <CardTitle>Widget shell</CardTitle>
              <CardDescription>Fresh shared shadcn form controls only.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="widget-name">Name</Label>
              <Input id="widget-name" placeholder="Enter name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="widget-phone">Phone</Label>
              <Input id="widget-phone" placeholder="Enter phone number" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="widget-message">Message</Label>
              <Textarea id="widget-message" placeholder="Enter message" />
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="button">Submit</Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
