import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
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
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add course"}
        </button>
      </header>

      {showForm && (
        <form onSubmit={submit} className="surface-card p-5 mb-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CS 101"
                className="w-full bg-transparent text-sm outline-none border border-border rounded-lg px-3 py-2 focus:border-foreground/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Intro to Computer Science"
                className="w-full bg-transparent text-sm outline-none border border-border rounded-lg px-3 py-2 focus:border-foreground/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Instructor</label>
              <input
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="Dr. Smith"
                className="w-full bg-transparent text-sm outline-none border border-border rounded-lg px-3 py-2 focus:border-foreground/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Accent color</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={hue}
                  onChange={(e) => setHue(Number(e.target.value))}
                  className="flex-1"
                />
                <span
                  className="h-6 w-6 rounded-full shrink-0"
                  style={{ background: `oklch(0.55 0.12 ${hue})` }}
                />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief course description..."
              className="w-full bg-transparent text-sm outline-none border border-border rounded-lg px-3 py-2 focus:border-foreground/30 transition-colors min-h-[80px] resize-y"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!code.trim() || !title.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> Add course
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((c) => (
          <div key={c.id} className="surface-card p-6 group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 relative">
            <Link
              to="/courses/$courseId"
              params={{ courseId: c.id }}
              className="block"
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
            <button
              onClick={() => remove(c.id)}
              className={cn(
                "absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all",
                "opacity-0 group-hover:opacity-100"
              )}
              aria-label="Delete course"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
