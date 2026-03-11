import { Badge } from "@cloler/ui/components/badge";
import { Button } from "@cloler/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@cloler/ui/components/card";
import { Input } from "@cloler/ui/components/input";
import { Textarea } from "@cloler/ui/components/textarea";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex gap-2">
              <Badge variant="secondary">Widget</Badge>
              <Badge variant="outline">Preview</Badge>
            </div>
            <CardTitle>Widget shell</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Name" />
            <Input placeholder="Phone" />
            <Textarea placeholder="Message" />
            <Button type="button">Submit</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
