import { useState } from "react";
import { Reveal } from "./Reveal";
import { playBubble } from "@/lib/sfx";

const initial = ["sad", "miss", "grief", "tired", "lost", "heavy", "alone", "ache"];

export function BreakBubble() {
  const [popped, setPopped] = useState<Record<number, boolean>>({});

  const reset = () => setPopped({});

  return (
    <Reveal>
      <div className="rounded-3xl border border-border bg-card/60 p-8 backdrop-blur">
        <h3 className="mb-2 text-2xl font-light">Break the Bubble</h3>
        <p className="mb-6 text-sm text-muted-foreground">Tap to gently let each one go.</p>
        <div className="flex flex-wrap items-center justify-center gap-4 py-4">
          {initial.map((word, i) => (
            <button
              key={i}
              onClick={() => {
                playBubble();
                setPopped((p) => ({ ...p, [i]: true }));
              }}
              className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-warm/60 to-accent/60 text-sm text-foreground shadow-inner transition-transform hover:scale-105 ${
                popped[i] ? "animate-pop pointer-events-none" : ""
              }`}
            >
              {word}
            </button>
          ))}
        </div>
        {Object.keys(popped).length === initial.length && (
          <div className="mt-4 text-center">
            <p className="italic text-muted-foreground">All released. Breathe deep.</p>
            <button onClick={reset} className="mt-3 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              start over
            </button>
          </div>
        )}
      </div>
    </Reveal>
  );
}
