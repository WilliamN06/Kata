import type { Subskill } from '@kata/core';

// V1 Pitch Value
import { V1_T1 } from './drills/v1-t1';
import { V1_T2 } from './drills/v1-t2';
import { V1_T3 } from './drills/v1-t3';
import { V1_T4 } from './drills/v1-t4';
import { V1_T5 } from './drills/v1-t5';
import { V1_T6 } from './drills/v1-t6';
import { V1_T7 } from './drills/v1-t7';

// V2 Interval
import { V2_T1 } from './drills/v2-t1';
import { V2_T2 } from './drills/v2-t2';
import { V2_T3 } from './drills/v2-t3';
import { V2_T4 } from './drills/v2-t4';
import { V2_T5 } from './drills/v2-t5';
import { V2_T6 } from './drills/v2-t6';
import { V2_T7 } from './drills/v2-t7';

// V3 Chord
import { V3_T1 } from './drills/v3-t1';
import { V3_T2 } from './drills/v3-t2';
import { V3_T3 } from './drills/v3-t3';
import { V3_T4 } from './drills/v3-t4';
import { V3_T5 } from './drills/v3-t5';
import { V3_T6 } from './drills/v3-t6';
import { V3_T7 } from './drills/v3-t7';

/**
 * Pitch subskill — 3 variables × 7 task types = 21 distinct drills.
 *
 * DrillScreen routes by (variableId, taskType). If drillsByVariable exists
 * on the subskill, DrillScreen uses it; otherwise falls back to `drills`
 * (which is required by the Subskill type).
 */
export const Pitch: Subskill & { drillsByVariable?: Record<string, Record<string, any>> } = {
  id: 'music:p1-pitch',
  name: 'Pitch',
  domain: 'music',
  definition: 'Perceive pitch value, intervals, and chords',
  variables: [
    'music:p1-pitch:V1' as any,
    'music:p1-pitch:V2' as any,
    'music:p1-pitch:V3' as any,
  ],
  drills: {
    'T1-categorisation': { variableId: 'music:p1-pitch:V1' as any, renderer: V1_T1, defaultTrials: 20 },
    'T2-discrimination': { variableId: 'music:p1-pitch:V1' as any, renderer: V1_T2, defaultTrials: 20 },
    'T3-estimation':     { variableId: 'music:p1-pitch:V1' as any, renderer: V1_T3, defaultTrials: 20 },
    'T4-matching':       { variableId: 'music:p1-pitch:V1' as any, renderer: V1_T4, defaultTrials: 20 },
    'T5-detection':      { variableId: 'music:p1-pitch:V1' as any, renderer: V1_T5, defaultTrials: 20 },
    'T6-ordering':       { variableId: 'music:p1-pitch:V1' as any, renderer: V1_T6, defaultTrials: 20 },
    'T7-identification': { variableId: 'music:p1-pitch:V1' as any, renderer: V1_T7, defaultTrials: 20 },
  } as any,
  drillsByVariable: {
    'music:p1-pitch:V1': {
      'T1-categorisation': V1_T1,
      'T2-discrimination': V1_T2,
      'T3-estimation':     V1_T3,
      'T4-matching':       V1_T4,
      'T5-detection':      V1_T5,
      'T6-ordering':       V1_T6,
      'T7-identification': V1_T7,
    },
    'music:p1-pitch:V2': {
      'T1-categorisation': V2_T1,
      'T2-discrimination': V2_T2,
      'T3-estimation':     V2_T3,
      'T4-matching':       V2_T4,
      'T5-detection':      V2_T5,
      'T6-ordering':       V2_T6,
      'T7-identification': V2_T7,
    },
    'music:p1-pitch:V3': {
      'T1-categorisation': V3_T1,
      'T2-discrimination': V3_T2,
      'T3-estimation':     V3_T3,
      'T4-matching':       V3_T4,
      'T5-detection':      V3_T5,
      'T6-ordering':       V3_T6,
      'T7-identification': V3_T7,
    },
  },
};

export { PITCH_VARIABLES } from './variables';
