export interface Interval {
  semitones: number;
  cents: number;
  name: string;
  short: string;
  quality: 'perfect' | 'major' | 'minor' | 'augmented' | 'diminished' | 'neutral';
}

export const NAMED_INTERVALS: readonly Interval[] = [
  { semitones: 0,  cents: 0,    name: 'Unison',         short: 'P1',  quality: 'perfect' },
  { semitones: 0,  cents: 50,   name: 'Quarter-tone',   short: '¼t',  quality: 'neutral' },
  { semitones: 1,  cents: 100,  name: 'Minor 2nd',      short: 'm2',  quality: 'minor' },
  { semitones: 2,  cents: 200,  name: 'Major 2nd',      short: 'M2',  quality: 'major' },
  { semitones: 3,  cents: 300,  name: 'Minor 3rd',      short: 'm3',  quality: 'minor' },
  { semitones: 4,  cents: 400,  name: 'Major 3rd',      short: 'M3',  quality: 'major' },
  { semitones: 5,  cents: 500,  name: 'Perfect 4th',    short: 'P4',  quality: 'perfect' },
  { semitones: 6,  cents: 600,  name: 'Tritone',        short: 'TT',  quality: 'augmented' },
  { semitones: 7,  cents: 700,  name: 'Perfect 5th',    short: 'P5',  quality: 'perfect' },
  { semitones: 8,  cents: 800,  name: 'Minor 6th',      short: 'm6',  quality: 'minor' },
  { semitones: 9,  cents: 900,  name: 'Major 6th',      short: 'M6',  quality: 'major' },
  { semitones: 10, cents: 1000, name: 'Minor 7th',      short: 'm7',  quality: 'minor' },
  { semitones: 11, cents: 1100, name: 'Major 7th',      short: 'M7',  quality: 'major' },
  { semitones: 12, cents: 1200, name: 'Octave',         short: 'P8',  quality: 'perfect' },
  { semitones: 13, cents: 1300, name: 'Minor 9th',      short: 'm9',  quality: 'minor' },
  { semitones: 14, cents: 1400, name: 'Major 9th',      short: 'M9',  quality: 'major' },
  { semitones: 15, cents: 1500, name: 'Minor 10th',     short: 'm10', quality: 'minor' },
  { semitones: 16, cents: 1600, name: 'Major 10th',     short: 'M10', quality: 'major' },
  { semitones: 17, cents: 1700, name: 'Perfect 11th',   short: 'P11', quality: 'perfect' },
  { semitones: 18, cents: 1800, name: 'Augmented 11th', short: 'A11', quality: 'augmented' },
  { semitones: 19, cents: 1900, name: 'Perfect 12th',   short: 'P12', quality: 'perfect' },
  { semitones: 20, cents: 2000, name: 'Minor 13th',     short: 'm13', quality: 'minor' },
  { semitones: 21, cents: 2100, name: 'Major 13th',     short: 'M13', quality: 'major' },
  { semitones: 24, cents: 2400, name: 'Double Octave',  short: 'P15', quality: 'perfect' },
];

const FALLBACK_INTERVAL: Interval = { semitones: 0, cents: 0, name: 'Unison', short: 'P1', quality: 'perfect' };

export function intervalBySemitones(semitones: number): Interval {
  return NAMED_INTERVALS.find((i) => i.semitones === semitones) ?? FALLBACK_INTERVAL;
}

export function intervalByCents(cents: number): Interval {
  let best: Interval = FALLBACK_INTERVAL;
  let minDist = Infinity;
  for (const interval of NAMED_INTERVALS) {
    const d = Math.abs(interval.cents - cents);
    if (d < minDist) { minDist = d; best = interval; }
  }
  return best;
}

export interface ChordType {
  symbol: string;
  name: string;
  short: string;
  intervals: number[];
  category: 'triad' | 'seventh' | 'extended' | 'sus' | 'altered';
}

export const CHORD_TYPES: readonly ChordType[] = [
  { symbol: 'maj',   name: 'Major triad',          short: 'M',    intervals: [0, 4, 7],        category: 'triad' },
  { symbol: 'min',   name: 'Minor triad',          short: 'm',    intervals: [0, 3, 7],        category: 'triad' },
  { symbol: 'dim',   name: 'Diminished triad',     short: '°',    intervals: [0, 3, 6],        category: 'triad' },
  { symbol: 'aug',   name: 'Augmented triad',      short: '+',    intervals: [0, 4, 8],        category: 'triad' },
  { symbol: '5',     name: 'Power chord',          short: '5',    intervals: [0, 7],           category: 'triad' },
  { symbol: 'sus2',  name: 'Suspended 2nd',        short: 'sus2', intervals: [0, 2, 7],        category: 'sus' },
  { symbol: 'sus4',  name: 'Suspended 4th',        short: 'sus4', intervals: [0, 5, 7],        category: 'sus' },
  { symbol: '6',     name: 'Major 6th',            short: '6',    intervals: [0, 4, 7, 9],     category: 'extended' },
  { symbol: 'm6',    name: 'Minor 6th',            short: 'm6',   intervals: [0, 3, 7, 9],     category: 'extended' },
  { symbol: 'maj7',  name: 'Major 7th',            short: 'M7',   intervals: [0, 4, 7, 11],    category: 'seventh' },
  { symbol: 'min7',  name: 'Minor 7th',            short: 'm7',   intervals: [0, 3, 7, 10],    category: 'seventh' },
  { symbol: '7',     name: 'Dominant 7th',         short: '7',    intervals: [0, 4, 7, 10],    category: 'seventh' },
  { symbol: 'm7b5',  name: 'Half-diminished 7th',  short: 'ø7',   intervals: [0, 3, 6, 10],    category: 'seventh' },
  { symbol: 'dim7',  name: 'Diminished 7th',       short: '°7',   intervals: [0, 3, 6, 9],     category: 'seventh' },
  { symbol: 'mMaj7', name: 'Minor-major 7th',      short: 'mM7',  intervals: [0, 3, 7, 11],    category: 'seventh' },
  { symbol: 'aug7',  name: 'Augmented 7th',        short: '+7',   intervals: [0, 4, 8, 10],    category: 'seventh' },
  { symbol: 'augMaj7', name: 'Augmented major 7th', short: '+M7',  intervals: [0, 4, 8, 11],    category: 'seventh' },
  { symbol: '7sus4', name: 'Dominant 7 sus4',      short: '7sus4', intervals: [0, 5, 7, 10],   category: 'sus' },
  { symbol: '9',     name: 'Dominant 9th',         short: '9',    intervals: [0, 4, 7, 10, 14], category: 'extended' },
  { symbol: 'maj9',  name: 'Major 9th',            short: 'M9',   intervals: [0, 4, 7, 11, 14], category: 'extended' },
  { symbol: 'min9',  name: 'Minor 9th',            short: 'm9',   intervals: [0, 3, 7, 10, 14], category: 'extended' },
  { symbol: '6add9', name: '6/9',                  short: '6/9',  intervals: [0, 4, 7, 9, 14],  category: 'extended' },
  { symbol: 'add9',  name: 'Add 9',                short: 'add9', intervals: [0, 4, 7, 14],     category: 'extended' },
  { symbol: 'madd9', name: 'Minor add 9',          short: 'madd9', intervals: [0, 3, 7, 14],    category: 'extended' },
  { symbol: '11',    name: 'Dominant 11th',        short: '11',   intervals: [0, 4, 7, 10, 14, 17], category: 'extended' },
  { symbol: 'm11',   name: 'Minor 11th',           short: 'm11',  intervals: [0, 3, 7, 10, 14, 17], category: 'extended' },
  { symbol: '13',    name: 'Dominant 13th',        short: '13',   intervals: [0, 4, 7, 10, 14, 21], category: 'extended' },
  { symbol: '7b5',   name: 'Dominant 7 flat 5',    short: '7♭5',  intervals: [0, 4, 6, 10],    category: 'altered' },
  { symbol: '7#5',   name: 'Dominant 7 sharp 5',   short: '7♯5',  intervals: [0, 4, 8, 10],    category: 'altered' },
  { symbol: '7b9',   name: 'Dominant 7 flat 9',    short: '7♭9',  intervals: [0, 4, 7, 10, 13], category: 'altered' },
  { symbol: '7#9',   name: 'Dominant 7 sharp 9',   short: '7♯9',  intervals: [0, 4, 7, 10, 15], category: 'altered' },
  { symbol: '7#11',  name: 'Dominant 7 sharp 11',  short: '7♯11', intervals: [0, 4, 7, 10, 18], category: 'altered' },
];

export function chordBySymbol(symbol: string): ChordType | undefined {
  return CHORD_TYPES.find((c) => c.symbol === symbol);
}

export function chordIntervals(symbol: string): number[] {
  return CHORD_TYPES.find((c) => c.symbol === symbol)?.intervals ?? [0, 4, 7];
}

