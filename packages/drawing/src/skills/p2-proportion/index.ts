import type { Subskill, DrillDefinition } from '@kata/core';
import { P2_VARIABLES } from './variables';

import { V1RatioDrill } from './drills/v1-ratio';
import { V2ReferenceUnitDrill } from './drills/v2-reference-unit';
import { V3DirectionDrill } from './drills/v3-direction';
import { V4MagnitudeDrill } from './drills/v4-magnitude';
import { V5DistanceDrill } from './drills/v5-distance';
import { V6PartWholeDrill } from './drills/v6-part-whole';
import { V7CrossDimensionDrill } from './drills/v7-cross-dimension';
import { V8MemoryDrill } from './drills/v8-memory';
import { V9ContextDrill } from './drills/v9-context';
import { V10ScaleDrill } from './drills/v10-scale';
import { V11PositionDrill } from './drills/v11-position';
import { V12SymmetryDrill } from './drills/v12-symmetry';
import { GroupADrill } from './integration/group-a';
import { GroupBDrill } from './integration/group-b';
import { GroupCDrill } from './integration/group-c';

const drills: Record<string, DrillDefinition> = {
  V1: { variableId: 'V1', renderer: V1RatioDrill, defaultTrials: 20, description: 'Estimate the ratio A:B between two extents' },
  V2: { variableId: 'V2', renderer: V2ReferenceUnitDrill, defaultTrials: 10, description: 'Establish a reference unit and count a figure in units' },
  V3: { variableId: 'V3', renderer: V3DirectionDrill, defaultTrials: 10, description: 'Judge whether A:B and B:A are the same ratio (reciprocity)' },
  V4: { variableId: 'V4', renderer: V4MagnitudeDrill, defaultTrials: 10, description: 'Estimate extreme ratios that are typically underestimated' },
  V5: { variableId: 'V5', renderer: V5DistanceDrill, defaultTrials: 10, description: 'Extract a distance between two points and reproduce it' },
  V6: { variableId: 'V6', renderer: V6PartWholeDrill, defaultTrials: 10, description: 'Judge a part as a fraction of the whole' },
  V7: { variableId: 'V7', renderer: V7CrossDimensionDrill, defaultTrials: 10, description: 'Judge H:W (cross-dimension) ratios' },
  V8: { variableId: 'V8', renderer: V8MemoryDrill, defaultTrials: 10, description: 'Memorize a ratio, hold through delay, reconstruct it' },
  V9: { variableId: 'V9', renderer: V9ContextDrill, defaultTrials: 10, description: 'Judge a ratio amid distracting ratios' },
  V10: { variableId: 'V10', renderer: V10ScaleDrill, defaultTrials: 10, description: 'Judge the same ratio at different scales' },
  V11: { variableId: 'V11', renderer: V11PositionDrill, defaultTrials: 10, description: 'Locate midpoints, thirds, quarters, and golden points' },
  V12: { variableId: 'V12', renderer: V12SymmetryDrill, defaultTrials: 10, description: 'Detect ratio-based symmetry in shapes' },
  GroupA: { variableId: 'GroupA', renderer: GroupADrill, defaultTrials: 5, description: 'Units + Extreme ratio + H:W integration' },
  GroupB: { variableId: 'GroupB', renderer: GroupBDrill, defaultTrials: 5, description: 'Part-whole + Position + Symmetry integration' },
  GroupC: { variableId: 'GroupC', renderer: GroupCDrill, defaultTrials: 5, description: 'Direction + Distance + Context integration' },
};

export const P2Proportion: Subskill = {
  id: 'p2-proportion',
  name: 'P2 Proportion',
  domain: 'drawing',
  layer: 'perception',
  definition:
    'The skill of perceiving ratios between two extents — such that proportional relationships (A:B), reference units, fractions of a whole, and positions along a line can be accurately estimated without mechanical measurement.',
  variables: P2_VARIABLES,
  drills,
  integrationGroups: [
    { id: 'A', variables: ['V2', 'V4', 'V7'], name: 'Units + Extreme Ratio + Cross-dimension' },
    { id: 'B', variables: ['V6', 'V11', 'V12'], name: 'Part-whole + Position + Symmetry' },
    { id: 'C', variables: ['V3', 'V5', 'V9'], name: 'Direction + Distance + Context' },
  ],
};