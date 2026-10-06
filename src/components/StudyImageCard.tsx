import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileDown, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generateStudyImage } from "@/lib/study.functions";
import { downloadAnswerPdf } from "@/lib/export-pdf";

/** زر «ولّد صورة ملخّص» + زر تنزيل PDF مباشر — للمواضيع الدراسية فقط */
export function StudyImageCard({ source, fileName = "ملخص-دراسي.png" }: { source: string; fileName?: string }) {
  const genImage = useServerFn(generateStudyImage);
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const makeImage = async () => {
    if (!source) return;
    setLoading(true);
    setImage("");
    try {
      const res = await genImage({ data: { topic: source } });
      setImage(res.image);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذّر إنشاء الصورة");
    } finally {
      setLoading(false);
    }
  };

  const makePdf = async () => {
    setPdfLoading(true);
    try {
      await downloadAnswerPdf(source, image || undefined);
      toast.success("تم تنزيل ملف PDF");
    } catch {
      toast.error("تعذّر إنشاء ملف PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Card className="mt-4 gap-4 p-6 shadow-glow">
      <Button variant="hero" size="lg" className="w-full" disabled={loading} onClick={makeImage}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
        {loading ? "جارٍ رسم صورة الملخّص..." : "ولّد صورة ملخّص دراسية"}
      </Button>
      <Button variant="soft" size="lg" className="w-full" disabled={pdfLoading} onClick={makePdf}>
        {pdfLoading ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
        {pdfLoading ? "جارٍ تجهيز الملف..." : "تنزيل الإجابة PDF"}
      </Button>
      {image && (
        <div className="space-y-3">
          <img src={image} alt="صورة ملخّص دراسي" className="w-full rounded-xl border border-border" />
          <Button variant="soft" className="w-full" asChild>
            <a href={image} download={fileName}>
              <Download className="size-4" />
              تحميل الصورة
            </a>
          </Button>
        </div>
      )}
    </Card>
  );
}
