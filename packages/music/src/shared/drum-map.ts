/**
 * GM Percussion map — MIDI note numbers for drums on channel 9, bank 128.
 * Standard General MIDI drum kit.
 */
export const DRUM_NOTE: Record<string, number> = {
  // Kick
  kick: 36,
  kick_acoustic: 35,
  // Snare
  snare: 38,
  snare_acoustic: 37,
  snare_rim: 40,
  // Hi-hat
  hat: 42,        // closed
  hat_closed: 42,
  hat_open: 46,
  hat_pedal: 44,
  // Toms
  tom: 45,        // low tom
  tom_low: 41,
  tom_mid: 47,
  tom_high: 50,
  // Cymbals
  crash: 49,
  ride: 51,
  // Clap / rim
  clap: 39,
  rim: 37,
  click: 37,
  // Other
  cowbell: 56,
  tambourine: 54,
};

/** Reverse map MIDI note → drum name */
export const MIDI_NOTE_TO_DRUM: Record<number, string> = Object.entries(DRUM_NOTE).reduce(
  (acc, [name, note]) => {
    if (!acc[note]) acc[note] = name;
    return acc;
  },
  {} as Record<number, string>
);
