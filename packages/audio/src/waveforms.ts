export type AudioWaveform =
  | 'sine'
  | 'triangle'
  | 'sawtooth'
  | 'square'
  | 'piano'
  | 'guitar'
  | 'strings'
  | 'organ'
  | 'reed'
  | 'brass'
  | 'bell'
  | 'plucked'
  | 'acoustic_grand_piano'
  | 'acoustic_guitar_nylon'
  | 'acoustic_guitar_steel'
  | 'string_ensemble_1'
  | 'violin'
  | 'cello'
  | 'drawbar_organ'
  | 'clarinet'
  | 'trumpet'
  | 'brass_section'
  | 'french_horn'
  | 'tubular_bells'
  | 'glockenspiel'
  | 'marimba'
  | 'pizzicato_strings'
  | 'orchestral_harp'
  | 'flute'
  | 'sitar'
  | 'kalimba';

export const AUDIO_WAVEFORMS: AudioWaveform[] = [
  'sine',
  'triangle',
  'sawtooth',
  'square',
  'piano',
  'guitar',
  'strings',
  'organ',
  'reed',
  'brass',
  'bell',
  'plucked',
];

export type HarmonicContent = 'simple' | 'moderate' | 'rich';

const NATIVE: Record<string, OscillatorType> = {
  sine: 'sine',
  triangle: 'triangle',
  sawtooth: 'sawtooth',
  square: 'square',
};

const HARMONICS: Record<string, number[]> = {
  piano:   [1, 0.60, 0.30, 0.18, 0.10, 0.06, 0.03, 0.02],
  guitar:  [1, 0.50, 0.40, 0.20, 0.15, 0.08, 0.05, 0.03, 0.02],
  strings: [1, 0.70, 0.55, 0.40, 0.30, 0.20, 0.15, 0.10, 0.07, 0.05],
  organ:   [1, 0.00, 0.55, 0.00, 0.35, 0.00, 0.20, 0.00, 0.10],
  reed:    [1, 0.40, 0.70, 0.20, 0.45, 0.15, 0.30, 0.10, 0.20],
  brass:   [1, 0.85, 0.65, 0.50, 0.35, 0.25, 0.18, 0.12, 0.08, 0.05],
  bell:    [1, 0.00, 0.00, 0.50, 0.00, 0.00, 0.30, 0.00, 0.00, 0.20],
  plucked: [1, 0.65, 0.35, 0.20, 0.12, 0.08, 0.05, 0.03],
};

function restrictHarmonics(table: number[], content: HarmonicContent): number[] {
  if (content === 'simple') return [table[0] ?? 1];
  if (content === 'moderate') return table.slice(0, 3);
  return table;
}

const waveCache = new WeakMap<BaseAudioContext, Map<string, PeriodicWave>>();

function getWaveCache(ctx: BaseAudioContext): Map<string, PeriodicWave> {
  let c = waveCache.get(ctx);
  if (!c) {
    c = new Map();
    waveCache.set(ctx, c);
  }
  return c;
}

export function resolveOscillator(
  ctx: BaseAudioContext,
  waveform: AudioWaveform | undefined,
  content: HarmonicContent = 'rich',
): OscillatorType | PeriodicWave {
  const w = waveform ?? 'sine';
  const native = NATIVE[w];
  if (native) return native;

  const table = HARMONICS[w];
  if (!table) return 'sine';

  const key = `${w}:${content}`;
  const cache = getWaveCache(ctx);
  const cached = cache.get(key);
  if (cached) return cached;

  const restricted = restrictHarmonics(table, content);
  const real = new Float32Array(restricted.length + 1);
  const imag = new Float32Array(restricted.length + 1);
  for (let i = 0; i < restricted.length; i++) imag[i + 1] = restricted[i] ?? 0;
  const wave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  cache.set(key, wave);
  return wave;
}

export function toOscillatorType(w: AudioWaveform | undefined): OscillatorType {
  const native = NATIVE[w ?? 'sine'];
  if (native) return native;
  return 'triangle';
}