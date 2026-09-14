import { Link } from "@tanstack/react-router";
import { FileText, Mic, Sparkles, GraduationCap } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "الملفات والصور", icon: FileText },
  { to: "/voice", label: "الصوت", icon: Mic },
  { to: "/features", label: "المميزات", icon: Sparkles },
];

export function StudyShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div dir="rtl" className="min-h-screen bg-background pb-28">
      <header className="bg-hero px-5 pt-10 pb-14 text-primary-foreground">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <GraduationCap className="size-5" />
            <span>المساعد الدراسي الذكي</span>
          </div>
          <h1 className="text-2xl font-bold leading-snug">{title}</h1>
          <p className="text-sm opacity-90">{subtitle}</p>
        </div>
      </header>

      <main className="mx-auto -mt-8 max-w-2xl px-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-1 py-3 text-xs text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary font-semibold" }}
              activeOptions={{ exact: to === "/" }}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
