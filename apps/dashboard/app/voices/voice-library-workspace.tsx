"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "@cloler/ui";
import { createLogger, serializeError } from "@cloler/observability";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";

const logger = createLogger("@cloler/dashboard/voice-library");

const languageOptions = [
  { label: "English (India)", value: "en-IN" },
  { label: "Hindi", value: "hi-IN" },
  { label: "Hinglish", value: "hinglish" },
] as const;

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatVoiceStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function VoiceLibraryWorkspace() {
  const { isLoaded: authLoaded, orgId, orgSlug } = useAuth();
  const { organization } = useOrganization();
  const voiceLibrary = useQuery(
    api.voices.getVoiceLibrary,
    authLoaded && orgId ? { organizationSlug: orgSlug ?? undefined } : "skip",
  );
  const createVoiceProfile = useMutation(api.voices.createVoiceProfile);
  const generateVoiceSampleUploadUrl = useMutation(
    api.voices.generateVoiceSampleUploadUrl,
  );
  const saveUploadedVoiceSample = useMutation(api.voices.saveUploadedVoiceSample);
  const setDefaultVoiceProfile = useMutation(api.voices.setDefaultVoiceProfile);
  const requestCloneTraining = useMutation(api.voices.requestCloneTraining);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<(typeof languageOptions)[number]["value"]>("en-IN");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingVoiceId, setPendingVoiceId] = useState<string | null>(null);
  const [filesByVoiceId, setFilesByVoiceId] = useState<Record<string, File | null>>({});

  const stats = useMemo(
    () =>
      voiceLibrary?.stats ?? {
        voiceCount: 0,
        totalSamples: 0,
        readyVoices: 0,
        pendingCloneVoices: 0,
        previewCount: 0,
      },
    [voiceLibrary],
  );

  const handleCreateVoiceProfile = async () => {
    if (!orgId) {
      setMessage("Select an organization before creating a voice.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await createVoiceProfile({
        organizationSlug: orgSlug ?? undefined,
        name,
        description,
        language,
      });
      setName("");
      setDescription("");
      setLanguage("en-IN");
      setMessage("Voice profile created.");
    } catch (error) {
      logger.error("Failed to create voice profile.", {
        error: serializeError(error),
        orgId,
      });
      setMessage(error instanceof Error ? error.message : "Voice creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpload = async (voiceId: string) => {
    const file = filesByVoiceId[voiceId];

    if (!file) {
      setMessage("Choose a reference audio file before uploading.");
      return;
    }

    setPendingVoiceId(voiceId);
    setMessage("");

    try {
      const { uploadUrl } = await generateVoiceSampleUploadUrl({
        organizationSlug: orgSlug ?? undefined,
        voiceProfileId: voiceId as never,
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Voice sample upload failed.");
      }

      const { storageId } = (await uploadResponse.json()) as { storageId: string };

      await saveUploadedVoiceSample({
        organizationSlug: orgSlug ?? undefined,
        voiceProfileId: voiceId as never,
        storageId: storageId as never,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });

      setFilesByVoiceId((current) => ({
        ...current,
        [voiceId]: null,
      }));
      setMessage(`Uploaded ${file.name}.`);
    } catch (error) {
      logger.error("Failed to upload voice sample.", {
        error: serializeError(error),
        voiceId,
      });
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setPendingVoiceId(null);
    }
  };

  const handleSetDefault = async (voiceId: string) => {
    setPendingVoiceId(voiceId);
    setMessage("");

    try {
      await setDefaultVoiceProfile({
        organizationSlug: orgSlug ?? undefined,
        voiceProfileId: voiceId as never,
      });
      setMessage("Default voice updated.");
    } catch (error) {
      logger.error("Failed to set default voice.", {
        error: serializeError(error),
        voiceId,
      });
      setMessage(error instanceof Error ? error.message : "Default voice update failed.");
    } finally {
      setPendingVoiceId(null);
    }
  };

  const handleRequestClone = async (voiceId: string) => {
    setPendingVoiceId(voiceId);
    setMessage("");

    try {
      await requestCloneTraining({
        organizationSlug: orgSlug ?? undefined,
        voiceProfileId: voiceId as never,
      });
      setMessage("Clone request queued.");
    } catch (error) {
      logger.error("Failed to queue clone request.", {
        error: serializeError(error),
        voiceId,
      });
      setMessage(error instanceof Error ? error.message : "Clone request failed.");
    } finally {
      setPendingVoiceId(null);
    }
  };

  if (!authLoaded) {
    return (
      <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70">
        <CardHeader>
          <CardTitle>Loading voices</CardTitle>
          <CardDescription>Checking workspace access.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="border-white/80 bg-white/92 shadow-sm shadow-slate-200/60 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Voice library</CardTitle>
            <CardDescription>
              Custom voices for calling, previews, and future cloned-voice routing.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
              <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Organization</p>
              <p className="mt-2 truncate text-lg font-semibold text-foreground">
                {organization?.name ?? voiceLibrary?.organization.name ?? "Workspace"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/85 p-4">
              <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Default focus</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Custom cloned voices</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/92 shadow-sm shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-sm">Voices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{stats.voiceCount}</p>
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/92 shadow-sm shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-sm">Reference samples</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{stats.totalSamples}</p>
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/92 shadow-sm shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-sm">Clone queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{stats.pendingCloneVoices}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.7fr)]">
        <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70">
          <CardHeader>
            <CardTitle>Create voice profile</CardTitle>
            <CardDescription>Start with a voice name, language, and reference audio later in the list.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="voice-name">Voice name</Label>
              <Input id="voice-name" onChange={(event) => setName(event.target.value)} placeholder="Clinic caller voice" value={name} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-language">Language</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-xs outline-none"
                id="voice-language"
                onChange={(event) => setLanguage(event.target.value as (typeof languageOptions)[number]["value"])}
                value={language}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-description">Notes</Label>
              <Textarea
                id="voice-description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short notes about tone, use case, or business context."
                rows={4}
                value={description}
              />
            </div>

            <Button disabled={isSubmitting || name.trim().length < 2} onClick={handleCreateVoiceProfile} type="button">
              {isSubmitting ? "Creating..." : "Create voice"}
            </Button>

            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70">
          <CardHeader>
            <CardTitle>Voice profiles</CardTitle>
            <CardDescription>Upload reference audio, set the default voice, and queue clone preparation.</CardDescription>
          </CardHeader>
          <CardContent>
            {voiceLibrary === undefined ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-6 text-sm text-muted-foreground">
                Loading voice library...
              </div>
            ) : voiceLibrary.voices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-6 text-sm text-muted-foreground">
                No voices yet. Create the first voice profile to start storing reference audio.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {voiceLibrary.voices.map((voice) => {
                  const selectedFile = filesByVoiceId[voice.id] ?? null;
                  const isBusy = pendingVoiceId === voice.id;

                  return (
                    <div className="rounded-3xl border border-border/70 bg-background/85 p-5" key={voice.id}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">{voice.name}</h3>
                            {voice.defaultForCalls ? <Badge>Default</Badge> : null}
                            <Badge variant="outline">{formatVoiceStatus(voice.cloneStatus)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {voice.description || "No notes added yet."}
                          </p>
                        </div>
                        <Badge variant="secondary">{voice.language}</Badge>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-border/70 bg-white px-3 py-3">
                          <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Samples</p>
                          <p className="mt-2 text-xl font-semibold text-foreground">{voice.sampleCount}</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-white px-3 py-3">
                          <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Previews</p>
                          <p className="mt-2 text-xl font-semibold text-foreground">{voice.previewCount}</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-white px-3 py-3">
                          <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Mode</p>
                          <p className="mt-2 text-xl font-semibold text-foreground">{voice.mode}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Label htmlFor={`upload-${voice.id}`}>Reference audio</Label>
                        <Input
                          accept="audio/*"
                          id={`upload-${voice.id}`}
                          onChange={(event) => {
                            const nextFile = event.target.files?.[0] ?? null;
                            setFilesByVoiceId((current) => ({
                              ...current,
                              [voice.id]: nextFile,
                            }));
                          }}
                          type="file"
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button disabled={!selectedFile || isBusy} onClick={() => handleUpload(voice.id)} type="button">
                            {isBusy ? "Uploading..." : "Upload sample"}
                          </Button>
                          <Button disabled={voice.defaultForCalls || isBusy} onClick={() => handleSetDefault(voice.id)} type="button" variant="outline">
                            Set default
                          </Button>
                          <Button disabled={voice.sampleCount === 0 || isBusy} onClick={() => handleRequestClone(voice.id)} type="button" variant="ghost">
                            Queue clone
                          </Button>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2">
                        <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Recent samples</p>
                        {voice.latestSamples.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No audio uploaded yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {voice.latestSamples.map((sample) => (
                              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-white px-3 py-3" key={sample.id}>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-foreground">{sample.fileName}</p>
                                  <p className="text-xs text-muted-foreground">{formatBytes(sample.sizeBytes)}</p>
                                </div>
                                {sample.url ? (
                                  <a className="text-sm font-medium text-primary underline-offset-4 hover:underline" href={sample.url} rel="noreferrer" target="_blank">
                                    Open
                                  </a>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
