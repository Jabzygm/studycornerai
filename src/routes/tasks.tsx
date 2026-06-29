import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useState } from "react";
import { useTasks, type TaskCategory } from "@/lib/tasks-store";
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

function TasksPage() {
  const { tasks, add, toggle, remove, update } = useTasks();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Homework");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    add({ title: title.trim(), category });
    setTitle("");
  };

  const startEdit = (id: string, current: string) => {
    setEditingId(id);
    setEditValue(current);
  };
  const saveEdit = (id: string) => {
    const v = editValue.trim();
    if (v) update(id, { title: v });
    setEditingId(null);
  };

  const visible = (cat: TaskCategory) =>
    tasks.filter((t) => t.category === cat && (filter === "all" || (filter === "pending" ? !t.done : t.done)));

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => !t.done).length,
    completed: tasks.filter((t) => t.done).length,
  };

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-12 py-12 md:py-16">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
        <h1 className="font-display text-4xl md:text-5xl font-medium mt-2">Tasks</h1>
      </header>

      <form onSubmit={submit} className="surface-card p-2 flex items-center gap-2 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task — finish problem set, draft essay…"
          className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TaskCategory)}
          className="bg-surface-muted rounded-md text-xs px-3 py-2 outline-none border border-border"
        >
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button
          type="submit"
          className="h-9 w-9 shrink-0 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      <div className="flex gap-1 mb-8 border-b border-border">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cats.map((cat) => {
          const items = visible(cat);
          return (
            <div key={cat} className="surface-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg">{cat}</h2>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              {items.length === 0 && (
                <p className="text-xs text-muted-foreground py-6 text-center">Nothing here.</p>
              )}
              <ul className="space-y-1.5">
                {items.map((t) => (
                  <li
                    key={t.id}
                    className="group flex items-start gap-3 rounded-lg p-2.5 hover:bg-surface-muted transition-colors"
                  >
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
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(t.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(t.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="w-full bg-transparent text-sm outline-none border-b border-foreground/30 pb-0.5"
                        />
                      ) : (
                        <p
                          onDoubleClick={() => startEdit(t.id, t.title)}
                          className={cn("text-sm transition-colors", t.done && "line-through text-muted-foreground")}
                        >
                          {t.title}
                        </p>
                      )}
                      {t.course && (
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                          {t.course}
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
                          <button onClick={() => startEdit(t.id, t.title)} className="text-muted-foreground hover:text-foreground" aria-label="Edit">
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
