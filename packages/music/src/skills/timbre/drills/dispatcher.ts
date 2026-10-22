import type { TimbreSynthParams } from '../stimuli/timbre-synth';

export interface VariableConfig {
  variableId: string;
  question: string;
  categories: string[];
  correctAnswer: (params: TimbreSynthParams) => string;
  readout: (params: TimbreSynthParams) => Array<{ label: string; value: string }>;
}

/**
 * Derive a category label from a numeric value using a threshold table.
 * Thresholds are checked in order; the first where `value <= max` wins.
 */
type Threshold = { max: number; label: string };
function categorize(value: number, thresholds: Threshold[]): string {
  for (const t of thresholds) {
    if (value <= t.max) return t.label;
  }
  return thresholds[thresholds.length - 1].label;
}

export function getTimbreConfig(variableId: string, params: TimbreSynthParams): VariableConfig {
  const varNum = variableId.split(':').pop() || 'V1';

  switch (varNum) {
    case 'V1': {
      const t: Threshold[] = [
        { max: 0.15, label: 'Harmonic' },
        { max: 0.85, label: 'Mixed' },
        { max: Infinity, label: 'Inharmonic' },
      ];
      return {
        variableId, question: 'What is the harmonic relationship?',
        categories: ['Harmonic', 'Mixed', 'Inharmonic'],
        correctAnswer: (p) => categorize(p.inharmonicity ?? 0, t),
        readout: (p) => [{ label: 'INHARM', value: `${(p.inharmonicity ?? 0).toFixed(2)}` }],
      };
    }
    case 'V2': {
      const t: Threshold[] = [
        { max: 0.2, label: 'Regular' },
        { max: 0.5, label: 'Irregular' },
        { max: 0.8, label: 'Clustered' },
        { max: Infinity, label: 'Sparse' },
      ];
      return {
        variableId, question: 'How are the partials spaced?',
        categories: ['Regular', 'Irregular', 'Clustered', 'Sparse'],
        correctAnswer: (p) => categorize(p.spacingIrregularity ?? 0, t),
        readout: (p) => [{ label: 'IRREG', value: `${(p.spacingIrregularity ?? 0).toFixed(2)}` }],
      };
    }
    case 'V3': {
      const t: Threshold[] = [
        { max: 20, label: 'Sparse' },
        { max: 50, label: 'Moderate' },
        { max: 80, label: 'Balanced' },
        { max: Infinity, label: 'Dense' },
      ];
      return {
        variableId, question: 'How dense is the spectrum?',
        categories: ['Sparse', 'Moderate', 'Balanced', 'Dense'],
        correctAnswer: (p) => categorize(p.partialDensity ?? 100, t),
        readout: (p) => [{ label: 'DENSITY', value: `${p.partialDensity ?? 100}%` }],
      };
    }
    case 'V4': {
      const t: Threshold[] = [
        { max: -0.2, label: 'Weak upper' },
        { max: 0.2, label: 'Balanced' },
        { max: Infinity, label: 'Strong upper' },
      ];
      return {
        variableId, question: 'How are the magnitudes distributed?',
        categories: ['Weak upper', 'Balanced', 'Strong upper'],
        correctAnswer: (p) => categorize(p.upperBalance ?? 0, t),
        readout: (p) => [{ label: 'UPPER', value: (p.upperBalance ?? 0).toFixed(2) }],
      };
    }
    case 'V5': {
      const t: Threshold[] = [
        { max: 0.3, label: 'Smooth' },
        { max: 0.7, label: 'Peaked' },
        { max: Infinity, label: 'Flat' },
      ];
      return {
        variableId, question: 'What is the envelope shape?',
        categories: ['Smooth', 'Peaked', 'Flat'],
        correctAnswer: (p) => categorize(p.envelopeShapeValue ?? 0, t),
        readout: (p) => [{ label: 'SHAPE', value: (p.envelopeShapeValue ?? 0).toFixed(2) }],
      };
    }
    case 'V6': {
      const t: Threshold[] = [
        { max: -18, label: 'Very dark' },
        { max: -4, label: 'Dark' },
        { max: 4, label: 'Flat' },
        { max: 18, label: 'Bright' },
        { max: Infinity, label: 'Very bright' },
      ];
      return {
        variableId, question: 'What is the spectral tilt?',
        categories: ['Very dark', 'Dark', 'Flat', 'Bright', 'Very bright'],
        correctAnswer: (p) => categorize(p.spectralTilt ?? 0, t),
        readout: (p) => [{ label: 'TILT', value: `${p.spectralTilt ?? 0} dB/oct` }],
      };
    }
    case 'V7': {
      const t: Threshold[] = [
        { max: -0.4, label: 'Low' },
        { max: 0.4, label: 'Balanced' },
        { max: Infinity, label: 'High' },
      ];
      return {
        variableId, question: 'Which frequency band dominates?',
        categories: ['Low', 'Balanced', 'High'],
        correctAnswer: (p) => categorize(p.bandBalanceValue ?? 0, t),
        readout: (p) => [{ label: 'BAND', value: (p.bandBalanceValue ?? 0).toFixed(2) }],
      };
    }
    case 'V8': {
      const t: Threshold[] = [
        { max: 0, label: 'None' },
        { max: 1, label: 'One' },
        { max: 2, label: 'Two' },
        { max: 3, label: 'Three' },
        { max: Infinity, label: 'Four+' },
      ];
      return {
        variableId, question: 'How many resonances can you hear?',
        categories: ['None', 'One', 'Two', 'Three', 'Four+'],
        correctAnswer: (p) => categorize(p.resonanceCount ?? 0, t),
        readout: (p) => [{ label: 'RES', value: `${p.resonanceCount ?? 0}` }],
      };
    }
    case 'V9': {
      const t: Threshold[] = [
        { max: 15, label: 'No notch' },
        { max: 60, label: 'Weak notch' },
        { max: Infinity, label: 'Strong notch' },
      ];
      return {
        variableId, question: 'Is there an antiresonance (notch)?',
        categories: ['No notch', 'Weak notch', 'Strong notch'],
        correctAnswer: (p) => categorize(p.antiresonanceDepth ?? 0, t),
        readout: (p) => [{ label: 'NOTCH', value: `${p.antiresonanceDepth ?? 0}%` }],
      };
    }
    case 'V10':
      return {
        variableId, question: 'Does the formant pattern sound like a vowel?',
        categories: ['None', '/a/', '/e/', '/i/', '/o/', '/u/'],
        correctAnswer: (p) => {
          const f = p.formantPattern ?? 'none';
          return f === 'none' ? 'None' : `/${f}/`;
        },
        readout: (p) => [{ label: 'FORMANT', value: p.formantPattern ?? 'none' }],
      };
    case 'V11': {
      const t: Threshold[] = [
        { max: 15, label: 'Smooth' },
        { max: 40, label: 'Slightly irregular' },
        { max: 70, label: 'Moderately irregular' },
        { max: Infinity, label: 'Very irregular' },
      ];
      return {
        variableId, question: 'How smooth or irregular is the envelope?',
        categories: ['Smooth', 'Slightly irregular', 'Moderately irregular', 'Very irregular'],
        correctAnswer: (p) => categorize(p.envelopeDeviation ?? 0, t),
        readout: (p) => [{ label: 'DEV', value: `${p.envelopeDeviation ?? 0}%` }],
      };
    }
    case 'V12': {
      const t: Threshold[] = [
        { max: 20, label: 'Very smooth' },
        { max: 45, label: 'Slightly peaky' },
        { max: 75, label: 'Moderately peaky' },
        { max: Infinity, label: 'Very peaky' },
      ];
      return {
        variableId, question: 'How peaky is the spectrum?',
        categories: ['Very smooth', 'Slightly peaky', 'Moderately peaky', 'Very peaky'],
        correctAnswer: (p) => categorize(p.peakiness ?? 0, t),
        readout: (p) => [{ label: 'PEAK', value: `${p.peakiness ?? 0}%` }],
      };
    }
    case 'V13': {
      const t: Threshold[] = [
        { max: 0.3, label: 'Regular' },
        { max: 0.7, label: 'Jittered' },
        { max: Infinity, label: 'Comb-like' },
      ];
      return {
        variableId, question: 'What is the micro-structure?',
        categories: ['Regular', 'Jittered', 'Comb-like'],
        correctAnswer: (p) => categorize(p.microStructureValue ?? 0, t),
        readout: (p) => [{ label: 'MICRO', value: (p.microStructureValue ?? 0).toFixed(2) }],
      };
    }
    case 'V14': {
      const t: Threshold[] = [
        { max: 0, label: 'Coarse' },
        { max: 2, label: 'Moderate' },
        { max: 4, label: 'Fine' },
        { max: Infinity, label: 'Very fine' },
      ];
      return {
        variableId, question: 'How fine is the micro-structure?',
        categories: ['Coarse', 'Moderate', 'Fine', 'Very fine'],
        correctAnswer: (p) => categorize(p.fineStructureDensity ?? 0, t),
        readout: (p) => [{ label: 'SUB', value: `${p.fineStructureDensity ?? 0}` }],
      };
    }
    case 'V15': {
      const t: Threshold[] = [
        { max: 20, label: 'Very noisy' },
        { max: 40, label: 'Mostly noisy' },
        { max: 60, label: 'Mixed' },
        { max: 80, label: 'Mostly tonal' },
        { max: Infinity, label: 'Very tonal' },
      ];
      // NOTE: hnr scale is inverted — high HNR = tonal. Categories checked low→high.
      return {
        variableId, question: 'How tonal vs noisy is this sound?',
        categories: ['Very noisy', 'Mostly noisy', 'Mixed', 'Mostly tonal', 'Very tonal'],
        correctAnswer: (p) => categorize(p.hnr ?? 100, t),
        readout: (p) => [{ label: 'HNR', value: `${p.hnr ?? 100}%` }],
      };
    }
    case 'V16': {
      const t: Threshold[] = [
        { max: -0.5, label: 'Brown' },
        { max: 0.5, label: 'Pink' },
        { max: Infinity, label: 'White' },
      ];
      return {
        variableId, question: 'What colour is the noise?',
        categories: ['Brown', 'Pink', 'White', 'Band-limited'],
        correctAnswer: (p) => p.bandLimited ? 'Band-limited' : categorize(p.noiseColourValue ?? 1, t),
        readout: (p) => [{ label: 'COLOUR', value: (p.noiseColourValue ?? 1).toFixed(2) }],
      };
    }
    case 'V17': {
      const t: Threshold[] = [
        { max: -0.3, label: 'Low' },
        { max: 0.3, label: 'Mid' },
        { max: Infinity, label: 'High' },
      ];
      return {
        variableId, question: 'Which band is the noise in?',
        categories: ['Low', 'Mid', 'High'],
        correctAnswer: (p) => categorize(p.noiseBandValue ?? 0, t),
        readout: (p) => [{ label: 'BAND', value: (p.noiseBandValue ?? 0).toFixed(2) }],
      };
    }
    case 'V18': {
      const t: Threshold[] = [
        { max: 0, label: 'None' },
        { max: 40, label: 'Slight' },
        { max: 65, label: 'Moderate' },
        { max: 90, label: 'Dominant' },
        { max: Infinity, label: 'Pure noise' },
      ];
      return {
        variableId, question: 'How much of this sound is noise?',
        categories: ['None', 'Slight', 'Moderate', 'Dominant', 'Pure noise'],
        correctAnswer: (p) => categorize(p.noisinessFraction ?? 0, t),
        readout: (p) => [{ label: 'NOISE %', value: `${p.noisinessFraction ?? 0}%` }],
      };
    }
    case 'V19': {
      const t: Threshold[] = [
        { max: -0.7, label: 'Anti-aligned' },
        { max: -0.3, label: 'Partial cancellation' },
        { max: 0.3, label: 'Random' },
        { max: 0.7, label: 'Coherent' },
        { max: Infinity, label: 'Aligned' },
      ];
      return {
        variableId, question: 'What phase relationship do the partials have?',
        categories: ['Anti-aligned', 'Partial cancellation', 'Random', 'Coherent', 'Aligned'],
        correctAnswer: (p) => {
          if (p.cancellationMode === 'partial') return 'Partial cancellation';
          if (p.cancellationMode === 'full') return 'Anti-aligned';
          return categorize(p.phaseCoherence ?? 1, t);
        },
        readout: (p) => [{ label: 'PHASE', value: (p.phaseCoherence ?? 1).toFixed(2) }],
      };
    }
    default:
      return { variableId, question: 'Analyse', categories: ['A', 'B'], correctAnswer: () => 'A', readout: () => [] };
  }
}

export function buildTimbreParams(
  variableId: string,
  variableParams: Record<string, string | number>,
  stimulusParams: Record<string, string | number>
): TimbreSynthParams {
  const num = (k: string, fallback: number) => {
    const v = Number(variableParams[k]);
    return Number.isFinite(v) ? v : fallback;
  };
  const stimNum = (k: string, fallback: number) => {
    const v = Number(stimulusParams[k]);
    return Number.isFinite(v) ? v : fallback;
  };
  const str = (k: string, fallback: string) => {
    const v = variableParams[k];
    return typeof v === 'string' ? v : fallback;
  };

  // Derive categorical states from numeric balance values
  const upperBalance = num('upperBalance', 0);
  const componentMagnitudes = upperBalance < -0.2 ? 'weak_upper'
    : upperBalance > 0.2 ? 'strong_upper' : 'balanced';

  const envelopeShapeValue = num('envelopeShapeValue', 0);
  const envelopeShape = envelopeShapeValue < 0.3 ? 'smooth'
    : envelopeShapeValue < 0.7 ? 'peaked' : 'flat';

  const bandBalanceValue = num('bandBalanceValue', 0);
  const bandBalance = bandBalanceValue < -0.4 ? 'low_dominant'
    : bandBalanceValue > 0.4 ? 'high_dominant' : 'balanced';

  const spacingIrregularity = num('spacingIrregularity', 0);
  const partialSpacing = spacingIrregularity < 0.2 ? 'regular'
    : spacingIrregularity < 0.5 ? 'irregular'
    : spacingIrregularity < 0.8 ? 'clustered' : 'sparse';

  const inharmonicity = num('inharmonicity', 0);
  const partialRelationship = inharmonicity < 0.15 ? 'harmonic'
    : inharmonicity > 0.85 ? 'inharmonic' : 'mixed';

  const microStructureValue = num('microStructureValue', 0);
  const microStructure = microStructureValue < 0.3 ? 'regular'
    : microStructureValue < 0.7 ? 'jittered' : 'comb';

  // Noise colour is a numeric balance now
  const noiseColourValue = num('noiseColourValue', 1);
  const noiseColour = noiseColourValue < -0.5 ? 'brown'
    : noiseColourValue < 0.5 ? 'pink' : 'white';

  // Noise band location
  const noiseBandValue = num('noiseBandValue', 0);
  const noiseBandLocation = noiseBandValue < -0.3 ? 'low'
    : noiseBandValue > 0.3 ? 'high' : 'mid';

  // Phase
  const phaseCoherence = num('phaseCoherence', 1);
  const cancellationMode = str('cancellationMode', 'none');
  let phaseRelationship: 'aligned' | 'random' | 'anti_aligned' | 'partial_cancel' | 'full_cancel' = 'aligned';
  if (cancellationMode === 'full') phaseRelationship = 'full_cancel';
  else if (cancellationMode === 'partial') phaseRelationship = 'partial_cancel';
  else if (phaseCoherence < -0.3) phaseRelationship = 'anti_aligned';
  else if (phaseCoherence < 0.3) phaseRelationship = 'random';

  // Noisiness fraction (V18 uses its own param; V15 derives from HNR)
  const noisinessFractionRaw = variableParams['noisinessFraction'] !== undefined
    ? Number(variableParams['noisinessFraction'])
    : undefined;
  const hnr = variableParams['hnr'] !== undefined ? Number(variableParams['hnr']) : 100;

  return {
    fundamental: stimNum('fundamental', 220),
    durationMs: stimNum('durationMs', 1200),
    attackMs: stimNum('attackMs', 5),
    decayMs: 100,
    sustainLevel: 60,
    releaseMs: 100,

    inharmonicity,
    spacingIrregularity,
    partialRelationship,
    partialSpacing,
    partialDensity: num('partialDensity', 100),
    partialCount: num('partialCount', 24),

    upperBalance,
    componentMagnitudes,
    envelopeShapeValue,
    envelopeShape,
    spectralTilt: num('spectralTilt', 0),
    bandBalanceValue,
    bandBalance,

    resonanceCount: num('resonanceCount', 0),
    resonanceFreqs: [num('resonanceFreq1', 700), num('resonanceFreq2', 1500)],
    resonanceGains: [num('resonanceGain', 12), num('resonanceGain', 12)],
    resonanceQ: num('resonanceQ', 3),

    antiresonanceDepth: num('antiresonanceDepth', 0),
    antiresonanceFreq: num('antiresonanceFreq', 750),

    formantPattern: str('formantPattern', 'none') as any,

    envelopeDeviation: num('envelopeDeviation', 0),
    peakiness: num('peakiness', 0),
    microStructureValue,
    microStructure,
    fineStructureDensity: num('fineStructureDensity', 0),

    hnr: hnr,
    noisinessFraction: noisinessFractionRaw,
    noiseColourValue,
    noiseColour: noiseColour,
    bandLimited: variableParams['bandLimited'] === 'on',
    noiseBandValue,
    noiseBandLocation,
    noiseAmount: stimNum('noiseAmount', noisinessFractionRaw !== undefined ? noisinessFractionRaw : (100 - hnr)),

    phaseCoherence,
    phaseRelationship,
    cancellationMode,
    coherence: 'coherent',
  };
}
