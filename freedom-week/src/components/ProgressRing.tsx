import { motion } from "framer-motion";

export function ProgressRing({
  progress,
  size = 220,
  stroke = 14,
  warm = false,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  /** Warms the ring toward crimson as the week runs out. */
  warm?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const color = warm ? "var(--color-crimson-glow)" : "var(--color-gold)";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="color-mix(in srgb, var(--color-parchment) 12%, transparent)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={clamped >= 1 ? "var(--color-gold-bright)" : color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - clamped) }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        style={
          clamped >= 1
            ? { filter: "drop-shadow(0 0 10px var(--color-gold-bright))" }
            : undefined
        }
      />
    </svg>
  );
}
