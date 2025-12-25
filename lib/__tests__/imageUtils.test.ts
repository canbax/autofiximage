import { describe, it, expect } from 'vitest';
import { getSafeCenteredRectForRotation } from '../imageUtils';

// Helper to assert centering within 1px tolerance due to rounding
function expectCentered(w: number, h: number, x: number, y: number, width: number, height: number) {
  const expectedX = (w - width) / 2;
  const expectedY = (h - height) / 2;
  expect(Math.abs(x - Math.round(expectedX))).toBeLessThanOrEqual(1);
  expect(Math.abs(y - Math.round(expectedY))).toBeLessThanOrEqual(1);
}

describe('getSafeCenteredRectForRotation', () => {
  it('returns full image at 0°', () => {
    const image = { naturalWidth: 1200, naturalHeight: 800 };
    const rect = getSafeCenteredRectForRotation(image, 0);
    expect(rect).toEqual({ x: 0, y: 0, width: 1200, height: 800 });
  });

  it('is symmetric for +angle and -angle', () => {
    const image = { naturalWidth: 1200, naturalHeight: 800 };
    const rPos = getSafeCenteredRectForRotation(image, 25);
    const rNeg = getSafeCenteredRectForRotation(image, -25);
    expect(rPos).toEqual(rNeg);
  });

  it('returns square of side min(w,h) at 90°', () => {
    const image = { naturalWidth: 1200, naturalHeight: 800 };
    const rect = getSafeCenteredRectForRotation(image, 90);
    expect(rect.width).toBe(800);
    expect(rect.height).toBe(800);
    expect(rect.x).toBe(200);
    expect(rect.y).toBe(0);
    expectCentered(1200, 800, rect.x, rect.y, rect.width, rect.height);
  });

  it('for square image at ~45° uses w/(cos+sin) approximation', () => {
    const image = { naturalWidth: 1000, naturalHeight: 1000 };
    const rect = getSafeCenteredRectForRotation(image, 45);
    // Expected ~707 (1000 / (cos45 + sin45) = 1000 / 1.4142...)
    expect(rect.width).toBe(707);
    expect(rect.height).toBe(707);
    expectCentered(1000, 1000, rect.x, rect.y, rect.width, rect.height);
    // Bounds safety
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.y).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(1000);
    expect(rect.y + rect.height).toBeLessThanOrEqual(1000);
  });

  // Invariants: results are centered and within bounds at a few angles
  it('centers and stays within bounds at 0°, 30°, 90°', () => {
    const image = { naturalWidth: 1600, naturalHeight: 900 };
    const rects = [0, 30, 90].map((a) => getSafeCenteredRectForRotation(image, a));
    rects.forEach((r) => {
      expectCentered(1600, 900, r.x, r.y, r.width, r.height);
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(1600);
      expect(r.y + r.height).toBeLessThanOrEqual(900);
    });
  });
});
