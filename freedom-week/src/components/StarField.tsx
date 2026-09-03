import { useMemo } from "react";

/** A barely-visible, deterministic star field for the navy background. */
export function StarField({
  count = 60,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const stars = useMemo(() => {
    let seed = 42;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      r: 0.4 + rand() * 1.1,
      o: 0.15 + rand() * 0.35,
      delay: rand() * 6,
    }));
  }, [count]);

  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {stars.map((s) => (
        <circle
          key={s.id}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="var(--color-gold-bright)"
          opacity={s.o}
        >
          <animate
            attributeName="opacity"
            values={`${s.o};${s.o * 0.3};${s.o}`}
            dur="5s"
            begin={`${s.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}
