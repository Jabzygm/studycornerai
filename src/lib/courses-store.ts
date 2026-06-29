import { useEffect, useState, useCallback } from "react";
import { courses as seedCourses, courseFiles as seedFiles, type Course } from "./mock-data";

export type CourseFile = { id: string; name: string; size: string; updated: string; note?: string };

const COURSES_KEY = "study-corner-courses";
const FILES_KEY = "study-corner-course-files";

// Simple cross-component subscription so all hook instances stay in sync.
type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

function readCourses(): Course[] {
  if (typeof window === "undefined") return seedCourses;
  try {
    const raw = localStorage.getItem(COURSES_KEY);
    if (!raw) return seedCourses;
    return JSON.parse(raw) as Course[];
  } catch {
    return seedCourses;
  }
}

function readFiles(): Record<string, CourseFile[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed from mock
  const seeded: Record<string, CourseFile[]> = {};
  for (const [k, arr] of Object.entries(seedFiles)) {
    seeded[k] = arr.map((f, i) => ({ id: `${k}-seed-${i}`, ...f }));
  }
  return seeded;
}

function writeCourses(c: Course[]) {
  try { localStorage.setItem(COURSES_KEY, JSON.stringify(c)); } catch {}
}
function writeFiles(f: Record<string, CourseFile[]>) {
  try { localStorage.setItem(FILES_KEY, JSON.stringify(f)); } catch {}
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>(seedCourses);
  const [files, setFiles] = useState<Record<string, CourseFile[]>>({});
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setCourses(readCourses());
    setFiles(readFiles());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);
    listeners.add(refresh);
    return () => { listeners.delete(refresh); };
  }, [refresh]);

  const addCourse = (input: { code: string; title: string; hue: number; instructor?: string }) => {
    const id = `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const next: Course = {
      id,
      code: input.code,
      title: input.title,
      instructor: input.instructor || "—",
      term: "Fall 2026",
      hue: input.hue,
      description: "",
      progress: 0,
    };
    const updated = [next, ...readCourses()];
    writeCourses(updated);
    emit();
    return id;
  };

  const removeCourse = (id: string) => {
    writeCourses(readCourses().filter((c) => c.id !== id));
    const f = readFiles(); delete f[id]; writeFiles(f);
    emit();
  };

  const addFile = (courseId: string, name: string, note?: string) => {
    const f = readFiles();
    const list = f[courseId] ?? [];
    const newFile: CourseFile = {
      id: `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      size: note ? `${Math.max(1, Math.round(note.length / 1024))} KB` : "—",
      updated: "just now",
      note,
    };
    f[courseId] = [newFile, ...list];
    writeFiles(f);
    emit();
  };

  const removeFile = (courseId: string, fileId: string) => {
    const f = readFiles();
    f[courseId] = (f[courseId] ?? []).filter((x) => x.id !== fileId);
    writeFiles(f);
    emit();
  };

  return { courses, files, hydrated, addCourse, removeCourse, addFile, removeFile };
}

export const COURSE_HUES = [220, 30, 150, 350, 280, 180, 50, 0];
