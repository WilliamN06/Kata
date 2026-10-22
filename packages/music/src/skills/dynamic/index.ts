import type { Subskill } from '@kata/core';
import { registerVariables } from '@kata/core';
import { DYNAMIC_VARIABLES } from './variables';
import { T1Categorisation } from './drills/t1-categorisation';
import { T2Discrimination } from './drills/t2-discrimination';
import { T3Estimation } from './drills/t3-estimation';
import { T4Matching } from './drills/t4-matching';
import { T5Detection } from './drills/t5-detection';
import { T6Ordering } from './drills/t6-ordering';
import { T7Identification } from './drills/t7-identification';

registerVariables(DYNAMIC_VARIABLES);

export const Dynamic: Subskill = {
  id: 'music:p2-dynamic' as any,
  name: 'Dynamic',
  domain: 'music',
  definition: 'The capacity to perceive amplitude, envelope, masking, dynamic span, compression, and frequency-dependent amplitude',
  variables: DYNAMIC_VARIABLES.map((v) => v.id),
  drills: {
    'T1-categorisation': { variableId: 'music:p2-dynamic:V1' as any, renderer: T1Categorisation, defaultTrials: 20 },
    'T2-discrimination': { variableId: 'music:p2-dynamic:V1' as any, renderer: T2Discrimination, defaultTrials: 20 },
    'T3-estimation':     { variableId: 'music:p2-dynamic:V1' as any, renderer: T3Estimation,     defaultTrials: 20 },
    'T4-matching':       { variableId: 'music:p2-dynamic:V1' as any, renderer: T4Matching,       defaultTrials: 20 },
    'T5-detection':      { variableId: 'music:p2-dynamic:V1' as any, renderer: T5Detection,      defaultTrials: 20 },
    'T6-ordering':       { variableId: 'music:p2-dynamic:V1' as any, renderer: T6Ordering,       defaultTrials: 20 },
    'T7-identification': { variableId: 'music:p2-dynamic:V1' as any, renderer: T7Identification, defaultTrials: 20 },
  },
};


export { DYNAMIC_VARIABLES } from './variables';

