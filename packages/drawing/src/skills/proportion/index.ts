import type { DrillDefinition, Subskill, TaskType } from '@kata/core';
import { registerVariables } from '@kata/core';
import { PROPORTION_VARIABLES } from './variables';
import { T1Categorisation } from './drills/t1-categorisation';
import { T2Discrimination } from './drills/t2-discrimination';
import { T3Estimation } from './drills/t3-estimation';
import { T4Matching } from './drills/t4-matching';
import { T5Detection } from './drills/t5-detection';
import { T6Ordering } from './drills/t6-ordering';
import { T7Identification } from './drills/t7-identification';
import { AngleT1Categorisation } from './drills/angle/t1-categorisation';
import { AngleT2Discrimination } from './drills/angle/t2-discrimination';
import { AngleT3Estimation } from './drills/angle/t3-estimation';
import { AngleT4Matching } from './drills/angle/t4-matching';
import { AngleT5Detection } from './drills/angle/t5-detection';
import { AngleT6Ordering } from './drills/angle/t6-ordering';
import { AngleT7Identification } from './drills/angle/t7-identification';

registerVariables(PROPORTION_VARIABLES);

const V1 = 'drawing:p1-proportion:V1' as const;
const V2 = 'drawing:p1-proportion:V2' as const;

const V1_DRILLS: Record<TaskType, DrillDefinition> = {
  'T1-categorisation': { variableId: V1, renderer: T1Categorisation, defaultTrials: 20 },
  'T2-discrimination': { variableId: V1, renderer: T2Discrimination, defaultTrials: 20 },
  'T3-estimation': { variableId: V1, renderer: T3Estimation, defaultTrials: 20 },
  'T4-matching': { variableId: V1, renderer: T4Matching, defaultTrials: 20 },
  'T5-detection': { variableId: V1, renderer: T5Detection, defaultTrials: 20 },
  'T6-ordering': { variableId: V1, renderer: T6Ordering, defaultTrials: 20 },
  'T7-identification': { variableId: V1, renderer: T7Identification, defaultTrials: 20 },
};

const V2_DRILLS: Record<TaskType, DrillDefinition> = {
  'T1-categorisation': { variableId: V2, renderer: AngleT1Categorisation, defaultTrials: 20 },
  'T2-discrimination': { variableId: V2, renderer: AngleT2Discrimination, defaultTrials: 20 },
  'T3-estimation': { variableId: V2, renderer: AngleT3Estimation, defaultTrials: 20 },
  'T4-matching': { variableId: V2, renderer: AngleT4Matching, defaultTrials: 20 },
  'T5-detection': { variableId: V2, renderer: AngleT5Detection, defaultTrials: 20 },
  'T6-ordering': { variableId: V2, renderer: AngleT6Ordering, defaultTrials: 20 },
  'T7-identification': { variableId: V2, renderer: AngleT7Identification, defaultTrials: 20 },
};

export const Proportion: Subskill = {
  id: 'drawing:p1-proportion',
  name: 'Proportion',
  domain: 'drawing',
  definition:
    'The capacity to perceive ratios between extents and the magnitude of angles.',
  variables: PROPORTION_VARIABLES.map((variable) => variable.id),
  drills: V1_DRILLS,
  drillsByVariable: {
    [V1]: V1_DRILLS,
    [V2]: V2_DRILLS,
  },
};

export { PROPORTION_VARIABLES } from './variables';
