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

export const courses: Course[] = [
  {
    id: "cs250",
    code: "CS 250",
    title: "Algorithms & Complexity",
    instructor: "Dr. Lin Park",
    term: "Fall 2026",
    hue: 220,
    description: "Foundations of algorithmic design, asymptotic analysis, and complexity classes.",
    progress: 62,
  },
  {
    id: "phil140",
    code: "PHIL 140",
    title: "Philosophy of Mind",
    instructor: "Prof. Aimée Renaud",
    term: "Fall 2026",
    hue: 30,
    description: "Consciousness, qualia, and theories of cognition from Descartes to Chalmers.",
    progress: 45,
  },
  {
    id: "math220",
    code: "MATH 220",
    title: "Linear Algebra",
    instructor: "Dr. Hiroshi Tanaka",
    term: "Fall 2026",
    hue: 150,
    description: "Vector spaces, eigenvalues, and applications to data and geometry.",
    progress: 78,
  },
  {
    id: "art110",
    code: "ART 110",
    title: "Modernism & After",
    instructor: "Prof. Camille Doré",
    term: "Fall 2026",
    hue: 350,
    description: "From Cézanne to contemporary practice: movements, manifestos, and methods.",
    progress: 30,
  },
];

export const courseFiles: Record<string, { name: string; size: string; updated: string }[]> = {
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

export const courseQuizzes: Record<
  string,
  { question: string; options: string[]; answerIndex: number }[]
> = {
  cs250: [
    {
      question: "What is the time complexity of binary search on a sorted array of n elements?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      answerIndex: 1,
    },
    {
      question: "Which sorting algorithm has the best average-case time complexity?",
      options: ["Bubble sort", "Insertion sort", "Merge sort", "Selection sort"],
      answerIndex: 2,
    },
    {
      question: "Big-O notation describes an algorithm's...",
      options: ["Best case", "Upper bound", "Lower bound", "Average exactly"],
      answerIndex: 1,
    },
  ],
  phil140: [
    {
      question: "Who introduced the 'hard problem of consciousness'?",
      options: ["Descartes", "Dennett", "Chalmers", "Kant"],
      answerIndex: 2,
    },
    {
      question: "Cartesian dualism holds that mind and body are...",
      options: ["Identical", "Two distinct substances", "Both physical", "Illusions"],
      answerIndex: 1,
    },
  ],
  math220: [
    {
      question: "The dimension of a vector space equals the number of...",
      options: ["Vectors", "Basis vectors", "Eigenvalues", "Rows in a matrix"],
      answerIndex: 1,
    },
    {
      question: "An eigenvector v of A satisfies...",
      options: ["Av = 0", "Av = v", "Av = λv", "A + v = λ"],
      answerIndex: 2,
    },
  ],
  art110: [
    {
      question: "Cubism was pioneered primarily by...",
      options: ["Monet & Manet", "Picasso & Braque", "Dalí & Miró", "Warhol & Lichtenstein"],
      answerIndex: 1,
    },
  ],
};

export function mockChatReply(courseTitle: string, prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) return "Could you share a specific question about the material?";
  const lower = trimmed.toLowerCase();

  if (/^(hi|hello|hey|yo)\b/.test(lower)) {
    return `Hey! Ready to dig into ${courseTitle}? Ask me about a concept, a reading, or a problem you're stuck on.`;
  }
  if (lower.includes("summarize") || lower.includes("summary") || lower.includes("tl;dr")) {
    return `Here's the gist for ${courseTitle}: the recent material builds from core definitions → worked examples → an open question you should be able to answer in 2–3 sentences. Want me to expand any section?`;
  }
  if (lower.includes("explain") || lower.includes("what is") || lower.includes("what's")) {
    return `Good prompt. In ${courseTitle}, think of it this way: start from the definition, then trace one concrete example end-to-end. The intuition usually clicks once you see why the edge cases behave the way they do. Want me to walk a worked example?`;
  }
  if (lower.includes("quiz") || lower.includes("test") || lower.includes("practice")) {
    return `Sure — try this: pick one concept from the latest lecture, write its definition from memory, then construct a counter-example. If you can do both in under 3 minutes, you're solid. Want me to generate 5 practice questions?`;
  }
  if (lower.includes("exam") || lower.includes("midterm") || lower.includes("final")) {
    return `For ${courseTitle} exams, prioritize: (1) definitions you can restate cleanly, (2) two worked problems per topic, (3) one "why does this matter" sentence per concept. That trio covers ~80% of typical questions.`;
  }
  if (lower.endsWith("?")) {
    return `Great question. In the context of ${courseTitle}, the short answer is: it depends on the assumptions you start from. The longer answer involves checking the conditions of the relevant theorem/argument and then applying it carefully. Want me to walk through step by step?`;
  }
  return `Noted. For ${courseTitle}, I'd suggest re-reading the most recent lecture notes, then attempting one practice problem before moving on. Tell me which topic feels shakiest and I'll target it.`;
}
