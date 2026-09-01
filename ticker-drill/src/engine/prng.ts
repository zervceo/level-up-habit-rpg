// Deterministic PRNG (mulberry32) + Gaussian sampler, so sessions are reproducible from a seed.

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  private rand: () => number;
  private spare: number | null = null;

  constructor(seed: number) {
    this.rand = mulberry32(seed);
  }

  uniform(): number {
    return this.rand();
  }

  uniformRange(min: number, max: number): number {
    return min + this.rand() * (max - min);
  }

  /** Standard normal via Box-Muller, cached second sample. */
  gaussian(): number {
    if (this.spare !== null) {
      const v = this.spare;
      this.spare = null;
      return v;
    }
    let u = 0;
    let v = 0;
    while (u === 0) u = this.rand();
    while (v === 0) v = this.rand();
    const mag = Math.sqrt(-2 * Math.log(u));
    const z0 = mag * Math.cos(2 * Math.PI * v);
    const z1 = mag * Math.sin(2 * Math.PI * v);
    this.spare = z1;
    return z0;
  }

  /**
   * Fat-tailed shock: a normal-mixture (scale-mixture of two Gaussians).
   * Most draws come from a "calm" regime; a small fraction come from a
   * wider "shock" regime, producing excess kurtosis versus pure GBM
   * without needing a true Student-t sampler.
   */
  fatTailShock(): number {
    const isShock = this.rand() < 0.04;
    const mult = isShock ? this.uniformRange(3, 7) : 1;
    return this.gaussian() * mult;
  }

  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.rand() * arr.length)];
  }

  chance(p: number): boolean {
    return this.rand() < p;
  }
}
