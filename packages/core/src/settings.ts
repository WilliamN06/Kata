// This file was auto-generated - do not edit manually

import type { DrillSettings } from './types';
import { DEFAULT_SETTINGS, MANUAL_LEVELS } from './constants';

export interface SubskillSettings extends Partial<DrillSettings> {
  subskillId: string;
}

export interface VariableSettings extends Partial<DrillSettings> {
  variableId: string;
}

export interface DrillSettingsOverrides {
  global: DrillSettings;
  subskill: Map<string, SubskillSettings>;
  variable: Map<string, VariableSettings>;
}

export function resolveSettings(
  global: DrillSettings,
  subskill?: Partial<DrillSettings>,
  perDrill?: Partial<DrillSettings>
): DrillSettings {
  return {
    ...global,
    ...(subskill ?? {}),
    ...(perDrill ?? {}),
  };
}

export function resolveFullSettings(
  overrides: DrillSettingsOverrides,
  subskillId: string,
  variableId: string
): DrillSettings {
  const subskillSettings = overrides.subskill.get(subskillId);
  const variableSettings = overrides.variable.get(variableId);
  return resolveSettings(overrides.global, subskillSettings, variableSettings);
}

export type DrillSettingValue = string | number | boolean;

export interface DrillSettingOption {
  value: string | number;
  label: string;
}

export interface DrillSettingField {
  /** Key used in `variableParams` and persisted to the `variable_params` JSON column. */
  key: string;
  label: string;
  description?: string;
  type: 'select' | 'toggle' | 'number';
  options?: DrillSettingOption[];
  default?: DrillSettingValue;
  min?: number;
  max?: number;
  step?: number;
  /** Optional condition — field is hidden when false. */
  showWhen?: (values: Record<string, DrillSettingValue | undefined>) => boolean;
  /** Optional filter — only show for matching subskill+drill. Defaults to all. */
  appliesTo?: (subskillId: string, drillId: string) => boolean;
}

/**
 * Per-drill variable settings are config-driven. Add, remove, or edit an entry
 * here to add/remove/modify a drill setting. Each field flows into the settings
 * object passed to drill renderers and is persisted as JSON automatically —
 * no schema or query changes needed.
 */
export const DRILL_VARIABLE_SETTING_FIELDS: DrillSettingField[] = [
  {
    key: 'angleDisplayMode',
    label: 'Display Mode',
    type: 'select',
    options: [
      { value: 'line', label: 'Line' },
      { value: 'line-with-dots', label: 'Line with dots' },
      { value: 'dots-only', label: 'Dots only' },
      { value: 'line-with-ticks', label: 'Line with ticks' },
    ],
    default: 'line',
    appliesTo: (sid) => sid.startsWith('p1-angle'),
  },
  {
    key: 'angleShowReference',
    label: 'Show reference line',
    type: 'toggle',
    default: true,
    appliesTo: (sid) => sid.startsWith('p1-angle'),
  },
  {
    key: 'angleReferenceType',
    label: 'Reference Type',
    type: 'select',
    options: [
      { value: 'vertical', label: 'Vertical' },
      { value: 'horizontal', label: 'Horizontal' },
      { value: 'none', label: 'None' },
    ],
    default: 'vertical',
    appliesTo: (sid) => sid.startsWith('p1-angle'),
    showWhen: (v) => v.angleShowReference !== false,
  },
  {
    key: 'stepSizeMin',
    label: 'Min Step %',
    type: 'number',
    min: 1,
    max: 20,
    default: 1,
  },
  {
    key: 'stepSizeMax',
    label: 'Max Step %',
    type: 'number',
    min: 1,
    max: 20,
    default: 5,
  },
  // P1 V6 — Angle Magnitude Classification
  {
    key: 'angleMin',
    label: 'Min Angle (°)',
    type: 'number',
    min: 0,
    max: 360,
    step: 1,
    default: 0,
    description: 'Lower bound of the generated angle range.',
    appliesTo: (sid, did) => sid.startsWith('p1-angle') && did === 'V6',
  },
  {
    key: 'angleMax',
    label: 'Max Angle (°)',
    type: 'number',
    min: 0,
    max: 360,
    step: 1,
    default: 180,
    description: 'Upper bound of the generated angle range.',
    appliesTo: (sid, did) => sid.startsWith('p1-angle') && did === 'V6',
  },
  {
    key: 'anglePrecision',
    label: 'Angle Precision',
    type: 'number',
    min: 0,
    max: 2,
    default: 0,
    description: 'Decimal places for angle display and input.',
    appliesTo: (sid, did) => sid.startsWith('p1-angle') && did === 'V6',
  },
  {
    key: 'includeReflex',
    label: 'Include reflex angles',
    type: 'toggle',
    default: false,
    appliesTo: (sid, did) => sid.startsWith('p1-angle') && did === 'V6',
    showWhen: (v) => (v.angleMax as number) > 180,
  },
  {
    key: 'showAnnotation',
    label: 'Show angle value',
    type: 'toggle',
    default: false,
    appliesTo: (sid, did) => sid.startsWith('p1-angle') && did === 'V6',
  },
  {
    key: 'magnitudeTolerance',
    label: 'Correctness Range (°)',
    type: 'number',
    min: 1,
    max: 30,
    step: 0.5,
    default: 5,
    description: 'Accepted error in degrees around the true angle.',
    appliesTo: (sid, did) => sid.startsWith('p1-angle') && did === 'V6',
  },
  {
    key: 'magnitudeDirection',
    label: 'Opening Direction',
    type: 'select',
    options: [
      { value: 'above', label: 'Above reference' },
      { value: 'below', label: 'Below reference' },
      { value: 'random', label: 'Random' },
    ],
    default: 'random',
    description: 'Which way the angle opens relative to the reference line.',
    appliesTo: (sid, did) => sid.startsWith('p1-angle') && did === 'V6',
  },
  // ---- P2 Proportion ----
  {
    key: 'ratioRange',
    label: 'Ratio Range',
    type: 'select',
    options: [
      { value: 'narrow', label: 'Narrow (1:1–1:3)' },
      { value: 'moderate', label: 'Moderate (1:1–1:6)' },
      { value: 'wide', label: 'Wide (1:1–1:10)' },
      { value: 'full', label: 'Full (1:1–1:10)' },
      { value: 'random', label: 'Random' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) =>
      sid.startsWith('p2-proportion') &&
      ['V1', 'V3', 'V8', 'V9', 'V10'].includes(did),
  },
  {
    key: 'orientation',
    label: 'Orientation',
    type: 'select',
    options: [
      { value: 'horizontal', label: 'Horizontal' },
      { value: 'vertical', label: 'Vertical' },
      { value: 'random', label: 'Random' },
    ],
    default: 'horizontal',
    appliesTo: (sid, did) => sid.startsWith('p2-proportion') && did === 'V1',
  },
  {
    key: 'unitSize',
    label: 'Unit Size',
    type: 'select',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'large', label: 'Large' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p2-proportion') && did === 'V2',
  },
  {
    key: 'distanceRange',
    label: 'Distance Range',
    type: 'select',
    options: [
      { value: 'short', label: 'Short (50–150px)' },
      { value: 'medium', label: 'Medium (150–350px)' },
      { value: 'long', label: 'Long (350–500px)' },
      { value: 'full', label: 'Full (50–500px)' },
      { value: 'random', label: 'Random' },
    ],
    default: 'medium',
    appliesTo: (sid, did) => sid.startsWith('p2-proportion') && did === 'V5',
  },
  {
    key: 'memorizeDuration',
    label: 'Memorize Time (s)',
    type: 'number',
    min: 1,
    max: 10,
    step: 1,
    default: 3,
    appliesTo: (sid, did) => sid.startsWith('p2-proportion') && did === 'V8',
  },
  {
    key: 'delayRange',
    label: 'Delay',
    type: 'select',
    options: [
      { value: 'short', label: 'Short (2–5s)' },
      { value: 'moderate', label: 'Moderate (5–10s)' },
      { value: 'long', label: 'Long (10–30s)' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p2-proportion') && did === 'V8',
  },
  {
    key: 'contextType',
    label: 'Context Type',
    type: 'select',
    options: [
      { value: 'similar', label: 'Similar' },
      { value: 'conflicting', label: 'Conflicting' },
      { value: 'noisy', label: 'Noisy' },
    ],
    default: 'similar',
    appliesTo: (sid, did) => sid.startsWith('p2-proportion') && did === 'V9',
  },
  {
    key: 'contextDensity',
    label: 'Context Density',
    type: 'select',
    options: [
      { value: 'sparse', label: 'Sparse' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'dense', label: 'Dense' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p2-proportion') && did === 'V9',
  },
  {
    key: 'scaleRange',
    label: 'Scale Range',
    type: 'select',
    options: [
      { value: 'small', label: 'Small (0.25×)' },
      { value: 'large', label: 'Large (1×)' },
      { value: 'diverse', label: 'Diverse (0.5×–2×)' },
    ],
    default: 'diverse',
    appliesTo: (sid, did) => sid.startsWith('p2-proportion') && did === 'V10',
  },
  {
    key: 'axis',
    label: 'Symmetry Axis',
    type: 'select',
    options: [
      { value: 'vertical', label: 'Vertical' },
      { value: 'horizontal', label: 'Horizontal' },
      { value: 'diagonal', label: 'Diagonal' },
    ],
    default: 'vertical',
    appliesTo: (sid, did) => sid.startsWith('p2-proportion') && did === 'V12',
  },
  {
    key: 'asymmetryRange',
    label: 'Asymmetry',
    type: 'select',
    options: [
      { value: 'subtle', label: 'Subtle' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'obvious', label: 'Obvious' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p2-proportion') && did === 'V12',
  },
  // P3 Value — 10 Drills
  {
    key: 'baseRange',
    label: 'Base Range',
    type: 'select',
    options: [
      { value: 'dark', label: 'Dark (L* 15–35)' },
      { value: 'mid', label: 'Mid (L* 35–65)' },
      { value: 'light', label: 'Light (L* 65–85)' },
      { value: 'full', label: 'Full (L* 15–85)' },
      { value: 'random', label: 'Random' },
    ],
    default: 'full',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V1',
  },
  {
    key: 'deltaStart',
    label: 'Starting Difference',
    type: 'number',
    min: 5,
    max: 50,
    step: 5,
    default: 25,
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V1',
  },
  {
    key: 'chipShape',
    label: 'Chip Shape',
    type: 'select',
    options: [
      { value: 'square', label: 'Square' },
      { value: 'circle', label: 'Circle' },
      { value: 'random', label: 'Random' },
    ],
    default: 'square',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V1',
  },
  {
    key: 'unitType',
    label: 'Unit Type',
    type: 'select',
    options: [
      { value: 'length', label: 'Length' },
      { value: 'area', label: 'Area' },
      { value: 'volume', label: 'Volume' },
    ],
    default: 'length',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V2',
  },
  {
    key: 'unitSize',
    label: 'Unit Size',
    type: 'select',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'large', label: 'Large' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V2',
  },
  {
    key: 'figureComplexity',
    label: 'Figure Complexity',
    type: 'select',
    options: [
      { value: 'simple', label: 'Simple (1 line)' },
      { value: 'moderate', label: 'Moderate (stacked)' },
      { value: 'complex', label: 'Complex (interleaved)' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V2',
  },
  {
    key: 'showUnitMarker',
    label: 'Show Unit Marker',
    type: 'toggle',
    default: true,
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V2',
  },
  {
    key: 'angleRange',
    label: 'Angle Range',
    type: 'select',
    options: [
      { value: 'shallow', label: 'Shallow (10–45°)' },
      { value: 'wide', label: 'Wide (45–90°)' },
      { value: 'steep', label: 'Steep (90–170°)' },
      { value: 'random', label: 'Random' },
    ],
    default: 'random',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V3',
  },
  {
    key: 'baseAngleRange',
    label: 'Base Angle',
    type: 'select',
    options: [
      { value: 'shallow', label: 'Shallow (10–45°)' },
      { value: 'wide', label: 'Wide (45–90°)' },
      { value: 'steep', label: 'Steep (90–170°)' },
      { value: 'random', label: 'Random' },
    ],
    default: 'random',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V3',
  },
  {
    key: 'displayMode',
    label: 'Display Mode',
    type: 'select',
    options: [
      { value: 'two-lines', label: 'Two lines' },
      { value: 'two-dots', label: 'Two dots' },
      { value: 'both', label: 'Both' },
    ],
    default: 'two-lines',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V3',
  },
  {
    key: 'contextType',
    label: 'Context Type',
    type: 'select',
    options: [
      { value: 'similar', label: 'Similar' },
      { value: 'conflicting', label: 'Conflicting' },
      { value: 'noisy', label: 'Noisy' },
    ],
    default: 'similar',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V4',
  },
  {
    key: 'contextDensity',
    label: 'Context Density',
    type: 'select',
    options: [
      { value: 'sparse', label: 'Sparse' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'dense', label: 'Dense' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V4',
  },
  {
    key: 'valueOffset',
    label: 'Value Offset',
    type: 'number',
    min: 5,
    max: 40,
    step: 5,
    default: 15,
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V4',
  },
  {
    key: 'targetSize',
    label: 'Target Size',
    type: 'select',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
    ],
    default: 'medium',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V4',
  },
  {
    key: 'memorizeDuration',
    label: 'Memorize Time (s)',
    type: 'number',
    min: 1,
    max: 10,
    step: 1,
    default: 3,
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V5',
  },
  {
    key: 'delayRange',
    label: 'Delay',
    type: 'select',
    options: [
      { value: 'short', label: 'Short (2–5s)' },
      { value: 'moderate', label: 'Moderate (5–10s)' },
      { value: 'long', label: 'Long (10–30s)' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V5',
  },
  {
    key: 'valueRangeV5',
    label: 'Value Range',
    type: 'select',
    options: [
      { value: 'narrow', label: 'Narrow (L* 40–60)' },
      { value: 'moderate', label: 'Moderate (L* 25–75)' },
      { value: 'wide', label: 'Wide (L* 10–90)' },
      { value: 'random', label: 'Random' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V5',
  },
  {
    key: 'scalePairs',
    label: 'Scale Pairs',
    type: 'select',
    options: [
      { value: 'small/medium', label: 'Small/Medium' },
      { value: 'medium/large', label: 'Medium/Large' },
      { value: 'diverse', label: 'Diverse (all 3)' },
    ],
    default: 'diverse',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V6',
  },
  {
    key: 'valueRangeV6',
    label: 'Value Range',
    type: 'select',
    options: [
      { value: 'narrow', label: 'Narrow (L* 40–60)' },
      { value: 'moderate', label: 'Moderate (L* 25–75)' },
      { value: 'wide', label: 'Wide (L* 10–90)' },
      { value: 'random', label: 'Random' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V6',
  },
  {
    key: 'valueDeviation',
    label: 'Value Deviation',
    type: 'select',
    options: [
      { value: 'subtle', label: 'Subtle (ΔE 1–3)' },
      { value: 'moderate', label: 'Moderate (ΔE 3–8)' },
      { value: 'obvious', label: 'Obvious (ΔE 8–15)' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V6',
  },
  {
    key: 'contrastRange',
    label: 'Contrast Range',
    type: 'select',
    options: [
      { value: 'low', label: 'Low (0–20 ΔL*)' },
      { value: 'medium', label: 'Medium (20–40 ΔL*)' },
      { value: 'high', label: 'High (40–80 ΔL*)' },
      { value: 'random', label: 'Random' },
    ],
    default: 'medium',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V7',
  },
  {
    key: 'referenceType',
    label: 'Reference Type',
    type: 'select',
    options: [
      { value: 'both-chips', label: 'Both chips' },
      { value: 'black-and-white', label: 'Black and white' },
      { value: 'mid-gray', label: 'Mid-gray' },
    ],
    default: 'both-chips',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V7',
  },
  {
    key: 'sceneComplexity',
    label: 'Scene Complexity',
    type: 'select',
    options: [
      { value: 'simple', label: 'Simple (3 values)' },
      { value: 'moderate', label: 'Moderate (5 values)' },
      { value: 'complex', label: 'Complex (8+ values)' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V8',
  },
  {
    key: 'valueSpread',
    label: 'Value Spread',
    type: 'select',
    options: [
      { value: 'narrow', label: 'Narrow' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'wide', label: 'Wide (0.5×–2×)' },
      { value: 'random', label: 'Random' },
    ],
    default: 'wide',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V8',
  },
  {
    key: 'identificationTarget',
    label: 'Identify',
    type: 'select',
    options: [
      { value: 'lightest', label: 'Lightest' },
      { value: 'darkest', label: 'Darkest' },
      { value: 'mid', label: 'Mid' },
      { value: 'all', label: 'All' },
    ],
    default: 'all',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V8',
  },
  {
    key: 'illuminationVariation',
    label: 'Illumination Change',
    type: 'select',
    options: [
      { value: 'subtle', label: 'Subtle (±10%)' },
      { value: 'moderate', label: 'Moderate (±25%)' },
      { value: 'strong', label: 'Strong (±50%)' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V9',
  },
  {
    key: 'lightingSetups',
    label: 'Lighting Setups',
    type: 'select',
    options: [
      { value: '2-way', label: '2-way (shadow/lit)' },
      { value: '3-way', label: '3-way (+ underlight)' },
      { value: 'diverse', label: 'Diverse' },
    ],
    default: '2-way',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V9',
  },
  {
    key: 'surfaceCount',
    label: 'Surface Count',
    type: 'select',
    options: [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
    ],
    default: '1',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V9',
  },
  {
    key: 'hueSet',
    label: 'Hue Set',
    type: 'select',
    options: [
      { value: 'primary', label: 'Primary (red/blue/yellow)' },
      { value: 'secondary', label: 'Secondary (+ green/orange/purple)' },
      { value: 'diverse', label: 'Diverse (+ cyan/magenta)' },
      { value: 'all', label: 'All' },
    ],
    default: 'primary',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V10',
  },
  {
    key: 'saturationRange',
    label: 'Saturation',
    type: 'select',
    options: [
      { value: 'low', label: 'Low (30–60%)' },
      { value: 'moderate', label: 'Moderate (60–90%)' },
      { value: 'full', label: 'Full (90–100%)' },
      { value: 'random', label: 'Random' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V10',
  },
  {
    key: 'valueRangeV10',
    label: 'Value Range',
    type: 'select',
    options: [
      { value: 'narrow', label: 'Narrow' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'wide', label: 'Wide (0.5×–2×)' },
      { value: 'random', label: 'Random' },
    ],
    default: 'moderate',
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V10',
  },
  {
    key: 'showPalette',
    label: 'Show Palette',
    type: 'toggle',
    default: true,
    appliesTo: (sid, did) => sid.startsWith('p3-value') && did === 'V10',
  },
];

export function getManualDelta(level: keyof typeof MANUAL_LEVELS): number {
  return MANUAL_LEVELS[level];
}

export function getDifficultyScore(settings: DrillSettings): number {
  let score = 0;

  score += settings.range === 'wide' ? 3 : settings.range === 'moderate' ? 2 : 1;
  score +=
    settings.tolerance === 'tight' ? 3 : settings.tolerance === 'moderate' ? 2 : 1;
  score += settings.timed ? (settings.secondsPerTrial && settings.secondsPerTrial <= 10 ? 3 : 2) : 1;
  score +=
    settings.interaction === 'simultaneous'
      ? 3
      : settings.interaction === 'sequential'
        ? 2
        : 1;
  score +=
    settings.variability === 'unpredictable'
      ? 3
      : settings.variability === 'semi'
        ? 2
        : 1;
  score += settings.conditions === '6+' ? 3 : settings.conditions === '3' ? 2 : 1;
  score += settings.taskCondition !== 'none' ? 2 : 1;
  score += settings.backgroundCondition !== 'none' ? 2 : 1;

  return score / 24;
}

export function mergeWithDefaults(settings: Partial<DrillSettings>): DrillSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
  } as DrillSettings;
}

export function createDefaultOverrides(): DrillSettingsOverrides {
  return {
    global: { ...DEFAULT_SETTINGS },
    subskill: new Map(),
    variable: new Map(),
  };
}