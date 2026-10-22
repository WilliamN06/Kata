import type { VariableParameters, VariableDimension } from '@kata/core';
import {
  STIMULUS_BASE,
  TASK_BASE,
  RATIO_RANGE_OVERRIDES,
  DISTANCE_RANGE_OVERRIDES,
  POSITION_RANGE_OVERRIDES,
  FRACTION_RANGE_OVERRIDES,
  ASYMMETRY_RANGE_OVERRIDES,
} from './p2-params';

// ─────────────────────────────────────────────────────────────
// Shared orientation dimension (used by V1, V4, V8, V9, V10)
// ─────────────────────────────────────────────────────────────
const ORIENTATION: VariableDimension = {
  id: 'orientation',
  label: 'Orientation',
  kind: 'select',
  defaultValue: 'horizontal',
  options: [
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'vertical', label: 'Vertical' },
    { value: 'random', label: 'Random' },
  ],
};

// ─────────────────────────────────────────────────────────────
// V1 — Ratio Perception
// ─────────────────────────────────────────────────────────────
const V1: VariableDimension[] = [
  {
    id: 'ratioRange',
    label: 'Ratio Range Preset',
    kind: 'select',
    defaultValue: 'moderate',
    options: [
      { value: 'narrow', label: 'Narrow (1:1–1:3)' },
      { value: 'moderate', label: 'Moderate (1:1–1:6)' },
      { value: 'wide', label: 'Wide (1:1–1:10)' },
      { value: 'random', label: 'Random' },
    ],
  },
  ...RATIO_RANGE_OVERRIDES,
  ORIENTATION,
  {
    id: 'direction',
    label: 'Direction',
    kind: 'select',
    defaultValue: 'random',
    options: [
      { value: 'a-to-b', label: 'A is longer' },
      { value: 'b-to-a', label: 'B is longer' },
      { value: 'random', label: 'Random' },
    ],
  },
  {
    id: 'displayStyle',
    label: 'Display Style',
    kind: 'select',
    defaultValue: 'two-bars',
    options: [
      { value: 'two-bars', label: 'Two bars' },
      { value: 'grid', label: 'Grid' },
      { value: 'random', label: 'Random' },
    ],
  },
];
export const V1_PARAMETERS: VariableParameters = {
  variableId: 'V1',
  summary: 'Estimate the ratio A:B between two extents.',
  dimensions: [...V1, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V2 — Reference Unit Establishment
// ─────────────────────────────────────────────────────────────
const V2: VariableDimension[] = [
  {
    id: 'unitType',
    label: 'Unit Type',
    kind: 'select',
    defaultValue: 'length',
    options: [
      { value: 'length', label: 'Length' },
      { value: 'area', label: 'Area' },
      { value: 'volume', label: 'Volume' },
    ],
  },
  {
    id: 'unitSizePct',
    label: 'Unit Size (% of canvas)',
    kind: 'range',
    defaultValue: 10,
    range: { min: 3, max: 30, step: 1 },
  },
  {
    id: 'countMin',
    label: 'Min Units',
    kind: 'range',
    defaultValue: 3,
    range: { min: 2, max: 12, step: 1 },
  },
  {
    id: 'countMax',
    label: 'Max Units',
    kind: 'range',
    defaultValue: 9,
    range: { min: 2, max: 12, step: 1 },
  },
  {
    id: 'figureComplexity',
    label: 'Figure Complexity',
    kind: 'select',
    defaultValue: 'moderate',
    options: [
      { value: 'simple', label: 'Simple (1 column)' },
      { value: 'moderate', label: 'Moderate (stacked)' },
      { value: 'complex', label: 'Complex (interleaved)' },
    ],
  },
  {
    id: 'showUnitMarker',
    label: 'Show Unit Marker',
    kind: 'toggle',
    defaultValue: true,
  },
];
export const V2_PARAMETERS: VariableParameters = {
  variableId: 'V2',
  summary: 'Establish a reference unit and count a figure in units.',
  dimensions: [...V2, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V3 — Comparison Direction Bias
// ─────────────────────────────────────────────────────────────
const V3: VariableDimension[] = [
  {
    id: 'ratioRange',
    label: 'Ratio Range Preset',
    kind: 'select',
    defaultValue: 'moderate',
    options: [
      { value: 'near-1:1', label: 'Near 1:1' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'extreme', label: 'Extreme' },
      { value: 'random', label: 'Random' },
    ],
  },
  ...RATIO_RANGE_OVERRIDES,
  {
    id: 'presentation',
    label: 'Presentation',
    kind: 'select',
    defaultValue: 'side-by-side',
    options: [
      { value: 'side-by-side', label: 'Side by side' },
      { value: 'sequential', label: 'Sequential' },
      { value: 'random', label: 'Random' },
    ],
  },
  {
    id: 'labelPosition',
    label: 'Label Position',
    kind: 'select',
    defaultValue: 'left-right',
    options: [
      { value: 'left-right', label: 'Left / right' },
      { value: 'top-bottom', label: 'Top / bottom' },
      { value: 'random', label: 'Random' },
    ],
  },
];
export const V3_PARAMETERS: VariableParameters = {
  variableId: 'V3',
  summary: 'Judge whether A:B and B:A are the same ratio.',
  dimensions: [...V3, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V4 — Magnitude Effect
// ─────────────────────────────────────────────────────────────
const V4: VariableDimension[] = [
  {
    id: 'ratioRange',
    label: 'Magnitude Preset',
    kind: 'select',
    defaultValue: 'extreme',
    options: [
      { value: 'moderate', label: 'Moderate (1:3–1:5)' },
      { value: 'extreme', label: 'Extreme (1:6–1:10)' },
      { value: 'full', label: 'Full (1:2–1:10)' },
      { value: 'random', label: 'Random' },
    ],
  },
  ...RATIO_RANGE_OVERRIDES,
  ORIENTATION,
  {
    id: 'type',
    label: 'Type',
    kind: 'select',
    defaultValue: 'linear',
    options: [
      { value: 'linear', label: 'Linear (dot pair)' },
      { value: 'area', label: 'Area' },
      { value: 'volume', label: 'Volume' },
    ],
  },
  {
    id: 'showHelper',
    label: 'Show Helper',
    kind: 'toggle',
    defaultValue: false,
  },
  {
    id: 'helperStyle',
    label: 'Helper Style',
    kind: 'select',
    defaultValue: 'intermediate-steps',
    options: [
      { value: 'intermediate-steps', label: 'Intermediate steps' },
      { value: 'reference-lines', label: 'Reference lines' },
      { value: 'grid-overlay', label: 'Grid overlay' },
    ],
  },
];
export const V4_PARAMETERS: VariableParameters = {
  variableId: 'V4',
  summary: 'Estimate extreme ratios that are typically underestimated.',
  dimensions: [...V4, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V5 — Distance Extraction
// ─────────────────────────────────────────────────────────────
const V5: VariableDimension[] = [
  {
    id: 'distanceRange',
    label: 'Distance Preset',
    kind: 'select',
    defaultValue: 'medium',
    options: [
      { value: 'short', label: 'Short (5–20% of canvas)' },
      { value: 'medium', label: 'Medium (15–45%)' },
      { value: 'long', label: 'Long (35–70%)' },
      { value: 'full', label: 'Full (5–70%)' },
      { value: 'random', label: 'Random' },
    ],
  },
  ...DISTANCE_RANGE_OVERRIDES,
  {
    id: 'direction',
    label: 'Direction',
    kind: 'select',
    defaultValue: 'random',
    options: [
      { value: 'horizontal', label: 'Horizontal' },
      { value: 'vertical', label: 'Vertical' },
      { value: 'diagonal', label: 'Diagonal' },
      { value: 'random', label: 'Random' },
    ],
  },
  {
    id: 'endpointClarity',
    label: 'Endpoint Clarity',
    kind: 'select',
    defaultValue: 'clear',
    options: [
      { value: 'clear', label: 'Clear dots' },
      { value: 'subtle', label: 'Subtle marks' },
      { value: 'random', label: 'Random' },
    ],
  },
];
export const V5_PARAMETERS: VariableParameters = {
  variableId: 'V5',
  summary: 'Extract a distance and reproduce it in a full-viewport canvas.',
  dimensions: [...V5, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V6 — Part-Whole Integration
// ─────────────────────────────────────────────────────────────
const V6: VariableDimension[] = [
  {
    id: 'fractionSet',
    label: 'Fraction Set',
    kind: 'select',
    defaultValue: 'mixed',
    options: [
      { value: 'halves', label: 'Halves only' },
      { value: 'thirds', label: 'Thirds' },
      { value: 'quarters', label: 'Quarters' },
      { value: 'mixed', label: 'Mixed' },
    ],
  },
  ...FRACTION_RANGE_OVERRIDES,
  {
    id: 'wholeSizePct',
    label: 'Whole Size (% of canvas)',
    kind: 'range',
    defaultValue: 60,
    range: { min: 20, max: 95, step: 5 },
  },
  {
    id: 'partPosition',
    label: 'Part Position',
    kind: 'select',
    defaultValue: 'center',
    options: [
      { value: 'center', label: 'Center' },
      { value: 'edge', label: 'Edge' },
      { value: 'random', label: 'Random' },
    ],
  },
  {
    id: 'displayStyle',
    label: 'Display Style',
    kind: 'select',
    defaultValue: 'three-dots',
    options: [
      { value: 'three-dots', label: 'Three dots' },
      { value: 'filled-bar', label: 'Filled bar' },
      { value: 'grid-cells', label: 'Grid cells' },
    ],
  },
];
export const V6_PARAMETERS: VariableParameters = {
  variableId: 'V6',
  summary: 'Judge a part as a fraction of the whole.',
  dimensions: [...V6, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V7 — Cross-Dimension Comparison
// ─────────────────────────────────────────────────────────────
const V7: VariableDimension[] = [
  {
    id: 'dimension',
    label: 'Dimension',
    kind: 'select',
    defaultValue: 'height-width',
    options: [
      { value: 'height-width', label: 'Height : Width' },
      { value: 'width-depth', label: 'Width : Depth' },
      { value: 'height-depth', label: 'Height : Depth' },
      { value: 'random', label: 'Random' },
    ],
  },
  {
    id: 'ratioRange',
    label: 'Ratio Range Preset',
    kind: 'select',
    defaultValue: 'moderate',
    options: [
      { value: 'narrow', label: 'Narrow (1:1–1:2)' },
      { value: 'moderate', label: 'Moderate (1:1–1:4)' },
      { value: 'wide', label: 'Wide (1:1–1:8)' },
      { value: 'random', label: 'Random' },
    ],
  },
  ...RATIO_RANGE_OVERRIDES,
  {
    id: 'figureScalePct',
    label: 'Figure Size (% of viewport)',
    kind: 'range',
    defaultValue: 60,
    range: { min: 20, max: 95, step: 5 },
    description: 'How large the cross-dimension figure is drawn, as a percentage of the shorter viewport side.',
  },
  {
    id: 'orientation',
    label: 'Orientation',
    kind: 'select',
    defaultValue: 'vertical',
    options: [
      { value: 'horizontal', label: 'Horizontal base' },
      { value: 'vertical', label: 'Vertical base' },
      { value: 'random', label: 'Random' },
    ],
  },
  {
    id: 'showGrid',
    label: 'Show Grid',
    kind: 'toggle',
    defaultValue: false,
  },
  {
  id: 'ratioDirection',
  label: 'Ratio Direction',
  kind: 'select',
  defaultValue: 'h-to-w',
  options: [
    { value: 'h-to-w', label: 'H : W = 1 : N (W is longer)' },
    { value: 'w-to-h', label: 'W : H = 1 : N (H is longer)' },
    { value: 'random', label: 'Random per trial' },
  ],
},
];
export const V7_PARAMETERS: VariableParameters = {
  variableId: 'V7',
  summary: 'Judge H:W and other cross-dimension ratios.',
  dimensions: [...V7, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V8 — Memory Decay of Ratio
// ─────────────────────────────────────────────────────────────
const V8: VariableDimension[] = [
  {
    id: 'memorizeDuration',
    label: 'Memorize (s)',
    kind: 'range',
    defaultValue: 3,
    range: { min: 1, max: 15, step: 1 },
  },
  {
    id: 'delayMinMs',
    label: 'Delay Min (ms)',
    kind: 'range',
    defaultValue: 2000,
    range: { min: 500, max: 30000, step: 500 },
  },
  {
    id: 'delayMaxMs',
    label: 'Delay Max (ms)',
    kind: 'range',
    defaultValue: 8000,
    range: { min: 500, max: 30000, step: 500 },
  },
  {
    id: 'ratioRange',
    label: 'Ratio Range Preset',
    kind: 'select',
    defaultValue: 'moderate',
    options: [
      { value: 'narrow', label: 'Narrow' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'wide', label: 'Wide' },
      { value: 'random', label: 'Random' },
    ],
  },
  ...RATIO_RANGE_OVERRIDES,
  ORIENTATION,
  {
    id: 'interference',
    label: 'Interference',
    kind: 'select',
    defaultValue: 'none',
    options: [
      { value: 'none', label: 'None' },
      { value: 'similar', label: 'Similar ratio' },
      { value: 'different', label: 'Unrelated' },
    ],
  },
];
export const V8_PARAMETERS: VariableParameters = {
  variableId: 'V8',
  summary: 'Memorize a ratio, hold through delay, reconstruct it.',
  dimensions: [...V8, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V9 — Context Interference
// ─────────────────────────────────────────────────────────────
const V9: VariableDimension[] = [
  {
    id: 'contextType',
    label: 'Context Type',
    kind: 'select',
    defaultValue: 'similar',
    options: [
      { value: 'similar', label: 'Similar' },
      { value: 'conflicting', label: 'Conflicting' },
      { value: 'noisy', label: 'Noisy' },
    ],
  },
  {
    id: 'contextDensity',
    label: 'Context Density',
    kind: 'range',
    defaultValue: 5,
    range: { min: 2, max: 12, step: 1 },
  },
  {
    id: 'contextProximity',
    label: 'Proximity',
    kind: 'select',
    defaultValue: 'near',
    options: [
      { value: 'far', label: 'Far' },
      { value: 'near', label: 'Near' },
      { value: 'overlapping', label: 'Overlapping' },
    ],
  },
  {
    id: 'ratioRange',
    label: 'Ratio Range Preset',
    kind: 'select',
    defaultValue: 'moderate',
    options: [
      { value: 'narrow', label: 'Narrow' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'wide', label: 'Wide' },
      { value: 'random', label: 'Random' },
    ],
  },
  ...RATIO_RANGE_OVERRIDES,
  ORIENTATION,
];
export const V9_PARAMETERS: VariableParameters = {
  variableId: 'V9',
  summary: 'Judge a ratio amid distracting ratios.',
  dimensions: [...V9, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V10 — Scale Invariance
// ─────────────────────────────────────────────────────────────
const V10: VariableDimension[] = [
  {
    id: 'scaleRange',
    label: 'Scale Range',
    kind: 'select',
    defaultValue: 'diverse',
    options: [
      { value: 'small', label: 'Small (0.25×–0.5×)' },
      { value: 'moderate', label: 'Moderate (0.5×–1×)' },
      { value: 'large', label: 'Large (1×–2×)' },
      { value: 'diverse', label: 'Diverse (0.25×–2×)' },
      { value: 'random', label: 'Random' },
    ],
  },
  {
    id: 'scaleDirection',
    label: 'Scale Direction',
    kind: 'select',
    defaultValue: 'both',
    options: [
      { value: 'up', label: 'Up' },
      { value: 'down', label: 'Down' },
      { value: 'both', label: 'Both' },
    ],
  },
  {
    id: 'scaleType',
    label: 'Scale Type',
    kind: 'select',
    defaultValue: 'uniform',
    options: [
      { value: 'uniform', label: 'Uniform' },
      { value: 'non-uniform', label: 'Non-uniform' },
      { value: 'random', label: 'Random' },
    ],
  },
  {
    id: 'ratioRange',
    label: 'Ratio Range Preset',
    kind: 'select',
    defaultValue: 'moderate',
    options: [
      { value: 'narrow', label: 'Narrow' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'wide', label: 'Wide' },
      { value: 'random', label: 'Random' },
    ],
  },
  ...RATIO_RANGE_OVERRIDES,
  ORIENTATION,
];
export const V10_PARAMETERS: VariableParameters = {
  variableId: 'V10',
  summary: 'Judge the same ratio at different scales.',
  dimensions: [...V10, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V11 — Position Extraction
// ─────────────────────────────────────────────────────────────
const V11: VariableDimension[] = [
  {
    id: 'positionSet',
    label: 'Position Set',
    kind: 'select',
    defaultValue: 'mixed',
    options: [
      { value: 'midpoint', label: 'Midpoint only' },
      { value: 'thirds', label: 'Thirds' },
      { value: 'quarters', label: 'Quarters' },
      { value: 'golden', label: 'Golden section' },
      { value: 'mixed', label: 'Mixed' },
    ],
  },
  ...POSITION_RANGE_OVERRIDES,
  {
    id: 'lineLengthPct',
    label: 'Line Length (% of viewport)',
    kind: 'range',
    defaultValue: 90,
    range: { min: 30, max: 100, step: 5 },
  },
  {
    id: 'orientation',
    label: 'Orientation',
    kind: 'select',
    defaultValue: 'horizontal',
    options: [
      { value: 'horizontal', label: 'Horizontal' },
      { value: 'vertical', label: 'Vertical' },
      { value: 'random', label: 'Random' },
    ],
  },
  {
    id: 'showTicks',
    label: 'Show Ticks',
    kind: 'toggle',
    defaultValue: false,
  },
];
export const V11_PARAMETERS: VariableParameters = {
  variableId: 'V11',
  summary: 'Locate midpoints, thirds, quarters, and golden-section points.',
  dimensions: [...V11, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// V12 — Symmetry Ratio Detection
// ─────────────────────────────────────────────────────────────
const V12: VariableDimension[] = [
  {
    id: 'symmetryType',
    label: 'Symmetry Type',
    kind: 'select',
    defaultValue: 'mirror',
    options: [
      { value: 'mirror', label: 'Mirror' },
      { value: 'rotational-2', label: 'Rotational 2-fold' },
      { value: 'rotational-3', label: 'Rotational 3-fold' },
      { value: 'mixed', label: 'Mixed' },
    ],
  },
  {
    id: 'axis',
    label: 'Axis',
    kind: 'select',
    defaultValue: 'vertical',
    options: [
      { value: 'vertical', label: 'Vertical' },
      { value: 'horizontal', label: 'Horizontal' },
      { value: 'diagonal', label: 'Diagonal' },
      { value: 'random', label: 'Random' },
    ],
  },
  {
    id: 'asymmetryRange',
    label: 'Asymmetry Preset',
    kind: 'select',
    defaultValue: 'moderate',
    options: [
      { value: 'subtle', label: 'Subtle (1–3px)' },
      { value: 'moderate', label: 'Moderate (3–8px)' },
      { value: 'obvious', label: 'Obvious (8–15px)' },
      { value: 'random', label: 'Random' },
    ],
  },
  ...ASYMMETRY_RANGE_OVERRIDES,
  {
    id: 'shapeComplexity',
    label: 'Shape Complexity',
    kind: 'select',
    defaultValue: 'moderate',
    options: [
      { value: 'simple', label: 'Simple' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'complex', label: 'Complex' },
    ],
  },
];
export const V12_PARAMETERS: VariableParameters = {
  variableId: 'V12',
  summary: 'Detect ratio-based symmetry in shapes.',
  dimensions: [...V12, ...STIMULUS_BASE, ...TASK_BASE],
};

// ─────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────
export const P2_PARAMETERS: Record<string, VariableParameters> = {
  V1: V1_PARAMETERS,
  V2: V2_PARAMETERS,
  V3: V3_PARAMETERS,
  V4: V4_PARAMETERS,
  V5: V5_PARAMETERS,
  V6: V6_PARAMETERS,
  V7: V7_PARAMETERS,
  V8: V8_PARAMETERS,
  V9: V9_PARAMETERS,
  V10: V10_PARAMETERS,
  V11: V11_PARAMETERS,
  V12: V12_PARAMETERS,
};