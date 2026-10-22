export { useAudioContext, getAudioContext } from './useAudioContext';

export { TonePlayer } from './TonePlayer';
export type { TonePlayerProps } from './TonePlayer';

export { IntervalPlayer } from './IntervalPlayer';
export type { IntervalPlayerProps } from './IntervalPlayer';

export { ChordPlayer } from './ChordPlayer';
export type { ChordPlayerProps, ChordType } from './ChordPlayer';

export { MelodyPlayer } from './MelodyPlayer';
export type { MelodyPlayerProps, MelodyNote } from './MelodyPlayer';

export { MaskingPlayer } from './MaskingPlayer';
export type { MaskingPlayerProps } from './MaskingPlayer';

export { MicrotonalPlayer } from './MicrotonalPlayer';
export type { MicrotonalPlayerProps } from './MicrotonalPlayer';

export type { AudioWaveform, HarmonicContent } from './waveforms';
export { AUDIO_WAVEFORMS, resolveOscillator, toOscillatorType } from './waveforms';
export { playSampled, isSampledInstrument, resetSoundfont, stopSampled } from './soundfont';
export type { ReverbPreset, NoisePreset } from './effects';

export {
  PITCH_CLASSES,
  INTERVAL_NAMES,
  midiToFrequency,
  frequencyToMidi,
  noteToFrequency,
  pitchClassToFrequency,
  semitonesToCents,
  detuneFrequency,
  buildChord,
  getEnharmonic,
  scaleDeltaToRange,
} from './pitch';

export {
  MIDI_MIN,
  MIDI_MAX,
  midiToNoteName,
  clampMidi,
  pickRootForInterval,
  pickMidiInRange,
  pickIntervalInRange,
  filterPoolByInterval,
  ALL_NOTE_OPTIONS,
} from './ranges';
export type { NoteOption } from './ranges';