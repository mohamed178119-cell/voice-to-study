import { createFileRoute } from "@tanstack/react-router";
import { BookOpenCheck, FileText, ImageIcon, Mic, ShieldCheck, Download } from "lucide-react";

import { StudyShell } from "@/components/StudyShell";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "مميزات المساعد الدراسي | تصميم محمد سعد" },
      {
        name: "description",
        content:
          "تعرف على مميزات المساعد الدراسي: حل الصور، تحليل PDF، تلخيص الصوت، والالتزام بالضابط المدرسي.",
      },
      { property: "og:title", content: "مميزات المساعد الدراسي" },
      {
        property: "og:description",
        content: "مساعد دراسي بالعربية يحل ويشرح ويلخص، من تصميم محمد سعد.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeaturesPage,
});

const features = [
  { icon: ImageIcon, title: "حل من الصور", desc: "صوّر السؤال وسيحلّه خطوة بخطوة مع الإجابة النهائية." },
  { icon: FileText, title: "تحليل ملفات المنهج", desc: "ارفع PDF المنهج واسأل عن أي جزء فيه." },
  { icon: Mic, title: "تلخيص الصوت", desc: "تسجيل مباشر للحصة أو ملف صوتي، والنتيجة ملخص منظم." },
  { icon: Download, title: "تصدير الإجابات", desc: "حمّل الإجابة أو احفظها كملف PDF للمراجعة." },
  { icon: ShieldCheck, title: "ضابط مدرسي", desc: "لا يرد إلا على الأسئلة الدراسية وبلغة محترمة." },
  { icon: BookOpenCheck, title: "شرح وتلخيص", desc: "اختر: حل، شرح مبسّط، أو تلخيص بأسئلة مراجعة." },
];

function FeaturesPage() {
  return (
    <StudyShell title="مميزات التطبيق" subtitle="كل ما تحتاجه للمراجعة والحل في مكان واحد.">
      <div className="grid gap-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="flex-row items-start gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground">{title}</h2>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-4 items-center gap-1 bg-hero p-6 text-center text-primary-foreground">
        <p className="text-xs opacity-90">تصميم وتطوير</p>
        <p className="text-xl font-bold">محمد سعد</p>
        <p className="text-xs opacity-90">المساعد الدراسي الذكي</p>
      </Card>
    </StudyShell>
  );
}
