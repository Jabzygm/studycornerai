import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useCourses, COURSE_HUES } from "@/lib/courses-store";
import { cn } from "@/lib/utils";

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
  const { courses, addCourse, removeCourse } = useCourses();
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-12 py-12 md:py-20">
      <header className="mb-12 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fall 2026</p>
          <h1 className="font-display text-4xl md:text-5xl font-medium mt-2">Courses</h1>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm hover:bg-surface-muted transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> New course
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((c) => (
          <div key={c.id} className="relative group">
            <Link
              to="/courses/$courseId"
              params={{ courseId: c.id }}
              className="surface-card p-6 block hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
            >
              <div
                className="h-24 rounded-lg mb-5 flex items-end p-4"
                style={{
                  background: `linear-gradient(135deg, oklch(0.92 0.05 ${c.hue}), oklch(0.85 0.09 ${c.hue}))`,
                }}
              >
                <span className="font-display text-2xl" style={{ color: `oklch(0.3 0.08 ${c.hue})` }}>
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
            <button
              onClick={(e) => {
                e.preventDefault();
                if (confirm(`Delete ${c.code}? Its files will be removed.`)) removeCourse(c.id);
              }}
              aria-label={`Delete ${c.code}`}
              className="absolute top-3 right-3 h-7 w-7 rounded-md bg-background/80 backdrop-blur border border-border text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all flex items-center justify-center"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <button
          onClick={() => setOpen(true)}
          className="surface-card p-6 flex flex-col items-center justify-center gap-2 border-dashed text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all min-h-[260px]"
        >
          <Plus className="h-5 w-5" />
          <span className="text-sm">Add a course</span>
        </button>
      </div>

      {open && <NewCourseModal onClose={() => setOpen(false)} onAdd={(d) => { addCourse(d); setOpen(false); }} />}
    </div>
  );
}

function NewCourseModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (d: { code: string; title: string; hue: number; instructor?: string }) => void;
}) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [instructor, setInstructor] = useState("");
  const [hue, setHue] = useState(COURSE_HUES[0]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;
    onAdd({ code: code.trim(), title: title.trim(), instructor: instructor.trim(), hue });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="surface-card w-full max-w-md p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">New course</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Course code">
            <input
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CS 101"
              className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </Field>
          <Field label="Course name">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Introduction to Computing"
              className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </Field>
          <Field label="Instructor (optional)">
            <input
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="Dr. Ada Lovelace"
              className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </Field>
          <Field label="Theme color">
            <div className="flex flex-wrap gap-2">
              {COURSE_HUES.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHue(h)}
                  aria-label={`Color ${h}`}
                  className={cn(
                    "h-8 w-8 rounded-full transition-transform border-2",
                    hue === h ? "scale-110 border-foreground" : "border-transparent",
                  )}
                  style={{ background: `linear-gradient(135deg, oklch(0.85 0.09 ${h}), oklch(0.65 0.14 ${h}))` }}
                />
              ))}
            </div>
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!code.trim() || !title.trim()}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Create course
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
