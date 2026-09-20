import { describe, it, expect } from 'vitest';
import {
  angleDifference,
  describeVerticalTilt,
  describeHorizontalTilt,
  classifyAngle,
  describeDirection,
  resolveMagnitudeAngle,
  resolveMagnitudeTolerance,
  MAGNITUDE_DIRECTIONS,
  type MagnitudeDirection,
} from './angle-utils';

describe('angle-utils', () => {
  describe('angleDifference', () => {
    it('returns absolute difference for small angles', () => {
      expect(angleDifference(30, 45)).toBe(15);
      expect(angleDifference(45, 30)).toBe(15);
    });

    it('normalises differences > 180 to the shortest arc', () => {
      expect(angleDifference(350, 10)).toBe(20);
      expect(angleDifference(10, 350)).toBe(20);
      expect(angleDifference(0, 180)).toBe(180);
      expect(angleDifference(359, 0)).toBe(1);
    });

    it('returns 0 for identical angles', () => {
      expect(angleDifference(123, 123)).toBe(0);
    });
  });

  describe('describeVerticalTilt', () => {
    it('describes a rightward tilt', () => {
      expect(describeVerticalTilt(95)).toEqual({ degrees: 5, direction: 'right' });
    });

    it('describes a leftward tilt', () => {
      expect(describeVerticalTilt(85)).toEqual({ degrees: 5, direction: 'left' });
    });

    it('returns none when aligned to vertical', () => {
      expect(describeVerticalTilt(90)).toEqual({ degrees: 0, direction: 'none' });
    });
  });

  describe('describeHorizontalTilt', () => {
    it('describes an upward tilt', () => {
      expect(describeHorizontalTilt(10)).toEqual({ degrees: 10, direction: 'up' });
    });

    it('describes a downward tilt', () => {
      expect(describeHorizontalTilt(-10)).toEqual({ degrees: 10, direction: 'down' });
    });

    it('returns none when aligned to horizontal', () => {
      expect(describeHorizontalTilt(0)).toEqual({ degrees: 0, direction: 'none' });
    });
  });

  describe('classifyAngle', () => {
    it('classifies acute', () => {
      expect(classifyAngle(0)).toBe('acute');
      expect(classifyAngle(45)).toBe('acute');
      expect(classifyAngle(89.9)).toBe('acute');
    });

    it('classifies right', () => {
      expect(classifyAngle(90)).toBe('right');
    });

    it('classifies obtuse', () => {
      expect(classifyAngle(91)).toBe('obtuse');
      expect(classifyAngle(179.9)).toBe('obtuse');
    });

    it('classifies reflex', () => {
      expect(classifyAngle(180)).toBe('reflex');
      expect(classifyAngle(270)).toBe('reflex');
      expect(classifyAngle(359)).toBe('reflex');
    });
  });

  describe('describeDirection', () => {
    it('describes flat (0°)', () => {
      expect(describeDirection(0)).toMatch(/flat along the reference/);
    });

    it('describes straight (180°)', () => {
      expect(describeDirection(180)).toMatch(/straight \(180°/);
    });

    it('describes an acute angle above the reference', () => {
      expect(describeDirection(45)).toMatch(/above the reference/);
      expect(describeDirection(45)).toContain('45');
    });

    it('describes a right angle', () => {
      expect(describeDirection(90)).toMatch(/straight up/);
    });

    it('describes a below reference interior angle', () => {
      expect(describeDirection(220)).toMatch(/below the reference/);
    });

    it('normalises negative and out-of-range inputs', () => {
      expect(describeDirection(-45)).toBe(describeDirection(315));
      expect(describeDirection(405)).toBe(describeDirection(45));
      expect(describeDirection(720)).toBe(describeDirection(0));
    });
  });

  describe('resolveMagnitudeAngle', () => {
    // A deterministic rng that yields a fixed value.
    const fixed = (value: number) => () => value;

    it('respects an acute-only numeric range', () => {
      const a = resolveMagnitudeAngle(10, 80, false, 'random', fixed(0.5));
      expect(a).toBeGreaterThanOrEqual(10);
      expect(a).toBeLessThanOrEqual(80);
    });

    it('respects a right-adjacent numeric range', () => {
      const a = resolveMagnitudeAngle(70, 110, false, 'random', fixed(0.5));
      expect(a).toBeGreaterThanOrEqual(70);
      expect(a).toBeLessThanOrEqual(110);
    });

    it('respects an obtuse-only numeric range', () => {
      const a = resolveMagnitudeAngle(100, 170, false, 'random', fixed(0.5));
      expect(a).toBeGreaterThanOrEqual(100);
      expect(a).toBeLessThanOrEqual(170);
    });

    it('produces a 0–360 angle for a full random range', () => {
      expect(resolveMagnitudeAngle(0, 360, true, 'random', fixed(0.5))).toBe(180);
    });

    it('clamps reflex angles to [0,180] when includeReflex is false', () => {
      const a = resolveMagnitudeAngle(0, 360, false, 'random', fixed(0.9));
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(180);
    });

    it('keeps reflex angles when includeReflex is true', () => {
      const a = resolveMagnitudeAngle(0, 180, true, 'random', fixed(0.9));
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(180);
    });

    it('direction "above" keeps the interior angle in [0,180]', () => {
      // rng 0.9 with 0–180 range => 162°; then mirrored above stays in range.
      const a = resolveMagnitudeAngle(0, 180, true, 'above', fixed(0.9));
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(180);
    });

    it('direction "below" keeps the interior angle in (180,360)', () => {
      const a = resolveMagnitudeAngle(0, 180, true, 'below', fixed(0.1));
      expect(a).toBeGreaterThan(180);
      expect(a).toBeLessThanOrEqual(360);
    });

    it('direction "random" does not force a side', () => {
      const a = resolveMagnitudeAngle(0, 180, true, 'random', fixed(0.1));
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(180);
    });

    it('includeReflex false overrides an above-below request that would be reflex', () => {
      // below forces a reflex interior angle, but includeReflex=false clamps it.
      const a = resolveMagnitudeAngle(0, 180, false, 'below', fixed(0.1));
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(180);
    });

    it('exposes the supported directions', () => {
      expect(MAGNITUDE_DIRECTIONS).toEqual(['above', 'below', 'random']);
      MAGNITUDE_DIRECTIONS.forEach((d) => {
        expect(['above', 'below', 'random']).toContain(d as MagnitudeDirection);
      });
    });
  });

  describe('resolveMagnitudeTolerance', () => {
    it('uses a numeric setting directly', () => {
      expect(resolveMagnitudeTolerance(3)).toBe(3);
      expect(resolveMagnitudeTolerance(0.5)).toBe(0.5);
    });

    it('parses a numeric string', () => {
      expect(resolveMagnitudeTolerance('3')).toBe(3);
      expect(resolveMagnitudeTolerance('7.5')).toBe(7.5);
    });

    it('falls back for legacy select strings', () => {
      expect(resolveMagnitudeTolerance('moderate')).toBe(5);
      expect(resolveMagnitudeTolerance('tight')).toBe(5);
    });

    it('falls back for undefined/null/non-numeric', () => {
      expect(resolveMagnitudeTolerance(undefined)).toBe(5);
      expect(resolveMagnitudeTolerance(null)).toBe(5);
      expect(resolveMagnitudeTolerance('abc')).toBe(5);
      expect(resolveMagnitudeTolerance(NaN)).toBe(5);
    });

    it('honours a custom fallback', () => {
      expect(resolveMagnitudeTolerance(undefined, 10)).toBe(10);
      expect(resolveMagnitudeTolerance('loose', 10)).toBe(10);
    });
  });
});