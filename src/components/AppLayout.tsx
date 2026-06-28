import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, SquareCheck as CheckSquare, LayoutDashboard, Sun, Moon, Coffee, GraduationCap } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/courses", label: "Courses", icon: BookOpen, exact: false },
  { to: "/tasks", label: "Tasks", icon: CheckSquare, exact: false },
] as const;

const themes: { value: Theme; icon: typeof Sun; label: string; color: string; bg: string }[] = [
  { value: "light", icon: Sun, label: "Light", color: "oklch(0.45 0.08 80)", bg: "oklch(0.95 0.02 85)" },
  { value: "dark", icon: Moon, label: "Dark", color: "oklch(0.75 0.03 270)", bg: "oklch(0.28 0.02 270)" },
  { value: "sepia", icon: Coffee, label: "Sepia", color: "oklch(0.45 0.1 60)", bg: "oklch(0.92 0.02 80)" },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex w-full">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border/60 bg-surface/30 backdrop-blur-sm px-5 py-8">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight mb-10 px-2 group">
          <span className="inline-flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <GraduationCap className="h-4.5 w-4.5" strokeWidth={2.2} />
            </span>
            <span className="tracking-tight">
              Study<span className="text-muted-foreground/70">.</span>corner
            </span>
          </span>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-primary/8 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-muted/60",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-300",
                    active ? "bg-foreground text-background shadow-sm" : "bg-surface-muted/60 group-hover:bg-surface-muted",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <span className="tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <p className="px-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-3">
            Theme
          </p>
          <div className="flex items-center gap-1.5 rounded-2xl border border-border/60 bg-surface/60 p-1.5">
            {themes.map((t) => {
              const Icon = t.icon;
              const active = theme === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  aria-label={t.label}
                  title={t.label}
                  className={cn(
                    "relative flex-1 inline-flex items-center justify-center rounded-xl py-2 transition-all duration-300",
                    active
                      ? "shadow-sm"
                      : "text-muted-foreground/60 hover:text-foreground hover:bg-surface-muted/60",
                  )}
                  style={active ? { backgroundColor: t.bg, color: t.color } : undefined}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-md px-4 h-14">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
            <GraduationCap className="h-3.5 w-3.5" />
          </span>
          Study.corner
        </Link>
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-surface/60 p-1">
          {themes.map((t) => {
            const Icon = t.icon;
            const active = theme === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                aria-label={t.label}
                title={t.label}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg h-8 w-8 transition-all duration-300",
                  active ? "shadow-sm" : "text-muted-foreground/60",
                )}
                style={active ? { backgroundColor: t.bg, color: t.color } : undefined}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <main className="flex-1 min-w-0 pt-14 md:pt-1">
        <div className="md:hidden fixed bottom-0 inset-x-0 z-20 border-t border-border/60 bg-background/90 backdrop-blur-md flex">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-all duration-300",
                  active ? "text-foreground" : "text-muted-foreground/60",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
                    active ? "bg-foreground text-background shadow-sm" : "",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="animate-fade-in pb-20 md:pb-0">{children}</div>
      </main>
    </div>
  );
}
