import type { Subskill, DrillDefinition } from '@kata/core';
import { P1_VARIABLES } from './variables';

import { V1VerticalDrill } from './drills/v1-vertical';
import { V2HorizontalDrill } from './drills/v2-horizontal';
import { V3DifferenceDrill } from './drills/v3-difference';
import { V4DirectionDrill } from './drills/v4-direction';
import { V5ReferenceDrill } from './drills/v5-reference';
import { V6MagnitudeDrill } from './drills/v6-magnitude';
import { V7ContextDrill } from './drills/v7-context';
import { V8MemoryDrill } from './drills/v8-memory';
import { V9TransferDrill } from './drills/v9-transfer';
import { V10SymmetryDrill } from './drills/v10-symmetry';
import { GroupADrill } from './integration/group-a';
import { GroupBDrill } from './integration/group-b';
import { GroupCDrill } from './integration/group-c';

const drills: Record<string, DrillDefinition> = {
  V1: { variableId: 'V1', renderer: V1VerticalDrill, defaultTrials: 20, description: 'Judge deviation from true vertical' },
  V2: { variableId: 'V2', renderer: V2HorizontalDrill, defaultTrials: 20, description: 'Judge deviation from true horizontal' },
  V3: { variableId: 'V3', renderer: V3DifferenceDrill, defaultTrials: 20, description: 'Judge angle between two lines' },
  V4: { variableId: 'V4', renderer: V4DirectionDrill, defaultTrials: 20, description: 'Judge which way a line tilts' },
  V5: { variableId: 'V5', renderer: V5ReferenceDrill, defaultTrials: 10, description: 'Identify the vertical reference line among distractors' },
  V6: { variableId: 'V6', renderer: V6MagnitudeDrill, defaultTrials: 20, description: 'Classify angle as acute, right, obtuse, or reflex' },
  V7: { variableId: 'V7', renderer: V7ContextDrill, defaultTrials: 10, description: 'Judge angle despite distracting context lines' },
  V8: { variableId: 'V8', renderer: V8MemoryDrill, defaultTrials: 10, description: 'Memorize angle, hold through delay, recall on slider' },
  V9: { variableId: 'V9', renderer: V9TransferDrill, defaultTrials: 20, description: 'Judge same angle at different scales' },
  V10: { variableId: 'V10', renderer: V10SymmetryDrill, defaultTrials: 20, description: 'Detect symmetry in a shape' },
  GroupA: { variableId: 'GroupA', renderer: GroupADrill, defaultTrials: 5, description: 'Vertical + Horizontal + Difference integration' },
  GroupB: { variableId: 'GroupB', renderer: GroupBDrill, defaultTrials: 5, description: 'Direction + Reference + Magnitude integration' },
  GroupC: { variableId: 'GroupC', renderer: GroupCDrill, defaultTrials: 5, description: 'Context + Memory + Transfer integration' },
};

export const P1Angle: Subskill = {
  id: 'p1-angle',
  name: 'P1 Angle',
  domain: 'drawing',
  layer: 'perception',
  definition:
    'The skill of perceiving angular relationships — direction, magnitude, and relationships between lines.',
  variables: P1_VARIABLES,
  drills,
  integrationGroups: [
    { id: 'A', variables: ['V1', 'V2', 'V3'], name: 'Vertical + Horizontal + Difference' },
    { id: 'B', variables: ['V4', 'V5', 'V6'], name: 'Direction + Reference + Magnitude' },
    { id: 'C', variables: ['V7', 'V8', 'V9'], name: 'Context + Memory + Transfer' },
  ],
};