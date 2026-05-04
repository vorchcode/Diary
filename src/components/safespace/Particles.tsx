export function Particles() {
  const particles = Array.from({ length: 24 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((_, i) => {
        const size = 4 + Math.random() * 10;
        const left = Math.random() * 100;
        const delay = Math.random() * 8;
        const duration = 8 + Math.random() * 10;
        return (
          <span
            key={i}
            className="absolute rounded-full bg-glow blur-[2px]"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              bottom: `-20px`,
              animation: `drift ${duration}s linear ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
