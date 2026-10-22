export function panToGainsEqualPower(pan: number): { left: number; right: number } {
  const p = Math.max(-1, Math.min(1, pan));
  const angle = ((p + 1) * Math.PI) / 4;
  return { left: Math.cos(angle), right: Math.sin(angle) };
}

export function panToGainsLinear(pan: number): { left: number; right: number } {
  const p = Math.max(-1, Math.min(1, pan));
  return { left: (1 - p) / 2, right: (1 + p) / 2 };
}

export function generateImpulseResponse(ctx: AudioContext, decayTime: number, preDelay: number, damping: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * (decayTime + preDelay + 0.1));
  const buffer = ctx.createBuffer(2, length, sampleRate);
  const preDelaySamples = Math.floor(preDelay * sampleRate);
  const decaySamples = length - preDelaySamples;

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      if (i < preDelaySamples) data[i] = 0;
      else {
        const t = (i - preDelaySamples) / decaySamples;
        const envelope = Math.pow(1 - t, damping > 0 ? 4 * damping : 2);
        data[i] = (Math.random() * 2 - 1) * envelope;
      }
    }
  }
  return buffer;
}

export function itdToPhase(itdMicroseconds: number, frequency: number): number {
  const itdSeconds = itdMicroseconds / 1e6;
  return 2 * Math.PI * frequency * itdSeconds;
}
