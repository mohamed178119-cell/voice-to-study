import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download, Printer } from "lucide-react";
import { toast } from "sonner";

export function AnswerCard({ answer }: { answer: string }) {
  const printAnswer = () => {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(
      `<html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>إجابة المساعد الدراسي</title>
      <style>body{font-family:system-ui,sans-serif;padding:32px;line-height:2;white-space:pre-wrap}h1{font-size:20px}</style>
      </head><body><h1>المساعد الدراسي — محمد سعد</h1><div>${answer
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")}</div></body></html>`,
    );
    w.document.close();
    w.focus();
    w.print();
  };

  const download = () => {
    const blob = new Blob([answer], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "الإجابة-الدراسية.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="mt-4 gap-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-foreground">إجابة المساعد</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="soft"
            onClick={() => {
              navigator.clipboard.writeText(answer);
              toast.success("تم نسخ الإجابة");
            }}
          >
            <Copy className="size-4" /> نسخ
          </Button>
          <Button size="sm" variant="soft" onClick={printAnswer}>
            <Printer className="size-4" /> PDF
          </Button>
          <Button size="sm" variant="soft" onClick={download}>
            <Download className="size-4" /> تحميل
          </Button>
        </div>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-8 text-foreground">{answer}</p>
    </Card>
  );
}
