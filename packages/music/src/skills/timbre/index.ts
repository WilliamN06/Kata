import type { Subskill } from '@kata/core';
import { registerVariables } from '@kata/core';
import { primitiveSubskillDrills } from '../../shared/primitives';
import { TIMBRE_VARIABLES, TIMBRE_MODELS } from './variables';

registerVariables(TIMBRE_VARIABLES);

export const Timbre: Subskill = {
  id: 'music:p3-timbre' as any,
  name: 'Timbre',
  domain: 'music',
  definition: 'The capacity to perceive the steady-state spectrum: brightness, width, skew, odd/even balance, irregularity, inharmonicity, resonance, noisiness and roughness.',
  variables: TIMBRE_VARIABLES.map((v) => v.id),
  ...primitiveSubskillDrills(TIMBRE_MODELS),
};

export { TIMBRE_VARIABLES } from './variables';
