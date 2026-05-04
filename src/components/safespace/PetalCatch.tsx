import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";
import { playPetal } from "@/lib/sfx";

const petals = ["🌸", "🌷", "🌼", "🌺", "🍀", "✿"];
const comforts = [
  "you are loved",
  "breathe",
  "it's okay",
  "you matter",
  "stay soft",
  "rest",
  "gentle",
  "hope",
];

type Petal = {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
};

export function PetalCatch() {
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [items, setItems] = useState<Petal[]>([]);
  const [caught, setCaught] = useState<{ id: number; word: string; x: number; y: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const spawn = setInterval(() => {
      idRef.current += 1;
      const p: Petal = {
        id: idRef.current,
        emoji: petals[Math.floor(Math.random() * petals.length)],
        left: Math.random() * 90,
        duration: 5 + Math.random() * 3,
        delay: 0,
      };
      setItems((prev) => [...prev.slice(-12), p]);
    }, 900);
    return () => clearInterval(spawn);
  }, [playing]);

  // listen for external events (bubble clicks) to spawn petals
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ count?: number }>;
      const count = (ev?.detail?.count as number) || 3;
      // start game and spawn count petals immediately
      setPlaying(true);
      for (let i = 0; i < count; i++) {
        idRef.current += 1;
        const p: Petal = {
          id: idRef.current,
          emoji: petals[Math.floor(Math.random() * petals.length)],
          left: 10 + Math.random() * 80,
          duration: 3 + Math.random() * 3,
          delay: Math.random() * 0.6,
        };
        setItems((prev) => [...prev.slice(-12), p]);
      }
    };
    window.addEventListener("petalSpawn", handler as EventListener);
    return () => window.removeEventListener("petalSpawn", handler as EventListener);
  }, []);

  const catchPetal = (p: Petal, e: React.MouseEvent) => {
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const word = comforts[Math.floor(Math.random() * comforts.length)];
    const wid = Date.now() + Math.random();
    setCaught((c) => [...c, { id: wid, word, x, y }]);
    setTimeout(() => setCaught((c) => c.filter((w) => w.id !== wid)), 1600);
    setItems((prev) => prev.filter((i) => i.id !== p.id));
    setScore((s) => s + 1);
    try { playPetal(); } catch (e) { /* ignore */ }
  };

  const reset = () => {
    setPlaying(false);
    setScore(0);
    setItems([]);
    setCaught([]);
  };

  return (
    <Reveal>
      <div className="rounded-3xl border border-border bg-card/60 p-8 backdrop-blur">
        <h3 className="mb-2 text-2xl font-light">Catch the Petals</h3>
        <p className="mb-5 text-sm text-muted-foreground">
          A tiny game. Tap drifting petals to gather small comforts.
        </p>

        <div className="relative mx-auto h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-warm/30 to-accent/20">
          {!playing ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-display text-xl italic text-foreground">
                {score > 0 ? `You gathered ${score} 🌸` : "Ready when you are."}
              </p>
              <button
                onClick={() => { setScore(0); setPlaying(true); }}
                className="rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground transition hover:opacity-90"
              >
                {score > 0 ? "Play again" : "Start"}
              </button>
            </div>
          ) : (
            <>
              {items.map((p) => (
                <button
                  key={p.id}
                  onClick={(e) => catchPetal(p, e)}
                  className="petal-fall absolute text-3xl select-none"
                  style={{
                    left: `${p.left}%`,
                    animationDuration: `${p.duration}s`,
                  }}
                  onAnimationEnd={() =>
                    setItems((prev) => prev.filter((i) => i.id !== p.id))
                  }
                >
                  {p.emoji}
                </button>
              ))}
              {caught.map((c) => (
                <span
                  key={c.id}
                  className="pointer-events-none absolute -translate-x-1/2 animate-fade-up font-display text-sm italic text-foreground"
                  style={{ left: c.x, top: c.y }}
                >
                  {c.word}
                </span>
              ))}
              <div className="absolute right-3 top-3 rounded-full bg-card/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                {score}
              </div>
            </>
          )}
        </div>

        {playing && (
          <button
            onClick={reset}
            className="mx-auto mt-4 block text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            stop
          </button>
        )}
      </div>
    </Reveal>
  );
}
