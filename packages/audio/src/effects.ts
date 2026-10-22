export type ReverbPreset = 'dry' | 'subtle' | 'moderate' | 'hall';
export type NoisePreset = 'silent' | 'subtle' | 'moderate';

export function makeReverbImpulse(
  ctx: BaseAudioContext,
  kind: ReverbPreset,
): AudioBuffer | null {
  if (kind === 'dry') return null;
  const seconds = kind === 'subtle' ? 0.4 : kind === 'moderate' ? 0.9 : 1.6;
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(rate * seconds));
  const impulse = ctx.createBuffer(2, length, rate);
  const decay = kind === 'hall' ? 2.2 : kind === 'moderate' ? 3.0 : 4.5;
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }
  }
  return impulse;
}

export function makeNoiseSource(
  ctx: BaseAudioContext,
  kind: NoisePreset,
): { source: AudioBufferSourceNode; gain: GainNode } | null {
  if (kind === 'silent') return null;
  const seconds = 2;
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = ctx.createGain();
  gain.gain.value = kind === 'subtle' ? 0.015 : 0.05;
  source.connect(gain);
  return { source, gain };
}