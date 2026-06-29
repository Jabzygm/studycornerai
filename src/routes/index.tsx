import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Calendar } from "lucide-react";
import { courses } from "@/lib/mock-data";
import { useTasks } from "@/lib/tasks-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Study Corner" },
      { name: "description", content: "Your calm overview of upcoming work and recent courses." },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { tasks } = useTasks();
  const open = tasks.filter((t) => !t.done).slice(0, 5);
  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-12 py-12 md:py-20">
      <header className="mb-16">
        <p className="text-sm text-muted-foreground tracking-wide">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-medium mt-3">
          {greeting()}.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl">
          You have <span className="text-foreground font-medium">{open.length}</span> open task{open.length === 1 ? "" : "s"} and{" "}
          <span className="text-foreground font-medium">{done}</span> completed. A quiet day for deep work.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="surface-card p-7 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl">Upcoming</h2>
            <Link to="/tasks" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
              All tasks <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {open.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">All caught up. ✦</p>
          ) : (
            <ul className="divide-y divide-border">
              {open.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3.5 group">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.category}{t.course ? ` · ${t.course}` : ""}
                    </p>
                  </div>
                  <Calendar className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface-card p-7">
          <h2 className="font-display text-xl mb-6">Recent courses</h2>
          <ul className="space-y-1">
            {courses.slice(0, 4).map((c) => (
              <li key={c.id}>
                <Link
                  to="/courses/$courseId"
                  params={{ courseId: c.id }}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 -mx-2 hover:bg-surface-muted transition-colors group"
                >
                  <span
                    className="h-8 w-8 shrink-0 rounded-md flex items-center justify-center text-[10px] font-medium"
                    style={{ background: `oklch(0.9 0.06 ${c.hue})`, color: `oklch(0.3 0.08 ${c.hue})` }}
                  >
                    {c.code.split(" ")[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.code}</p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
