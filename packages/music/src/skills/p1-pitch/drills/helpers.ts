import type { AudioWaveform, HarmonicContent, ReverbPreset, NoisePreset } from '@kata/audio';
import { parsePlayback, scaleDuration } from '../musicParams';

export interface DrillAudioSettings {
  timbre: AudioWaveform;
  reverb: ReverbPreset;
  noise: NoisePreset;
  harmonics: HarmonicContent;
  repeats: 1 | 2 | 3;
  loop: boolean;
  tempo: number;
}

export function readAudioSettings(
  variableParams: Record<string, string | number> | undefined,
): DrillAudioSettings {
  const vp = variableParams ?? {};
  const timbre = (vp.stim_timbre as AudioWaveform) ?? 'sine';
  const reverb = (vp.stim_reverb as ReverbPreset) ?? 'dry';
  const noise = (vp.stim_noise as NoisePreset) ?? 'silent';
  const harmonics = (vp.stim_harmonics as HarmonicContent) ?? 'rich';
  const playback = parsePlayback(vp.task_playbackStyle as string | undefined);
  const tempo = (vp.task_tempo as number) ?? 80;
  return { timbre, reverb, noise, harmonics, repeats: playback.repeats, loop: playback.loop, tempo };
}

export function durationAtTempo(baseSeconds: number, variableParams: Record<string, string | number> | undefined): number {
  const vp = variableParams ?? {};
  return scaleDuration(baseSeconds, vp.task_tempo as number | undefined);
}

export function readTolerance(variableParams: Record<string, string | number> | undefined): number {
  const vp = variableParams ?? {};
  return (vp.task_tolerance as number) ?? 0;
}