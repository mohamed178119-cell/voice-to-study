import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

export function AnswerCard({ answer }: { answer: string }) {
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
          <Button size="sm" variant="soft" onClick={download}>
            <Download className="size-4" /> تحميل
          </Button>
        </div>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-8 text-foreground">{answer}</p>
    </Card>
  );
}
