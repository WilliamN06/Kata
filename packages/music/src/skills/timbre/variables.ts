import type { Variable } from '@kata/core';

/**
 * Timbre — 19 variables.
 *
 * Every variable is a numeric range. Categories (shown to the user) are
 * DERIVED from the number via threshold logic in the dispatcher.
 *
 * Conventions:
 *   - Balance variables: -1 (left pole) to +1 (right pole), 0 = neutral
 *   - Percentage variables: 0 to 100 (%)
 *   - Count variables: integer ranges
 *   - Physical variables: dB/oct, Hz, Q (arbitrary ranges but standard units)
 *   - V10 (Formant Pattern) is genuinely categorical — 6 discrete vowels.
 *     No numeric range makes sense there.
 */

const commonStimulusParams = [
  { id: 'fundamental', label: 'Fundamental Frequency', kind: 'number' as const,
    defaultValue: 220,
    range: { min: 20, max: 8000, step: 1, unit: 'Hz', extendable: true } },
  { id: 'durationMs', label: 'Duration', kind: 'number' as const,
    defaultValue: 1200,
    range: { min: 200, max: 5000, step: 100, unit: 'ms', extendable: true } },
  { id: 'attackMs', label: 'Attack', kind: 'number' as const,
    defaultValue: 5,
    range: { min: 0, max: 500, step: 1, unit: 'ms', extendable: true } },
  { id: 'reverb', label: 'Reverb', kind: 'select' as const,
    defaultValue: 'none',
    options: [
      { value: 'none', label: 'None (dry)' },
      { value: 'room', label: 'Room (small)' },
      { value: 'hall', label: 'Hall (large)' },
    ] },
];

const rangeNumber = (
  id: string, label: string, dflt: number,
  min: number, max: number, step: number, unit: string
) => ({
  id, label, kind: 'range' as const, defaultValue: dflt,
  range: { min, max, step, unit, extendable: true },
});

const balance = (id: string, label: string, leftLabel: string, rightLabel: string, dflt = 0) => ({
  id, label, kind: 'range' as const, defaultValue: dflt,
  range: { min: -1, max: 1, step: 0.05, unit: `${leftLabel} ← → ${rightLabel}`, extendable: false },
});

export const TIMBRE_VARIABLES: Variable[] = [
  // ================================================================
  // CLUSTER 1 — SPECTRAL MAGNITUDE DISTRIBUTION
  // ================================================================

  // V1 — Partial Relationships (harmonicity 0 = harmonic, 1 = inharmonic)
  {
    id: 'music:p3-timbre:V1' as any,
    name: 'Partial Relationships',
    definition: 'How harmonic vs inharmonic the partials are. 0 = perfect integer multiples. 1 = fully stretched.',
    unit: 'ratio',
    defaultValue: 0,
    variableDimensions: [
      rangeNumber('inharmonicity', 'Inharmonicity', 0, 0, 1, 0.05, '0=harmonic … 1=inharmonic'),
      rangeNumber('partialCount', 'Partial Count', 24, 2, 128, 1, 'partials'),
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // V2 — Partial Spacing (0 = regular, 1 = irregular/clustered/sparse)
  {
    id: 'music:p3-timbre:V2' as any,
    name: 'Partial Spacing',
    definition: 'How irregularly the partials are distributed. 0 = perfect evenly spaced. 1 = maximally irregular.',
    unit: 'ratio',
    defaultValue: 0,
    variableDimensions: [
      rangeNumber('spacingIrregularity', 'Spacing Irregularity', 0, 0, 1, 0.05, '0=regular … 1=irregular'),
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // V3 — Partial Density (0–100%)
  {
    id: 'music:p3-timbre:V3' as any,
    name: 'Partial Density',
    definition: 'How many of the possible partials are present. 0% = sparse (only a few). 100% = dense (all present).',
    unit: '%',
    defaultValue: 100,
    variableDimensions: [
      rangeNumber('partialDensity', 'Density', 100, 0, 100, 5, '% partials present'),
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // V4 — Component Magnitudes (-1 = weak upper, +1 = strong upper)
  {
    id: 'music:p3-timbre:V4' as any,
    name: 'Component Magnitudes',
    definition: 'Balance of energy between lower and upper partials. -1 = upper partials suppressed. +1 = upper partials boosted.',
    unit: 'balance',
    defaultValue: 0,
    variableDimensions: [
      balance('upperBalance', 'Upper Partial Balance', 'weak upper', 'strong upper'),
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // V5 — Envelope Shape (0 = smooth, 0.5 = peaked, 1 = flat)
  {
    id: 'music:p3-timbre:V5' as any,
    name: 'Spectral Envelope Shape',
    definition: 'Overall contour. 0 = smooth natural decay. 0.5 = peaked hump. 1 = flat (equal magnitudes).',
    unit: 'ratio',
    defaultValue: 0,
    variableDimensions: [
      rangeNumber('envelopeShapeValue', 'Shape (smooth→peaked→flat)', 0, 0, 1, 0.05, '0=smooth … 0.5=peaked … 1=flat'),
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // V6 — Spectral Tilt (-24 to +12 dB/oct)
  {
    id: 'music:p3-timbre:V6' as any,
    name: 'Spectral Tilt',
    definition: 'Overall slope of the spectrum. Negative = dark/warm. Positive = bright/thin.',
    unit: 'dB/octave',
    defaultValue: 0,
    variableDimensions: [
      rangeNumber('spectralTilt', 'Spectral Tilt', 0, -24, 12, 1, 'dB/octave'),
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // V7 — Band-Energy Balance (-1 = low, +1 = high)
  {
    id: 'music:p3-timbre:V7' as any,
    name: 'Band-Energy Balance',
    definition: 'Which frequency band dominates. -1 = low band. 0 = mid/balanced. +1 = high band.',
    unit: 'balance',
    defaultValue: 0,
    variableDimensions: [
      balance('bandBalanceValue', 'Band Balance', 'low', 'high'),
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // V8 — Resonance Structure (count + freq + gain + Q — all numeric)
  {
    id: 'music:p3-timbre:V8' as any,
    name: 'Resonance Structure',
    definition: 'Number, position, strength, and width of resonances (peaks).',
    unit: 'multiple',
    defaultValue: 0,
    variableDimensions: [
      rangeNumber('resonanceCount', 'Resonance Count', 3, 0, 8, 1, 'resonances'),
      rangeNumber('resonanceFreq1', 'Resonance 1 Frequency', 700, 100, 4000, 10, 'Hz'),
      rangeNumber('resonanceGain', 'Resonance Strength', 12, 0, 30, 1, 'dB'),
      rangeNumber('resonanceQ', 'Resonance Width (Q)', 3, 0.5, 20, 0.1, 'Q'),
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // V9 — Antiresonance Structure (depth + freq)
  {
    id: 'music:p3-timbre:V9' as any,
    name: 'Antiresonance Structure',
    definition: 'Depth and frequency of notches (magnitude dips) in the spectrum.',
    unit: 'multiple',
    defaultValue: 0,
    variableDimensions: [
      rangeNumber('antiresonanceDepth', 'Notch Depth', 50, 0, 100, 5, '% reduction'),
      rangeNumber('antiresonanceFreq', 'Notch Frequency', 750, 100, 4000, 10, 'Hz'),
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // V10 — Formant Pattern (genuinely categorical — 6 vowels)
  {
    id: 'music:p3-timbre:V10' as any,
    name: 'Formant Structure',
    definition: 'Whether the resonance pattern matches a vowel formant structure.',
    unit: 'category',
    defaultValue: 0,
    variableDimensions: [
      { id: 'formantPattern', label: 'Formant Pattern', kind: 'select',
        options: [
          { value: 'none', label: 'None (no vowel pattern)' },
          { value: 'a', label: 'Vowel /a/ (F1≈730, F2≈1090)' },
          { value: 'e', label: 'Vowel /e/ (F1≈530, F2≈1840)' },
          { value: 'i', label: 'Vowel /i/ (F1≈270, F2≈2290)' },
          { value: 'o', label: 'Vowel /o/ (F1≈570, F2≈840)' },
          { value: 'u', label: 'Vowel /u/ (F1≈300, F2≈870)' },
        ], defaultValue: 'none' },
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // ================================================================
  // CLUSTER 2 — SPECTRAL FINE STRUCTURE
  // ================================================================

  // V11 — Envelope Deviation (0–100%)
  {
    id: 'music:p3-timbre:V11' as any,
    name: 'Envelope Deviation',
    definition: 'How much individual partial magnitudes deviate from a smooth envelope.',
    unit: '%',
    defaultValue: 0,
    variableDimensions: [
      rangeNumber('envelopeDeviation', 'Deviation', 40, 0, 100, 5, '%'),
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // V12 — Peakiness (0–100%)
  {
    id: 'music:p3-timbre:V12' as any,
    name: 'Peakiness',
    definition: 'How peaked vs smooth the spectrum contour is.',
    unit: '%',
    defaultValue: 0,
    variableDimensions: [
      rangeNumber('peakiness', 'Peakiness', 50, 0, 100, 5, '%'),
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // V13 — Micro-Structure (0 = regular, 0.5 = jittered, 1 = comb)
  {
    id: 'music:p3-timbre:V13' as any,
    name: 'Partial Micro-Structure',
    definition: 'Fine-grained pattern: 0 = regular. 0.5 = jittered. 1 = comb-like.',
    unit: 'ratio',
    defaultValue: 0,
    variableDimensions: [
      rangeNumber('microStructureValue', 'Micro-Structure', 0, 0, 1, 0.05, '0=regular … 0.5=jittered … 1=comb'),
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // V14 — Fine-Structure Density (0–8 sub-partials)
  {
    id: 'music:p3-timbre:V14' as any,
    name: 'Fine-Structure Density',
    definition: 'Number of sub-partials added around each main partial.',
    unit: 'count',
    defaultValue: 0,
    variableDimensions: [
      rangeNumber('fineStructureDensity', 'Sub-Partials per Partial', 0, 0, 8, 1, 'sub-partials'),
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },

  // ================================================================
  // CLUSTER 3 — APERIODIC / NOISE COMPONENT
  // ================================================================

  // V15 — HNR (0–100% tonal)
  {
    id: 'music:p3-timbre:V15' as any,
    name: 'Harmonic-to-Noise Ratio',
    definition: 'Proportion of the sound that is tonal vs noisy.',
    unit: '%',
    defaultValue: 100,
    variableDimensions: [
      rangeNumber('hnr', 'HNR (tonal %)', 100, 0, 100, 5, '% tonal'),
    ],
    stimulusParameters: [
      ...commonStimulusParams,
      { id: 'noiseColour', label: 'Noise Colour (constant)', kind: 'select',
        defaultValue: 'white',
        options: [
          { value: 'white', label: 'White' },
          { value: 'pink', label: 'Pink' },
          { value: 'brown', label: 'Brown' },
        ] },
    ],
    visualisation: 'both',
  },

  // V16 — Noise Colour (-1 = brown, 0 = pink, +1 = white)
  {
    id: 'music:p3-timbre:V16' as any,
    name: 'Noise Colour',
    definition: 'Spectral slope of the noise. -1 = brown (steep, rumble). 0 = pink (natural). +1 = white (flat hiss).',
    unit: 'slope',
    defaultValue: 1,
    variableDimensions: [
      rangeNumber('noiseColourValue', 'Colour (-1=brown, 0=pink, +1=white)', 1, -1, 1, 0.05, 'brown ← → white'),
      { id: 'bandLimited', label: 'Band-Limited', kind: 'select',
        options: [{ value: 'off', label: 'Off (full spectrum)' }, { value: 'on', label: 'On (narrow band)' }],
        defaultValue: 'off' },
    ],
    stimulusParameters: [
      ...commonStimulusParams,
      { id: 'noiseAmount', label: 'Noise Amount (constant)', kind: 'number',
        defaultValue: 100, range: { min: 50, max: 100, step: 5, unit: '%', extendable: false } },
    ],
    visualisation: 'both',
  },

  // V17 — Noise Band Location (-1 = low, 0 = mid, +1 = high)
  {
    id: 'music:p3-timbre:V17' as any,
    name: 'Noise Band Location',
    definition: 'Where in the frequency spectrum the noise sits. -1 = low, 0 = mid, +1 = high.',
    unit: 'balance',
    defaultValue: 0,
    variableDimensions: [
      balance('noiseBandValue', 'Band Location', 'low', 'high'),
    ],
    stimulusParameters: [
      ...commonStimulusParams,
      { id: 'noiseColour', label: 'Noise Colour (constant)', kind: 'select',
        defaultValue: 'white',
        options: [
          { value: 'white', label: 'White' },
          { value: 'pink', label: 'Pink' },
          { value: 'brown', label: 'Brown' },
        ] },
      { id: 'noiseAmount', label: 'Noise Amount (constant)', kind: 'number',
        defaultValue: 100, range: { min: 50, max: 100, step: 5, unit: '%', extendable: false } },
    ],
    visualisation: 'both',
  },

  // V18 — Noisiness Fraction (0–100%)
  {
    id: 'music:p3-timbre:V18' as any,
    name: 'Noisiness Fraction',
    definition: 'How much of the sound is noise. 0% = pure tonal. 100% = pure noise.',
    unit: '%',
    defaultValue: 0,
    variableDimensions: [
      rangeNumber('noisinessFraction', 'Noise Fraction', 50, 0, 100, 5, '% noise'),
    ],
    stimulusParameters: [
      ...commonStimulusParams,
      { id: 'noiseColour', label: 'Noise Colour (constant)', kind: 'select',
        defaultValue: 'white',
        options: [
          { value: 'white', label: 'White' },
          { value: 'pink', label: 'Pink' },
          { value: 'brown', label: 'Brown' },
        ] },
    ],
    visualisation: 'both',
  },

  // ================================================================
  // CLUSTER 4 — PHASE / COHERENCE
  // ================================================================

  // V19 — Phase Coherence (-1 = anti-aligned, 0 = random, +1 = aligned)
  {
    id: 'music:p3-timbre:V19' as any,
    name: 'Phase Coherence',
    definition: 'How correlated partial phases are. -1 = all anti-aligned (cancellation). 0 = random. +1 = all aligned.',
    unit: 'coherence',
    defaultValue: 1,
    variableDimensions: [
      balance('phaseCoherence', 'Phase Coherence', 'anti-aligned', 'aligned'),
      { id: 'cancellationMode', label: 'Cancellation Mode', kind: 'select',
        options: [
          { value: 'none', label: 'None (no cancellation)' },
          { value: 'partial', label: 'Partial (some partials cancelled)' },
          { value: 'full', label: 'Full (odd partials cancelled)' },
        ], defaultValue: 'none' },
    ],
    stimulusParameters: commonStimulusParams,
    visualisation: 'both',
  },
];
