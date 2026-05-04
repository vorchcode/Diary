import { Reveal } from "./Reveal";

const messages = [
  "You don't have to be strong all the time.",
  "It's okay to feel everything.",
  "Grief comes in waves, and that's okay.",
  "Healing isn't linear — and you're allowed to rest.",
  "Their love stays with you, always.",
];

export function ComfortMessages() {
  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-3xl space-y-32 text-center">
        {messages.map((m, i) => (
          <Reveal key={i} delay={i * 80}>
            <p className="text-balance font-display text-3xl font-light italic leading-relaxed text-foreground sm:text-4xl md:text-5xl">
              "{m}"
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
