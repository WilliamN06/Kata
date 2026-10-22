import type { Subskill } from '@kata/core';
import { T1Categorisation } from './drills/t1-categorisation';
import { T2Discrimination } from './drills/t2-discrimination';
import { T3Estimation } from './drills/t3-estimation';
import { T4Matching } from './drills/t4-matching';
import { T5Detection } from './drills/t5-detection';
import { T6Ordering } from './drills/t6-ordering';
import { T7Identification } from './drills/t7-identification';

export const Timbre: Subskill = {
  id: 'music:p3-timbre',
  name: 'Timbre',
  domain: 'music',
  definition: 'Perceive spectral content — magnitude distribution, fine structure, aperiodic components, and phase coherence',
  variables: [
    'music:p3-timbre:V1' as any, 'music:p3-timbre:V2' as any,
    'music:p3-timbre:V3' as any, 'music:p3-timbre:V4' as any,
    'music:p3-timbre:V5' as any, 'music:p3-timbre:V6' as any,
    'music:p3-timbre:V7' as any, 'music:p3-timbre:V8' as any,
    'music:p3-timbre:V9' as any, 'music:p3-timbre:V10' as any,
    'music:p3-timbre:V11' as any, 'music:p3-timbre:V12' as any,
    'music:p3-timbre:V13' as any, 'music:p3-timbre:V14' as any,
    'music:p3-timbre:V15' as any, 'music:p3-timbre:V16' as any,
  ],
  drills: {
    'T1-categorisation': { variableId: 'music:p3-timbre:V1' as any, renderer: T1Categorisation, defaultTrials: 20 },
    'T2-discrimination': { variableId: 'music:p3-timbre:V1' as any, renderer: T2Discrimination, defaultTrials: 20 },
    'T3-estimation':     { variableId: 'music:p3-timbre:V1' as any, renderer: T3Estimation,     defaultTrials: 20 },
    'T4-matching':       { variableId: 'music:p3-timbre:V1' as any, renderer: T4Matching,       defaultTrials: 20 },
    'T5-detection':      { variableId: 'music:p3-timbre:V1' as any, renderer: T5Detection,      defaultTrials: 20 },
    'T6-ordering':       { variableId: 'music:p3-timbre:V1' as any, renderer: T6Ordering,       defaultTrials: 20 },
    'T7-identification': { variableId: 'music:p3-timbre:V1' as any, renderer: T7Identification, defaultTrials: 20 },
  },
};


export { TIMBRE_VARIABLES } from './variables';

