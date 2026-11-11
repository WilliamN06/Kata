import type { Subskill } from '@kata/core';
import { registerVariables } from '@kata/core';
import { primitiveSubskillDrills } from '../../shared/primitives';
import { PITCH_VARIABLES, PITCH_MODELS } from './variables';

registerVariables(PITCH_VARIABLES);

export const Pitch: Subskill = {
  id: 'music:p1-pitch' as any,
  name: 'Pitch',
  domain: 'music',
  definition: 'The capacity to perceive pitch height and the interval between two pitches.',
  variables: PITCH_VARIABLES.map((v) => v.id),
  ...primitiveSubskillDrills(PITCH_MODELS),
};

export { PITCH_VARIABLES } from './variables';
