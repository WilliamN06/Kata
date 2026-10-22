import type { Subskill, DrillDefinition } from '@kata/core';
import { MUSIC_P1_VARIABLES } from './variables';
import { MUSIC_P1_PARAMETERS } from './parameters';
import {
  V1IntervalDrill,
  V2ChordDrill,
  V3TonalCentreDrill,
  V4PitchClassDrill,
  V5ContourDrill,
  V6FusionDrill,
  V7MaskingDrill,
  V8PhraseBoundaryDrill,
  V9MicrotonalDrill,
  V10InversionDrill,
  V11EnharmonicDrill,
  V12AbsolutePitchDrill,
} from './drills';

const drills: Record<string, DrillDefinition> = {
  V1: { variableId: 'V1', renderer: V1IntervalDrill, defaultTrials: 20,
        description: 'Interval discrimination', variableParams: MUSIC_P1_PARAMETERS.V1 },
  V2: { variableId: 'V2', renderer: V2ChordDrill, defaultTrials: 20,
        description: 'Chord quality recognition', variableParams: MUSIC_P1_PARAMETERS.V2 },
  V3: { variableId: 'V3', renderer: V3TonalCentreDrill, defaultTrials: 20,
        description: 'Tonal centre perception', variableParams: MUSIC_P1_PARAMETERS.V3 },
  V4: { variableId: 'V4', renderer: V4PitchClassDrill, defaultTrials: 20,
        description: 'Pitch class recognition', variableParams: MUSIC_P1_PARAMETERS.V4 },
  V5: { variableId: 'V5', renderer: V5ContourDrill, defaultTrials: 20,
        description: 'Melodic contour perception', variableParams: MUSIC_P1_PARAMETERS.V5 },
  V6: { variableId: 'V6', renderer: V6FusionDrill, defaultTrials: 20,
        description: 'Simultaneous pitch fusion', variableParams: MUSIC_P1_PARAMETERS.V6 },
  V7: { variableId: 'V7', renderer: V7MaskingDrill, defaultTrials: 20,
        description: 'Frequency masking detection', variableParams: MUSIC_P1_PARAMETERS.V7 },
  V8: { variableId: 'V8', renderer: V8PhraseBoundaryDrill, defaultTrials: 20,
        description: 'Phrase boundary perception', variableParams: MUSIC_P1_PARAMETERS.V8 },
  V9: { variableId: 'V9', renderer: V9MicrotonalDrill, defaultTrials: 20,
        description: 'Microtonal deviation detection', variableParams: MUSIC_P1_PARAMETERS.V9 },
  V10: { variableId: 'V10', renderer: V10InversionDrill, defaultTrials: 20,
         description: 'Interval inversion recognition', variableParams: MUSIC_P1_PARAMETERS.V10 },
  V11: { variableId: 'V11', renderer: V11EnharmonicDrill, defaultTrials: 20,
         description: 'Enharmonic equivalence recognition', variableParams: MUSIC_P1_PARAMETERS.V11 },
  V12: { variableId: 'V12', renderer: V12AbsolutePitchDrill, defaultTrials: 20,
         description: 'Absolute pitch class identification', variableParams: MUSIC_P1_PARAMETERS.V12 },
};

export const P1PitchSubskill: Subskill = {
  id: 'm1-pitch',
  name: 'M1 Pitch Perception',
  domain: 'music',
  layer: 'perception',
  definition:
    'The capacity to extract fundamental frequency from sound events and classify pitch relationships — intervals, chords, tonal centres — toward accurate identification.',
  variables: MUSIC_P1_VARIABLES,
  drills,
  integrationGroups: [
    { id: 'A', variables: ['V1', 'V2', 'V3'], name: 'Interval + Chord + Tonal' },
    { id: 'B', variables: ['V4', 'V5', 'V6'], name: 'Pitch + Contour + Fusion' },
    { id: 'C', variables: ['V9', 'V10', 'V11'], name: 'Microtonal + Inversion + Enharmonic' },
  ],
};