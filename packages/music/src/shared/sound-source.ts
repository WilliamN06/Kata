/**
 * Sound source catalogue — every instrument a drill can play through.
 *
 * Grouped by family so the dropdown is easy to scan. Group headers render
 * as <optgroup> in the settings panel.
 *
 * Drills that test perceptual variables (pitch, dynamic, spatial, rhythm)
 * let the user pick a source. Drills that test timbre must not — they
 * synthesise their own sound from spectral parameters.
 */

export interface SoundSourceOption {
  value: string;
  label: string;
  group: string;
  category: 'instrument' | 'synth';
}

export const SOUND_SOURCE_OPTIONS: SoundSourceOption[] = [
  // ============================================================
  // PIANO FAMILY
  // ============================================================
  { value: 'piano_acoustic',    label: 'Acoustic Grand Piano',  group: 'Piano', category: 'instrument' },
  { value: 'piano_bright',      label: 'Bright Acoustic Piano', group: 'Piano', category: 'instrument' },
  { value: 'piano_electric',    label: 'Electric Grand Piano',  group: 'Piano', category: 'instrument' },
  { value: 'piano_honky',       label: 'Honky-tonk Piano',      group: 'Piano', category: 'instrument' },
  { value: 'rhodes',            label: 'Electric Piano (Rhodes)', group: 'Piano', category: 'instrument' },
  { value: 'harpsichord',       label: 'Harpsichord',           group: 'Piano', category: 'instrument' },
  { value: 'clavinet',          label: 'Clavinet',              group: 'Piano', category: 'instrument' },

  // ============================================================
  // CHROMATIC PERCUSSION
  // ============================================================
  { value: 'celesta',           label: 'Celesta',               group: 'Chromatic Percussion', category: 'instrument' },
  { value: 'glockenspiel',      label: 'Glockenspiel',          group: 'Chromatic Percussion', category: 'instrument' },
  { value: 'music_box',         label: 'Music Box',             group: 'Chromatic Percussion', category: 'instrument' },
  { value: 'vibraphone',        label: 'Vibraphone',            group: 'Chromatic Percussion', category: 'instrument' },
  { value: 'marimba',           label: 'Marimba',               group: 'Chromatic Percussion', category: 'instrument' },
  { value: 'xylophone',         label: 'Xylophone',             group: 'Chromatic Percussion', category: 'instrument' },
  { value: 'tubular_bells',     label: 'Tubular Bells',         group: 'Chromatic Percussion', category: 'instrument' },
  { value: 'dulcimer',          label: 'Dulcimer',              group: 'Chromatic Percussion', category: 'instrument' },

  // ============================================================
  // ORGAN
  // ============================================================
  { value: 'organ_drawbar',     label: 'Drawbar Organ',         group: 'Organ', category: 'instrument' },
  { value: 'organ_percussive',  label: 'Percussive Organ',      group: 'Organ', category: 'instrument' },
  { value: 'organ_rock',        label: 'Rock Organ',            group: 'Organ', category: 'instrument' },
  { value: 'organ_church',      label: 'Church Organ',          group: 'Organ', category: 'instrument' },
  { value: 'organ_reed',        label: 'Reed Organ',            group: 'Organ', category: 'instrument' },
  { value: 'accordion',         label: 'Accordion',             group: 'Organ', category: 'instrument' },
  { value: 'harmonica',         label: 'Harmonica',             group: 'Organ', category: 'instrument' },

  // ============================================================
  // GUITAR
  // ============================================================
  { value: 'guitar_nylon',      label: 'Nylon Guitar',          group: 'Guitar', category: 'instrument' },
  { value: 'guitar_steel',      label: 'Steel Guitar',          group: 'Guitar', category: 'instrument' },
  { value: 'guitar_jazz',       label: 'Jazz Guitar',           group: 'Guitar', category: 'instrument' },
  { value: 'guitar_clean',      label: 'Clean Electric Guitar', group: 'Guitar', category: 'instrument' },
  { value: 'guitar_muted',      label: 'Muted Electric Guitar', group: 'Guitar', category: 'instrument' },
  { value: 'guitar_overdriven', label: 'Overdriven Guitar',     group: 'Guitar', category: 'instrument' },
  { value: 'guitar_distortion', label: 'Distortion Guitar',     group: 'Guitar', category: 'instrument' },

  // ============================================================
  // BASS
  // ============================================================
  { value: 'bass_acoustic',     label: 'Acoustic Bass',         group: 'Bass', category: 'instrument' },
  { value: 'bass_finger',       label: 'Fingered Bass',         group: 'Bass', category: 'instrument' },
  { value: 'bass_pick',         label: 'Picked Bass',           group: 'Bass', category: 'instrument' },
  { value: 'bass_slap',         label: 'Slap Bass',             group: 'Bass', category: 'instrument' },
  { value: 'bass_synth',        label: 'Synth Bass',            group: 'Bass', category: 'instrument' },

  // ============================================================
  // STRINGS
  // ============================================================
  { value: 'violin',            label: 'Violin',                group: 'Strings', category: 'instrument' },
  { value: 'viola',             label: 'Viola',                 group: 'Strings', category: 'instrument' },
  { value: 'cello',             label: 'Cello',                 group: 'Strings', category: 'instrument' },
  { value: 'contrabass',        label: 'Contrabass',            group: 'Strings', category: 'instrument' },
  { value: 'strings_ensemble',  label: 'String Ensemble',       group: 'Strings', category: 'instrument' },
  { value: 'strings_pizzicato', label: 'Pizzicato Strings',     group: 'Strings', category: 'instrument' },
  { value: 'harp',              label: 'Harp',                  group: 'Strings', category: 'instrument' },

  // ============================================================
  // BRASS
  // ============================================================
  { value: 'trumpet',           label: 'Trumpet',               group: 'Brass', category: 'instrument' },
  { value: 'trombone',          label: 'Trombone',              group: 'Brass', category: 'instrument' },
  { value: 'tuba',              label: 'Tuba',                  group: 'Brass', category: 'instrument' },
  { value: 'french_horn',       label: 'French Horn',           group: 'Brass', category: 'instrument' },
  { value: 'brass_section',     label: 'Brass Section',         group: 'Brass', category: 'instrument' },

  // ============================================================
  // REED
  // ============================================================
  { value: 'sax_soprano',       label: 'Soprano Sax',           group: 'Reed', category: 'instrument' },
  { value: 'sax_alto',          label: 'Alto Sax',              group: 'Reed', category: 'instrument' },
  { value: 'sax_tenor',         label: 'Tenor Sax',             group: 'Reed', category: 'instrument' },
  { value: 'sax_baritone',      label: 'Baritone Sax',          group: 'Reed', category: 'instrument' },
  { value: 'oboe',              label: 'Oboe',                  group: 'Reed', category: 'instrument' },
  { value: 'english_horn',      label: 'English Horn',          group: 'Reed', category: 'instrument' },
  { value: 'bassoon',           label: 'Bassoon',               group: 'Reed', category: 'instrument' },
  { value: 'clarinet',          label: 'Clarinet',              group: 'Reed', category: 'instrument' },

  // ============================================================
  // PIPE
  // ============================================================
  { value: 'flute',             label: 'Flute',                 group: 'Pipe', category: 'instrument' },
  { value: 'piccolo',           label: 'Piccolo',               group: 'Pipe', category: 'instrument' },
  { value: 'recorder',          label: 'Recorder',              group: 'Pipe', category: 'instrument' },
  { value: 'pan_flute',         label: 'Pan Flute',             group: 'Pipe', category: 'instrument' },
  { value: 'ocarina',           label: 'Ocarina',               group: 'Pipe', category: 'instrument' },

  // ============================================================
  // SYNTH PADS
  // ============================================================
  { value: 'pad_warm',          label: 'Warm Pad',              group: 'Synth Pad', category: 'synth' },
  { value: 'pad_new_age',       label: 'New Age Pad',           group: 'Synth Pad', category: 'synth' },
  { value: 'pad_choir',         label: 'Choir Pad',             group: 'Synth Pad', category: 'synth' },
  { value: 'pad_metallic',      label: 'Metallic Pad',          group: 'Synth Pad', category: 'synth' },

  // ============================================================
  // SYNTH LEAD
  // ============================================================
  { value: 'lead_square',       label: 'Square Lead',           group: 'Synth Lead', category: 'synth' },
  { value: 'lead_saw',          label: 'Sawtooth Lead',         group: 'Synth Lead', category: 'synth' },
  { value: 'lead_callia',       label: 'Calliope Lead',         group: 'Synth Lead', category: 'synth' },
  { value: 'lead_voice',        label: 'Voice Lead',            group: 'Synth Lead', category: 'synth' },

  // ============================================================
  // PURE TONES
  // ============================================================
  { value: 'sine',              label: 'Sine (pure tone)',      group: 'Pure Tones', category: 'synth' },
  { value: 'triangle',          label: 'Triangle',              group: 'Pure Tones', category: 'synth' },
  { value: 'sawtooth',          label: 'Sawtooth',              group: 'Pure Tones', category: 'synth' },
  { value: 'square',            label: 'Square',                group: 'Pure Tones', category: 'synth' },
];

/** All options grouped for rendering as <optgroup>. */
export function groupedSoundSources(): Record<string, SoundSourceOption[]> {
  const groups: Record<string, SoundSourceOption[]> = {};
  for (const opt of SOUND_SOURCE_OPTIONS) {
    if (!groups[opt.group]) groups[opt.group] = [];
    groups[opt.group].push(opt);
  }
  return groups;
}

/** Find an option by value. */
export function findSoundSource(value: string): SoundSourceOption | undefined {
  return SOUND_SOURCE_OPTIONS.find((o) => o.value === value);
}

/** Is this a raw waveform (synthesised) or a sampled instrument? */
export function isSynthetic(value: string): boolean {
  const opt = findSoundSource(value);
  return opt?.category === 'synth' && ['sine', 'triangle', 'sawtooth', 'square'].includes(value);
}


