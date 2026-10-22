let sharedContext: AudioContext | null = null;
let masterBus: GainNode | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedContext) {
    const Ctor =
      (globalThis as any).AudioContext ||
      (globalThis as any).webkitAudioContext;
    sharedContext = new Ctor();
  }
  return sharedContext!;
}

export function getMasterBus(): GainNode {
  if (!masterBus) {
    const ctx = getAudioContext();
    masterBus = ctx.createGain();
    masterBus.gain.value = 0.7;
    masterBus.connect(ctx.destination);
  }
  return masterBus!;
}

export async function resumeAudio(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}
