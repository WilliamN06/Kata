import type { VariableDimension } from '@kata/core';

// ─────────────────────────────────────────────────────────────
// Shared stimulus block
// ─────────────────────────────────────────────────────────────
export const STIMULUS_BASE: VariableDimension[] = [
  {
    id: 'stim_backgroundValue',
    label: 'Background Value',
    kind: 'select',
    defaultValue: 'dark',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'mid', label: 'Mid' },
      { value: 'dark', label: 'Dark' },
    ],
  },
  {
    id: 'stim_contrast',
    label: 'Contrast',
    kind: 'select',
    defaultValue: 'moderate',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' },
    ],
  },
  {
    id: 'stim_backgroundComplexity',
    label: 'Background Complexity',
    kind: 'select',
    defaultValue: 'plain',
    options: [
      { value: 'plain', label: 'Plain' },
      { value: 'simple', label: 'Simple' },
      { value: 'complex', label: 'Complex' },
    ],
  },
  {
  id: 'stim_showLine',
  label: 'Show Connecting Line',
  kind: 'toggle',
  defaultValue: true,
  description: 'Draw a dashed line between the dots. Off shows only the dots.',
},
{
  id: 'stim_showEdges',
  label: 'Show Figure Outline',
  kind: 'toggle',
  defaultValue: true,
  description: 'Connect the corner dots with thin edges so the figure reads as one shape.',
},
{
  id: 'stim_dotMode',
  label: 'Dot Display',
  kind: 'select',
  defaultValue: 'two-dots',
  description: 'How the cross-dimension figure is drawn.',
  options: [
    { value: 'two-dots', label: 'Two dots (one corner, two lengths)' },
    { value: 'three-dots', label: 'Three dots (adds opposite corner)' },
    { value: 'four-corners', label: 'Four corners (rectangle)' },
  ],
},
];

// ─────────────────────────────────────────────────────────────
// Shared task block
// ─────────────────────────────────────────────────────────────
export const TASK_BASE: VariableDimension[] = [
  {
    id: 'task_tolerance',
    label: 'Tolerance (steps)',
    kind: 'range',
    defaultValue: 0,
    range: { min: 0, max: 3, step: 1 },
    description: 'How many ratio steps off the user may be and still count as correct.',
  },
  {
    id: 'task_feedbackDelay',
    label: 'Feedback Delay',
    kind: 'select',
    defaultValue: 'immediate',
    options: [
      { value: 'immediate', label: 'Immediate' },
      { value: 'short', label: 'Short' },
      { value: 'long', label: 'Long' },
    ],
  },
  {
    id: 'task_feedbackType',
    label: 'Feedback Type',
    kind: 'select',
    defaultValue: 'visual',
    options: [
      { value: 'visual', label: 'Visual' },
      { value: 'numerical', label: 'Numerical' },
      { value: 'verbal', label: 'Verbal' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Numeric range override pairs
// ─────────────────────────────────────────────────────────────
export const RATIO_RANGE_OVERRIDES: VariableDimension[] = [
  {
    id: 'ratioMin',
    label: 'Ratio Min (numeric override)',
    kind: 'range',
    defaultValue: 1,
    range: { min: 1, max: 10, step: 1 },
    description: 'Set both min and max to override the preset range.',
  },
  {
    id: 'ratioMax',
    label: 'Ratio Max (numeric override)',
    kind: 'range',
    defaultValue: 10,
    range: { min: 1, max: 10, step: 1 },
  },
];

export const DISTANCE_RANGE_OVERRIDES: VariableDimension[] = [
  {
    id: 'distanceMinPct',
    label: 'Distance Min (% of canvas)',
    kind: 'range',
    defaultValue: 15,
    range: { min: 2, max: 95, step: 1 },
  },
  {
    id: 'distanceMaxPct',
    label: 'Distance Max (% of canvas)',
    kind: 'range',
    defaultValue: 45,
    range: { min: 2, max: 95, step: 1 },
  },
];

export const POSITION_RANGE_OVERRIDES: VariableDimension[] = [
  {
    id: 'positionTolerancePct',
    label: 'Position Tolerance (%)',
    kind: 'range',
    defaultValue: 3,
    range: { min: 0.5, max: 15, step: 0.5 },
    description: 'How far from the true position a tap may be, as a percentage of the line.',
  },
];

export const FRACTION_RANGE_OVERRIDES: VariableDimension[] = [
  {
    id: 'fractionTolerancePct',
    label: 'Fraction Tolerance (%)',
    kind: 'range',
    defaultValue: 5,
    range: { min: 1, max: 20, step: 1 },
  },
];

export const ASYMMETRY_RANGE_OVERRIDES: VariableDimension[] = [
  {
    id: 'asymmetryMinPx',
    label: 'Asymmetry Min (px)',
    kind: 'range',
    defaultValue: 3,
    range: { min: 1, max: 40, step: 1 },
  },
  {
    id: 'asymmetryMaxPx',
    label: 'Asymmetry Max (px)',
    kind: 'range',
    defaultValue: 12,
    range: { min: 1, max: 40, step: 1 },
  },
];

