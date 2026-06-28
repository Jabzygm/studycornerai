import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Trash2, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useCourses } from "@/lib/courses-store";
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
  const { courses, add, remove } = useCourses();
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [instructor, setInstructor] = useState("");
  const [description, setDescription] = useState("");
  const [hue, setHue] = useState(220);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;
    add({
      code: code.trim(),
      title: title.trim(),
      instructor: instructor.trim() || "TBA",
      term: "Fall 2026",
      hue,
      description: description.trim() || "No description provided.",
    });
    setCode("");
    setTitle("");
    setInstructor("");
    setDescription("");
    setHue(220);
    setShowForm(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-12 py-12 md:py-20">
      <header className="mb-12 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fall 2026</p>
          <h1 className="font-display text-4xl md:text-5xl font-medium mt-2">Courses</h1>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {showForm ? "Cancel" : "Add course"}
        </button>
      </header>

      {showForm && (
        <form onSubmit={submit} className="surface-elevated p-6 mb-10 animate-scale-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted-foreground/70 mb-1.5 block font-medium">Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CS 101"
                className="w-full bg-surface-muted/50 text-sm outline-none border border-border rounded-xl px-3.5 py-2.5 focus:border-foreground/20 focus:bg-surface transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground/70 mb-1.5 block font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Intro to Computer Science"
                className="w-full bg-surface-muted/50 text-sm outline-none border border-border rounded-xl px-3.5 py-2.5 focus:border-foreground/20 focus:bg-surface transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground/70 mb-1.5 block font-medium">Instructor</label>
              <input
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="Dr. Smith"
                className="w-full bg-surface-muted/50 text-sm outline-none border border-border rounded-xl px-3.5 py-2.5 focus:border-foreground/20 focus:bg-surface transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground/70 mb-1.5 block font-medium">Accent color</label>
              <div className="flex items-center gap-3 h-[42px] bg-surface-muted/50 rounded-xl px-3 border border-border">
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={hue}
                  onChange={(e) => setHue(Number(e.target.value))}
                  className="flex-1 accent-foreground"
                />
                <span
                  className="h-5 w-5 rounded-full shrink-0 ring-2 ring-offset-1 ring-border transition-all duration-300"
                  style={{ background: `oklch(0.55 0.12 ${hue})`, ringColor: `oklch(0.55 0.12 ${hue})` }}
                />
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label className="text-xs text-muted-foreground/70 mb-1.5 block font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief course description..."
              className="w-full bg-surface-muted/50 text-sm outline-none border border-border rounded-xl px-3.5 py-2.5 focus:border-foreground/20 focus:bg-surface transition-all duration-300 min-h-[90px] resize-y"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!code.trim() || !title.trim()}
              className="btn-primary disabled:opacity-40"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} /> Add course
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((c) => (
          <div key={c.id} className="surface-card group relative overflow-hidden">
            <Link
              to="/courses/$courseId"
              params={{ courseId: c.id }}
              className="block p-6"
            >
              <div
                className="h-28 rounded-xl mb-5 flex items-end p-4 relative overflow-hidden transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, oklch(0.92 0.04 ${c.hue}), oklch(0.85 0.07 ${c.hue}))`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `radial-gradient(circle at 80% 20%, oklch(0.95 0.12 ${c.hue}), transparent 60%)`,
                  }}
                />
                <span
                  className="font-display text-2xl relative z-10"
                  style={{ color: `oklch(0.3 0.08 ${c.hue})` }}
                >
                  {c.code}
                </span>
              </div>
              <h2 className="font-display text-lg leading-tight font-medium">{c.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{c.instructor}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                <span>{c.progress}% complete</span>
                <span className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  Open <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${c.progress}%`, background: `oklch(0.55 0.12 ${c.hue})` }}
                />
              </div>
            </Link>
            <button
              onClick={() => remove(c.id)}
              className={cn(
                "absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all duration-300",
                "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0",
              )}
              aria-label="Delete course"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
