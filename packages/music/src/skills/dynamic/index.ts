import type { Subskill } from '@kata/core';
import { registerVariables } from '@kata/core';
import { primitiveSubskillDrills } from '../../shared/primitives';
import { DYNAMIC_VARIABLES, DYNAMIC_MODELS } from './variables';

registerVariables(DYNAMIC_VARIABLES);

export const Dynamic: Subskill = {
  id: 'music:p2-dynamic' as any,
  name: 'Amplitude',
  domain: 'music',
  definition: 'The capacity to perceive level and how level changes over time.',
  variables: DYNAMIC_VARIABLES.map((v) => v.id),
  ...primitiveSubskillDrills(DYNAMIC_MODELS),
};

export { DYNAMIC_VARIABLES } from './variables';
