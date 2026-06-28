import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, CheckSquare, LayoutDashboard, Moon, Sun, Coffee } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/courses", label: "Courses", icon: BookOpen, exact: false },
  { to: "/tasks", label: "Tasks", icon: CheckSquare, exact: false },
] as const;

const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "sepia", icon: Coffee, label: "Sepia" },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex w-full">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-surface/40 px-5 py-8">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight mb-10 px-2">
          Study<span className="text-muted-foreground">.</span>corner
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                  active
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface/60",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <p className="px-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Theme
          </p>
          <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            {themes.map((t) => {
              const Icon = t.icon;
              const active = theme === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  aria-label={t.label}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center rounded-full py-1.5 transition-all duration-300",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-20 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur px-4 h-14">
        <Link to="/" className="font-display text-lg font-semibold">Study.corner</Link>
        <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
          {themes.map((t) => {
            const Icon = t.icon;
            const active = theme === t.value;
            return (
              <button key={t.value} onClick={() => setTheme(t.value)} aria-label={t.label}
                className={cn("inline-flex items-center justify-center rounded-full h-7 w-7 transition-all",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="md:hidden border-b border-border bg-surface/40 flex">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to}
                className={cn("flex-1 text-center py-3 text-xs transition-colors",
                  active ? "text-foreground border-b-2 border-primary" : "text-muted-foreground")}>
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
