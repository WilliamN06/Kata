interface SkillDomain {
  id: string;
  name: string;
  subskills: any[];
  integrationGroups: any[];
}
import type { Variable, Subskill } from '@kata/core';
import {
  Proportion,
  Colour,
  PROPORTION_VARIABLES,
  COLOUR_VARIABLES,
} from '@kata/drawing';
import {
  Pitch,
  Dynamic,
  Timbre,
  Rhythm,
  Spatial,
  PITCH_VARIABLES,
  DYNAMIC_VARIABLES,
  TIMBRE_VARIABLES,
  RHYTHM_VARIABLES,
  SPATIAL_VARIABLES,
} from '@kata/music'
;

export const ALL_VARIABLES: Variable[] = [
  ...PROPORTION_VARIABLES,
  ...COLOUR_VARIABLES,
  ...PITCH_VARIABLES,
    ...DYNAMIC_VARIABLES,
  ...TIMBRE_VARIABLES,
  ...RHYTHM_VARIABLES,
  ...SPATIAL_VARIABLES,
];

export const VARIABLE_REGISTRY: Record<string, Variable> = Object.fromEntries(
  ALL_VARIABLES.map((v) => [v.id, v])
);

export function getVariable(id: string): Variable | undefined {
  return VARIABLE_REGISTRY[id];
}

export const DRAWING_SUBSKILLS: Subskill[] = [Proportion, Colour];
export const MUSIC_SUBSKILLS: Subskill[] = [Pitch, Dynamic, Timbre, Rhythm, Spatial];

export const DRAWING: SkillDomain = {
  id: 'drawing',
  name: 'Drawing',
  subskills: DRAWING_SUBSKILLS,
  integrationGroups: [],
};

export const MUSIC: SkillDomain = {
  id: 'music',
  name: 'Music',
  subskills: MUSIC_SUBSKILLS,
  integrationGroups: [],
};

export const ALL_DOMAINS: SkillDomain[] = [DRAWING, MUSIC];

export function getSubskill(domainId: string, subskillId: string | undefined): Subskill | undefined {
  const d = ALL_DOMAINS.find((x) => x.id === domainId);
  return d?.subskills.find((s) => s.id === subskillId);
}

export function getDomain(id: string): SkillDomain | undefined {
  return ALL_DOMAINS.find((d) => d.id === id);
}

// -----------------------------------------------------------------
// PICKER HELPERS — used by DrillPicker
// -----------------------------------------------------------------

export function getSubskillsByDomain(domain: 'drawing' | 'music'): Subskill[] {
  return domain === 'drawing' ? DRAWING_SUBSKILLS : MUSIC_SUBSKILLS;
}

export function getVariablesForSubskill(subskillId: string): Variable[] {
  const domainId = subskillId.split(':')[0];
  const subskill = getSubskill(domainId, subskillId);
  if (!subskill) return [];
  return subskill.variables
    .map((id) => getVariable(id as string))
    .filter((v): v is Variable => Boolean(v));
}

export function getTaskTypes(): Array<{ id: string; label: string }> {
  return [
    { id: 'T1-categorisation', label: 'T1 · Categorisation' },
    { id: 'T2-discrimination', label: 'T2 · Discrimination' },
    { id: 'T3-estimation',     label: 'T3 · Estimation' },
    { id: 'T4-matching',       label: 'T4 · Matching' },
    { id: 'T5-detection',      label: 'T5 · Detection' },
    { id: 'T6-ordering',       label: 'T6 · Ordering' },
    { id: 'T7-identification', label: 'T7 · Identification' },
  ];
}





