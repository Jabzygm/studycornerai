import { useEffect, useState } from "react";

export type Course = {
  id: string;
  code: string;
  title: string;
  instructor: string;
  term: string;
  hue: number;
  description: string;
  progress: number;
};

export type CourseFile = { name: string; size: string; updated: string };
export type QuizQuestion = { question: string; options: string[]; answerIndex: number };

const COURSES_KEY = "study-corner-courses";
const FILES_KEY = "study-corner-files";
const QUIZZES_KEY = "study-corner-quizzes";

const seedCourses: Course[] = [
  { id: "cs250", code: "CS 250", title: "Algorithms & Complexity", instructor: "Dr. Lin Park", term: "Fall 2026", hue: 220, description: "Foundations of algorithmic design, asymptotic analysis, and complexity classes.", progress: 62 },
  { id: "phil140", code: "PHIL 140", title: "Philosophy of Mind", instructor: "Prof. Aimée Renaud", term: "Fall 2026", hue: 30, description: "Consciousness, qualia, and theories of cognition from Descartes to Chalmers.", progress: 45 },
  { id: "math220", code: "MATH 220", title: "Linear Algebra", instructor: "Dr. Hiroshi Tanaka", term: "Fall 2026", hue: 150, description: "Vector spaces, eigenvalues, and applications to data and geometry.", progress: 78 },
  { id: "art110", code: "ART 110", title: "Modernism & After", instructor: "Prof. Camille Doré", term: "Fall 2026", hue: 350, description: "From Cézanne to contemporary practice: movements, manifestos, and methods.", progress: 30 },
];

const seedFiles: Record<string, CourseFile[]> = {
  cs250: [
    { name: "Lecture_01_Intro.pdf", size: "1.2 MB", updated: "2 days ago" },
    { name: "Lecture_02_Divide_Conquer.pdf", size: "2.4 MB", updated: "5 days ago" },
    { name: "Problem_Set_1.pdf", size: "340 KB", updated: "1 week ago" },
    { name: "Syllabus.pdf", size: "180 KB", updated: "3 weeks ago" },
  ],
  phil140: [
    { name: "Lecture_01_Dualism.pdf", size: "980 KB", updated: "1 day ago" },
    { name: "Reading_Chalmers.pdf", size: "3.1 MB", updated: "4 days ago" },
    { name: "Essay_Prompt.pdf", size: "120 KB", updated: "1 week ago" },
  ],
  math220: [
    { name: "Notes_Vector_Spaces.pdf", size: "1.5 MB", updated: "today" },
    { name: "Homework_3.pdf", size: "220 KB", updated: "3 days ago" },
    { name: "Midterm_Review.pdf", size: "890 KB", updated: "6 days ago" },
  ],
  art110: [
    { name: "Slides_Cubism.pdf", size: "5.2 MB", updated: "yesterday" },
    { name: "Reading_Greenberg.pdf", size: "1.1 MB", updated: "5 days ago" },
  ],
};

const seedQuizzes: Record<string, QuizQuestion[]> = {
  cs250: [
    { question: "What is the time complexity of binary search on a sorted array of n elements?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answerIndex: 1 },
    { question: "Which sorting algorithm has the best average-case time complexity?", options: ["Bubble sort", "Insertion sort", "Merge sort", "Selection sort"], answerIndex: 2 },
    { question: "Big-O notation describes an algorithm's...", options: ["Best case", "Upper bound", "Lower bound", "Average exactly"], answerIndex: 1 },
  ],
  phil140: [
    { question: "Who introduced the 'hard problem of consciousness'?", options: ["Descartes", "Dennett", "Chalmers", "Kant"], answerIndex: 2 },
    { question: "Cartesian dualism holds that mind and body are...", options: ["Identical", "Two distinct substances", "Both physical", "Illusions"], answerIndex: 1 },
  ],
  math220: [
    { question: "The dimension of a vector space equals the number of...", options: ["Vectors", "Basis vectors", "Eigenvalues", "Rows in a matrix"], answerIndex: 1 },
    { question: "An eigenvector v of A satisfies...", options: ["Av = 0", "Av = v", "Av = λv", "A + v = λ"], answerIndex: 2 },
  ],
  art110: [
    { question: "Cubism was pioneered primarily by...", options: ["Monet & Manet", "Picasso & Braque", "Dalí & Miró", "Warhol & Lichtenstein"], answerIndex: 1 },
  ],
};

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

function writeCourses(courses: Course[]) {
  try {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  } catch {}
}

function readFiles(): Record<string, CourseFile[]> {
  if (typeof window === "undefined") return seedFiles;
  try {
    const raw = localStorage.getItem(FILES_KEY);
    if (!raw) return seedFiles;
    return JSON.parse(raw) as Record<string, CourseFile[]>;
  } catch {
    return seedFiles;
  }
}

function writeFiles(files: Record<string, CourseFile[]>) {
  try {
    localStorage.setItem(FILES_KEY, JSON.stringify(files));
  } catch {}
}

function readQuizzes(): Record<string, QuizQuestion[]> {
  if (typeof window === "undefined") return seedQuizzes;
  try {
    const raw = localStorage.getItem(QUIZZES_KEY);
    if (!raw) return seedQuizzes;
    return JSON.parse(raw) as Record<string, QuizQuestion[]>;
  } catch {
    return seedQuizzes;
  }
}

function writeQuizzes(quizzes: Record<string, QuizQuestion[]>) {
  try {
    localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
  } catch {}
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>(seedCourses);
  const [files, setFiles] = useState<Record<string, CourseFile[]>>(seedFiles);
  const [quizzes, setQuizzes] = useState<Record<string, QuizQuestion[]>>(seedQuizzes);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCourses(readCourses());
    setFiles(readFiles());
    setQuizzes(readQuizzes());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeCourses(courses);
  }, [courses, hydrated]);

  useEffect(() => {
    if (hydrated) writeFiles(files);
  }, [files, hydrated]);

  useEffect(() => {
    if (hydrated) writeQuizzes(quizzes);
  }, [quizzes, hydrated]);

  const add = (input: Omit<Course, "id" | "progress">) => {
    const id = crypto.randomUUID();
    const course: Course = { ...input, id, progress: 0 };
    setCourses((c) => [course, ...c]);
    setFiles((f) => ({ ...f, [id]: [] }));
    setQuizzes((q) => ({ ...q, [id]: [] }));
    return id;
  };

  const remove = (id: string) => {
    setCourses((c) => c.filter((x) => x.id !== id));
    setFiles((f) => {
      const next = { ...f };
      delete next[id];
      return next;
    });
    setQuizzes((q) => {
      const next = { ...q };
      delete next[id];
      return next;
    });
  };

  const update = (id: string, patch: Partial<Course>) =>
    setCourses((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return { courses, files, quizzes, add, remove, update, hydrated };
}
