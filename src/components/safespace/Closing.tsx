import { Reveal } from "./Reveal";

export function Closing() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <div
        className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow/60 blur-3xl animate-glow"
        aria-hidden
      />
      <Reveal>
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <p className="text-balance font-display text-3xl font-light italic leading-snug text-foreground sm:text-4xl md:text-5xl">
            "You're still here, and that matters.
            <br />
            Take it one moment at a time."
          </p>
          <p className="mt-10 text-xs uppercase tracking-[0.4em] text-muted-foreground">with love 🤍</p>
        </div>
      </Reveal>
    </section>
  );
}
