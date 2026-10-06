import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square, Upload } from "lucide-react";
import { toast } from "sonner";

import { loadMemory, remember } from "@/lib/memory";
import { StudyShell } from "@/components/StudyShell";
import { AnswerCard } from "@/components/AnswerCard";
import { StudyImageCard } from "@/components/StudyImageCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { askStudyAssistant } from "@/lib/study.functions";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [
      { title: "تلخيص المحاضرات الصوتية | المساعد الدراسي" },
      {
        name: "description",
        content: "سجّل شرح الحصة مباشرة أو ارفع تسجيلًا صوتيًا ليقوم المساعد بتلخيصه دراسيًا.",
      },
      { property: "og:title", content: "تلخيص المحاضرات الصوتية" },
      {
        property: "og:description",
        content: "تسجيل مباشر أو رفع ملف صوتي، والمساعد يلخّص الدرس ويستخرج أهم النقاط.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VoicePage,
});

const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("فشل قراءة التسجيل"));
    reader.readAsDataURL(blob);
  });

function VoicePage() {
  const ask = useServerFn(askStudyAssistant);
  const [recording, setRecording] = useState(false);
  const [clip, setClip] = useState<{ blob: Blob; url: string; name: string } | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [micState, setMicState] = useState<"unknown" | "granted" | "denied" | "prompt">("unknown");

  useEffect(() => {
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((p) => {
        setMicState(p.state as typeof micState);
        p.onchange = () => setMicState(p.state as typeof micState);
      })
      .catch(() => setMicState("prompt"));
  }, []);

  const requestMic = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((t) => t.stop());
      setMicState("granted");
      toast.success("تم السماح باستخدام الميكروفون");
    } catch {
      setMicState("denied");
      toast.error("تم رفض الإذن، فعّله من إعدادات المتصفح");
    }
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        setClip({ blob, url: URL.createObjectURL(blob), name: "تسجيل-مباشر" });
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("لم نتمكن من الوصول إلى الميكروفون");
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const summarize = async () => {
    if (!clip) {
      toast.error("سجّل أو ارفع ملفًا صوتيًا أولًا");
      return;
    }
    setLoading(true);
    setAnswer("");
    try {
      const res = await ask({
        data: {
          prompt: "هذا تسجيل لدرس دراسي. لخّصه واستخرج أهم النقاط وأسئلة مراجعة.",
          mode: "summarize",
          history: loadMemory(),
          attachments: [
            {
              kind: "audio",
              mime: clip.blob.type || "audio/webm",
              data: await toBase64(clip.blob),
              name: clip.name,
            },
          ],
        },
      });
      setAnswer(res.answer);
      remember("تلخيص تسجيل صوتي لحصة", res.answer);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudyShell
      title="سجّل الدرس أو ارفع الصوت"
      subtitle="التسجيل المباشر للحصة أو ملف صوتي جاهز — والمساعد يلخّصه لك."
    >
      <Card className="items-center gap-5 p-6 shadow-glow">
        {micState !== "granted" && micState !== "unknown" && (
          <div className="w-full rounded-xl bg-secondary p-4 text-center text-sm">
            <p className="mb-3">
              {micState === "denied"
                ? "الميكروفون مرفوض. فعّل الإذن من إعدادات المتصفح ثم أعد المحاولة."
                : "يحتاج التطبيق إذن الميكروفون لتسجيل الحصة مباشرة."}
            </p>
            <Button size="sm" variant="hero" onClick={requestMic}>
              <Mic className="size-4" /> السماح بالوصول للميكروفون
            </Button>
          </div>
        )}
        <button
          onClick={recording ? stop : start}
          className={`flex size-28 items-center justify-center rounded-full text-primary-foreground transition-transform ${
            recording ? "bg-destructive animate-pulse" : "bg-hero shadow-glow active:scale-95"
          }`}
          aria-label={recording ? "إيقاف التسجيل" : "بدء التسجيل"}
        >
          {recording ? <Square className="size-9" /> : <Mic className="size-10" />}
        </button>
        <p className="text-sm text-muted-foreground">
          {recording ? "جارٍ التسجيل... اضغط للإيقاف" : "اضغط لبدء التسجيل المباشر"}
        </p>

        <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm">
          <Upload className="size-5 text-primary" />
          رفع ملف صوتي (mp3 / m4a / wav)
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setClip({ blob: f, url: URL.createObjectURL(f), name: f.name });
            }}
          />
        </label>

        {clip && (
          <div className="w-full space-y-2">
            <p className="text-xs text-muted-foreground">{clip.name}</p>
            <audio controls src={clip.url} className="w-full" />
          </div>
        )}

        <Button variant="hero" size="lg" className="w-full" disabled={loading} onClick={summarize}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {loading ? "جارٍ التلخيص..." : "لخّص التسجيل"}
        </Button>
      </Card>

      {answer && (
        <>
          <AnswerCard answer={answer} />
          <StudyImageCard source={answer} fileName="ملخص-الحصة.png" />
        </>
      )}
    </StudyShell>
  );
}
