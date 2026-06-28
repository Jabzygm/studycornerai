import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, FileText, Send, Sparkles, Check, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { courses, courseFiles, courseQuizzes, mockChatReply } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses/$courseId")({
  loader: ({ params }) => {
    const course = courses.find((c) => c.id === params.courseId);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.course.code} — Study Corner` },
      { name: "description", content: loaderData?.course.description ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="p-12 text-center text-muted-foreground">Course not found.</div>
  ),
  component: CourseHub,
});

type Tab = "materials" | "quiz";

function CourseHub() {
  const { course } = Route.useLoaderData();
  const [tab, setTab] = useState<Tab>("materials");
  const files = courseFiles[course.id] ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-12 py-10 md:py-14">
      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-3 w-3" /> Courses
      </Link>

      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <p
            className="text-xs uppercase tracking-[0.2em]"
            style={{ color: `oklch(0.5 0.1 ${course.hue})` }}
          >
            {course.code} · {course.term}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-medium mt-2">{course.title}</h1>
          <p className="text-muted-foreground mt-2">{course.instructor}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <div className="flex gap-1 border-b border-border mb-6">
            {(["materials", "quiz"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-4 py-2.5 text-sm capitalize relative transition-colors",
                  tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
                {tab === t && (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-foreground" />
                )}
              </button>
            ))}
          </div>

          {tab === "materials" && (
            <div className="surface-card overflow-hidden animate-fade-in">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Materials</p>
                <p className="text-xs text-muted-foreground">{files.length} files</p>
              </div>
              <ul className="divide-y divide-border">
                {files.map((f) => (
                  <li
                    key={f.name}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-surface-muted transition-colors cursor-pointer group"
                  >
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center"
                      style={{ background: `oklch(0.92 0.04 ${course.hue})` }}
                    >
                      <FileText
                        className="h-4 w-4"
                        style={{ color: `oklch(0.4 0.08 ${course.hue})` }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.size} · updated {f.updated}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      Open
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "quiz" && <Quiz courseId={course.id} hue={course.hue} />}
        </div>

        <Chat courseTitle={course.title} hue={course.hue} />
      </div>
    </div>
  );
}

function Quiz({ courseId, hue }: { courseId: string; hue: number }) {
  const questions = courseQuizzes[courseId] ?? [];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[idx];

  if (!q) return <div className="surface-card p-8 text-center text-muted-foreground">No quiz yet.</div>;

  const reveal = selected !== null;

  const next = () => {
    if (selected === q.answerIndex) setScore((s) => s + 1);
    if (idx + 1 >= questions.length) setDone(true);
    else {
      setIdx(idx + 1);
      setSelected(null);
    }
  };

  const reset = () => {
    setIdx(0); setSelected(null); setScore(0); setDone(false);
  };

  if (done) {
    return (
      <div className="surface-card p-10 text-center animate-fade-in">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Result</p>
        <p className="font-display text-5xl mt-3">
          {score}<span className="text-muted-foreground">/{questions.length}</span>
        </p>
        <button onClick={reset} className="mt-6 text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="surface-card p-7 animate-fade-in">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-5">
        <span>Question {idx + 1} of {questions.length}</span>
        <span>Score {score}</span>
      </div>
      <h3 className="font-display text-xl leading-snug mb-6">{q.question}</h3>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answerIndex;
          const isSelected = i === selected;
          return (
            <button
              key={i}
              disabled={reveal}
              onClick={() => setSelected(i)}
              className={cn(
                "w-full text-left rounded-lg border px-4 py-3 text-sm transition-all duration-200 flex items-center justify-between",
                reveal && isAnswer && "border-foreground bg-surface-muted",
                reveal && isSelected && !isAnswer && "border-destructive/40 text-muted-foreground",
                !reveal && "border-border hover:border-foreground/30 hover:bg-surface-muted",
              )}
              style={!reveal && isSelected ? { borderColor: `oklch(0.55 0.12 ${hue})` } : undefined}
            >
              <span>{opt}</span>
              {reveal && isAnswer && <Check className="h-4 w-4" />}
              {reveal && isSelected && !isAnswer && <X className="h-4 w-4" />}
            </button>
          );
        })}
      </div>
      <button
        disabled={selected === null}
        onClick={next}
        className="mt-6 w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-40 transition-opacity hover:opacity-90"
      >
        {idx + 1 === questions.length ? "Finish" : "Next question"}
      </button>
    </div>
  );
}

type Msg = { role: "user" | "ai"; text: string };

function Chat({ courseTitle, hue }: { courseTitle: string; hue: number }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: `Hi! Ask me anything about ${courseTitle} — concepts, readings, problem sets.` },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "ai", text: mockChatReply(courseTitle, text) }]);
      setTyping(false);
    }, 700 + Math.random() * 600);
  };

  return (
    <aside className="surface-card flex flex-col h-[600px] lg:sticky lg:top-6">
      <header className="px-5 py-4 border-b border-border flex items-center gap-2.5">
        <div
          className="h-7 w-7 rounded-full flex items-center justify-center"
          style={{ background: `oklch(0.92 0.05 ${hue})` }}
        >
          <Sparkles className="h-3.5 w-3.5" style={{ color: `oklch(0.4 0.1 ${hue})` }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">Course assistant</p>
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
                : "text-foreground",
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
          className="flex-1 bg-transparent text-sm outline-none px-3 py-2 placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 transition-opacity hover:opacity-90"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </aside>
  );
}
