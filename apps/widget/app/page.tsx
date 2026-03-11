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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@cloler/ui/components/field";
import { Input } from "@cloler/ui/components/input";
import { Textarea } from "@cloler/ui/components/textarea";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100/70 p-6 md:p-10">
      <div className="mx-auto max-w-xl">
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge>Widget</Badge>
              <Badge variant="outline">Preview</Badge>
            </div>
            <CardTitle className="text-2xl tracking-tight">Contact form shell</CardTitle>
            <CardDescription>Official shadcn field + input primitives</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" placeholder="Enter name" />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input id="phone" placeholder="Enter phone number" />
                <FieldDescription>Shared input component only.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="message">Message</FieldLabel>
                <Textarea
                  id="message"
                  placeholder="Enter callback message"
                  className="min-h-28"
                />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end border-t">
            <Button type="button">Submit</Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}