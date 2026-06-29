import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, Send, Sparkles, Check, X, Wand2, RotateCcw, Upload, Trash2, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { courseQuizzes, mockChatReply } from "@/lib/mock-data";
import { useCourses } from "@/lib/courses-store";
import { useTasks, type TaskCategory } from "@/lib/tasks-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses/$courseId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.courseId} — Study Corner` },
      { name: "description", content: "Course hub: materials, AI tutor, and quizzes." },
    ],
  }),
  component: CourseHub,
});

type Tab = "materials" | "quiz" | "tasks";

function CourseHub() {
  const { courseId } = Route.useParams();
  const { courses, files, addFile, removeFile, hydrated } = useCourses();
  const [tab, setTab] = useState<Tab>("materials");

  const course = courses.find((c) => c.id === courseId);

  if (!hydrated) {
    return <div className="p-12 text-center text-muted-foreground text-sm">Loading…</div>;
  }
  if (!course) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <p>Course not found.</p>
        <Link to="/courses" className="text-sm underline mt-3 inline-block">Back to courses</Link>
      </div>
    );
  }

  const courseFiles = files[course.id] ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-12 py-10 md:py-14">
      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="h-3 w-3" /> Courses
      </Link>

      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: `oklch(0.5 0.1 ${course.hue})` }}>
          {course.code} · {course.term}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-medium mt-2">{course.title}</h1>
        <p className="text-muted-foreground mt-2">{course.instructor}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <div className="flex gap-1 border-b border-border mb-6">
            {(["materials", "tasks", "quiz"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-4 py-2.5 text-sm capitalize relative transition-colors",
                  tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
                {tab === t && <span className="absolute inset-x-3 -bottom-px h-px bg-foreground" />}
              </button>
            ))}
          </div>

          {tab === "materials" && (
            <div className="space-y-6 animate-fade-in">
              <Materials
                courseId={course.id}
                hue={course.hue}
                files={courseFiles}
                onAdd={(name, note) => addFile(course.id, name, note)}
                onRemove={(fid) => removeFile(course.id, fid)}
              />
              <SmartStudy courseTitle={course.title} hue={course.hue} />
            </div>
          )}

          {tab === "tasks" && <CourseTasks courseId={course.id} courseCode={course.code} hue={course.hue} />}

          {tab === "quiz" && <Quiz courseId={course.id} hue={course.hue} />}
        </div>

        <Chat courseTitle={course.title} hue={course.hue} />
      </div>
    </div>
  );
}

function Materials({
  hue, files, onAdd, onRemove,
}: {
  courseId: string;
  hue: number;
  files: { id: string; name: string; size: string; updated: string; note?: string }[];
  onAdd: (name: string, note?: string) => void;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n && !note.trim()) {
      toast.error("Add a file name or paste some text.");
      return;
    }
    const finalName = n || `Note_${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}.txt`;
    onAdd(finalName, note.trim() || undefined);
    setName(""); setNote("");
    toast.success("Material added");
  };

  return (
    <>
      <form onSubmit={submit} className="surface-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="h-3.5 w-3.5" style={{ color: `oklch(0.4 0.1 ${hue})` }} />
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Upload material</p>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="File name — Lecture_03.pdf"
          className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-foreground/30"
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Or paste notes / text content (optional)…"
          className="w-full min-h-[80px] resize-y bg-transparent border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-foreground/30 placeholder:text-muted-foreground"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" /> Add to materials
          </button>
        </div>
      </form>

      <div className="surface-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Materials</p>
          <p className="text-xs text-muted-foreground">{files.length} files</p>
        </div>
        {files.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No materials yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-muted transition-colors group">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `oklch(0.92 0.04 ${hue})` }}>
                  <FileText className="h-4 w-4" style={{ color: `oklch(0.4 0.08 ${hue})` }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.size} · updated {f.updated}</p>
                  {f.note && <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">"{f.note}"</p>}
                </div>
                <button
                  onClick={() => onRemove(f.id)}
                  aria-label="Remove file"
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

const CATS: TaskCategory[] = ["Homework", "Projects", "Finals"];

function CourseTasks({ courseId, courseCode, hue }: { courseId: string; courseCode: string; hue: number }) {
  const { tasks, add, toggle, remove } = useTasks();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Homework");

  const mine = tasks.filter((t) => t.courseId === courseId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    add({ title: title.trim(), category, courseId, course: courseCode });
    setTitle("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={submit} className="surface-card p-2 flex items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Add a task for ${courseCode}…`}
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TaskCategory)}
          className="bg-surface-muted rounded-md text-xs px-2 py-2 border border-border outline-none"
        >
          {CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button type="submit" className="h-9 w-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" />
        </button>
      </form>

      <div className="surface-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Course tasks</p>
          <p className="text-xs text-muted-foreground">{mine.length}</p>
        </div>
        {mine.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {mine.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3 group hover:bg-surface-muted transition-colors">
                <button
                  onClick={() => toggle(t.id)}
                  className={cn(
                    "h-4 w-4 shrink-0 rounded border transition-all flex items-center justify-center",
                    t.done ? "border-transparent" : "border-border hover:border-foreground/40",
                  )}
                  style={t.done ? { background: `oklch(0.55 0.12 ${hue})` } : undefined}
                >
                  {t.done && (
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", t.done && "line-through text-muted-foreground")}>{t.title}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{t.category}</p>
                </div>
                <button
                  onClick={() => remove(t.id)}
                  aria-label="Delete"
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
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
    if (!text) { toast.error("Paste some notes first."); return; }
    try {
      await navigator.clipboard.writeText(buildPrompt(text));
      toast.success("Gemini study prompt copied", { description: "Paste it into Gemini to get your summary and quiz." });
    } catch { toast.error("Couldn't access clipboard"); }
  };

  return (
    <div className="surface-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
        <Wand2 className="h-3.5 w-3.5" style={{ color: `oklch(0.4 0.1 ${hue})` }} />
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Smart Study · AI Prep</p>
      </div>
      <div className="p-5 space-y-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste lecture notes, readings, or rough thoughts here…"
          className="w-full min-h-[140px] resize-y bg-transparent text-sm outline-none placeholder:text-muted-foreground border border-border rounded-lg p-3 focus:border-foreground/30 transition-colors"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {notes.trim() ? `${notes.trim().split(/\s+/).length} words` : "Awaiting notes"}
          </p>
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Wand2 className="h-3.5 w-3.5" /> Generate Gemini Prompt
          </button>
        </div>
      </div>
    </div>
  );
}

function Quiz({ courseId, hue }: { courseId: string; hue: number }) {
  const questions = courseQuizzes[courseId] ?? [];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const q = questions[idx];

  if (!q) return <div className="surface-card p-10 text-center text-sm text-muted-foreground">No quiz available for this course yet.</div>;

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
  const reset = () => { setIdx(0); setSelected(null); setScore(0); setDone(false); setAnswered([]); };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="surface-card p-10 text-center animate-fade-in">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Result</p>
        <p className="font-display text-6xl mt-3">{score}<span className="text-muted-foreground">/{questions.length}</span></p>
        <p className="text-sm text-muted-foreground mt-2">{pct}% correct</p>
        <button onClick={reset} className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-muted transition-colors">
          <RotateCcw className="h-3.5 w-3.5" /> Reset Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="surface-card p-7 animate-fade-in">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-5">
        <span>Question {idx + 1} of {questions.length}</span>
        <div className="flex items-center gap-3">
          <span>Score {score}/{questions.length}</span>
          <button onClick={reset} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>
      <h3 className="font-display text-xl leading-snug mb-6">{q.question}</h3>
      <div className="space-y-2">
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
                "w-full text-left rounded-lg border px-4 py-3 text-sm transition-all duration-200 flex items-center justify-between",
                !reveal && "border-border hover:border-foreground/30 hover:bg-surface-muted cursor-pointer",
                showCorrect && "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                showWrong && "border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300",
                reveal && !isAnswer && !isSelected && "opacity-50",
              )}
              style={!reveal && isSelected ? { borderColor: `oklch(0.55 0.12 ${hue})` } : undefined}
            >
              <span>{opt}</span>
              {showCorrect && <Check className="h-4 w-4" />}
              {showWrong && <X className="h-4 w-4" />}
            </button>
          );
        })}
      </div>
      <button
        disabled={!reveal}
        onClick={next}
        className="mt-6 w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-40 transition-opacity hover:opacity-90"
      >
        {idx + 1 === questions.length ? "Finish quiz" : "Next question"}
      </button>
      {answered.length > 0 && (
        <div className="mt-4 flex gap-1 justify-center">
          {answered.map((ok, i) => (
            <span key={i} className={cn("h-1.5 w-6 rounded-full", ok ? "bg-emerald-500/70" : "bg-red-500/70")} />
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
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

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

  return (
    <aside className="surface-card flex flex-col h-[600px] lg:sticky lg:top-6">
      <header className="px-5 py-4 border-b border-border flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{ background: `oklch(0.92 0.05 ${hue})` }}>
          <Sparkles className="h-3.5 w-3.5" style={{ color: `oklch(0.4 0.1 ${hue})` }} />
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
          disabled={!input.trim() || typing}
          className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 transition-opacity hover:opacity-90"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </aside>
  );
}
