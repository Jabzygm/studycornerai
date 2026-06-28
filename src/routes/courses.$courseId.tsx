import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileText, Send, Sparkles, Check, X, Wand as Wand2, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useCourses } from "@/lib/courses-store";
import { mockChatReply } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses/$courseId")({
  head: () => ({
    meta: [
      { title: "Course — Study Corner" },
      { name: "description", content: "Course hub, materials, quizzes, and AI tutor." },
    ],
  }),
  component: CourseHub,
});

type Tab = "materials" | "quiz";

function CourseHub() {
  const { courseId } = useParams({ from: "/courses/$courseId" });
  const { courses, files: courseFiles, quizzes: courseQuizzes } = useCourses();
  const course = courses.find((c) => c.id === courseId);
  const [tab, setTab] = useState<Tab>("materials");

  if (!course) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-10 md:py-14">
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-300 mb-8"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2.5} /> Courses
        </Link>
        <div className="p-12 text-center text-muted-foreground">Course not found.</div>
      </div>
    );
  }

  const files = courseFiles[course.id] ?? [];
  const accentColor = `oklch(0.55 0.12 ${course.hue})`;
  const lightAccent = `oklch(0.92 0.05 ${course.hue})`;

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-12 py-10 md:py-14">
      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-300 mb-8"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={2.5} /> Courses
      </Link>

      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: accentColor }}>
            {course.code} · {course.term}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-medium mt-2">{course.title}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{course.instructor}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <div className="flex gap-1 border-b border-border/60 mb-6">
            {(["materials", "quiz"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "relative px-4 py-2.5 text-sm capitalize transition-all duration-300 font-medium",
                  tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
                {tab === t && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 bg-foreground rounded-full" />
                )}
              </button>
            ))}
          </div>

          {tab === "materials" && (
            <div className="space-y-6 animate-fade-in">
              <div className="surface-card overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">Materials</p>
                  <p className="text-xs text-muted-foreground">{files.length} files</p>
                </div>
                <ul className="divide-y divide-border/60">
                  {files.map((f) => (
                    <li
                      key={f.name}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-muted/60 transition-all duration-300 cursor-pointer group"
                    >
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                        style={{ background: lightAccent }}
                      >
                        <FileText className="h-4 w-4" style={{ color: accentColor }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <p className="text-xs text-muted-foreground/60">
                          {f.size} · updated {f.updated}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                        Open →
                      </span>
                    </li>
                  ))}
                  {files.length === 0 && (
                    <li className="px-5 py-8 text-center text-xs text-muted-foreground/60">
                      No files yet.
                    </li>
                  )}
                </ul>
              </div>

              <SmartStudy courseTitle={course.title} hue={course.hue} />
            </div>
          )}

          {tab === "quiz" && <Quiz courseId={course.id} hue={course.hue} courseQuizzes={courseQuizzes} />}
        </div>

        <Chat courseTitle={course.title} hue={course.hue} />
      </div>
    </div>
  );
}

function SmartStudy({ courseTitle, hue }: { courseTitle: string; hue: number }) {
  const [notes, setNotes] = useState("");

  const buildPrompt = (text: string) =>
    `You are an expert university professor teaching ${courseTitle}. A student has shared the following lecture notes:

"""
${text.trim()}
"""

Please do the following, formatted in clean markdown:

1. **Concise Summary** — Distill the notes into 5–7 bullet points capturing the core concepts.
2. **Key Terms** — Define the 5 most important terms in your own words.
3. **5-Question Quiz** — Create a multiple-choice quiz (4 options each) testing comprehension. Mark the correct answer and add a one-sentence explanation.
4. **Study Suggestion** — Recommend one concrete next step to deepen understanding.

Keep the tone clear, rigorous, and encouraging.`;

  const generate = async () => {
    const text = notes.trim();
    if (!text) {
      toast.error("Paste some notes first.");
      return;
    }
    const prompt = buildPrompt(text);
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success("Gemini study prompt copied", {
        description: "Paste it into Gemini to get your summary and quiz.",
      });
    } catch {
      toast.error("Couldn't access clipboard");
    }
  };

  return (
    <div className="surface-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
        <Wand2 className="h-3.5 w-3.5" style={{ color: `oklch(0.5 0.1 ${hue})` }} />
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">Smart Study · AI Prep</p>
      </div>
      <div className="p-5 space-y-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste lecture notes, readings, or rough thoughts here…"
          className="w-full min-h-[160px] resize-y bg-surface-muted/50 text-sm outline-none placeholder:text-muted-foreground/60 border border-border rounded-xl p-3.5 focus:border-foreground/20 focus:bg-surface transition-all duration-300"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground/60">
            {notes.trim() ? `${notes.trim().split(/\s+/).length} words` : "Awaiting notes"}
          </p>
          <button onClick={generate} className="btn-primary">
            <Wand2 className="h-3.5 w-3.5" strokeWidth={2.5} />
            Generate Gemini Study Prompt
          </button>
        </div>
      </div>
    </div>
  );
}

function Quiz({ courseId, hue, courseQuizzes }: { courseId: string; hue: number; courseQuizzes: Record<string, { question: string; options: string[]; answerIndex: number }[]> }) {
  const questions = courseQuizzes[courseId] ?? [];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const q = questions[idx];

  if (!q) return (
    <div className="surface-card p-8 text-center text-muted-foreground animate-fade-in">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted mb-4">
        <Sparkles className="h-5 w-5 text-muted-foreground/40" />
      </div>
      <p className="text-sm">No quiz yet for this course.</p>
    </div>
  );

  const reveal = selected !== null;

  const choose = (i: number) => {
    if (reveal) return;
    setSelected(i);
    if (i === q.answerIndex) setScore((s) => s + 1);
    setAnswered((a) => [...a, i === q.answerIndex]);
  };

  const next = () => {
    if (idx + 1 >= questions.length) setDone(true);
    else { setIdx(idx + 1); setSelected(null); }
  };

  const reset = () => {
    setIdx(0); setSelected(null); setScore(0); setDone(false); setAnswered([]);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const accentColor = `oklch(0.55 0.12 ${hue})`;
    return (
      <div className="surface-card p-10 text-center animate-fade-in">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Result</p>
        <div className="relative inline-flex items-center justify-center mt-6">
          <svg className="h-32 w-32 -rotate-90">
            <circle cx="64" cy="64" r="56" stroke="var(--color-muted)" strokeWidth="6" fill="none" />
            <circle cx="64" cy="64" r="56" stroke={accentColor} strokeWidth="6" fill="none" strokeDasharray={`${2 * Math.PI * 56 * pct / 100} ${2 * Math.PI * 56}`} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-3xl font-medium">{pct}%</span>
          </div>
        </div>
        <p className="font-display text-3xl mt-4">
          {score}<span className="text-muted-foreground">/{questions.length}</span>
        </p>
        <button onClick={reset} className="mt-6 btn-ghost">
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.5} /> Reset Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="surface-card p-7 animate-fade-in">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-5">
        <span className="font-medium">Question {idx + 1} of {questions.length}</span>
        <div className="flex items-center gap-3">
          <span className="bg-surface-muted px-2 py-1 rounded-md font-medium">Score {score}/{questions.length}</span>
          <button onClick={reset} className="inline-flex items-center gap-1 hover:text-foreground transition-colors duration-300 p-1 rounded-md hover:bg-surface-muted">
            <RotateCcw className="h-3 w-3" strokeWidth={2.5} /> Reset
          </button>
        </div>
      </div>
      <h3 className="font-display text-xl leading-snug mb-6">{q.question}</h3>
      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answerIndex;
          const isSelected = i === selected;
          const showCorrect = reveal && isAnswer;
          const showWrong = reveal && isSelected && !isAnswer;
          return (
            <button
              key={i}
              disabled={reveal}
              onClick={() => choose(i)}
              className={cn(
                "w-full text-left rounded-xl border px-4 py-3.5 text-sm transition-all duration-300 flex items-center justify-between",
                !reveal && "border-border hover:border-foreground/20 hover:bg-surface-muted/60 cursor-pointer",
                showCorrect && "border-emerald-500/50 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300",
                showWrong && "border-red-500/50 bg-red-500/8 text-red-700 dark:text-red-300",
                reveal && !isAnswer && !isSelected && "opacity-40",
              )}
              style={!reveal && isSelected ? { borderColor: `oklch(0.55 0.12 ${hue})`, backgroundColor: `oklch(0.95 0.02 ${hue})` } : undefined}
            >
              <span className="font-medium">{opt}</span>
              {showCorrect && <Check className="h-4 w-4" strokeWidth={2.5} />}
              {showWrong && <X className="h-4 w-4" strokeWidth={2.5} />}
            </button>
          );
        })}
      </div>
      <button
        disabled={!reveal}
        onClick={next}
        className="mt-6 w-full btn-primary disabled:opacity-40"
      >
        {idx + 1 === questions.length ? "Finish quiz" : "Next question"}
      </button>
      {answered.length > 0 && (
        <div className="mt-5 flex gap-1 justify-center">
          {answered.map((ok, i) => (
            <span
              key={i}
              className={cn("h-1.5 w-6 rounded-full transition-all duration-300", ok ? "bg-emerald-500/60" : "bg-red-500/60")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type Msg = { role: "user" | "ai"; text: string };

function Chat({ courseTitle, hue }: { courseTitle: string; hue: number }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: `Hi! I'm your ${courseTitle} tutor. Ask me anything — concepts, readings, problem sets.` },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "ai", text: mockChatReply(courseTitle, text) }]);
      setTyping(false);
      inputRef.current?.focus();
    }, 1000);
  };

  const accentColor = `oklch(0.55 0.12 ${hue})`;
  const lightAccent = `oklch(0.92 0.05 ${hue})`;

  return (
    <aside className="surface-card flex flex-col h-[600px] lg:sticky lg:top-6">
      <header className="px-5 py-4 border-b border-border flex items-center gap-2.5">
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center"
          style={{ background: lightAccent }}
        >
          <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">Course tutor</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Always available</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] text-sm leading-relaxed animate-fade-in",
              m.role === "user"
                ? "ml-auto rounded-2xl rounded-br-md bg-primary text-primary-foreground px-3.5 py-2.5"
                : "text-foreground rounded-2xl rounded-bl-md bg-surface-muted/60 px-3.5 py-2.5",
            )}
          >
            {m.text}
          </div>
        ))}
        {typing && (
          <div className="flex gap-1 text-muted-foreground text-sm animate-fade-in">
            <span className="animate-pulse">●</span>
            <span className="animate-pulse [animation-delay:150ms]">●</span>
            <span className="animate-pulse [animation-delay:300ms]">●</span>
          </div>
        )}
      </div>

      <form onSubmit={send} className="p-3 border-t border-border flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 bg-transparent text-sm outline-none px-3 py-2 placeholder:text-muted-foreground/60"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shadow-sm"
        >
          <Send className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </form>
    </aside>
  );
}
