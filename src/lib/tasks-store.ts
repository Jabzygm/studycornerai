import { useEffect, useState, useCallback } from "react";

export type TaskCategory = "Homework" | "Finals" | "Projects";
export type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  done: boolean;
  createdAt: number;
  course?: string;
  courseId?: string;
};

const KEY = "study-corner-tasks";

const seed: Task[] = [
  { id: "t1", title: "Finish problem set 3", category: "Homework", done: false, createdAt: Date.now() - 86400000, courseId: "cs250", course: "CS 250" },
  { id: "t2", title: "Read Chalmers chapter 2", category: "Homework", done: true, createdAt: Date.now() - 172800000, courseId: "phil140", course: "PHIL 140" },
  { id: "t3", title: "Linear algebra midterm review", category: "Finals", done: false, createdAt: Date.now() - 43200000, courseId: "math220", course: "MATH 220" },
  { id: "t4", title: "Outline modernism essay", category: "Projects", done: false, createdAt: Date.now() - 200000, courseId: "art110", course: "ART 110" },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read(): Task[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    return JSON.parse(raw) as Task[];
  } catch {
    return seed;
  }
}

function write(tasks: Task[]) {
  try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch {}
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(seed);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => setTasks(read()), []);

  useEffect(() => {
    refresh();
    setHydrated(true);
    listeners.add(refresh);
    return () => { listeners.delete(refresh); };
  }, [refresh]);

  const commit = (next: Task[]) => {
    write(next);
    setTasks(next);
    emit();
  };

  const add = (input: Omit<Task, "id" | "createdAt" | "done">) =>
    commit([{ ...input, id: crypto.randomUUID(), createdAt: Date.now(), done: false }, ...read()]);
  const toggle = (id: string) =>
    commit(read().map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const remove = (id: string) => commit(read().filter((x) => x.id !== id));
  const update = (id: string, patch: Partial<Task>) =>
    commit(read().map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return { tasks, add, toggle, remove, update, hydrated };
}
