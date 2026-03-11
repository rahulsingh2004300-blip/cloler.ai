import { Badge } from "@cloler/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@cloler/ui/components/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex gap-2">
              <Badge variant="secondary">Marketing</Badge>
              <Badge variant="outline">Blank shell</Badge>
            </div>
            <CardTitle>cloler.ai</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No marketing content yet.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
