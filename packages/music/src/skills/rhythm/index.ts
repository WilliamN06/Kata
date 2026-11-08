import type { Subskill } from '@kata/core';
import { registerVariables } from '@kata/core';
import { RHYTHM_VARIABLES } from './variables';
import { T1Categorisation } from './drills/t1-categorisation';
import { T2Discrimination } from './drills/t2-discrimination';
import { T3Estimation } from './drills/t3-estimation';
import { T4Matching } from './drills/t4-matching';
import { T5Detection } from './drills/t5-detection';
import { T6Ordering } from './drills/t6-ordering';
import { T7Identification } from './drills/t7-identification';

registerVariables(RHYTHM_VARIABLES);

export const Rhythm: Subskill = {
  id: 'music:p4-time' as any,
  name: 'Time',
  domain: 'music',
  definition: 'The capacity to perceive temporal relationships in sound: onset timing, note duration, absence/gap, tempo, grouping, and rhythmic relationship.',
  variables: RHYTHM_VARIABLES.map((v) => v.id),
  drills: {
    'T1-categorisation': { variableId: 'music:p4-time:V1' as any, renderer: T1Categorisation, defaultTrials: 20 },
    'T2-discrimination': { variableId: 'music:p4-time:V1' as any, renderer: T2Discrimination, defaultTrials: 20 },
    'T3-estimation':     { variableId: 'music:p4-time:V1' as any, renderer: T3Estimation,     defaultTrials: 20 },
    'T4-matching':       { variableId: 'music:p4-time:V1' as any, renderer: T4Matching,       defaultTrials: 20 },
    'T5-detection':      { variableId: 'music:p4-time:V1' as any, renderer: T5Detection,      defaultTrials: 20 },
    'T6-ordering':       { variableId: 'music:p4-time:V1' as any, renderer: T6Ordering,       defaultTrials: 20 },
    'T7-identification': { variableId: 'music:p4-time:V1' as any, renderer: T7Identification, defaultTrials: 20 },
  },
  drillsByVariable: {
    'music:p4-time:V2': {
      'T1-categorisation': { variableId: 'music:p4-time:V2' as any, renderer: T1Categorisation, defaultTrials: 20 },
      'T2-discrimination': { variableId: 'music:p4-time:V2' as any, renderer: T2Discrimination, defaultTrials: 20 },
      'T3-estimation':     { variableId: 'music:p4-time:V2' as any, renderer: T3Estimation,     defaultTrials: 20 },
      'T4-matching':       { variableId: 'music:p4-time:V2' as any, renderer: T4Matching,       defaultTrials: 20 },
      'T5-detection':      { variableId: 'music:p4-time:V2' as any, renderer: T5Detection,      defaultTrials: 20 },
      'T6-ordering':       { variableId: 'music:p4-time:V2' as any, renderer: T6Ordering,       defaultTrials: 20 },
      'T7-identification': { variableId: 'music:p4-time:V2' as any, renderer: T7Identification, defaultTrials: 20 },
    },
    'music:p4-time:V3': {
      'T1-categorisation': { variableId: 'music:p4-time:V3' as any, renderer: T1Categorisation, defaultTrials: 20 },
      'T2-discrimination': { variableId: 'music:p4-time:V3' as any, renderer: T2Discrimination, defaultTrials: 20 },
      'T3-estimation':     { variableId: 'music:p4-time:V3' as any, renderer: T3Estimation,     defaultTrials: 20 },
      'T4-matching':       { variableId: 'music:p4-time:V3' as any, renderer: T4Matching,       defaultTrials: 20 },
      'T5-detection':      { variableId: 'music:p4-time:V3' as any, renderer: T5Detection,      defaultTrials: 20 },
      'T6-ordering':       { variableId: 'music:p4-time:V3' as any, renderer: T6Ordering,       defaultTrials: 20 },
      'T7-identification': { variableId: 'music:p4-time:V3' as any, renderer: T7Identification, defaultTrials: 20 },
    },
  },
};

export { RHYTHM_VARIABLES } from './variables';
