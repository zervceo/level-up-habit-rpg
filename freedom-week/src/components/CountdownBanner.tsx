import { useEffect, useState } from "react";
import { hoursMinutesUntilRollover, isPastThursday } from "../lib/date";

export function CountdownBanner() {
  const [show, setShow] = useState(isPastThursday());
  const [remaining, setRemaining] = useState(hoursMinutesUntilRollover());

  useEffect(() => {
    const id = setInterval(() => {
      setShow(isPastThursday());
      setRemaining(hoursMinutesUntilRollover());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!show) return null;

  return (
    <div className="fw-grain flex items-center justify-between rounded-lg border border-crimson-glow/40 bg-crimson/10 px-4 py-2.5">
      <span className="text-xs uppercase tracking-wider text-parchment/70">
        The week resets Monday, 4:00 AM
      </span>
      <span className="font-display text-sm tracking-wide text-crimson-glow">
        {remaining.days}d {remaining.hours}h left
      </span>
    </div>
  );
}
