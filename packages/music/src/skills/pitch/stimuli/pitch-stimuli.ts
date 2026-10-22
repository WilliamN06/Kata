import { applyInterval, chordIntervals } from '@kata/music-shared';
import { getAudioContext } from '@kata/audio';
import { playInstrumentNote, playChord } from '../../../shared/SoundfontLoader';

let __intervalInstanceCounter = 0;

interface BaseParams {
  rootFrequency: number;
  durationMs: number;
  gapMs: number;
  soundSource?: string;
}

/**
 * The single point where every pitch drill sends a tone to be played.
 *
 * IMPORTANT: this delegates to playInstrumentNote(), which routes to
 * the soundfont's WorkletSynthesizer for instrument names (piano_acoustic,
 * violin, etc.) and to an OscillatorNode only for the four raw waveforms
 * (sine, triangle, sawtooth, square).
 *
 * If you call ctx.createOscillator() directly with a sound source name,
 * the browser silently coerces it to 'sine' — that was the old bug.
 */
async function playTone(
  freq: number,
  start: number,
  durationMs: number,
  soundSource: string,
  gain: number = 0.4
): Promise<void> {
  console.log(`[playTone] freq=${freq.toFixed(0)} Hz start=${start.toFixed(3)} source=${soundSource}`);
  await playInstrumentNote(soundSource, freq, start, durationMs / 1000, gain);
}

// =================================================================
// V1 — Pitch Value
// =================================================================
export function createPitchStimulus(params: BaseParams, _ctx: AudioContext, _dest: AudioNode) {
  const play = (start: number) =>
    playTone(params.rootFrequency, start, params.durationMs, params.soundSource ?? 'piano_acoustic');

  return {
    play: (start: number) => play(start),
    playA: () => play(getAudioContext().currentTime + 0.05),
    playB: () => play(getAudioContext().currentTime + 0.05),
    stop: () => {},
  };
}

// =================================================================
// V2 — Interval
// =================================================================
export interface IntervalParams extends BaseParams {
  intervalSemitones: number;
  direction: 'ascending' | 'descending' | 'harmonic';
  referencePresent: 'present' | 'absent';
}

export function createIntervalStimulus(params: IntervalParams, _ctx: AudioContext, _dest: AudioNode) {
  const root = params.rootFrequency;
  const target = root * Math.pow(2, params.intervalSemitones / 12);
  const dur = params.durationMs / 1000;
  const gap = params.gapMs / 1000;
  const src = params.soundSource ?? 'piano_acoustic';

  // Each call plays exactly ONE interval (root then target — 2 notes total).
  // IMPORTANT: This function schedules notes but must NOT await each
  // playTone() call. Awaiting would serialize them (wrong timing).
  //
  // Instead, we rely on the soundfont being preloaded by the wrapper,
  // so playInstrumentNote() resolves synchronously on subsequent calls.
  //
  // If the soundfont ISN'T preloaded, both playTone() promises will
  // resolve after init finishes, and both noteOn() calls will fire at
  // "currentTime now" — collapsing the ascending interval into a chord.
  // That's the "double play" symptom; the wrapper's preload prevents it.
  const __instanceId = ++__intervalInstanceCounter;
  console.log(`[IntervalStimulus#${__instanceId}] CREATED semitones=${params.intervalSemitones} root=${root.toFixed(0)}Hz target=${target.toFixed(0)}Hz`);

  const playInterval = (start: number, tag: string) => {
    console.log(`[IntervalStimulus#${__instanceId}:${tag}] play at ${start.toFixed(3)}s root=${root.toFixed(0)}Hz target=${target.toFixed(0)}Hz semitones=${params.intervalSemitones}`);

    if (params.direction === 'harmonic') {
      playTone(root, start, params.durationMs, src);
      playTone(target, start, params.durationMs, src);
      return;
    }
    if (params.direction === 'ascending') {
      playTone(root, start, params.durationMs, src);
      playTone(target, start + dur + gap, params.durationMs, src);
    } else {
      playTone(target, start, params.durationMs, src);
      playTone(root, start + dur + gap, params.durationMs, src);
    }
  };

  return {
    play: (start: number) => playInterval(start, 'play'),
    playA: () => playInterval(getAudioContext().currentTime + 0.05, 'playA'),
    playB: () => playInterval(getAudioContext().currentTime + 0.05, 'playB'),
    stop: () => {},
  };
}
export function describeInterval(intervalCents: number): { name: string; short: string; cents: number } {
  return { name: `${Math.round(intervalCents)} cents`, short: `${Math.round(intervalCents)}¢`, cents: intervalCents };
}

// =================================================================
// V3 — Chord
// =================================================================
export interface ChordParams extends BaseParams {
  chordSymbol: string;
  voicing: 'close' | 'open' | 'spread';
  inversion: 'root' | 'first' | 'second' | 'third' | 'random';
}

export function createChordStimulus(params: ChordParams, _ctx: AudioContext, _dest: AudioNode) {
  const intervals = chordIntervals(params.chordSymbol);
  const inversionIndex =
    params.inversion === 'root' ? 0 :
    params.inversion === 'first' ? 1 :
    params.inversion === 'second' ? 2 :
    params.inversion === 'third' ? 3 :
    Math.floor(Math.random() * intervals.length);

  const inverted = intervals.map((semi, i) => (i < inversionIndex ? semi + 12 : semi));
  const voiced = inverted.map((semi, i) => {
    if (params.voicing === 'open' && i % 2 === 1) return semi + 12;
    if (params.voicing === 'spread' && i % 2 === 1) return semi + 24;
    return semi;
  });

  // Convert semitone offsets to absolute MIDI notes from the root frequency.
  // Root MIDI: 69 + 12*log2(rootFreq/440). Each chord tone = rootMidi + semi.
  const rootMidi = Math.round(69 + 12 * Math.log2(params.rootFrequency / 440));
  const midiNotes = voiced.map((semi) => rootMidi + semi);

  const src = params.soundSource ?? 'piano_acoustic';

  const playChordAt = (start: number) => {
    playChord(src, midiNotes, start, params.durationMs / 1000, 0.4);
  };

  return {
    play: (start: number) => playChordAt(start),
    playA: () => playChordAt(getAudioContext().currentTime + 0.05),
    playB: () => playChordAt(getAudioContext().currentTime + 0.05),
    stop: () => {},
  };
}

export function chordShortName(symbol: string): string {
  const map: Record<string, string> = {
    // Triads
    'maj':     'Major triad (M)',
    'min':     'Minor triad (m)',
    'dim':     'Diminished triad (°)',
    'aug':     'Augmented triad (+)',
    '5':       'Power chord (5)',

    // Suspended
    'sus2':    'Suspended 2nd (sus2)',
    'sus4':    'Suspended 4th (sus4)',
    '7sus4':   'Dominant 7 sus4 (7sus4)',

    // Sixths
    '6':       'Major 6th (6)',
    'm6':      'Minor 6th (m6)',
    '6add9':   'Six-nine (6/9)',

    // Sevenths
    'maj7':    'Major 7th (M7)',
    'min7':    'Minor 7th (m7)',
    '7':       'Dominant 7th (7)',
    'm7b5':    'Half-diminished 7th (ø7)',
    'dim7':    'Diminished 7th (°7)',
    'mMaj7':   'Minor-major 7th (mM7)',
    'aug7':    'Augmented 7th (+7)',
    'augMaj7': 'Augmented major 7th (+M7)',

    // Extended
    '9':       'Dominant 9th (9)',
    'maj9':    'Major 9th (M9)',
    'min9':    'Minor 9th (m9)',
    'add9':    'Add 9 (add9)',
    'madd9':   'Minor add 9 (madd9)',
    '11':      'Dominant 11th (11)',
    'm11':     'Minor 11th (m11)',
    '13':      'Dominant 13th (13)',

    // Altered
    '7b5':     'Dominant 7 flat 5 (7♭5)',
    '7#5':     'Dominant 7 sharp 5 (7♯5)',
    '7b9':     'Dominant 7 flat 9 (7♭9)',
    '7#9':     'Dominant 7 sharp 9 (7♯9)',
    '7#11':    'Dominant 7 sharp 11 (7♯11)',
  };
  return map[symbol] ?? symbol;
}









