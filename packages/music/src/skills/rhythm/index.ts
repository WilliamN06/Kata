import type { Subskill } from '@kata/core';
import { registerVariables } from '@kata/core';
import { primitiveSubskillDrills } from '../../shared/primitives';
import { RHYTHM_VARIABLES, RHYTHM_MODELS } from './variables';

registerVariables(RHYTHM_VARIABLES);

export const Rhythm: Subskill = {
  id: 'music:p4-time' as any,
  name: 'Time',
  domain: 'music',
  definition: 'The capacity to perceive how long sounds and silences last.',
  variables: RHYTHM_VARIABLES.map((v) => v.id),
  ...primitiveSubskillDrills(RHYTHM_MODELS),
};

export { RHYTHM_VARIABLES } from './variables';
