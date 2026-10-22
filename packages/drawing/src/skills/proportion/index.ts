import type { Subskill } from '@kata/core';
import { registerVariables } from '@kata/core';
import { PROPORTION_VARIABLES } from './variables';
import { T1Categorisation } from './drills/t1-categorisation';
import { T2Discrimination } from './drills/t2-discrimination';
import { T3Estimation } from './drills/t3-estimation';
import { T4Matching } from './drills/t4-matching';
import { T5Detection } from './drills/t5-detection';
import { T6Ordering } from './drills/t6-ordering';
import { T7Identification } from './drills/t7-identification';

registerVariables(PROPORTION_VARIABLES);

export const Proportion: Subskill = {
  id: 'drawing:p1-proportion' as any,
  name: 'Proportion',
  domain: 'drawing',
  definition:
    'The capacity to perceive ratios between extents (two lengths compared) and angles',
  variables: PROPORTION_VARIABLES.map((v) => v.id),
  drills: {
    'T1-categorisation': { variableId: 'drawing:p1-proportion:V1' as any, renderer: T1Categorisation, defaultTrials: 20 },
    'T2-discrimination': { variableId: 'drawing:p1-proportion:V1' as any, renderer: T2Discrimination, defaultTrials: 20 },
    'T3-estimation':     { variableId: 'drawing:p1-proportion:V1' as any, renderer: T3Estimation,     defaultTrials: 20 },
    'T4-matching':       { variableId: 'drawing:p1-proportion:V1' as any, renderer: T4Matching,       defaultTrials: 20 },
    'T5-detection':      { variableId: 'drawing:p1-proportion:V1' as any, renderer: T5Detection,      defaultTrials: 20 },
    'T6-ordering':       { variableId: 'drawing:p1-proportion:V1' as any, renderer: T6Ordering,       defaultTrials: 20 },
    'T7-identification': { variableId: 'drawing:p1-proportion:V1' as any, renderer: T7Identification, defaultTrials: 20 },
  },
};


export { PROPORTION_VARIABLES } from './variables';

