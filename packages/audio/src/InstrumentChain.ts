import { makeReverbImpulse, makeNoiseSource, type ReverbPreset, type NoisePreset } from './effects';
import { resolveOscillator, type AudioWaveform, type HarmonicContent } from './waveforms';
import { isSampledInstrument, playSampled } from './soundfont';

export interface InstrumentOptions {
  waveform: AudioWaveform;
  reverb?: ReverbPreset;
  noise?: NoisePreset;
  harmonics?: HarmonicContent;
  duration: number;
}

export interface VoiceHandle {
  osc: OscillatorNode | null;
  gain: GainNode;
}

export class InstrumentChain {
  private voices: VoiceHandle[] = [];
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private usingSamples: boolean;

  constructor(
    private ctx: BaseAudioContext,
    private destination: AudioNode,
    private options: InstrumentOptions,
  ) {
    this.usingSamples = isSampledInstrument(this.options.waveform);

    const impulse = makeReverbImpulse(ctx, options.reverb ?? 'dry');
    if (impulse) {
      this.reverb = ctx.createConvolver();
      this.reverb.buffer = impulse;
      this.reverbGain = ctx.createGain();
      this.reverbGain.gain.value = options.reverb === 'hall' ? 0.5 : 0.3;
      this.reverb.connect(this.reverbGain).connect(destination);
    }

    const noise = makeNoiseSource(ctx, options.noise ?? 'silent');
    if (noise) {
      this.noiseSource = noise.source;
      this.noiseGain = noise.gain;
      this.noiseSource.connect(this.noiseGain).connect(destination);
    }
  }

  /**
   * Play one note. If the timbre is a sample-based instrument, uses the SF3
   * loader; otherwise builds an oscillator voice.
   */
  playNote(midi: number, frequency: number, startAt: number, duration: number, velocity = 90): void {
    if (this.usingSamples) {
      // Fire-and-forget — playSampled handles its own scheduling.
      void playSampled(
        this.options.waveform as Parameters<typeof playSampled>[0],
        midi,
        duration,
        startAt,
        velocity,
      );
      return;
    }

    const voice = this.makeOscillatorVoice(frequency);
    scheduleEnvelope(voice.gain, startAt, duration, 0.3);
    voice.osc?.start(startAt);
    voice.osc?.stop(startAt + duration);
  }

  private makeOscillatorVoice(frequency: number): VoiceHandle {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const wave = resolveOscillator(ctx, this.options.waveform, this.options.harmonics ?? 'rich');
    if (wave instanceof PeriodicWave) {
      osc.setPeriodicWave(wave);
    } else {
      osc.type = wave as OscillatorType;
    }

    osc.frequency.value = frequency;
    gain.gain.value = 0.0001;
    gain.connect(this.destination);
    if (this.reverb) gain.connect(this.reverb);
    osc.connect(gain);

    const handle: VoiceHandle = { osc, gain };
    this.voices.push(handle);
    return handle;
  }

  start(startAt: number): void {
    if (this.noiseSource) {
      this.noiseSource.start(startAt);
      this.noiseSource.stop(startAt + this.options.duration + 0.5);
    }
  }

  onLastNoteEnd(callback: () => void): void {
    if (this.usingSamples) {
      // Sample playback can't notify reliably without hooking the synth.
      // Fall back to a timeout matching the duration.
      setTimeout(callback, this.options.duration * 1000 + 100);
      return;
    }
    const last = this.voices[this.voices.length - 1];
    if (last?.osc) {
      last.osc.onended = () => callback();
    } else {
      setTimeout(callback, this.options.duration * 1000 + 100);
    }
  }

  teardown(): void {
    for (const v of this.voices) {
      try { v.osc?.stop(); v.osc?.disconnect(); } catch { /* noop */ }
      try { v.gain.disconnect(); } catch { /* noop */ }
    }
    try { this.noiseSource?.stop(); this.noiseSource?.disconnect(); } catch { /* noop */ }
    try { this.noiseGain?.disconnect(); } catch { /* noop */ }
    try { this.reverb?.disconnect(); } catch { /* noop */ }
    try { this.reverbGain?.disconnect(); } catch { /* noop */ }
  }
}

export function scheduleEnvelope(
  gain: GainNode,
  startAt: number,
  duration: number,
  peak: number,
): void {
  const atk = Math.min(0.02, duration * 0.2);
  const rel = Math.min(0.15, duration * 0.5);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + atk);
  gain.gain.setValueAtTime(peak, startAt + Math.max(atk, duration - rel));
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
}