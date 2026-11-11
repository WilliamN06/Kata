import type { Subskill } from '@kata/core';
import { registerVariables } from '@kata/core';
import { primitiveSubskillDrills } from '../../shared/primitives';
import { SPATIAL_VARIABLES, SPATIAL_MODELS } from './variables';

registerVariables(SPATIAL_VARIABLES);

export const Spatial: Subskill = {
  id: 'music:p5-spatial' as any,
  name: 'Spatial',
  domain: 'music',
  definition: 'The capacity to perceive interaural level, interaural time, width and wetness.',
  variables: SPATIAL_VARIABLES.map((v) => v.id),
  ...primitiveSubskillDrills(SPATIAL_MODELS),
};

export { SPATIAL_VARIABLES } from './variables';
