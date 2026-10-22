import type { Variable } from '@kata/core';

/**
 * Proportion V1 — Extent Ratio.
 *
 * Two extents on a flat plane. How long is one compared to the other.
 *
 * No boxes, no depth, no 3D, no H:W of a shape.
 * Just A length vs B length, in whatever arrangement the user selects.
 *
 * V2 Angle is separate — rotation vs reference is a different operation.
 */

export const PROPORTION_VARIABLES: Variable[] = [
  {
    id: 'drawing:p1-proportion:V1' as any,
    name: 'Extent Ratio',
    definition:
      'The capacity to perceive the ratio between two extents on the same plane — as dots, lines, or lines with dots, in any arrangement.',
    unit: 'ratio',
    defaultValue: 2,
    variableDimensions: [
      // ---------- RATIO ----------
      {
        id: 'ratioValue',
        label: 'Ratio Value',
        kind: 'number',
        defaultValue: 2,
        range: { min: 0.01, max: 1000, step: 0.01, unit: ':1', extendable: true },
        helpText:
          'Target / reference. 2 = target is twice as long as reference. Any positive number. 1.618, √2, anything.',
      },
      {
        id: 'ratioDirection',
        label: 'Direction',
        kind: 'select',
        options: [
          { value: 'a-to-b', label: 'A:B (target longer)' },
          { value: 'b-to-a', label: 'B:A (reference longer)' },
          { value: 'both', label: 'Both (random each trial)' },
        ],
        defaultValue: 'both',
      },

      // ---------- MARK TYPE ----------
      {
        id: 'markType',
        label: 'Mark Type',
        kind: 'select',
        options: [
          { value: 'three-dots', label: 'Three dots (A | B share middle)' },
          { value: 'line', label: 'Lines only (no dots)' },
          { value: 'line-with-dots', label: 'Lines with end dots' },
          { value: 'line-with-three-dots', label: 'Lines with 3 dots (mid marked)' },
        ],
        defaultValue: 'two-dots',
        helpText:
          'How the two extents are drawn. Dots = endpoints only. Lines = the extent itself. Line-with-dots = both.',
      },

      // ---------- RELATIONSHIP (how the two extents sit relative to each other) ----------
      {
        id: 'relationship',
        label: 'Relationship',
        kind: 'select',
        options: [
          { value: 'parallel-same-axis', label: 'Parallel, same axis (both horizontal or both vertical)' },
          { value: 'parallel-angled', label: 'Parallel, angled (both tilted at the same angle)' },
          { value: 'perpendicular', label: 'Perpendicular (one horizontal, one vertical)' },
          { value: 'end-to-end', label: 'End-to-end (collinear, sharing one endpoint)' },
          { value: 'end-to-end-angled', label: 'End-to-end at angle (sharing one endpoint, joint at angle)' },
          { value: 'random', label: 'Random (varies each trial)' },
        ],
        defaultValue: 'parallel-same-axis',
        helpText:
          'How the two extents are arranged in space. Different arrangements train different perceptual operations.',
      },

      // ---------- ANGLE ----------
      {
        id: 'angle',
        label: 'Angle',
        kind: 'number',
        defaultValue: 0,
        range: { min: -180, max: 180, step: 1, unit: '°', extendable: true },
        helpText:
          'Tilt of the extent pair. 0° = horizontal. Used when relationship is parallel-angled or end-to-end-angled. Ignored for other relationships.',
      },
      {
        id: 'jointAngle',
        label: 'Joint Angle',
        kind: 'number',
        defaultValue: 90,
        range: { min: 1, max: 179, step: 1, unit: '°', extendable: true },
        helpText:
          'Angle between the two segments at their shared point. Only used when relationship is end-to-end-angled.',
      },

      // ---------- BASE LENGTH ----------
      {
        id: 'baseLength',
        label: 'Reference Length',
        kind: 'number',
        defaultValue: 200,
        range: { min: 20, max: 2000, step: 10, unit: 'px', extendable: true },
        helpText:
          'Length of the reference extent in pixels. The target is baseLength × ratio. Whole thing auto-scales to fit the window.',
      },

      // ---------- TOLERANCE ----------
      {
        id: 'tolerance',
        label: 'Tolerance',
        kind: 'number',
        defaultValue: 0.15,
        range: { min: 0.01, max: 1, step: 0.01, unit: '× ratio', extendable: true },
        helpText:
          'How close an estimate must be to count as correct. 0.15 = ±15% of true ratio.',
      },

      // ---------- LABELS ----------
      {
        id: 'showLabels',
        label: 'Show A/B Labels',
        kind: 'select',
        options: [
          { value: 'off', label: 'Off' },
          { value: 'on', label: 'On (A, B at endpoints)' },
        ],
        defaultValue: 'off',
      },
    ],
    stimulusParameters: [
      // ---------- MARK STYLING ----------
      {
        id: 'dotSize',
        label: 'Dot Size',
        kind: 'number',
        defaultValue: 14,
        range: { min: 2, max: 60, step: 1, unit: 'px', extendable: true },
      },
      {
        id: 'lineThickness',
        label: 'Line Thickness',
        kind: 'number',
        defaultValue: 3,
        range: { min: 1, max: 30, step: 1, unit: 'px', extendable: true },
      },
      {
        id: 'lineStyle',
        label: 'Line Style',
        kind: 'select',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
        ],
        defaultValue: 'solid',
      },

      // ---------- VISUAL ----------
      {
        id: 'contrast',
        label: 'Contrast',
        kind: 'select',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'high', label: 'High' },
        ],
        defaultValue: 'high',
      },
      {
        id: 'backgroundValue',
        label: 'Background',
        kind: 'select',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'mid', label: 'Mid' },
          { value: 'dark', label: 'Dark' },
          { value: 'grid', label: 'Grid' },
          { value: 'transparent', label: 'Transparent (match page)' },
        ],
        defaultValue: 'mid',
      },

      // ---------- POSITION ----------
      {
        id: 'position',
        label: 'Position',
        kind: 'select',
        options: [
          { value: 'centre', label: 'Centre' },
          { value: 'top-left', label: 'Top left' },
          { value: 'top-right', label: 'Top right' },
          { value: 'bottom-left', label: 'Bottom left' },
          { value: 'bottom-right', label: 'Bottom right' },
        ],
        defaultValue: 'centre',
      },

      // ---------- SCALE (viewing distance simulation) ----------
      {
        id: 'scale',
        label: 'Overall Scale',
        kind: 'number',
        defaultValue: 1,
        range: { min: 0.1, max: 3, step: 0.05, unit: '×', extendable: true },
        helpText:
          'Multiplies the whole form size. 2 = twice as large — simulates viewing distance.',
      },

      // ---------- REFERENCE UNIT ----------
      {
        id: 'referenceUnit',
        label: 'Reference Unit Mark',
        kind: 'select',
        options: [
          { value: 'absent', label: 'Absent (judge from the two extents alone)' },
          { value: 'present', label: 'Present (small unit mark shown)' },
        ],
        defaultValue: 'absent',
        helpText:
          'When present, a small horizontal mark equal to one "unit" appears at the bottom-left. The reference extent equals one unit.',
      },
    ],
    visualisation: 'none',
  },

  // V2 Angle — separate skill, unchanged
  {
    id: 'drawing:p1-proportion:V2' as any,
    name: 'Angle',
    definition:
      'The capacity to perceive the orientation of a line relative to a reference',
    unit: 'degrees',
    defaultValue: 45,
    variableDimensions: [
      {
        id: 'angleValue',
        label: 'Angle Value',
        kind: 'number',
        defaultValue: 45,
        range: { min: 0, max: 360, step: 1, unit: '°', extendable: true },
      },
      {
        id: 'referenceType',
        label: 'Reference Type',
        kind: 'select',
        options: [
          { value: 'vertical', label: 'Vertical' },
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'another-line', label: 'Another line' },
          { value: 'custom', label: 'Custom angle' },
        ],
        defaultValue: 'vertical',
      },
      {
        id: 'referenceAngle',
        label: 'Reference Angle',
        kind: 'number',
        defaultValue: 0,
        range: { min: 0, max: 360, step: 1, unit: '°', extendable: true },
        appliesWhen: { dimension: 'referenceType', values: ['another-line', 'custom'] },
      },
      {
        id: 'lineLength',
        label: 'Line Length',
        kind: 'number',
        defaultValue: 300,
        range: { min: 20, max: 2000, step: 10, unit: 'px', extendable: true },
      },
    ],
    stimulusParameters: [
      {
        id: 'lineThickness',
        label: 'Line Thickness',
        kind: 'number',
        defaultValue: 3,
        range: { min: 1, max: 20, step: 1, unit: 'px', extendable: true },
      },
      {
        id: 'lineContrast',
        label: 'Contrast',
        kind: 'select',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'high', label: 'High' },
        ],
        defaultValue: 'high',
      },
      {
        id: 'lineStyle',
        label: 'Line Style',
        kind: 'select',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
        ],
        defaultValue: 'solid',
      },
      {
        id: 'referenceVisibility',
        label: 'Reference Visibility',
        kind: 'select',
        options: [
          { value: 'clear', label: 'Clear' },
          { value: 'faint', label: 'Faint' },
          { value: 'implied', label: 'Implied' },
        ],
        defaultValue: 'clear',
      },
      {
        id: 'backgroundValue',
        label: 'Background',
        kind: 'select',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'mid', label: 'Mid' },
          { value: 'dark', label: 'Dark' },
        ],
        defaultValue: 'mid',
      },
    ],
    visualisation: 'none',
  },
];

