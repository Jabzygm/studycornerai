import { createFileRoute, Link } from "@tanstack/react-router";
import { courses } from "@/lib/mock-data";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses — Study Corner" },
      { name: "description", content: "Your current university courses." },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 md:px-12 py-12 md:py-20">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fall 2026</p>
        <h1 className="font-display text-4xl md:text-5xl font-medium mt-2">Courses</h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((c) => (
          <Link
            key={c.id}
            to="/courses/$courseId"
            params={{ courseId: c.id }}
            className="surface-card p-6 group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
          >
            <div
              className="h-24 rounded-lg mb-5 flex items-end p-4"
              style={{
                background: `linear-gradient(135deg, oklch(0.92 0.05 ${c.hue}), oklch(0.85 0.09 ${c.hue}))`,
              }}
            >
              <span
                className="font-display text-2xl"
                style={{ color: `oklch(0.3 0.08 ${c.hue})` }}
              >
                {c.code}
              </span>
            </div>
            <h2 className="font-display text-lg leading-tight">{c.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{c.instructor}</p>
            <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
              <span>{c.progress}% complete</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${c.progress}%`, background: `oklch(0.55 0.12 ${c.hue})` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
