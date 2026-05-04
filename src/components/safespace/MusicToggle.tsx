import { useEffect, useRef, useState } from "react";

export function MusicToggle() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ gain: GainNode; oscs: OscillatorNode[] } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  const stopAll = () => {
    // stop audio file
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
      } catch {}
      audioRef.current = null;
    }

    // stop fallback sound
    nodesRef.current?.gain.gain.exponentialRampToValueAtTime(
      0.0001,
      (ctxRef.current?.currentTime ?? 0) + 1
    );

    setTimeout(() => {
      nodesRef.current?.oscs.forEach((o) => o.stop());
      ctxRef.current?.close();
      ctxRef.current = null;
      nodesRef.current = null;
    }, 1000);

    setOn(false);
  };

  const toggle = () => {
    if (on) {
      stopAll();
      return;
    }

    // 🎧 AUDIO DARI FOLDER
    const audio = new Audio("/audio/music.mp3");
    audio.loop = true;
    // increase default site music volume
    audio.volume = 0.6;

    audio.play()
      .then(() => {
        audioRef.current = audio;
        setOn(true);
      })
      .catch(() => {
        // fallback kalau gagal
        try {
          const Ctx =
            window.AudioContext ||
            (window as any).webkitAudioContext;

          const ctx = new Ctx();
          const gain = ctx.createGain();
          gain.gain.value = 0.0001;
          gain.connect(ctx.destination);

          const freqs = [196, 261.6, 329.6, 392];
          const oscs = freqs.map((f) => {
            const o = ctx.createOscillator();
            o.type = "sine";
            o.frequency.value = f;

            const g = ctx.createGain();
            g.gain.value = 0.25;

            o.connect(g).connect(gain);
            o.start();
            return o;
          });

          // bring fallback tone volume up to be audible
          gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 2);

          ctxRef.current = ctx;
          nodesRef.current = { gain, oscs };

          setOn(true);
        } catch {
          setOn(true);
        }
      });
  };

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card/80 text-foreground shadow-lg backdrop-blur transition hover:bg-accent"
    >
      {on ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
          <line x1="3" y1="3" x2="21" y2="21" />
        </svg>
      )}
    </button>
  );
}