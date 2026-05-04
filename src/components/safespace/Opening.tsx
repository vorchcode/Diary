import { useEffect, useRef, useState } from "react";
import { Particles } from "./Particles";

export function Opening({ onEnter }: { onEnter: () => void }) {
  const [opened, setOpened] = useState(false);
  const [persistentFlowers, setPersistentFlowers] = useState(
    [] as {
      id: number;
      emoji: string;
      x?: number;
      y?: number;
      size: number;
      r: number;
      fixed?: boolean;
      right?: number;
      top?: number;
    }[]
  );
  const envelopeRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<{
    id: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const handleOpen = () => {
    if (opened) return;
    setOpened(true);
    setTimeout(() => onEnter(), 1600);
  };

  useEffect(() => {
    if (!opened) return;
    // add several prominent flowers fixed around the letter, spaced apart
    const now = Date.now();
    // place flowers near the top-right corner, spaced apart vertically
    const flowers = [
      { id: now, emoji: "🌸", fixed: true, right: -20, top: -180, size: 44, r: 6  },
      { id: now + 1, emoji: "🌸", fixed: true, right: 430, top: 110, size: 50, r: 6  },
      { id: now + 2, emoji: "🌸", fixed: true, right: -40, top: 110, size: 50, r: 6  },
      { id: now + 3, emoji: "🌸", fixed: true, right: 430, top: -180, size: 44, r: 6  },
    ];
    setPersistentFlowers(flowers);
  }, [opened]);

  useEffect(() => {
    const onPointerMove = (ev: PointerEvent) => {
      const drag = draggingRef.current;
      if (!drag) return;
      const env = envelopeRef.current;
      if (!env) return;
      const rect = env.getBoundingClientRect();
      const dx = ev.clientX - drag.startX;
      const dy = ev.clientY - drag.startY;
      let nx = drag.origX + dx; // x is offset from right edge
      let ny = drag.origY + dy;
      // clamp: allow movement to the right side area and vertically within envelope height
      const maxRight = rect.width * 1.2;
      const halfH = rect.height / 2 - 12;
      nx = Math.max(12, Math.min(maxRight, nx));
      ny = Math.max(-halfH, Math.min(halfH, ny));

      setPersistentFlowers((prev) => prev.map((f) => (f.id === drag.id ? { ...f, x: nx, y: ny } : f)));
    };

    const onPointerUp = () => {
      draggingRef.current = null;
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <Particles />
      <div
        className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-warm/40 blur-3xl animate-glow"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Flower burst */}
        {opened && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            {Array.from({ length: 48 }).map((_, i) => {
              const angle = (i / 48) * Math.PI * 2;
              const dist = 100 + Math.random() * 260; // wider spread
              const x = Math.cos(angle) * dist;
              // nudge the burst downward so central flowers sit lower and avoid the letter
              const y = Math.sin(angle) * dist + 30;
              const flowers = ["🌸", "🌼", "🌷", "💐", "🌺", "✿", "🌻", "🌹"];
              const f = flowers[Math.floor(Math.random() * flowers.length)];
              const delay = Math.random() * 0.6;
              const dur = 1.6 + Math.random() * 2.0;
              const size = 14 + Math.random() * 28;
              return (
                <span
                  key={i}
                  className="flower-burst"
                  style={{
                    ["--x" as any]: `${x}px`,
                    ["--y" as any]: `${y}px`,
                    ["--r" as any]: `${Math.random() * 720 - 360}deg`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${dur}s`,
                    fontSize: `${size}px`,
                  }}
                >
                  {f}
                </span>
              );
            })}
          </div>
        )}

        {/* Envelope */}
        <div
          ref={envelopeRef}
          className={`envelope ${opened ? "is-open" : ""}`}
          role="button"
          tabIndex={0}
          aria-label="Open the letter"
          onClick={handleOpen}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpen()}
        >
          <div className="envelope-back" />

          <div className="letter">
            <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">a safe space</p>
            <h1 className="text-balance font-display text-lg font-light leading-snug text-foreground sm:text-xl md:text-2xl">
              I know you're going through a really difficult time right now.
            </h1>
            <p className="mt-3 text-balance text-sm text-muted-foreground sm:text-base">
              You don't have to go through this alone.
            </p>
            <p className="mt-4 text-[10px] italic text-muted-foreground/70">— take a breath, when you're ready —</p>
          </div>

          <div className="envelope-front" />

          {/* center envelope flower removed to avoid overlapping the letter */}

          <div className="envelope-flap">
            <div className="wax-seal" aria-hidden>
              ♥
            </div>
          </div>

          {/* persistent decorations after opening */}
          {opened && (
            <>
              {/* persistent flowers (render all, spaced apart) */}
              {persistentFlowers.map((pf) => {
                const onDown = (ev: any) => {
                  if (pf.fixed) return;
                  ev.stopPropagation();
                  const startX = ev.clientX;
                  const startY = ev.clientY;
                  draggingRef.current = { id: pf.id, startX, startY, origX: pf.x ?? 0, origY: pf.y ?? 0 };
                  document.body.style.userSelect = "none";
                };

                const style = pf.fixed
                  ? { right: `${pf.right ?? 12}px`, top: `${pf.top ?? 12}px`, fontSize: `${pf.size}px`, transform: `rotate(${pf.r}deg)`, pointerEvents: 'none' as const }
                  : { left: `calc(50% + ${pf.x}px)`, top: `calc(50% + ${pf.y}px)`, fontSize: `${pf.size}px`, transform: `translate(-50%,-50%) rotate(${pf.r}deg)` };

                const cls = pf.fixed ? "envelope-persistent-flower" : "envelope-single-flower";

                return (
                  <span key={pf.id} className={cls} onPointerDown={onDown} style={style} aria-hidden>
                    {pf.emoji}
                  </span>
                );
              })}

              {/* letter stars removed per design request */}

              {/* sun graphic at top-left */}
              <div className="envelope-sun" aria-hidden>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="4" fill="#FFD166" />
                  <g stroke="#FFD166" strokeWidth="1.2" strokeLinecap="round">
                    <line x1="12" y1="1" x2="12" y2="4" />
                    <line x1="12" y1="20" x2="12" y2="23" />
                    <line x1="1" y1="12" x2="4" y2="12" />
                    <line x1="20" y1="12" x2="23" y2="12" />
                    <line x1="4.2" y1="4.2" x2="6.5" y2="6.5" />
                    <line x1="17.5" y1="17.5" x2="19.8" y2="19.8" />
                    <line x1="4.2" y1="19.8" x2="6.5" y2="17.5" />
                    <line x1="17.5" y1="6.5" x2="19.8" y2="4.2" />
                  </g>
                </svg>
              </div>
            </>
          )}
        </div>

        {!opened && (
          <p className="mt-10 animate-fade-up text-xs uppercase tracking-[0.4em] text-muted-foreground">
            tap the envelope to open
          </p>
        )}
      </div>
    </section>
  );
}
