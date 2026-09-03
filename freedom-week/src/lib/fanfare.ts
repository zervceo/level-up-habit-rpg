/**
 * An original, synthesized four-note ascending brass-ish fanfare, built
 * entirely from Web Audio oscillators — no audio files, no sampled or
 * existing music. Resolves upward to a bright major triad on the last note.
 */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

function brassNote(
  ac: AudioContext,
  freq: number,
  start: number,
  duration: number,
  gain: number,
) {
  const osc1 = ac.createOscillator();
  const osc2 = ac.createOscillator();
  const g = ac.createGain();

  osc1.type = "sawtooth";
  osc2.type = "square";
  osc1.frequency.value = freq;
  osc2.frequency.value = freq * 1.005; // slight detune for body

  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.03);
  g.gain.exponentialRampToValueAtTime(gain * 0.6, start + duration * 0.5);
  g.gain.exponentialRampToValueAtTime(0.001, start + duration);

  osc1.connect(g);
  osc2.connect(g);
  g.connect(ac.destination);

  osc1.start(start);
  osc2.start(start);
  osc1.stop(start + duration + 0.05);
  osc2.stop(start + duration + 0.05);
}

export function playFanfare(muted: boolean) {
  if (muted) return;
  try {
    const ac = getCtx();
    if (ac.state === "suspended") void ac.resume();
    const t0 = ac.currentTime + 0.02;

    // Four ascending notes resolving to a bright major landing.
    brassNote(ac, 392.0, t0, 0.32, 0.16); // G4
    brassNote(ac, 493.88, t0 + 0.3, 0.32, 0.17); // B4
    brassNote(ac, 587.33, t0 + 0.6, 0.32, 0.18); // D5
    brassNote(ac, 783.99, t0 + 0.9, 0.9, 0.22); // G5 — resolution
    // A quiet major third under the final note for a fuller resolve.
    brassNote(ac, 987.77, t0 + 0.92, 0.85, 0.1); // B5
  } catch {
    // Audio unavailable (autoplay policy, unsupported browser) — the visual
    // sequence still carries the moment.
  }
}
