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
import { useEffect, useMemo, useRef, useState } from "react";

type VoiceMode = "custom" | "stock";
type StockVoiceKey = "bulbul_v2" | "bulbul_v3";
type ThemePresetKey =
  | "sales_opener"
  | "negotiation"
  | "appointment_booking"
  | "support_clarity"
  | "payment_reminder"
  | "local_outreach";

type VoiceTuning = {
  creativity: number;
  expressiveness: number;
  pace: number;
  stability: number;
  warmth: number;
};

type RecordedClip = {
  file: File;
  url: string;
};

const logger = createLogger("@cloler/dashboard/voice-library");

const languageOptions = [
  { label: "English (India)", value: "en-IN" },
  { label: "Hindi", value: "hi-IN" },
  { label: "Hinglish", value: "hinglish" },
] as const;

const stockVoiceOptions = [
  {
    key: "bulbul_v2" as const,
    name: "Sarvam Bulbul v2",
    detail: "Low-cost stock path for high-volume calling.",
  },
  {
    key: "bulbul_v3" as const,
    name: "Sarvam Bulbul v3",
    detail: "Higher-fidelity stock path for premium outreach.",
  },
];

const themePresets: Array<{ key: ThemePresetKey; name: string; hint: string; script: string }> = [
  {
    key: "sales_opener",
    name: "Sales opener",
    hint: "Warm introduction for new outreach.",
    script: "Namaste, I am reaching out to quickly introduce our service and see if you would like a short walkthrough.",
  },
  {
    key: "negotiation",
    name: "Negotiation",
    hint: "Steady and persuasive for active leads.",
    script: "I wanted to check what would help you feel comfortable moving ahead and whether I can answer the last few questions right now.",
  },
  {
    key: "appointment_booking",
    name: "Appointment",
    hint: "Calm booking flow for confirmations.",
    script: "I am calling to help you schedule the next available slot and confirm the timing that works best for you.",
  },
  {
    key: "support_clarity",
    name: "Support",
    hint: "Clear, patient voice for helpdesk tasks.",
    script: "I am here to help you resolve the issue step by step and make sure the request is closed properly today.",
  },
  {
    key: "payment_reminder",
    name: "Payment reminder",
    hint: "Firm but respectful collections tone.",
    script: "This is a quick reminder regarding the pending payment, and I can help you complete it or answer any billing questions.",
  },
  {
    key: "local_outreach",
    name: "Local outreach",
    hint: "Friendly regional-language style for local businesses.",
    script: "Namaste, I am calling from the local support team to share a quick update and help with the next step whenever you are ready.",
  },
];

const defaultTuning: VoiceTuning = {
  creativity: 42,
  expressiveness: 58,
  pace: 50,
  stability: 68,
  warmth: 55,
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateTime(timestamp?: number) {
  if (!timestamp) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(timestamp);
}

function formatVoiceStatus(status: string) {
  return status.replace(/_/g, " ");
}
function sentenceCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}


function waveformBars(active: boolean, paused = false) {
  const bars = [22, 34, 18, 28, 12, 30, 20, 26, 14, 24];
  return (
    <div className="flex h-10 items-end gap-1">
      {bars.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={`w-1.5 rounded-full transition-all ${active ? (paused ? "bg-amber-300" : "bg-sky-500") : "bg-slate-300"}`}
          style={{ height, opacity: active && !paused ? 0.65 + ((index % 3) * 0.1) : 0.5 }}
        />
      ))}
    </div>
  );
}

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function sliderTrackClass(value: number) {
  return {
    background: `linear-gradient(90deg, rgb(14 165 233) 0%, rgb(14 165 233) ${value}%, rgb(226 232 240) ${value}%, rgb(226 232 240) 100%)`,
  };
}

function presetLabel(key: ThemePresetKey) {
  return themePresets.find((preset) => preset.key === key)?.name ?? key;
}

function modeLabel(mode: VoiceMode) {
  return mode === "stock" ? "Stock voice" : "Cloned voice";
}

export function VoiceLibraryWorkspace() {
  const { isLoaded: authLoaded, orgId, orgSlug } = useAuth();
  const { organization } = useOrganization();
  const voiceLibrary = useQuery(api.voices.getVoiceLibrary, authLoaded && orgId ? { organizationSlug: orgSlug ?? undefined } : "skip");
  const createVoiceProfile = useMutation(api.voices.createVoiceProfile);
  const acceptVoiceConsent = useMutation(api.voices.acceptVoiceConsent);
  const updateVoiceProfileStyle = useMutation(api.voices.updateVoiceProfileStyle);
  const generateVoiceSampleUploadUrl = useMutation(api.voices.generateVoiceSampleUploadUrl);
  const saveUploadedVoiceSample = useMutation(api.voices.saveUploadedVoiceSample);
  const setDefaultVoiceProfile = useMutation(api.voices.setDefaultVoiceProfile);
  const requestCloneTraining = useMutation(api.voices.requestCloneTraining);
  const requestVoicePreviewGeneration = useMutation(api.voices.requestVoicePreviewGeneration);

  const [mode, setMode] = useState<VoiceMode>("custom");
  const [stockVoiceKey, setStockVoiceKey] = useState<StockVoiceKey>("bulbul_v2");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<(typeof languageOptions)[number]["value"]>("en-IN");
  const [consentAcceptedForCreate, setConsentAcceptedForCreate] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"neutral" | "error" | "success">("neutral");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingVoiceId, setPendingVoiceId] = useState<string | null>(null);
  const [filesByVoiceId, setFilesByVoiceId] = useState<Record<string, File | null>>({});
  const [previewTextByVoiceId, setPreviewTextByVoiceId] = useState<Record<string, string>>({});
  const [presetNameByVoiceId, setPresetNameByVoiceId] = useState<Record<string, string>>({});
  const [settingsByVoiceId, setSettingsByVoiceId] = useState<Record<string, { presetKey: ThemePresetKey; tuning: VoiceTuning }>>({});
  const [playingGenerationId, setPlayingGenerationId] = useState<string | null>(null);
  const [recordingVoiceId, setRecordingVoiceId] = useState<string | null>(null);
  const [recordingPaused, setRecordingPaused] = useState(false);
  const [recordingElapsedMs, setRecordingElapsedMs] = useState(0);
  const [recordedClipsByVoiceId, setRecordedClipsByVoiceId] = useState<Record<string, RecordedClip | null>>({});
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);
  const recordingAccumulatedMsRef = useRef(0);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
      Object.values(recordedClipsByVoiceId).forEach((clip) => {
        if (clip) URL.revokeObjectURL(clip.url);
      });
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [recordedClipsByVoiceId]);

  useEffect(() => {
    if (!recordingVoiceId || recordingPaused) return;

    const timer = window.setInterval(() => {
      const startedAt = recordingStartedAtRef.current ?? Date.now();
      setRecordingElapsedMs(recordingAccumulatedMsRef.current + (Date.now() - startedAt));
    }, 120);

    return () => window.clearInterval(timer);
  }, [recordingPaused, recordingVoiceId]);

  useEffect(() => {
    if (!voiceLibrary) return;

    setSettingsByVoiceId((current) => {
      const next = { ...current };
      for (const voice of voiceLibrary.voices) {
        if (!next[voice.id]) {
          next[voice.id] = {
            presetKey: voice.themePresetKey,
            tuning: {
              creativity: voice.creativity,
              expressiveness: voice.expressiveness,
              pace: voice.pace,
              stability: voice.stability,
              warmth: voice.warmth,
            },
          };
        }
      }
      return next;
    });

    setPreviewTextByVoiceId((current) => {
      const next = { ...current };
      for (const voice of voiceLibrary.voices) {
        if (!next[voice.id]) {
          const preset = themePresets.find((item) => item.key === voice.themePresetKey);
          next[voice.id] = voice.previewScript ?? preset?.script ?? themePresets[0].script;
        }
      }
      return next;
    });

    setPresetNameByVoiceId((current) => {
      const next = { ...current };
      for (const voice of voiceLibrary.voices) {
        if (!next[voice.id]) {
          next[voice.id] = voice.presetName ?? presetLabel(voice.themePresetKey);
        }
      }
      return next;
    });
  }, [voiceLibrary]);

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

  const setFeedback = (nextMessage: string, tone: "neutral" | "error" | "success" = "neutral") => {
    setMessage(nextMessage || null);
    setMessageTone(tone);
  };

  const voiceSettingFor = (voice: NonNullable<typeof voiceLibrary>["voices"][number]) =>
    settingsByVoiceId[voice.id] ?? {
      presetKey: voice.themePresetKey,
      tuning: {
        creativity: voice.creativity,
        expressiveness: voice.expressiveness,
        pace: voice.pace,
        stability: voice.stability,
        warmth: voice.warmth,
      },
    };

  const presetNameFor = (voice: NonNullable<typeof voiceLibrary>["voices"][number]) =>
    presetNameByVoiceId[voice.id] ?? voice.presetName ?? presetLabel(voice.themePresetKey);

  const voiceReadyMessage = (voice: NonNullable<typeof voiceLibrary>["voices"][number]) => {
    if (voice.mode === "stock") {
      return "Stock Sarvam voice is ready for preset saving and preview generation.";
    }

    if (!voice.consentAccepted) {
      return "Accept voice rights terms before collecting samples.";
    }

    if (voice.cloneStatus === "ready") {
      return "Clone is ready. Save the preset and generate a preview before assigning it to campaigns.";
    }

    if (voice.sampleCount < 3) {
      return `Add ${3 - voice.sampleCount} more source sample${voice.sampleCount === 2 ? "" : "s"} to unlock clone training.`;
    }

    if (["training_requested", "training"].includes(voice.cloneStatus)) {
      return "Clone training is running. Preview generation will unlock as soon as training finishes.";
    }

    return "This voice is almost ready. Start clone training, then generate a final preview.";
  };

  const updateVoiceSetting = (voiceId: string, patch: Partial<{ presetKey: ThemePresetKey; tuning: Partial<VoiceTuning> }>) => {
    setSettingsByVoiceId((current) => {
      const existing = current[voiceId] ?? { presetKey: "sales_opener" as ThemePresetKey, tuning: defaultTuning };
      return {
        ...current,
        [voiceId]: {
          presetKey: patch.presetKey ?? existing.presetKey,
          tuning: {
            ...existing.tuning,
            ...(patch.tuning ?? {}),
          },
        },
      };
    });
  };

  const handleCreateVoiceProfile = async () => {
    if (!orgId) {
      setFeedback("Select an organization before creating a voice.", "error");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      if (mode === "custom" && !consentAcceptedForCreate) {
        throw new Error("Accept the voice rights terms before creating a cloned voice.");
      }

      await createVoiceProfile({
        organizationSlug: orgSlug ?? undefined,
        name,
        description,
        language,
        mode,
        stockVoiceKey: mode === "stock" ? stockVoiceKey : undefined,
        consentAccepted: mode === "custom" ? consentAcceptedForCreate : undefined,
      });
      setName("");
      setDescription("");
      setLanguage("en-IN");
      setMode("custom");
      setStockVoiceKey("bulbul_v2");
      setConsentAcceptedForCreate(false);
      setFeedback(mode === "stock" ? "Stock voice added to the library." : "Voice shell created. Add source samples next.", "success");
    } catch (error) {
      logger.error("Failed to create voice profile.", {
        error: serializeError(error),
        orgId,
      });
      setFeedback(error instanceof Error ? error.message : "Voice creation failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFileForVoice = async (voiceId: string, file: File) => {
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
  };

  const handleUpload = async (voiceId: string) => {
    const file = filesByVoiceId[voiceId] ?? recordedClipsByVoiceId[voiceId]?.file ?? null;
    if (!file) {
      setFeedback("Choose or record a reference clip before uploading.", "error");
      return;
    }

    setPendingVoiceId(voiceId);
    setFeedback("");

    try {
      await uploadFileForVoice(voiceId, file);
      setFilesByVoiceId((current) => ({ ...current, [voiceId]: null }));
      setRecordedClipsByVoiceId((current) => {
        const clip = current[voiceId];
        if (clip) URL.revokeObjectURL(clip.url);
        return { ...current, [voiceId]: null };
      });
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
      await setDefaultVoiceProfile({ organizationSlug: orgSlug ?? undefined, voiceProfileId: voiceId as never });
      setFeedback("Default voice updated.", "success");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Default voice update failed.", "error");
    } finally {
      setPendingVoiceId(null);
    }
  };

  const handleRequestClone = async (voiceId: string) => {
    setPendingVoiceId(voiceId);
    setFeedback("");
    try {
      await requestCloneTraining({ organizationSlug: orgSlug ?? undefined, voiceProfileId: voiceId as never });
      setFeedback("Clone training queued.", "success");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Clone request failed.", "error");
    } finally {
      setPendingVoiceId(null);
    }
  };

  const handleAcceptConsent = async (voiceId: string) => {
    setPendingVoiceId(voiceId);
    setFeedback("");
    try {
      await acceptVoiceConsent({ organizationSlug: orgSlug ?? undefined, voiceProfileId: voiceId as never });
      setFeedback("Voice rights confirmation saved.", "success");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Consent update failed.", "error");
    } finally {
      setPendingVoiceId(null);
    }
  };

  const handleSaveStyle = async (voiceId: string, presetKey: ThemePresetKey, tuning: VoiceTuning, previewScript: string, presetName: string) => {
    setPendingVoiceId(voiceId);
    setFeedback("");
    try {
      await updateVoiceProfileStyle({
        organizationSlug: orgSlug ?? undefined,
        voiceProfileId: voiceId as never,
        themePresetKey: presetKey,
        presetName: presetName.trim() || presetLabel(presetKey),
        previewScript,
        ...tuning,
      });
      setFeedback("Voice preset saved.", "success");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Preset save failed.", "error");
    } finally {
      setPendingVoiceId(null);
    }
  };

  const handleRequestPreview = async (voiceId: string, presetKey: ThemePresetKey, tuning: VoiceTuning, fallbackScript: string, presetName: string) => {
    const previewScript = (previewTextByVoiceId[voiceId] ?? fallbackScript).trim();
    setPendingVoiceId(voiceId);
    setFeedback("");
    try {
      await requestVoicePreviewGeneration({
        organizationSlug: orgSlug ?? undefined,
        voiceProfileId: voiceId as never,
        text: previewScript,
        presetKey,
        presetName: presetName.trim() || presetLabel(presetKey),
        ...tuning,
      });
      setFeedback("Preview generation started.", "success");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Preview generation failed.", "error");
    } finally {
      setPendingVoiceId(null);
    }
  };

  const handlePlayGeneration = (generationId: string, text: string, language: string) => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (playingGenerationId === generationId) {
      synth.cancel();
      setPlayingGenerationId(null);
      return;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1;
    utterance.onend = () => setPlayingGenerationId(null);
    utterance.onerror = () => setPlayingGenerationId(null);
    setPlayingGenerationId(generationId);
    synth.speak(utterance);
  };

  const handleStartRecording = async (voiceId: string) => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setFeedback("Browser recording is not available on this device.", "error");
      return;
    }

    if (recordingVoiceId && recordingVoiceId !== voiceId) {
      setFeedback("Finish the current recording before starting another one.", "error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorderRef.current = recorder;
      streamRef.current = stream;
      recordingAccumulatedMsRef.current = 0;
      recordingStartedAtRef.current = Date.now();
      setRecordingElapsedMs(0);
      setRecordingPaused(false);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const extension = blob.type.includes("mp4") ? "m4a" : "webm";
        const file = new File([blob], `voice-sample-${Date.now()}.${extension}`, { type: blob.type || "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedClipsByVoiceId((current) => {
          const existing = current[voiceId];
          if (existing) URL.revokeObjectURL(existing.url);
          return { ...current, [voiceId]: { file, url } };
        });
        setRecordingVoiceId(null);
        setRecordingPaused(false);
        setRecordingElapsedMs(0);
        recordingStartedAtRef.current = null;
        recordingAccumulatedMsRef.current = 0;
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      setRecordingVoiceId(voiceId);
      setFeedback("Recording started.", "neutral");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Recording could not start.", "error");
    }
  };

  const handleToggleRecordingPause = () => {
    if (!recorderRef.current || !recordingVoiceId) return;

    if (recordingPaused) {
      recorderRef.current.resume();
      recordingStartedAtRef.current = Date.now();
      setRecordingPaused(false);
      setFeedback("Recording resumed.", "neutral");
      return;
    }

    recorderRef.current.pause();
    const startedAt = recordingStartedAtRef.current ?? Date.now();
    recordingAccumulatedMsRef.current += Date.now() - startedAt;
    recordingStartedAtRef.current = null;
    setRecordingElapsedMs(recordingAccumulatedMsRef.current);
    setRecordingPaused(true);
    setFeedback("Recording paused.", "neutral");
  };

  const handleStopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
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
      <div className="grid gap-5 xl:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.8fr)]">
        <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70">
          <CardHeader>
            <CardTitle>Build voice library</CardTitle>
            <CardDescription>Create a voice, collect consented samples, then save a reusable calling preset.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <button className={`rounded-2xl border px-4 py-4 text-left ${mode === "custom" ? "border-sky-400 bg-sky-50" : "border-border/70 bg-background/70"}`} onClick={() => setMode("custom")} type="button">
                <p className="text-sm font-semibold text-foreground">Custom cloned voice</p>
                <p className="mt-1 text-sm text-muted-foreground">Record or upload the source speaker you want to turn into a calling voice.</p>
              </button>
              <button className={`rounded-2xl border px-4 py-4 text-left ${mode === "stock" ? "border-sky-400 bg-sky-50" : "border-border/70 bg-background/70"}`} onClick={() => setMode("stock")} type="button">
                <p className="text-sm font-semibold text-foreground">Stock Sarvam voice</p>
                <p className="mt-1 text-sm text-muted-foreground">Use a platform-managed Sarvam voice and skip the cloning step.</p>
              </button>
            </div>

            {mode === "stock" ? (
              <div className="grid gap-3">
                {stockVoiceOptions.map((voiceOption) => (
                  <button
                    className={`rounded-2xl border px-4 py-4 text-left ${stockVoiceKey === voiceOption.key ? "border-sky-400 bg-sky-50" : "border-border/70 bg-background/70"}`}
                    key={voiceOption.key}
                    onClick={() => setStockVoiceKey(voiceOption.key)}
                    type="button"
                  >
                    <p className="text-sm font-semibold text-foreground">{voiceOption.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{voiceOption.detail}</p>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="voice-name">Voice name</Label>
                <Input id="voice-name" onChange={(event) => setName(event.target.value)} placeholder="Clinic caller voice" value={name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="voice-language">Language</Label>
                <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-xs outline-none" id="voice-language" onChange={(event) => setLanguage(event.target.value as (typeof languageOptions)[number]["value"])} value={language}>
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Workspace</p>
                <p className="mt-2 truncate text-sm font-semibold text-foreground">{organization?.name ?? voiceLibrary?.organization.name ?? "Workspace"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-description">Notes</Label>
              <Textarea id="voice-description" onChange={(event) => setDescription(event.target.value)} placeholder="Use-case, niche, or agent context." rows={4} value={description} />
            </div>

            {mode === "custom" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="mb-2 font-medium text-amber-950">Voice rights and legal acceptance</p>
                <label className="flex items-start gap-3">
                  <input checked={consentAcceptedForCreate} className="mt-1 size-4 rounded border-amber-300" onChange={(event) => setConsentAcceptedForCreate(event.target.checked)} type="checkbox" />
                  <span>I confirm I have the rights to clone and use this voice, and I understand cloler.ai only provides the tooling and is not responsible for misuse or unlawful impersonation.</span>
                </label>
              </div>
            ) : null}

            <Button disabled={isSubmitting || name.trim().length < 2 || (mode === "custom" && !consentAcceptedForCreate)} onClick={handleCreateVoiceProfile} type="button">
              {isSubmitting ? "Creating..." : mode === "stock" ? "Add stock voice" : "Create cloned voice"}
            </Button>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4"><p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Voices</p><p className="mt-2 text-3xl font-semibold text-foreground">{stats.voiceCount}</p></div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4"><p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Ready</p><p className="mt-2 text-3xl font-semibold text-foreground">{stats.readyVoices}</p></div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4"><p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Samples</p><p className="mt-2 text-3xl font-semibold text-foreground">{stats.totalSamples}</p></div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4"><p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">Previews</p><p className="mt-2 text-3xl font-semibold text-foreground">{stats.previewCount}</p></div>
            </div>

            {message ? <div className={`rounded-2xl border px-4 py-3 text-sm ${messageTone === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : messageTone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border/70 bg-background/70 text-muted-foreground"}`}>{message}</div> : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {voiceLibrary === undefined ? (
            <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70"><CardContent className="p-6 text-sm text-muted-foreground">Loading voice library...</CardContent></Card>
          ) : voiceLibrary.voices.length === 0 ? (
            <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70"><CardContent className="p-6 text-sm text-muted-foreground">No voices yet.</CardContent></Card>
          ) : (
            voiceLibrary.voices.map((voice) => {
              const isBusy = pendingVoiceId === voice.id;
              const activeSettings = voiceSettingFor(voice);
              const previewScript = previewTextByVoiceId[voice.id] ?? themePresets.find((preset) => preset.key === activeSettings.presetKey)?.script ?? themePresets[0].script;
              const presetName = presetNameFor(voice);
              const selectedFile = filesByVoiceId[voice.id] ?? null;
              const recordedClip = recordedClipsByVoiceId[voice.id] ?? null;
              const canTrain = voice.mode === "custom" && voice.consentAccepted && voice.sampleCount >= 3 && !["training_requested", "training"].includes(voice.cloneStatus);
              const canGeneratePreview = (voice.mode === "stock" || voice.cloneStatus === "ready") && previewScript.trim().length >= 12;
              const isRecordingThisVoice = recordingVoiceId === voice.id;
              const latestReadyGeneration = voice.recentGenerations.find((generation) => generation.status === "ready") ?? null;
              const sampleGoalRemaining = Math.max(0, 3 - voice.sampleCount);
              const hasUsableSample = Boolean(selectedFile || recordedClip || voice.latestSamples.length > 0);

              return (
                <Card className="border-white/80 bg-white/92 shadow-lg shadow-slate-200/70" key={voice.id}>
                  <CardContent className="space-y-6 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-2xl font-semibold text-foreground">{voice.name}</h3>
                          <Badge variant="outline">{modeLabel(voice.mode)}</Badge>
                          {voice.consentAccepted ? <Badge variant="secondary">Consent accepted</Badge> : null}
                          <Badge variant="outline">{formatVoiceStatus(voice.cloneStatus)}</Badge>
                          <Badge variant="secondary">{voice.language}</Badge>
                          {voice.defaultForCalls ? <Badge>Default for calling</Badge> : null}
                        </div>
                        {voice.description ? <p className="text-sm text-muted-foreground">{voice.description}</p> : null}
                        <p className="text-xs text-muted-foreground">Updated {formatDateTime(voice.updatedAt)}</p>
                      </div>
                      <div className="grid min-w-[260px] gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-3"><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Samples</p><p className="mt-2 text-xl font-semibold text-foreground">{voice.sampleCount}</p></div>
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-3"><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Previews</p><p className="mt-2 text-xl font-semibold text-foreground">{voice.previewCount}</p></div>
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-3"><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Preset</p><p className="mt-2 text-sm font-semibold text-foreground">{presetName}</p></div>
                        <div className="rounded-2xl border border-border/70 bg-background/80 p-3"><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Voice key</p><p className="mt-2 truncate text-sm font-semibold text-foreground">{voice.providerVoiceId ?? "Pending"}</p></div>
                      </div>
                    </div>

                    <div className="grid gap-4 2xl:grid-cols-[minmax(320px,1fr)_minmax(420px,1.25fr)]">
                      <div className="space-y-4 rounded-3xl border border-border/70 bg-background/70 p-5">
                        <div>
                          <p className="text-base font-semibold text-foreground">1. Source voice</p>
                          <p className="text-sm text-muted-foreground">Upload or record the speaker you want the agent to sound like. Clone training unlocks after three consented clips.</p>
                        </div>
                        {voice.mode === "custom" ? (
                          <>
                            {!voice.consentAccepted ? (
                              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                <p className="font-medium text-amber-950">Voice rights confirmation required</p>
                                <p className="mt-1">Confirm that you have lawful rights to clone this voice before uploading samples or training it.</p>
                                <Button className="mt-3" disabled={isBusy} onClick={() => handleAcceptConsent(voice.id)} type="button" variant="outline">Accept voice terms</Button>
                              </div>
                            ) : null}
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`file-${voice.id}`}>Upload clip</Label>
                                <Input id={`file-${voice.id}`} accept="audio/*" onChange={(event) => setFilesByVoiceId((current) => ({ ...current, [voice.id]: event.target.files?.[0] ?? null }))} type="file" />
                              </div>
                              <div className="rounded-2xl border border-border/70 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-medium text-foreground">Record here</p>
                                  <Badge variant="outline">{isRecordingThisVoice ? (recordingPaused ? "Paused" : "Recording") : "Ready"}</Badge>
                                </div>
                                <div className="mt-3 rounded-2xl border border-border/70 bg-slate-50 px-4 py-3">
                                  <div className="flex items-center justify-between gap-3">
                                    {waveformBars(isRecordingThisVoice, recordingPaused)}
                                    <span className="text-sm font-semibold text-foreground">{isRecordingThisVoice ? formatDuration(recordingElapsedMs) : "00:00"}</span>
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {isRecordingThisVoice ? (
                                    <>
                                      <Button onClick={handleToggleRecordingPause} type="button" variant="outline">{recordingPaused ? "Resume recording" : "Pause recording"}</Button>
                                      <Button onClick={handleStopRecording} type="button" variant="destructive">Stop and save clip</Button>
                                    </>
                                  ) : (
                                    <Button onClick={() => handleStartRecording(voice.id)} type="button" variant="outline">Start recording</Button>
                                  )}
                                </div>
                                {recordedClip ? (
                                  <div className="mt-3 space-y-2">
                                    <audio className="w-full" controls src={recordedClip.url} />
                                    <p className="text-xs text-muted-foreground">{recordedClip.file.name}</p>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-white p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-foreground">Sample progress</p>
                                  <p className="text-sm text-muted-foreground">
                                    {sampleGoalRemaining === 0
                                      ? "Enough samples collected. You can start clone training."
                                      : `${sampleGoalRemaining} more sample${sampleGoalRemaining === 1 ? "" : "s"} needed before training.`}
                                  </p>
                                </div>
                                <Badge variant="outline">{voice.sampleCount}/3 uploaded</Badge>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button disabled={isBusy || !voice.consentAccepted || (!selectedFile && !recordedClip)} onClick={() => handleUpload(voice.id)} type="button">{isBusy ? "Uploading..." : "Upload reference sample"}</Button>
                              <Button disabled={voice.defaultForCalls || isBusy} onClick={() => handleSetDefault(voice.id)} type="button" variant="outline">Use for calling</Button>
                              <Button disabled={!canTrain || isBusy} onClick={() => handleRequestClone(voice.id)} type="button" variant="outline">{voice.cloneStatus === "ready" ? "Retrain clone" : "Start clone training"}</Button>
                            </div>
                          </>
                        ) : (
                          <div className="rounded-2xl border border-border/70 bg-white p-4 text-sm text-muted-foreground">
                            Stock voices do not require sample recording or clone training. You can tune them and generate previews immediately.
                          </div>
                        )}

                        <div className="grid gap-2">
                          {voice.latestSamples.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No reference samples yet.</p>
                          ) : (
                            voice.latestSamples.map((sample) => (
                              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-white px-4 py-3" key={sample.id}>
                                <div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{sample.fileName}</p><p className="text-xs text-muted-foreground">{formatBytes(sample.sizeBytes)} · {formatDateTime(sample.createdAt)}</p></div>
                                {sample.url ? <a className="text-sm font-medium text-sky-600 underline-offset-4 hover:underline" href={sample.url} rel="noreferrer" target="_blank">Open</a> : null}
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="space-y-4 rounded-3xl border border-border/70 bg-background/70 p-5">
                        <div>
                          <p className="text-base font-semibold text-foreground">2. Behavior and preset</p>
                          <p className="text-sm text-muted-foreground">Choose the selling style, tune the delivery, then save it as a reusable preset for campaigns and calling agents.</p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {themePresets.map((preset) => (
                            <button key={preset.key} className={`rounded-2xl border px-4 py-4 text-left ${activeSettings.presetKey === preset.key ? "border-sky-400 bg-sky-50" : "border-border/70 bg-white"}`} onClick={() => { updateVoiceSetting(voice.id, { presetKey: preset.key }); setPresetNameByVoiceId((current) => ({ ...current, [voice.id]: preset.name })); setPreviewTextByVoiceId((current) => ({ ...current, [voice.id]: preset.script })); }} type="button">
                              <p className="text-sm font-semibold text-foreground">{preset.name}</p><p className="mt-1 text-sm text-muted-foreground">{preset.hint}</p>
                            </button>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`preset-name-${voice.id}`}>Preset name</Label>
                          <Input id={`preset-name-${voice.id}`} onChange={(event) => setPresetNameByVoiceId((current) => ({ ...current, [voice.id]: event.target.value }))} placeholder="Sales opener" value={presetName} />
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {([
                            ["Creativity", "creativity"],
                            ["Expressiveness", "expressiveness"],
                            ["Pace", "pace"],
                            ["Stability", "stability"],
                            ["Warmth", "warmth"],
                          ] as const).map(([label, key]) => {
                            const sliderValue = activeSettings.tuning[key] ?? defaultTuning[key];
                            return (
                              <div className="rounded-2xl border border-border/70 bg-white p-4" key={key}>
                                <div className="mb-3 flex items-center justify-between"><p className="text-sm font-medium text-foreground">{label}</p><span className="text-sm text-muted-foreground">{sliderValue}</span></div>
                                <input className="h-2 w-full cursor-pointer appearance-none rounded-full" max={100} min={0} onChange={(event) => updateVoiceSetting(voice.id, { tuning: { [key]: Number(event.target.value) } as Partial<VoiceTuning> })} style={sliderTrackClass(sliderValue)} type="range" value={sliderValue} />
                              </div>
                            );
                          })}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`preview-${voice.id}`}>Preview script</Label>
                          <Textarea id={`preview-${voice.id}`} onChange={(event) => setPreviewTextByVoiceId((current) => ({ ...current, [voice.id]: event.target.value }))} rows={4} value={previewScript} />
                        </div>

                        <div className="rounded-2xl border border-border/70 bg-white p-4">
                          <p className="text-sm font-medium text-foreground">3. Final result before campaign use</p>
                          <p className="mt-2 text-sm text-muted-foreground">{voiceReadyMessage(voice)}</p>
                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Preset saved as</p>
                              <p className="mt-2 text-sm font-semibold text-foreground">{presetName}</p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Preview availability</p>
                              <p className="mt-2 text-sm font-semibold text-foreground">{canGeneratePreview ? "Can generate now" : "Unlocks after clone is ready"}</p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Agent voice result</p>
                              <p className="mt-2 text-sm font-semibold text-foreground">
                                {latestReadyGeneration
                                  ? `Preview ready in ${latestReadyGeneration.presetName}`
                                  : hasUsableSample
                                    ? "Waiting for a generated preview"
                                    : "Needs source voice first"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-3">
                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">What the agent will speak</p>
                            <p className="mt-2 text-sm text-foreground">{previewScript}</p>
                          </div>
                          {latestReadyGeneration ? (
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <Button onClick={() => handlePlayGeneration(latestReadyGeneration.id, latestReadyGeneration.text, voice.speechLanguage)} type="button" variant="outline">
                                {playingGenerationId === latestReadyGeneration.id ? "Stop preview" : "Play latest preview"}
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                Generated {formatDateTime(latestReadyGeneration.completedAt ?? latestReadyGeneration.createdAt)}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button disabled={isBusy || presetName.trim().length < 2} onClick={() => handleSaveStyle(voice.id, activeSettings.presetKey, activeSettings.tuning, previewScript, presetName)} type="button" variant="outline">Save preset</Button>
                          <Button disabled={isBusy || !canGeneratePreview} onClick={() => handleRequestPreview(voice.id, activeSettings.presetKey, activeSettings.tuning, previewScript, presetName)} type="button">Generate preview</Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_320px]">
                      <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <div><p className="text-base font-semibold text-foreground">4. Preview history</p><p className="text-sm text-muted-foreground">Use this as the QA area before this voice preset is attached to campaigns or agent calling flows.</p></div>
                          {waveformBars(Boolean(playingGenerationId))}
                        </div>
                        <div className="space-y-3">
                          {voice.recentGenerations.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No previews generated yet.</p>
                          ) : (
                            voice.recentGenerations.map((generation) => (
                              <div className="rounded-2xl border border-border/70 bg-white p-4" key={generation.id}>
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                  <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{generation.presetName ?? sentenceCase(presetLabel(generation.presetKey))}</Badge><Badge variant="secondary">{formatVoiceStatus(generation.status)}</Badge></div>
                                    <p className="text-sm text-foreground">{generation.text}</p>
                                    <p className="text-xs text-muted-foreground">{formatDateTime(generation.completedAt ?? generation.createdAt)} · {generation.generatedSeconds ?? 0}s · {generation.characterCount} chars</p>
                                  </div>
                                  <Button disabled={!generation.canPlay} onClick={() => handlePlayGeneration(generation.id, generation.text, voice.speechLanguage)} type="button" variant="outline">{playingGenerationId === generation.id ? "Stop" : "Play"}</Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                        <p className="text-base font-semibold text-foreground">Readiness</p>
                        <p className="mt-1 text-sm text-muted-foreground">This summary tells you whether this voice can already be used for live calling or still needs sample or clone work.</p>
                        <div className="mt-4 space-y-3">
                          <div className="rounded-2xl border border-border/70 bg-white px-4 py-3"><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Clone state</p><p className="mt-2 text-sm font-semibold text-foreground">{formatVoiceStatus(voice.cloneStatus)}</p></div>
                          <div className="rounded-2xl border border-border/70 bg-white px-4 py-3"><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Latest job</p><p className="mt-2 text-sm font-semibold text-foreground">{voice.latestCloneJob ? formatVoiceStatus(voice.latestCloneJob.status) : voice.mode === "stock" ? "Stock ready" : "No job yet"}</p></div>
                          <div className="rounded-2xl border border-border/70 bg-white px-4 py-3"><p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Calling path</p><p className="mt-2 text-sm font-semibold text-foreground">{voice.defaultForCalls ? "Attached as default voice" : "Library only"}</p></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}








