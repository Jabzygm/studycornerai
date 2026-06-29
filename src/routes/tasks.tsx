import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useState } from "react";
import { useTasks, type TaskCategory } from "@/lib/tasks-store";
import { useCourses } from "@/lib/courses-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Study Corner" },
      { name: "description", content: "Your tasks, homework, and projects in one calm board." },
    ],
  }),
  component: TasksPage,
});

const cats: TaskCategory[] = ["Homework", "Projects", "Finals"];
type Filter = "all" | "pending" | "completed";
const filters: Filter[] = ["all", "pending", "completed"];
const NONE = "__none__";

function TasksPage() {
  const { tasks, add, toggle, remove, update } = useTasks();
  const { courses } = useCourses();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Homework");
  const [newCourseId, setNewCourseId] = useState<string>(NONE);
  const [filter, setFilter] = useState<Filter>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editCourseId, setEditCourseId] = useState<string>(NONE);

  const codeFor = (id?: string) => courses.find((c) => c.id === id)?.code;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const cid = newCourseId === NONE ? undefined : newCourseId;
    add({ title: title.trim(), category, courseId: cid, course: codeFor(cid) });
    setTitle("");
  };

  const startEdit = (id: string, current: string, cid?: string) => {
    setEditingId(id);
    setEditValue(current);
    setEditCourseId(cid ?? NONE);
  };
  const saveEdit = (id: string) => {
    const v = editValue.trim();
    const cid = editCourseId === NONE ? undefined : editCourseId;
    if (v) update(id, { title: v, courseId: cid, course: codeFor(cid) });
    setEditingId(null);
  };

  const matchesFilters = (t: { done: boolean; courseId?: string }) => {
    if (filter === "pending" && t.done) return false;
    if (filter === "completed" && !t.done) return false;
    if (courseFilter === "none" && t.courseId) return false;
    if (courseFilter !== "all" && courseFilter !== "none" && t.courseId !== courseFilter) return false;
    return true;
  };

  const visible = (cat: TaskCategory) => tasks.filter((t) => t.category === cat && matchesFilters(t));

  const counts = {
    all: tasks.filter(matchesFiltersIgnoringStatus(courseFilter)).length,
    pending: tasks.filter((t) => !t.done && matchesFiltersIgnoringStatus(courseFilter)(t)).length,
    completed: tasks.filter((t) => t.done && matchesFiltersIgnoringStatus(courseFilter)(t)).length,
  };

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-12 py-12 md:py-16">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
        <h1 className="font-display text-4xl md:text-5xl font-medium mt-2">Tasks</h1>
      </header>

      <form onSubmit={submit} className="surface-card p-2 flex flex-wrap items-center gap-2 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task — finish problem set, draft essay…"
          className="flex-1 min-w-[200px] bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <select
          value={newCourseId}
          onChange={(e) => setNewCourseId(e.target.value)}
          className="bg-surface-muted rounded-md text-xs px-3 py-2 outline-none border border-border max-w-[160px]"
        >
          <option value={NONE}>No course</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TaskCategory)}
          className="bg-surface-muted rounded-md text-xs px-3 py-2 outline-none border border-border"
        >
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button type="submit" className="h-9 w-9 shrink-0 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" />
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 border-b border-border">
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "relative px-4 py-2.5 text-sm capitalize transition-colors",
                filter === f ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f} <span className="text-xs text-muted-foreground ml-1">{counts[f]}</span>
              {filter === f && <span className="absolute inset-x-3 -bottom-px h-px bg-foreground" />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pb-2">
          <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Course</label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-surface-muted rounded-md text-xs px-3 py-2 outline-none border border-border"
          >
            <option value="all">All courses</option>
            <option value="none">No course</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cats.map((cat) => {
          const items = visible(cat);
          return (
            <div key={cat} className="surface-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg">{cat}</h2>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              {items.length === 0 && <p className="text-xs text-muted-foreground py-6 text-center">Nothing here.</p>}
              <ul className="space-y-1.5">
                {items.map((t) => (
                  <li key={t.id} className="group flex items-start gap-3 rounded-lg p-2.5 hover:bg-surface-muted transition-colors">
                    <button
                      onClick={() => toggle(t.id)}
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0 rounded border transition-all flex items-center justify-center",
                        t.done ? "bg-primary border-primary" : "border-border hover:border-foreground/40",
                      )}
                    >
                      {t.done && (
                        <svg className="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      {editingId === t.id ? (
                        <div className="space-y-1.5">
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(t.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="w-full bg-transparent text-sm outline-none border-b border-foreground/30 pb-0.5"
                          />
                          <select
                            value={editCourseId}
                            onChange={(e) => setEditCourseId(e.target.value)}
                            className="bg-surface-muted rounded-md text-[10px] px-2 py-1 border border-border outline-none"
                          >
                            <option value={NONE}>No course</option>
                            {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
                          </select>
                        </div>
                      ) : (
                        <p
                          onDoubleClick={() => startEdit(t.id, t.title, t.courseId)}
                          className={cn("text-sm transition-colors", t.done && "line-through text-muted-foreground")}
                        >
                          {t.title}
                        </p>
                      )}
                      {!editingId && (codeFor(t.courseId) || t.course) && (
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                          {codeFor(t.courseId) ?? t.course}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingId === t.id ? (
                        <>
                          <button onClick={() => saveEdit(t.id)} className="text-muted-foreground hover:text-foreground" aria-label="Save">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground" aria-label="Cancel">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(t.id, t.title, t.courseId)} className="text-muted-foreground hover:text-foreground" aria-label="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function matchesFiltersIgnoringStatus(courseFilter: string) {
  return (t: { courseId?: string }) => {
    if (courseFilter === "all") return true;
    if (courseFilter === "none") return !t.courseId;
    return t.courseId === courseFilter;
  };
}
