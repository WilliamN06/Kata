import type { Subskill, DrillDefinition } from '@kata/core';
import { P3_VARIABLES } from './variables';

import { V1JNDDrill } from './drills/v1-jnd';
import { V2RangeDrill } from './drills/v2-range';
import { V3ContrastDrill } from './drills/v3-contrast';
import { V4AdaptationDrill } from './drills/v4-adaptation';
import { V5ConstancyDrill } from './drills/v5-constancy';
import { V6MachDrill } from './drills/v6-mach';
import { V7OrderingDrill } from './drills/v7-ordering';
import { V8MatchingDrill } from './drills/v8-matching';
import { V9ContextDrill } from './drills/v9-context';
import { V10MemoryDrill } from './drills/v10-memory';
import { V11BackgroundDrill } from './drills/v11-background';
import { V12ColourDrill } from './drills/v12-colour';

const drills: Record<string, DrillDefinition> = {
  V1: { variableId: 'V1', renderer: V1JNDDrill, defaultTrials: 20, description: 'Detect the smallest value difference between two samples; JND calibration matches difference to scale' },
  V2: { variableId: 'V2', renderer: V2RangeDrill, defaultTrials: 10, description: 'Identify darkest and lightest patches in a scene, then match true extremes to a value scale' },
  V3: { variableId: 'V3', renderer: V3ContrastDrill, defaultTrials: 10, description: 'Judge whether the same gray value appears different on black vs white backgrounds (simultaneous contrast)' },
  V4: { variableId: 'V4', renderer: V4AdaptationDrill, defaultTrials: 5, description: 'Adapt to bright or dark field for 5 seconds, then judge a mid-gray value on a scale' },
  V5: { variableId: 'V5', renderer: V5ConstancyDrill, defaultTrials: 10, description: 'Identify true value of white paper seen in shadow vs light (lightness constancy)' },
  V6: { variableId: 'V6', renderer: V6MachDrill, defaultTrials: 10, description: 'Compare edge vs middle of a gradient; ignore Mach band illusion to judge true values' },
  V7: { variableId: 'V7', renderer: V7OrderingDrill, defaultTrials: 5, description: 'Sort 5 values lightest-to-darkest (7A) or insert a missing value into a sequence (7B)' },
  V8: { variableId: 'V8', renderer: V8MatchingDrill, defaultTrials: 20, description: 'Match a target tone to the closest step on a 10-step value scale' },
  V9: { variableId: 'V9', renderer: V9ContextDrill, defaultTrials: 10, description: 'Judge a value in a textured scene, then squint to blur detail and re-judge consistently' },
  V10: { variableId: 'V10', renderer: V10MemoryDrill, defaultTrials: 10, description: 'Memorize a value for 3 seconds, hold through a delay, then recall it on a scale' },
  V11: { variableId: 'V11', renderer: V11BackgroundDrill, defaultTrials: 10, description: 'Judge the same value on light and dark backgrounds; consistency means background independence' },
  V12: { variableId: 'V12', renderer: V12ColourDrill, defaultTrials: 20, description: 'Judge value of coloured samples by squinting (12A), then recall inherent hue values from memory (12B)' },
};

export const P3Value: Subskill = {
  id: 'p3-value',
  name: 'P3 Value',
  domain: 'drawing',
  layer: 'perception',
  definition:
    'The skill of perceiving discrete steps on a luminance continuum from minimum to maximum — such that differences in lightness/darkness between adjacent areas, or between a tone and a reference scale, can be accurately detected, compared, and matched without mechanical measurement.',
  variables: P3_VARIABLES,
  drills,
  integrationGroups: [
    { id: 'A', variables: ['V1', 'V3', 'V11'], name: 'JND + Contrast + Background' },
    { id: 'B', variables: ['V2', 'V5', 'V7'], name: 'Range + Constancy + Ordering' },
    { id: 'C', variables: ['V6', 'V8', 'V9'], name: 'Mach + Matching + Context' },
  ],
};