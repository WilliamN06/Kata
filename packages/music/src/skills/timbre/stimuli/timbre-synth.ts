/**
 * Timbre synthesis engine.
 *
 * Takes numeric parameters directly. Categories are resolved by the dispatcher
 * before this engine is called — the engine works entirely with numbers.
 */

export interface TimbreSynthParams {
  fundamental: number;
  durationMs: number;
  attackMs: number;
  decayMs: number;
  sustainLevel: number;
  releaseMs: number;

  // Numeric dimensions (source of truth)
  inharmonicity?: number;              // 0=harmonic, 1=inharmonic
  spacingIrregularity?: number;        // 0=regular, 1=irregular
  partialDensity?: number;             // 0-100
  partialCount?: number;
  upperBalance?: number;               // -1=weak upper, +1=strong upper
  envelopeShapeValue?: number;         // 0=smooth, 0.5=peaked, 1=flat
  spectralTilt?: number;               // dB/oct
  bandBalanceValue?: number;           // -1=low, +1=high
  resonanceCount?: number;
  resonanceFreqs?: number[];
  resonanceGains?: number[];
  resonanceQ?: number;
  antiresonanceDepth?: number;
  antiresonanceFreq?: number;
  formantPattern?: 'none' | 'a' | 'e' | 'i' | 'o' | 'u';
  envelopeDeviation?: number;
  peakiness?: number;
  microStructureValue?: number;        // 0=regular, 0.5=jittered, 1=comb
  fineStructureDensity?: number;
  hnr?: number;                        // 0-100
  noisinessFraction?: number;          // 0-100
  noiseColourValue?: number;           // -1=brown, 0=pink, +1=white
  bandLimited?: boolean;
  noiseBandValue?: number;             // -1=low, 0=mid, +1=high
  noiseAmount?: number;
  phaseCoherence?: number;             // -1=anti, 0=random, +1=aligned
  cancellationMode?: 'none' | 'partial' | 'full';

  // Categorical states (derived by dispatcher, used by synthesis)
  partialRelationship?: 'harmonic' | 'inharmonic' | 'mixed';
  partialSpacing?: 'regular' | 'irregular' | 'clustered' | 'sparse';
  componentMagnitudes?: 'balanced' | 'strong_upper' | 'weak_upper';
  envelopeShape?: 'smooth' | 'peaked' | 'flat' | 'tilted';
  bandBalance?: 'balanced' | 'low_dominant' | 'mid_dominant' | 'high_dominant';
  microStructure?: 'regular' | 'jittered' | 'comb';
  noiseColour?: 'white' | 'pink' | 'brown';
  noiseBandLocation?: 'low' | 'mid' | 'high';
  phaseRelationship?: 'aligned' | 'random' | 'anti_aligned' | 'partial_cancel' | 'full_cancel';
  coherence?: 'coherent' | 'incoherent';
}

export function computePartials(params: TimbreSynthParams) {
  const f0 = params.fundamental;
  const count = params.partialCount ?? 24;
  const density = (params.partialDensity ?? 100) / 100;
  const inharm = params.inharmonicity ?? 0;
  const spacing = params.spacingIrregularity ?? 0;
  const upperBal = params.upperBalance ?? 0;
  const envVal = params.envelopeShapeValue ?? 0;
  const tilt = params.spectralTilt ?? 0;
  const bandVal = params.bandBalanceValue ?? 0;
  const dev = (params.envelopeDeviation ?? 0) / 100;
  const peakAmt = (params.peakiness ?? 0) / 100;
  const microVal = params.microStructureValue ?? 0;

  const partials: Array<{ freq: number; amp: number; phase: number }> = [];

  for (let i = 1; i <= count; i++) {
    if (Math.random() > density && i > 1) continue;

    let freq = f0 * i;

    // Inharmonicity: stretch partials gradually
    if (inharm > 0) {
      const stretch = 1 + inharm * (Math.pow(i, 1.04) / i - 1);
      freq = f0 * i * stretch;
    }

    // Spacing irregularity: jitter proportional to value
    if (spacing > 0) freq *= 1 + (Math.random() - 0.5) * 0.12 * spacing;

    // Micro-structure: jitter at higher microVal
    if (microVal > 0) {
      freq *= 1 + (Math.random() - 0.5) * 0.05 * (microVal > 0.3 ? microVal : 0);
    }

    // Amplitude envelope
    let amp = 1 / i;

    // Envelope shape: 0=smooth (1/n), 0.5=peaked (Gaussian), 1=flat
    if (envVal > 0) {
      const smoothAmp = 1 / i;
      const peak = count / 2;
      const peakedAmp = Math.exp(-Math.pow((i - peak) / (count / 4), 2));
      const flatAmp = 1;
      // Blend based on envVal: 0-0.5 blends smooth→peaked, 0.5-1 blends peaked→flat
      if (envVal < 0.5) {
        amp = smoothAmp * (1 - envVal * 2) + peakedAmp * (envVal * 2);
      } else {
        amp = peakedAmp * (2 - envVal * 2) + flatAmp * (envVal * 2 - 1);
      }
    }

    // Tilt: apply dB/oct multiplier
    if (tilt !== 0) {
      amp *= Math.pow(10, (tilt * (i - 1) / 12) / 20);
    }

    // Upper balance: -1 = suppress upper, +1 = boost upper
    if (upperBal !== 0 && i > 3) {
      amp *= Math.exp(upperBal * 0.6);
    }

    // Band balance: -1 = low dominant, +1 = high dominant
    const half = count / 2;
    if (bandVal !== 0) {
      if (bandVal < 0 && i > half) amp *= 1 + bandVal * 0.65;
      else if (bandVal > 0 && i < half) amp *= 1 - bandVal * 0.65;
    }

    // Envelope deviation: random magnitude jitter
    if (dev > 0) amp *= 1 + (Math.random() - 0.5) * 2 * dev;

    // Peakiness: boost some partials
    if (peakAmt > 0) {
      if (Math.random() < peakAmt) amp *= 2.5;
      else amp *= 1 - peakAmt * 0.5;
    }

    // Comb: alternating amplitude at high microVal
    if (microVal > 0.7) {
      amp *= (i % 2 === 0 ? 1.5 : 0.5);
    }

    if (freq > 20000) continue;

    // Phase
    let phase = 0;
    const phaseCoh = params.phaseCoherence ?? 1;
    const cancelMode = params.cancellationMode ?? 'none';
    if (cancelMode === 'full' && i % 2 === 1) { amp = 0; phase = 0; }
    else if (cancelMode === 'partial' && i % 2 === 0) phase = Math.PI;
    else if (phaseCoh < -0.3) phase = Math.PI * (i % 2);
    else if (phaseCoh < 0.3) phase = Math.random() * 2 * Math.PI;

    // Fine-structure density
    const fineDensity = params.fineStructureDensity ?? 0;
    for (let k = 0; k < fineDensity; k++) {
      const subFreq = freq * (1 + (k + 1) * 0.02);
      if (subFreq < 20000) partials.push({ freq: subFreq, amp: amp * 0.15, phase });
    }

    partials.push({ freq, amp: Math.max(0, amp), phase });
  }

  // Resonances
  const resCount = params.resonanceCount ?? 0;
  const resFreqs = params.resonanceFreqs ?? [];
  const resGains = params.resonanceGains ?? [];
  const resQ = params.resonanceQ ?? 3;
  for (let r = 0; r < resCount; r++) {
    const resFreq = resFreqs[r] ?? (500 * (r + 1));
    const resGain = Math.pow(10, (resGains[r] ?? 12) / 20);
    const bandwidth = resFreq / resQ; // higher Q = narrower
    for (const p of partials) {
      const dist = Math.abs(p.freq - resFreq) / bandwidth;
      if (dist < 2) p.amp *= 1 + resGain * Math.max(0, 1 - dist / 2);
    }
  }

  // Antiresonance
  const antiDepth = (params.antiresonanceDepth ?? 0) / 100;
  if (antiDepth > 0) {
    const notchFreq = params.antiresonanceFreq ?? 750;
    for (const p of partials) {
      const dist = Math.abs(p.freq - notchFreq) / (notchFreq * 0.2);
      if (dist < 1) p.amp *= 1 - antiDepth * (1 - dist);
    }
  }

  // Formant overlay
  const formant = params.formantPattern;
  if (formant && formant !== 'none') {
    const formants: Record<string, number[]> = {
      a: [730, 1090, 2440], e: [530, 1840, 2480], i: [270, 2290, 3010],
      o: [570, 840, 2410], u: [300, 870, 2240],
    };
    const freqs = formants[formant] ?? [];
    for (const fFreq of freqs) {
      for (const p of partials) {
        const dist = Math.abs(p.freq - fFreq) / fFreq;
        if (dist < 0.25) p.amp *= 1 + 2.5 * (1 - dist / 0.25);
      }
    }
  }

  const maxAmp = Math.max(...partials.map((p) => p.amp), 0.001);
  return partials.map((p) => ({ ...p, amp: p.amp / maxAmp }));
}

export function createTimbreSynth(
  params: TimbreSynthParams,
  ctx: AudioContext,
  destination: AudioNode
) {
  const dur = params.durationMs / 1000;
  const attack = (params.attackMs ?? 10) / 1000;
  const decay = (params.decayMs ?? 100) / 1000;
  const sustain = (params.sustainLevel ?? 60) / 100;
  const release = (params.releaseMs ?? 100) / 1000;
  const sustainDur = Math.max(0.01, dur - attack - decay - release);

  const play = (start: number) => {
    const partials = computePartials(params);

    const master = ctx.createGain();
    master.connect(destination);
    master.gain.setValueAtTime(0, start);
    master.gain.linearRampToValueAtTime(1.0, start + attack);
    master.gain.linearRampToValueAtTime(sustain, start + attack + decay);
    master.gain.setValueAtTime(sustain, start + attack + decay + sustainDur);
    master.gain.linearRampToValueAtTime(0, start + attack + decay + sustainDur + release);

    const hnr = (params.hnr ?? 100) / 100;
    if (hnr > 0.05 && partials.length > 0) {
      for (const p of partials) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = p.freq;
        const gain = ctx.createGain();
        gain.gain.value = p.amp * hnr * 0.25;
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(start + attack + decay + sustainDur + release + 0.1);
      }
    }

    const noiseAmt = (params.noiseAmount ?? (1 - hnr) * 100) / 100;
    if (noiseAmt > 0.03) {
      const bufSize = Math.floor(ctx.sampleRate * (attack + decay + sustainDur + release + 0.1));
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);

      // Noise colour: -1 = brown (1/f²), 0 = pink (1/f), +1 = white (flat)
      const colourVal = params.noiseColourValue ?? 1;
      if (colourVal > 0.7) {
        // White
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      } else if (colourVal > -0.3) {
        // Pink (1/f)
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufSize; i++) {
          const w = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + w * 0.0555179;
          b1 = 0.99332 * b1 + w * 0.0750759;
          b2 = 0.969 * b2 + w * 0.153852;
          b3 = 0.8665 * b3 + w * 0.3104856;
          b4 = 0.55 * b4 + w * 0.5329522;
          b5 = -0.7616 * b5 - w * 0.016898;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
          b6 = w * 0.115926;
        }
      } else {
        // Brown (1/f²)
        let last = 0;
        for (let i = 0; i < bufSize; i++) {
          const w = Math.random() * 2 - 1;
          last = (last + 0.02 * w) / 1.02;
          data[i] = last * 3.5;
        }
      }

      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = buf;

      // Band location: -1 = low, 0 = mid, +1 = high
      const bandVal = params.noiseBandValue ?? 0;
      const bandHz = bandVal < -0.3 ? 400 : bandVal > 0.3 ? 8000 : 2000;
      const filter = ctx.createBiquadFilter();
      filter.type = params.bandLimited ? 'bandpass' : 'lowpass';
      filter.frequency.value = bandHz;
      filter.Q.value = params.bandLimited ? 4 : 0.7;

      const noiseGain = ctx.createGain();
      noiseGain.gain.value = noiseAmt * 0.35;

      noiseSrc.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(master);
      noiseSrc.start(start);
      noiseSrc.stop(start + attack + decay + sustainDur + release + 0.1);
    }
  };

  return { play, stop: () => {} };
}

export function describeTimbre(params: TimbreSynthParams): Array<{ label: string; value: string }> {
  const out: Array<{ label: string; value: string }> = [];
  if (params.inharmonicity !== undefined) out.push({ label: 'INHARM', value: params.inharmonicity.toFixed(2) });
  if (params.spectralTilt) out.push({ label: 'TILT', value: `${params.spectralTilt} dB/oct` });
  if (params.hnr !== undefined) out.push({ label: 'HNR', value: `${params.hnr}%` });
  if (params.noiseColourValue !== undefined) out.push({ label: 'COLOUR', value: params.noiseColourValue.toFixed(2) });
  return out;
}
