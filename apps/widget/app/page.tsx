import {
  Button,
  DialogFrame,
  FeatureCard,
  StudioShell,
  TextArea,
  TextInput,
} from "@cloler/ui";

const actions = [
  {
    href: "#preview",
    label: "Widget preview",
    caption: "Shared form components are wired and ready.",
  },
  {
    href: "#notes",
    label: "Implementation notes",
    caption: "Live voice behavior is not built yet.",
    variant: "secondary" as const,
  },
];

const metrics = [
  {
    label: "Mode",
    value: "Preview",
    note: "This is a UI scaffold only.",
    emphasis: true,
  },
  {
    label: "Fields",
    value: "3",
    note: "Name, phone, and message are shown as a placeholder flow.",
  },
  {
    label: "Next",
    value: "Voice",
    note: "Real session handling will be added in later steps.",
  },
];

export default function HomePage() {
  return (
    <StudioShell
      eyebrow="cloler.ai / widget"
      title="Widget scaffold"
      description="This app only demonstrates the shared UI foundation for an embeddable widget. It should stay compact and neutral until the real widget behavior is implemented."
      pills={["Widget", "Shared inputs", "Preview only"]}
      actions={actions}
      metrics={metrics}
      spotlight={
        <DialogFrame
          eyebrow="Preview"
          title="Simple callback form"
          description="A minimal placeholder that proves the widget can reuse the shared input and button components."
          footer="Validation, DND checks, and live voice flows will be added later."
        >
          <div className="grid gap-4" id="preview">
            <TextInput label="Name" defaultValue="Aarav Sharma" />
            <TextInput label="Phone" defaultValue="+91 98765 43210" />
            <TextArea
              label="Message"
              defaultValue="Please schedule a callback for tomorrow morning."
            />
            <div className="flex gap-3">
              <Button>Submit</Button>
              <Button tone="secondary">Reset</Button>
            </div>
          </div>
        </DialogFrame>
      }
      footnote={
        <p id="notes">
          The widget remains intentionally small until real voice and queue
          logic are added.
        </p>
      }
    >
      <FeatureCard
        title="Lead capture"
        description="Basic input states are available for the future embedded support flow."
        detail="Current"
        tone="accent"
      />
      <FeatureCard
        title="Validation placeholder"
        description="Field validation and queue rules will be added without redesigning the widget shell."
        detail="Next"
      />
      <FeatureCard
        title="Future handoff"
        description="Later steps will connect this surface to telephony and live conversation workflows."
        detail="Later"
        tone="warm"
      />
    </StudioShell>
  );
}
