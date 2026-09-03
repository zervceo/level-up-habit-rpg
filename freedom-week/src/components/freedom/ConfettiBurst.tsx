import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["var(--color-gold)", "var(--color-gold-bright)", "var(--color-crimson)", "var(--color-crimson-glow)"];

export function ConfettiBurst({ count = 60 }: { count?: number }) {
  const pieces = useMemo(() => {
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (rand() - 0.5) * 100,
      rot: rand() * 360,
      delay: rand() * 0.35,
      duration: 1.4 + rand() * 1.1,
      color: COLORS[i % COLORS.length],
      w: 5 + rand() * 5,
      h: 9 + rand() * 7,
      drift: (rand() - 0.5) * 60,
    }));
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 0, x: `${p.x}vw`, y: "40vh", rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: ["40vh", "-10vh", "110vh"],
            x: `${p.x + p.drift * 0.1}vw`,
            rotate: p.rot * 3,
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: p.w,
            height: p.h,
            background: p.color,
            display: "block",
          }}
        />
      ))}
    </div>
  );
}
