import { motion, useMotionValue, useTransform, animate as fmAnimate } from "framer-motion";
import { useEffect, useRef } from "react";

const STEP_COUNT = 8;
const STEPS = Array.from({ length: STEP_COUNT }, (_, i) => ({
  x: 60 + i * 42,
  y: 250 - i * 24,
}));
const ASCENT_DURATION = 3.4;

function Limb({
  x1,
  y1,
  x2,
  y2,
  origin,
  swing,
  victory,
  victoryAngle,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  origin: string;
  swing: number[];
  victory: boolean;
  victoryAngle: number;
}) {
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="var(--color-navy-deep)"
      strokeWidth={4.5}
      strokeLinecap="round"
      style={{ transformOrigin: origin }}
      animate={
        victory
          ? { rotate: victoryAngle }
          : { rotate: swing }
      }
      transition={
        victory
          ? { type: "spring", stiffness: 120, damping: 12 }
          : { duration: 0.42, repeat: Infinity, ease: "easeInOut" }
      }
    />
  );
}

export function AscentRunner({
  running,
  victory,
  onClimbComplete,
  reduced,
}: {
  running: boolean;
  victory: boolean;
  onClimbComplete: () => void;
  reduced?: boolean;
}) {
  const x = useMotionValue(STEPS[0].x);
  const y = useMotionValue(STEPS[0].y);
  const facadeBaseY = STEPS[STEP_COUNT - 1].y - 4;
  const started = useRef(false);

  useEffect(() => {
    if (!running || started.current || reduced) return;
    started.current = true;
    const controlsX = fmAnimate(x, STEPS.map((s) => s.x), {
      duration: ASCENT_DURATION,
      ease: "easeInOut",
    });
    const controlsY = fmAnimate(y, STEPS.map((s) => s.y), {
      duration: ASCENT_DURATION,
      ease: "easeInOut",
      onComplete: onClimbComplete,
    });
    return () => {
      controlsX.stop();
      controlsY.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, reduced]);

  useEffect(() => {
    if (reduced) {
      x.set(STEPS[STEP_COUNT - 1].x);
      y.set(STEPS[STEP_COUNT - 1].y);
    }
  }, [reduced, x, y]);

  const pan = useTransform(y, [STEPS[0].y, STEPS[STEP_COUNT - 1].y], [0, -70]);
  const skyProgress = useTransform(y, [STEPS[0].y, STEPS[STEP_COUNT - 1].y], [0, 1]);
  const dawnOpacity = useTransform(skyProgress, [0, 0.55, 1], [1, 0.3, 0]);
  const duskOpacity = useTransform(skyProgress, [0, 0.5, 0.85, 1], [0, 0.8, 0.9, 0]);
  const goldOpacity = useTransform(skyProgress, [0.6, 1], [0, 1]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Sky layers crossfade pre-dawn navy -> orange -> gold */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: dawnOpacity, background: "linear-gradient(180deg, var(--color-navy-deep), var(--color-navy))" }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ opacity: duskOpacity, background: "linear-gradient(180deg, #6b2a2f 0%, #b3122e 45%, #c9682a 100%)" }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ opacity: goldOpacity, background: "linear-gradient(180deg, #e6c34a 0%, #c9a227 55%, #8a6a1c 100%)" }}
      />

      <motion.svg
        viewBox="0 0 420 300"
        className="absolute inset-0 h-full w-full"
        style={{ y: pan }}
        preserveAspectRatio="xMidYMax meet"
      >
        {/* City skyline, faint, behind the facade */}
        <g opacity={0.35} fill="var(--color-navy-deep)">
          <rect x="10" y="140" width="20" height="90" />
          <rect x="34" y="110" width="16" height="120" />
          <rect x="330" y="120" width="18" height="110" />
          <rect x="352" y="150" width="22" height="80" />
          <rect x="378" y="100" width="16" height="130" />
        </g>

        {/* Neoclassical facade + columns atop the steps */}
        <g fill="var(--color-parchment-dim)">
          <polygon points={`150,${facadeBaseY - 60} 270,${facadeBaseY - 60} 300,${facadeBaseY - 20} 120,${facadeBaseY - 20}`} opacity={0.9} />
          {Array.from({ length: 7 }).map((_, i) => (
            <rect
              key={i}
              x={130 + i * 24}
              y={facadeBaseY - 20}
              width="10"
              height="42"
              opacity={0.85}
            />
          ))}
          <rect x="110" y={facadeBaseY + 18} width="200" height="10" opacity={0.9} />
        </g>

        {/* Staircase */}
        <g>
          {STEPS.map((s, i) => (
            <rect
              key={i}
              x={s.x - 30}
              y={s.y}
              width={STEP_COUNT * 42 - i * 42 + 30}
              height={250 - s.y + 26}
              fill="var(--color-parchment-dim)"
              opacity={0.15 + i * 0.05}
            />
          ))}
        </g>

        {/* Runner */}
        <motion.g style={{ x, y }}>
          <motion.g
            animate={{ scaleX: victory ? -1 : 1 }}
            transition={{ duration: 0.5 }}
            style={{ transformOrigin: "0px 0px" }}
          >
            <circle cx="0" cy="-40" r="6" fill="var(--color-navy-deep)" />
            <line x1="0" y1="-34" x2="0" y2="-14" stroke="var(--color-navy-deep)" strokeWidth={4.5} strokeLinecap="round" />
            <Limb x1={0} y1={-30} x2={-9} y2={-16} origin="0px -30px" swing={[-35, 40, -35]} victory={victory} victoryAngle={168} />
            <Limb x1={0} y1={-30} x2={9} y2={-16} origin="0px -30px" swing={[40, -35, 40]} victory={victory} victoryAngle={-168} />
            <Limb x1={0} y1={-14} x2={-8} y2={0} origin="0px -14px" swing={[30, -30, 30]} victory={victory} victoryAngle={0} />
            <Limb x1={0} y1={-14} x2={8} y2={0} origin="0px -14px" swing={[-30, 30, -30]} victory={victory} victoryAngle={0} />
          </motion.g>
        </motion.g>
      </motion.svg>
    </div>
  );
}
