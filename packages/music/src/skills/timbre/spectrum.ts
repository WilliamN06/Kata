/**
 * Steady-state spectral synthesis for isolated timbre variables.
 *
 * Build order (source-filter):
 *   1. harmonic source (optionally stretched: inharmonicity)
 *   2. smooth spectral curve in Hz: centre (brightness), width, skew
 *   3. per-partial changes: even-partial gain, irregularity jitter, one resonance peak
 *   4. noise shaped by the same curve, mixed at a tone-to-noise ratio
 *   5. roughness: amplitude fluctuation at a fixed rate
 *   6. re-fit the curve's centre and width so measured centroid/spread hit their targets
 *   7. normalise A-weighted power, so loudness is not a cue
 *
 * No attack, vibrato or spectral change over time: the spectrum is static.
 */

export interface TimbreSpec {
  f0: number;
  /** Target measured centroid, Hz. */
  centroid: number;
  /** Target measured spread, octaves. */
  spreadOct: number;
  /** Curve asymmetry, -1..1 (+ = wider above the centre). */
  skew: number;
  /** Gain on even partials, dB (≤ 0 → hollow). */
  evenDb: number;
  /** SD of per-partial random deviation from the curve, dB. */
  irregDb: number;
  /** Stretch coefficient B: f_n = n·f0·√(1 + B·n²). */
  inharm: number;
  resGainDb: number;
  resFreq: number;
  resBwOct: number;
  /** Noise power relative to tonal power, dB. */
  noiseDb: number;
  /** Amplitude fluctuation depth 0..1. */
  roughDepth: number;
  roughRateHz: number;
  seed: number;
  durationMs: number;
  fmax: number;
}

export const BASELINE: Omit<TimbreSpec, 'f0' | 'seed' | 'resFreq'> = {
  centroid: 1000,
  spreadOct: 1.0,
  skew: 0,
  evenDb: 0,
  irregDb: 0,
  inharm: 0,
  resGainDb: 0,
  resBwOct: 1 / 6,
  noiseDb: -40,
  roughDepth: 0,
  roughRateHz: 70,
  durationMs: 500,
  fmax: 8000,
};

// ── helpers ─────────────────────────────────────────────────────

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussians(seed: number, n: number): number[] {
  const r = rng(seed ^ 0xa5a5a5);
  return Array.from({ length: n }, () => {
    const u = r() || 1e-12;
    const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
    return Math.max(-2.5, Math.min(2.5, g));
  });
}

const log2 = Math.log2;

/** Smooth curve in dB at frequency f. */
function curveDb(f: number, centre: number, sd: number, skew: number): number {
  const z = log2(f / centre);
  const side = z > 0 ? sd * (1 + skew) : sd * (1 - skew);
  return -0.5 * (z / Math.max(1e-3, side)) ** 2 * 8.685889638;
}

/** A-weighting gain (linear), 1 at 1 kHz. */
export function aWeight(f: number): number {
  const f2 = f * f;
  const ra = (12194 ** 2 * f2 * f2) / ((f2 + 20.6 ** 2) * Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2));
  return ra / 0.7943282347;
}

interface Component {
  f: number;
  /** Power (mean square). */
  p: number;
}

interface Built {
  partials: Array<{ f: number; amp: number }>;
  /** Noise power density shape over a frequency grid (unnormalised). */
  noiseGrid: Array<{ f: number; d: number }>;
  noiseScale: number;
  components: Component[];
}

const NOISE_DF = 10;

function build(spec: TimbreSpec, centre: number, sd: number): Built {
  const g = gaussians(spec.seed, 128);
  const partials: Array<{ f: number; amp: number }> = [];
  for (let n = 1; n < 128; n++) {
    const f = n * spec.f0 * Math.sqrt(1 + spec.inharm * n * n);
    if (f > spec.fmax) break;
    // Harmonics get denser per octave as f rises (∝ f/f0); compensate so the
    // energy per octave, not per partial, follows the curve.
    let db = curveDb(f, centre, sd, spec.skew) - 10 * Math.log10(f / spec.f0);
    if (n % 2 === 0) db += spec.evenDb;
    db += spec.irregDb * g[n]!;
    const zr = log2(f / spec.resFreq) / spec.resBwOct;
    db += spec.resGainDb * Math.exp(-0.5 * zr * zr);
    partials.push({ f, amp: 10 ** (db / 20) });
  }

  const components: Component[] = [];
  const m = spec.roughDepth;
  let tonal = 0;
  for (const pt of partials) {
    const p = (pt.amp * pt.amp) / 2;
    components.push({ f: pt.f, p });
    tonal += p;
    if (m > 0) {
      const sp = p * (m * m) / 4;
      if (pt.f - spec.roughRateHz > 20) components.push({ f: pt.f - spec.roughRateHz, p: sp });
      components.push({ f: pt.f + spec.roughRateHz, p: sp });
      tonal += 2 * sp;
    }
  }

  // Noise follows the same smooth curve (no per-partial structure).
  const noiseGrid: Array<{ f: number; d: number }> = [];
  let noiseShape = 0;
  for (let f = 40; f <= spec.fmax; f += NOISE_DF) {
    const d = 10 ** (curveDb(f, centre, sd, spec.skew) / 10) / f;
    noiseGrid.push({ f, d });
    noiseShape += d;
  }
  const noiseTotal = tonal * 10 ** (spec.noiseDb / 10);
  const noiseScale = noiseShape > 0 ? noiseTotal / noiseShape : 0;
  for (const n of noiseGrid) components.push({ f: n.f, p: n.d * noiseScale });

  return { partials, noiseGrid, noiseScale, components };
}

export interface Descriptors {
  /** Power-weighted mean in log frequency, Hz. */
  centroid: number;
  /** Power-weighted SD in log frequency, octaves. */
  spread: number;
  skewness: number;
  /** Tonal-to-noise power, dB. */
  hnr: number;
  /** A-weighted power, dB (before normalisation). */
  loudnessDb: number;
}

function describeComponents(cs: Component[], tonal: number, noise: number): Descriptors {
  let w = 0;
  let m1 = 0;
  let aw = 0;
  for (const c of cs) {
    w += c.p;
    m1 += c.p * log2(c.f);
    aw += c.p * aWeight(c.f) ** 2;
  }
  const mean = m1 / w;
  let m2 = 0;
  let m3 = 0;
  for (const c of cs) {
    const d = log2(c.f) - mean;
    m2 += c.p * d * d;
    m3 += c.p * d * d * d;
  }
  const varr = m2 / w;
  return {
    centroid: 2 ** mean,
    spread: Math.sqrt(varr),
    skewness: m3 / w / Math.max(1e-12, varr ** 1.5),
    hnr: 10 * Math.log10(tonal / Math.max(1e-30, noise)),
    loudnessDb: 10 * Math.log10(aw),
  };
}

/** Curve centre/width that make the measured centroid and spread hit their targets. */
export function fit(spec: TimbreSpec): { centre: number; sd: number; built: Built; desc: Descriptors } {
  let centre = spec.centroid;
  let sd = spec.spreadOct;
  let built = build(spec, centre, sd);
  let desc = describeBuilt(built);
  for (let i = 0; i < 12; i++) {
    centre = Math.min(spec.fmax, Math.max(20, centre * (spec.centroid / desc.centroid)));
    sd = Math.min(4, Math.max(0.05, sd * (spec.spreadOct / Math.max(1e-3, desc.spread))));
    built = build(spec, centre, sd);
    desc = describeBuilt(built);
    if (Math.abs(desc.centroid / spec.centroid - 1) < 1e-4 && Math.abs(desc.spread - spec.spreadOct) < 1e-4) break;
  }
  return { centre, sd, built, desc };
}

function describeBuilt(b: Built): Descriptors {
  let noise = 0;
  for (const n of b.noiseGrid) noise += n.d * b.noiseScale;
  let total = 0;
  for (const c of b.components) total += c.p;
  return describeComponents(b.components, total - noise, noise);
}

export function describe(spec: TimbreSpec): Descriptors {
  return fit(spec).desc;
}

// ── rendering ───────────────────────────────────────────────────

function fftInPlace(re: Float64Array, im: Float64Array, inverse: boolean) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j]!, re[i]!];
      [im[i], im[j]] = [im[j]!, im[i]!];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((inverse ? 2 : -2) * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k]!;
        const ai = im[i + k]!;
        const br = re[i + k + len / 2]! * cr - im[i + k + len / 2]! * ci;
        const bi = re[i + k + len / 2]! * ci + im[i + k + len / 2]! * cr;
        re[i + k] = ar + br;
        im[i + k] = ai + bi;
        re[i + k + len / 2] = ar - br;
        im[i + k + len / 2] = ai - bi;
        const t = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = t;
      }
    }
  }
}

/** Render mono samples, A-weighted power normalised to a full-scale 1 kHz sine. */
export function synthesize(spec: TimbreSpec, sampleRate: number): Float32Array {
  const { built, desc, centre, sd } = fit(spec);
  const n = Math.max(1, Math.round((spec.durationMs / 1000) * sampleRate));
  const out = new Float64Array(n);
  const r = rng(spec.seed ^ 0x1234567);

  // Tonal part with random phases, then amplitude fluctuation.
  for (const pt of built.partials) {
    if (pt.f >= sampleRate / 2) continue;
    const w = (2 * Math.PI * pt.f) / sampleRate;
    const ph = r() * 2 * Math.PI;
    for (let i = 0; i < n; i++) out[i] = out[i]! + pt.amp * Math.sin(w * i + ph);
  }
  if (spec.roughDepth > 0) {
    const w = (2 * Math.PI * spec.roughRateHz) / sampleRate;
    for (let i = 0; i < n; i++) out[i] = out[i]! * (1 + spec.roughDepth * Math.sin(w * i));
  }

  // Shaped noise via inverse FFT, scaled to its exact target power.
  if (built.noiseScale > 0) {
    let size = 1;
    while (size < n) size <<= 1;
    const re = new Float64Array(size);
    const im = new Float64Array(size);
    for (let k = 1; k < size / 2; k++) {
      const f = (k * sampleRate) / size;
      if (f < 40 || f > spec.fmax) continue;
      const mag = Math.sqrt(10 ** (curveDb(f, centre, sd, spec.skew) / 10) / f);
      const ph = r() * 2 * Math.PI;
      re[k] = mag * Math.cos(ph);
      im[k] = mag * Math.sin(ph);
      re[size - k] = re[k]!;
      im[size - k] = -im[k]!;
    }
    fftInPlace(re, im, true);
    let pow = 0;
    for (let i = 0; i < n; i++) pow += re[i]! * re[i]!;
    pow /= n;
    let target = 0;
    for (const g of built.noiseGrid) target += g.d * built.noiseScale;
    const k = pow > 0 ? Math.sqrt(target / pow) : 0;
    for (let i = 0; i < n; i++) out[i] = out[i]! + re[i]! * k;
  }

  // Loudness: match A-weighted power of a unit sine at 1 kHz (0.5).
  const gain = Math.sqrt(0.5 / 10 ** (desc.loudnessDb / 10));
  const f32 = new Float32Array(n);
  for (let i = 0; i < n; i++) f32[i] = out[i]! * gain;
  return f32;
}
