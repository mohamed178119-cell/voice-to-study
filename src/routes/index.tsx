import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FileText, ImageIcon, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";

import { StudyShell } from "@/components/StudyShell";
import { AnswerCard } from "@/components/AnswerCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { askStudyAssistant, type StudyAttachment } from "@/lib/study.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "المساعد الدراسي | حل الصور وتحليل ملفات المنهج" },
      {
        name: "description",
        content:
          "ارفع صور الأسئلة أو ملفات PDF للمنهج واحصل على حل وشرح وتلخيص دراسي فوري بالعربية.",
      },
      { property: "og:title", content: "المساعد الدراسي | حل الصور وملفات PDF" },
      {
        property: "og:description",
        content: "مساعد ذكي للدراسة فقط: يحل الأسئلة من الصور ويحلل ملفات المنهج ويلخصها.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UploadPage,
});

const readBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("فشل قراءة الملف"));
    reader.readAsDataURL(file);
  });

function UploadPage() {
  const ask = useServerFn(askStudyAssistant);
  const [files, setFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"solve" | "summarize" | "explain">("solve");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!files.length && !prompt.trim()) {
      toast.error("اكتب سؤالك أو ارفع ملفًا");
      return;
    }
    setLoading(true);
    setAnswer("");
    try {
      const attachments: StudyAttachment[] = await Promise.all(
        files.map(async (f) => ({
          kind: f.type === "application/pdf" ? ("pdf" as const) : ("image" as const),
          mime: f.type || "image/jpeg",
          name: f.name,
          data: await readBase64(f),
        })),
      );
      const res = await ask({ data: { prompt: prompt.trim(), mode, attachments } });
      setAnswer(res.answer);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const modes: { key: typeof mode; label: string }[] = [
    { key: "solve", label: "حل الأسئلة" },
    { key: "summarize", label: "تلخيص" },
    { key: "explain", label: "شرح" },
  ];

  return (
    <StudyShell
      title="ارفع صور الأسئلة أو ملف المنهج"
      subtitle="صور، ملفات PDF، أو سؤال مكتوب — والحل يوصلك منظم خطوة بخطوة."
    >
      <Card className="gap-4 p-5 shadow-glow">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-5 text-sm">
            <ImageIcon className="size-6 text-primary" />
            صور الأسئلة
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles((p) => [...p, ...Array.from(e.target.files ?? [])])}
            />
          </label>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-5 text-sm">
            <FileText className="size-6 text-primary" />
            ملف PDF للمنهج
            <input
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) => setFiles((p) => [...p, ...Array.from(e.target.files ?? [])])}
            />
          </label>
        </div>

        {files.length > 0 && (
          <ul className="flex flex-col gap-2">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-xs"
              >
                <span className="truncate">{f.name}</span>
                <button
                  aria-label="إزالة"
                  onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                >
                  <X className="size-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          {modes.map((m) => (
            <Button
              key={m.key}
              size="sm"
              variant={mode === m.key ? "default" : "soft"}
              onClick={() => setMode(m.key)}
            >
              {m.label}
            </Button>
          ))}
        </div>

        <Textarea
          dir="rtl"
          rows={3}
          placeholder="اكتب سؤالك الدراسي أو ما تريده من الملف..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <Button variant="hero" size="lg" disabled={loading} onClick={submit}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {loading ? "جارٍ التحليل..." : "أرسل للمساعد"}
        </Button>
      </Card>

      {answer && (
        <>
          <AnswerCard answer={answer} />
          <StudyImageCard source={answer} />
        </>
      )}
    </StudyShell>
  );
}
