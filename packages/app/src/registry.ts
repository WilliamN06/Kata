import type { Subskill, SkillDomain } from '@kata/core';
import { P1Angle, P2Proportion, P3Value } from '@kata/drawing';
import { P1PitchSubskill } from '@kata/music';

export const DRAWING_SUBSKILLS: Subskill[] = [P1Angle, P2Proportion, P3Value];
export const MUSIC_SUBSKILLS: Subskill[] = [P1PitchSubskill];

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

export function getDomain(id: string): SkillDomain | undefined {
  return ALL_DOMAINS.find((d) => d.id === id);
}

export function getSubskill(
  domainId: string,
  subskillId: string
): Subskill | undefined {
  const domain = getDomain(domainId);
  return domain?.subskills.find((s) => s.id === subskillId);
}

export function getSubskillById(subskillId: string): Subskill | undefined {
  for (const domain of ALL_DOMAINS) {
    const found = domain.subskills.find((s) => s.id === subskillId);
    if (found) return found;
  }
  return undefined;
}