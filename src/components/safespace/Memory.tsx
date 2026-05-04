import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";

type Mem = { id: string; text: string; at: number };

export function Memory() {
  const [memories, setMemories] = useState<Mem[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("safespace_memories");
    if (raw) setMemories(JSON.parse(raw));
  }, []);

  const save = () => {
    if (!text.trim()) return;
    const next = [{ id: crypto.randomUUID(), text: text.trim(), at: Date.now() }, ...memories];
    setMemories(next);
    localStorage.setItem("safespace_memories", JSON.stringify(next));
    setText("");
  };

  const remove = (id: string) => {
    const next = memories.filter((m) => m.id !== id);
    setMemories(next);
    localStorage.setItem("safespace_memories", JSON.stringify(next));
  };

  const tilts = ["-rotate-1", "rotate-1", "-rotate-2", "rotate-2", "rotate-0"];

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Memory Corner</p>
            <h2 className="mt-3 text-3xl font-light sm:text-4xl">Hold their light, gently</h2>
            <p className="mt-3 text-muted-foreground">A moment, a smile, a phrase you remember.</p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mx-auto mb-12 max-w-2xl rounded-3xl border border-border bg-card/60 p-6 backdrop-blur">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="A memory you want to keep…"
              className="w-full resize-none rounded-2xl border border-border bg-background/60 p-4 outline-none focus:border-ring"
            />
            <button
              onClick={save}
              className="mt-3 w-full rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition hover:opacity-90"
            >
              Save memory
            </button>
          </div>
        </Reveal>

        {memories.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {memories.map((m, i) => (
              <Reveal key={m.id} delay={i * 60}>
                <div
                  className={`group relative rounded-2xl border border-border bg-gradient-to-br from-card to-warm/30 p-6 shadow-sm transition-transform hover:-translate-y-1 ${tilts[i % tilts.length]}`}
                >
                  <p className="whitespace-pre-wrap font-display text-lg italic leading-relaxed text-foreground">
                    {m.text}
                  </p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {new Date(m.at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <button
                    onClick={() => remove(m.id)}
                    className="absolute right-3 top-3 text-xs text-muted-foreground/60 opacity-0 transition hover:text-destructive group-hover:opacity-100"
                    aria-label="Remove memory"
                  >
                    ✕
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
