import { useEffect, useState } from "react";
import { Download, Share2, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export function InstallAppCard() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setInstalled(true));
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (installed) return null;

  return (
    <Card className="mt-4 gap-3 p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Smartphone className="size-5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-foreground">ثبّت التطبيق على هاتفك</h2>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            يعمل كتطبيق حقيقي بأيقونة على الشاشة الرئيسية وبشاشة كاملة بدون متصفح.
          </p>
        </div>
      </div>

      {promptEvent ? (
        <Button
          variant="hero"
          size="lg"
          onClick={() => {
            void promptEvent.prompt();
            setPromptEvent(null);
          }}
        >
          <Download className="size-4" />
          تثبيت التطبيق الآن
        </Button>
      ) : (
        <p className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-xs leading-6 text-muted-foreground">
          <Share2 className="mt-1 size-4 shrink-0 text-primary" />
          {isIos
            ? "من متصفح Safari: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»."
            : "من قائمة المتصفح (⋮): اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»."}
        </p>
      )}
    </Card>
  );
}
