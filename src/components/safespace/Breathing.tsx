import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";
import { playBreath } from "@/lib/sfx";

type Phase = "in" | "hold" | "out";
const cycle: { phase: Phase; label: string; seconds: number }[] = [
  { phase: "in", label: "Breathe in", seconds: 4 },
  { phase: "hold", label: "Hold", seconds: 4 },
  { phase: "out", label: "Breathe out", seconds: 6 },
];

export function Breathing() {
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(cycle[0].seconds);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          setIdx((i) => (i + 1) % cycle.length);
          return cycle[(idx + 1) % cycle.length].seconds;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [active, idx]);

  // play SFX at the start of each phase
  useEffect(() => {
    if (!active) return;
    // noop here — SFX will be played once when starting the exercise
  }, [idx, active]);

  const current = cycle[idx];
  const scale = current.phase === "in" ? 1.4 : current.phase === "out" ? 0.7 : 1.4;
  const duration = current.phase === "hold" ? 0.3 : current.seconds;

  return (
    <Reveal>
      <div className="rounded-3xl border border-border bg-card/60 p-8 text-center backdrop-blur">
        <h3 className="mb-2 text-2xl font-light">Breathing Space</h3>
        <p className="mb-8 text-sm text-muted-foreground">In 4 · Hold 4 · Out 6</p>
        <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-warm/70 to-accent/70 blur-md"
            style={{
              transform: `scale(${active ? scale : 1})`,
              transition: `transform ${duration}s ease-in-out`,
            }}
          />
          <div className="relative z-10">
            <p className="font-display text-2xl italic text-foreground">{active ? current.label : "Ready?"}</p>
            {active && <p className="mt-2 text-4xl font-light text-foreground">{count}</p>}
          </div>
        </div>
        <button
          onClick={() => {
            setActive((a) => {
              const willStart = !a;
              if (willStart) {
                try {
                  playBreath('in', cycle[0].seconds);
                } catch (e) {}
              }
              return willStart;
            });
            setIdx(0);
            setCount(cycle[0].seconds);
          }}
          className="mt-8 rounded-full border border-border bg-card px-8 py-3 text-sm transition hover:bg-accent"
        >
          {active ? "Pause" : "Begin"}
        </button>
      </div>
    </Reveal>
  );
}
