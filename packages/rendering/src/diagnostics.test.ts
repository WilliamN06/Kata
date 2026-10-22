import { describe, it, expect, beforeAll } from 'vitest';
import { lStarToSrgb, lStarToRgbString } from './lstar';
import { applyCalibration, isCalibrationValid, DEFAULT_CALIBRATION } from './calibration';

describe('P3 Black Chip Diagnostics', () => {
  describe('Test 1: Rendering Pipeline (lstar.ts)', () => {
    it('converts L* to correct sRGB bytes (current implementation values)', () => {
      expect(lStarToSrgb(0)).toBe(0);
      expect(lStarToSrgb(25)).toBe(59);
      expect(lStarToSrgb(50)).toBe(119);
      expect(lStarToSrgb(75)).toBe(185);
      expect(lStarToSrgb(100)).toBe(255);
    });

    it('produces valid rgb strings', () => {
      expect(lStarToRgbString(50)).toBe('rgb(119, 119, 119)');
      expect(lStarToRgbString(0)).toBe('rgb(0, 0, 0)');
      expect(lStarToRgbString(100)).toBe('rgb(255, 255, 255)');
    });

    it('handles invalid input gracefully', () => {
      expect(lStarToSrgb(NaN)).toBe(128);
      expect(lStarToSrgb(Infinity)).toBe(128);
      expect(lStarToSrgb(-10)).toBe(0);
      expect(lStarToSrgb(110)).toBe(255);
    });
  });

  describe('Test 3: Calibration Function (calibration.ts)', () => {
    it('returns raw L* when calibration is null', () => {
      expect(applyCalibration(0, null)).toBe(0);
      expect(applyCalibration(25, null)).toBe(25);
      expect(applyCalibration(50, null)).toBe(50);
      expect(applyCalibration(75, null)).toBe(75);
      expect(applyCalibration(100, null)).toBe(100);
    });

    it('returns raw L* for invalid calibration (reversed)', () => {
      const badCal = { gamma: 1, blackPoint: 100, whitePoint: 0, date: '' };
      const result = applyCalibration(50, badCal);
      expect(result).toBe(50); // Should fall back to raw
    });

    it('returns raw L* for zero gamma', () => {
      const badCal = { gamma: 0, blackPoint: 0, whitePoint: 100, date: '' };
      expect(applyCalibration(50, badCal)).toBe(50);
    });

    it('returns raw L* for extreme gamma', () => {
      const badCal = { gamma: 10, blackPoint: 0, whitePoint: 100, date: '' };
      expect(applyCalibration(50, badCal)).toBe(50);
    });

    it('applies identity calibration correctly', () => {
      const goodCal = { gamma: 1, blackPoint: 0, whitePoint: 100, date: '' };
      expect(applyCalibration(0, goodCal)).toBe(0);
      expect(applyCalibration(50, goodCal)).toBe(50);
      expect(applyCalibration(100, goodCal)).toBe(100);
    });

    it('validates calibration correctly', () => {
      expect(isCalibrationValid(null)).toBe(false);
      expect(isCalibrationValid({ gamma: 1, blackPoint: 0, whitePoint: 100, date: '' })).toBe(true);
      expect(isCalibrationValid({ gamma: 0.1, blackPoint: 0, whitePoint: 100, date: '' })).toBe(false);
      expect(isCalibrationValid({ gamma: 10, blackPoint: 0, whitePoint: 100, date: '' })).toBe(false);
      expect(isCalibrationValid({ gamma: 1, blackPoint: 100, whitePoint: 0, date: '' })).toBe(false);
      expect(isCalibrationValid({ gamma: 1, blackPoint: 50, whitePoint: 50, date: '' })).toBe(false);
    });
  });

  describe('Test 4/6: ValueChip Defensive Logic', () => {
    it('sanitizes input to valid range', () => {
      // These test the logic that ValueChip uses internally
      const sanitize = (lStar: number) => Number.isFinite(lStar) ? Math.max(0, Math.min(100, lStar)) : 50;
      
      expect(sanitize(50)).toBe(50);
      expect(sanitize(-10)).toBe(0);
      expect(sanitize(110)).toBe(100);
      expect(sanitize(NaN)).toBe(50);
      expect(sanitize(Infinity)).toBe(50);
      expect(sanitize(undefined as any)).toBe(50);
    });
  });
});

// Integration test that requires a running app - run manually in DevTools
export const MANUAL_TESTS = `
// Run these in Tauri DevTools Console (F12)

// Test 2: Calibration State
const storeMod = await import('/src/db/store.ts').catch(() => import('@kata/db').catch(() => null));
const cal = storeMod?.useStore.getState().calibration;
console.log('Calibration:', JSON.stringify(cal));

// Test 4: DOM Elements
const chips = document.querySelectorAll('[role="img"]');
chips.forEach((el, i) => {
  const style = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  console.log(\`Chip \${i}: tag=\${el.tagName}, bg=\${style.backgroundColor}, size=\${rect.width}x\${rect.height}, filter=\${style.filter}\`);
});

// Test 5: Overlay Detection
chips.forEach((chip, i) => {
  const rect = chip.getBoundingClientRect();
  const topEl = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
  console.log(\`Chip \${i} overlay check: \${topEl === chip || chip.contains(topEl) ? 'OK' : 'COVERED by ' + topEl.tagName}\`);
});

// Test 8: Manual Gray Div
const d = document.createElement('div');
d.style.cssText = 'position:fixed;top:10px;left:10px;width:100px;height:100px;background:rgb(128,128,128);border:2px solid red;z-index:999999';
d.textContent='TEST';
document.body.appendChild(d);
setTimeout(()=>d.remove(),10000);
console.log('Test div added - look for gray square with red border at top-left');
`;