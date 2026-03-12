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
import { useEffect, useMemo, useState } from "react";

const logger = createLogger("@cloler/dashboard/voice-library");

const languageOptions = [
  { label: "English (India)", value: "en-IN" },
  { label: "Hindi", value: "hi-IN" },
  { label: "Hinglish", value: "hinglish" },
] as const;

const defaultPreviewScript =
  "Namaste, this is your AI voice assistant. I am calling to help with the next step and confirm the request.";

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

function formatDateTime(timestamp?: number) {
  if (!timestamp) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

function statusTone(status: string) {
  switch (status) {
    case "ready":
      return "bg-emerald-500";
    case "training":
    case "processing":
      return "bg-amber-500";
    case "failed":
      return "bg-rose-500";
    default:
      return "bg-slate-300";
  }
}

function VoiceWaveform({ active }: { active: boolean }) {
  const bars = [16, 28, 18, 34, 22, 30, 16, 24, 12];

  return (
    <div className="flex h-9 items-end gap-1">
      {bars.map((height, index) => (
        <span
          className={`w-1.5 rounded-full transition-all ${active ? "bg-sky-500" : "bg-slate-300"}`}
          key={`${height}-${index}`}
          style={{ height }}
        />
      ))}
    </div>
  );
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
  const requestVoicePreviewGeneration = useMutation(
    api.voices.requestVoicePreviewGeneration,
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<(typeof languageOptions)[number]["value"]>("en-IN");
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"neutral" | "error" | "success">("neutral");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingVoiceId, setPendingVoiceId] = useState<string | null>(null);
  const [filesByVoiceId, setFilesByVoiceId] = useState<Record<string, File | null>>({});
  const [previewTextByVoiceId, setPreviewTextByVoiceId] = useState<Record<string, string>>({});
  const [playingGenerationId, setPlayingGenerationId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  const setFeedback = (
    nextMessage: string,
    tone: "neutral" | "error" | "success" = "neutral",
  ) => {
    setMessage(nextMessage);
    setMessageTone(tone);
  };

  const handleCreateVoiceProfile = async () => {
    if (!orgId) {
      setFeedback("Select an organization before creating a voice.", "error");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

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
      setFeedback("Voice profile created.", "success");
    } catch (error) {
      logger.error("Failed to create voice profile.", {
        error: serializeError(error),
        orgId,
      });
      setFeedback(
        error instanceof Error ? error.message : "Voice creation failed.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpload = async (voiceId: string) => {
    const file = filesByVoiceId[voiceId];

    if (!file) {
      setFeedback("Choose a reference audio file before uploading.", "error");
      return;
    }

    setPendingVoiceId(voiceId);
    setFeedback("");

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
      setFeedback(`Uploaded ${file.name}.`, "success");
    } catch (error) {
      logger.error("Failed to upload voice sample.", {
        error: serializeError(error),
        voiceId,
      });
      setFeedback(error instanceof Error ? error.message : "Upload failed.", "error");
    } finally {
      setPendingVoiceId(null);
    }
  };

  const handleSetDefault = async (voiceId: string) => {
    setPendingVoiceId(voiceId);
    setFeedback("");

    try {
      await setDefaultVoiceProfile({
        organizationSlug: orgSlug ?? undefined,
        voiceProfileId: voiceId as never,
      });
      setFeedback("Default voice updated.", "success");
    } catch (error) {
      logger.error("Failed to set default voice.", {
        error: serializeError(error),
        voiceId,
      });
      setFeedback(
        error instanceof Error ? error.message : "Default voice update failed.",
        "error",
      );
    } finally {
      setPendingVoiceId(null);
    }
  };

  const handleRequestClone = async (voiceId: string) => {
    setPendingVoiceId(voiceId);
    setFeedback("");

    try {
      await requestCloneTraining({
        organizationSlug: orgSlug ?? undefined,
        voiceProfileId: voiceId as never,
      });
      setFeedback("Clone training queued.", "success");
    } catch (error) {
      logger.error("Failed to queue clone request.", {
        error: serializeError(error),
        voiceId,
      });
      setFeedback(error instanceof Error ? error.message : "Clone request failed.", "error");
    } finally {
      setPendingVoiceId(null);
    }
  };

  const handleRequestPreview = async (
    voiceId: string,
    fallbackScript: string,
  ) => {
    const previewScript = (previewTextByVoiceId[voiceId] ?? fallbackScript).trim();

    setPendingVoiceId(voiceId);
    setFeedback("");

    try {
      await requestVoicePreviewGeneration({
        organizationSlug: orgSlug ?? undefined,
        voiceProfileId: voiceId as never,
        text: previewScript,
      });
      setFeedback("Preview generation started.", "success");
    } catch (error) {
      logger.error("Failed to queue preview generation.", {
        error: serializeError(error),
        voiceId,
      });
      setFeedback(
        error instanceof Error ? error.message : "Preview generation failed.",
        "error",
      );
    } finally {
      setPendingVoiceId(null);
    }
  };

  const handlePlayGeneration = (
    generationId: string,
    text: string,
    language: string,
  ) => {
    if (typeof window === "undefined") {
      return;
    }

    const synth = window.speechSynthesis;

    if (playingGenerationId === generationId) {
      synth.cancel();
      setPlayingGenerationId(null);
      return;
    }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;

    const availableVoices = synth.getVoices();
    const matchingVoice = availableVoices.find(
      (voice) => voice.lang.toLowerCase() === language.toLowerCase(),
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => setPlayingGenerationId(null);
    utterance.onerror = () => setPlayingGenerationId(null);

    setPlayingGenerationId(generationId);
    synth.speak(utterance);
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
      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.95fr)_minmax(0,2fr)]">
        <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70">
          <CardHeader>
            <CardTitle>New voice</CardTitle>
            <CardDescription>Create a profile first, then upload at least three reference clips.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="voice-name">Voice name</Label>
                <Input id="voice-name" onChange={(event) => setName(event.target.value)} placeholder="Clinic caller voice" value={name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice-language">Language</Label>
                <select
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-xs outline-none"
                  id="voice-language"
                  onChange={(event) =>
                    setLanguage(event.target.value as (typeof languageOptions)[number]["value"])
                  }
                  value={language}
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Workspace</p>
                <p className="mt-2 truncate text-sm font-semibold text-foreground">
                  {organization?.name ?? voiceLibrary?.organization.name ?? "Workspace"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-description">Notes</Label>
              <Textarea
                id="voice-description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional internal note for operators."
                rows={4}
                value={description}
              />
            </div>

            <Button disabled={isSubmitting || name.trim().length < 2} onClick={handleCreateVoiceProfile} type="button">
              {isSubmitting ? "Creating..." : "Create voice"}
            </Button>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Voices</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{stats.voiceCount}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Ready to call</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{stats.readyVoices}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Samples</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{stats.totalSamples}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Previews</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{stats.previewCount}</p>
              </div>
            </div>

            {message ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  messageTone === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : messageTone === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-border/70 bg-background/70 text-muted-foreground"
                }`}
              >
                {message}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70">
          <CardHeader>
            <CardTitle>Voice library</CardTitle>
            <CardDescription>Train cloned voices and generate operator previews before attaching them to calling flows.</CardDescription>
          </CardHeader>
          <CardContent>
            {voiceLibrary === undefined ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-6 text-sm text-muted-foreground">
                Loading voice library...
              </div>
            ) : voiceLibrary.voices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-6 text-sm text-muted-foreground">
                No voices yet.
              </div>
            ) : (
              <div className="space-y-4">
                {voiceLibrary.voices.map((voice) => {
                  const selectedFile = filesByVoiceId[voice.id] ?? null;
                  const isBusy = pendingVoiceId === voice.id;
                  const previewScript =
                    previewTextByVoiceId[voice.id] ?? defaultPreviewScript;

                  return (
                    <div className="rounded-3xl border border-border/70 bg-background/85 p-5" key={voice.id}>
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold text-foreground">{voice.name}</h3>
                            {voice.defaultForCalls ? <Badge>Default</Badge> : null}
                            <Badge variant="outline">{formatVoiceStatus(voice.cloneStatus)}</Badge>
                            <Badge variant="secondary">{voice.language}</Badge>
                          </div>
                          {voice.description ? (
                            <p className="text-sm text-muted-foreground">{voice.description}</p>
                          ) : null}
                          <p className="text-xs text-muted-foreground">
                            Last updated {formatDateTime(voice.updatedAt)}
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-4 xl:min-w-[360px]">
                          <div className="rounded-2xl border border-border/70 bg-white px-3 py-3">
                            <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Samples</p>
                            <p className="mt-2 text-xl font-semibold text-foreground">{voice.sampleCount}</p>
                          </div>
                          <div className="rounded-2xl border border-border/70 bg-white px-3 py-3">
                            <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Clone</p>
                            <p className="mt-2 text-sm font-semibold text-foreground">{formatVoiceStatus(voice.cloneStatus)}</p>
                          </div>
                          <div className="rounded-2xl border border-border/70 bg-white px-3 py-3">
                            <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Previews</p>
                            <p className="mt-2 text-xl font-semibold text-foreground">{voice.previewCount}</p>
                          </div>
                          <div className="rounded-2xl border border-border/70 bg-white px-3 py-3">
                            <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Voice key</p>
                            <p className="mt-2 truncate text-sm font-semibold text-foreground">
                              {voice.providerVoiceId ?? "Pending"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_320px]">
                        <div className="rounded-3xl border border-border/70 bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">Reference samples</p>
                              <p className="text-xs text-muted-foreground">Upload at least three clips to start clone training.</p>
                            </div>
                            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${statusTone(voice.sampleCount >= 3 ? "ready" : "draft")}`} />
                          </div>

                          <div className="mt-4 space-y-3">
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
                            </div>

                            <div className="space-y-2">
                              {voice.latestSamples.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No reference audio yet.</p>
                              ) : (
                                voice.latestSamples.map((sample) => (
                                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-3 py-3" key={sample.id}>
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
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-border/70 bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">Clone training</p>
                              <p className="text-xs text-muted-foreground">Pipeline moves from queue to ready automatically after sample validation.</p>
                            </div>
                            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${statusTone(voice.cloneStatus)}`} />
                          </div>

                          <div className="mt-4 space-y-3">
                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3">
                                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Queued</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">{voice.latestCloneJob ? formatVoiceStatus(voice.latestCloneJob.status) : "Idle"}</p>
                              </div>
                              <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3">
                                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Requested</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">{voice.latestCloneJob ? formatDateTime(voice.latestCloneJob.requestedAt) : "-"}</p>
                              </div>
                              <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3">
                                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Completed</p>
                                <p className="mt-2 text-sm font-semibold text-foreground">{voice.latestCloneJob?.completedAt ? formatDateTime(voice.latestCloneJob.completedAt) : "-"}</p>
                              </div>
                            </div>

                            <Button
                              disabled={
                                isBusy ||
                                voice.sampleCount < 3 ||
                                ["training_requested", "training"].includes(voice.cloneStatus)
                              }
                              onClick={() => handleRequestClone(voice.id)}
                              type="button"
                              variant={voice.cloneStatus === "ready" ? "outline" : "default"}
                            >
                              {voice.cloneStatus === "ready"
                                ? "Retrain clone"
                                : voice.cloneStatus === "training_requested" ||
                                    voice.cloneStatus === "training"
                                  ? "Training..."
                                  : "Start clone training"}
                            </Button>

                            {voice.latestCloneJob?.failureReason ? (
                              <p className="text-sm text-rose-600">{voice.latestCloneJob.failureReason}</p>
                            ) : null}
                          </div>
                        </div>

                        <div className="rounded-3xl border border-border/70 bg-white p-4">
                          <p className="text-sm font-semibold text-foreground">Preview generation</p>
                          <p className="mt-1 text-xs text-muted-foreground">Generate a short preview and play it inside the dashboard.</p>

                          <div className="mt-4 space-y-3">
                            <Textarea
                              onChange={(event) =>
                                setPreviewTextByVoiceId((current) => ({
                                  ...current,
                                  [voice.id]: event.target.value,
                                }))
                              }
                              placeholder={defaultPreviewScript}
                              rows={5}
                              value={previewScript}
                            />
                            <Button
                              disabled={
                                isBusy ||
                                voice.cloneStatus !== "ready" ||
                                previewScript.trim().length < 12
                              }
                              onClick={() => handleRequestPreview(voice.id, defaultPreviewScript)}
                              type="button"
                            >
                              {isBusy ? "Generating..." : "Generate preview"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 rounded-3xl border border-border/70 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">Recent previews</p>
                            <p className="text-xs text-muted-foreground">Preview generations are metered and can be reused for QA before launch.</p>
                          </div>
                          {voice.lastPreviewGeneratedAt ? (
                            <p className="text-xs text-muted-foreground">Last generated {formatDateTime(voice.lastPreviewGeneratedAt)}</p>
                          ) : null}
                        </div>

                        <div className="mt-4 space-y-3">
                          {voice.recentGenerations.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No previews generated yet.</p>
                          ) : (
                            voice.recentGenerations.map((generation) => {
                              const isPlaying = playingGenerationId === generation.id;

                              return (
                                <div className="rounded-2xl border border-border/70 bg-background/70 p-4" key={generation.id}>
                                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="space-y-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">{generation.provider}</Badge>
                                        <Badge variant="secondary">{formatVoiceStatus(generation.status)}</Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {generation.characterCount} chars
                                        </span>
                                      </div>
                                      <p className="text-sm text-foreground">{generation.text}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {generation.completedAt
                                          ? `Ready ${formatDateTime(generation.completedAt)}`
                                          : `Started ${formatDateTime(generation.createdAt)}`}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                      <VoiceWaveform active={isPlaying} />
                                      <Button
                                        disabled={!generation.canPlay}
                                        onClick={() =>
                                          handlePlayGeneration(
                                            generation.id,
                                            generation.text,
                                            voice.speechLanguage,
                                          )
                                        }
                                        type="button"
                                        variant={isPlaying ? "outline" : "default"}
                                      >
                                        {isPlaying ? "Stop" : "Play"}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
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
