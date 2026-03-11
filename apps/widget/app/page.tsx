import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  Input,
  Textarea,
} from "@cloler/ui";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Badge className="w-fit" variant="secondary">
            Widget
          </Badge>
          <CardTitle>Blank shell</CardTitle>
          <CardDescription>Shared inputs only.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="widget-name">Name</FieldLabel>
              <FieldContent>
                <Input id="widget-name" placeholder="Enter name" />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="widget-message">Message</FieldLabel>
              <FieldContent>
                <Textarea id="widget-message" placeholder="Enter message" />
              </FieldContent>
            </Field>
            <Button className="w-fit" type="button">
              Submit
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
    </main>
  );
}
