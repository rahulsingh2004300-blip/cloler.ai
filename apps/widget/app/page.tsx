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
import { Textarea } from "@cloler/ui/components/textarea";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100/70 p-6 md:p-10">
      <div className="mx-auto max-w-xl">
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Widget</Badge>
              <Badge variant="outline">Preview</Badge>
            </div>
            <CardTitle className="text-2xl tracking-tight">Contact form shell</CardTitle>
            <CardDescription>Simple shared inputs only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Name</div>
              <Input placeholder="Enter name" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Phone</div>
              <Input placeholder="Enter phone number" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Message</div>
              <Textarea placeholder="Enter callback message" className="min-h-28" />
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t">
            <Button type="button">Submit</Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}