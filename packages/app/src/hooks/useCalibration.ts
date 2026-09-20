import { useCallback } from 'react';
import { useStore } from '@kata/db';
import { applyCalibration, DEFAULT_CALIBRATION } from '@kata/rendering';

export function useCalibratedLStar() {
  const calibration = useStore((s) => s.calibration);

  return useCallback(
    (targetLStar: number): number => {
      return applyCalibration(targetLStar, calibration);
    },
    [calibration]
  );
}

export function useCalibrationOrDefault() {
  const calibration = useStore((s) => s.calibration);
  return calibration ?? DEFAULT_CALIBRATION;
}