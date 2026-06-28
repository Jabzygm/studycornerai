import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
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

function TasksPage() {
  const { tasks, add, toggle, remove } = useTasks();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Homework");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    add({ title: title.trim(), category });
    setTitle("");
  };

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-12 py-12 md:py-16">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
        <h1 className="font-display text-4xl md:text-5xl font-medium mt-2">Tasks</h1>
      </header>

      <form onSubmit={submit} className="surface-card p-2 flex items-center gap-2 mb-10">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cats.map((cat) => {
          const items = tasks.filter((t) => t.category === cat);
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
                        t.done
                          ? "bg-primary border-primary"
                          : "border-border hover:border-foreground/40",
                      )}
                    >
                      {t.done && (
                        <svg className="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm transition-colors", t.done && "line-through text-muted-foreground")}>
                        {t.title}
                      </p>
                      {t.course && (
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                          {t.course}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => remove(t.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
