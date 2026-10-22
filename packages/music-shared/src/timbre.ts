export function harmonicToPeriodicWave(ctx: AudioContext, amplitudes: number[]): PeriodicWave {
  const real = new Float32Array(amplitudes.length + 1);
  const imag = new Float32Array(amplitudes.length + 1);
  for (let i = 0; i < amplitudes.length; i++) {
    const amp = amplitudes[i];
    if (amp !== undefined) imag[i + 1] = amp;
  }
  return ctx.createPeriodicWave(real, imag);
}

export const VOWEL_FORMANTS: Record<string, readonly [number, number, number]> = {
  a: [730, 1090, 2440],
  e: [530, 1840, 2480],
  i: [270, 2290, 3010],
  o: [570, 840, 2410],
  u: [300, 870, 2240],
};

export function makeDistortionCurve(amount: number, type: 'soft' | 'hard' | 'fuzz'): Float32Array {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const k = amount;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    if (type === 'soft') curve[i] = Math.tanh(k * x);
    else if (type === 'hard') curve[i] = Math.max(-1, Math.min(1, k * x));
    else curve[i] = Math.sin(k * x) * Math.sign(x);
  }
  return curve;
}

export function spectralCentroid(freqData: Uint8Array, sampleRate: number, fftSize: number): number {
  let num = 0;
  let den = 0;
  const binWidth = sampleRate / fftSize;
  for (let i = 0; i < freqData.length; i++) {
    const v = freqData[i];
    if (v === undefined) continue;
    num += i * binWidth * v;
    den += v;
  }
  return den > 0 ? num / den : 0;
}

export function spectralTilt(freqData: Uint8Array): number {
  const n = freqData.length;
  if (n < 2) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    const v = freqData[i] ?? 0;
    sumX += i;
    sumY += v;
    sumXY += i * v;
    sumX2 += i * i;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  const num = sumXY - n * meanX * meanY;
  const den = sumX2 - n * meanX * meanX;
  return den > 0 ? num / den : 0;
}
