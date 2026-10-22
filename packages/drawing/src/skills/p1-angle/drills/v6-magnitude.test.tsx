import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { DrillProps, Variable } from '@kata/core';
import { V6MagnitudeDrill } from './v6-magnitude';

const VARIABLE: Variable = {
  id: 'V6',
  name: 'Angle Magnitude Classification',
  definition: 'Classify angle as acute, right, obtuse, or reflex',
  unit: '°',
  lowerIsBetter: true,
  normativeRange: { lower: 0, upper: 180 },
};

function renderDrill(settings?: Partial<DrillProps['settings']>) {
  const onAnswer = vi.fn();
  const calibratedLStar = vi.fn((t: number) => t);
  render(
    <V6MagnitudeDrill
      variable={VARIABLE}
      delta={5}
      onAnswer={onAnswer}
      calibratedLStar={calibratedLStar}
      settings={{ autoContinue: false, ...settings }}
      task={{}}
    />
  );
  return { onAnswer, calibratedLStar };
}

function submitValue(value: string) {
  const input = screen.getByPlaceholderText('0–360');
  fireEvent.change(input, { target: { value } });
  fireEvent.click(screen.getByText('SUBMIT'));
}

describe('V6MagnitudeDrill', () => {
  it('renders the prompt and a numeric input', () => {
    renderDrill({ angleMin: 10, angleMax: 80, magnitudeTolerance: 3 });
    expect(screen.getByText(/Enter this angle's magnitude in degrees/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0–360')).toBeInTheDocument();
  });

  it('shows the numbered correctness range (not select buttons)', () => {
    renderDrill({ angleMin: 10, angleMax: 80, magnitudeTolerance: 3 });
    expect(screen.getByText(/Within 3° of the true angle/)).toBeInTheDocument();
  });

  it('shows the configured opening direction', () => {
    renderDrill({ angleMin: 100, angleMax: 170, magnitudeTolerance: 5, magnitudeDirection: 'above' });
    expect(screen.getByText(/above the reference/)).toBeInTheDocument();
  });

  it('shows a below-reference direction when configured', () => {
    renderDrill({ angleMin: 0, angleMax: 180, magnitudeTolerance: 5, magnitudeDirection: 'below', includeReflex: true });
    expect(screen.getByText(/below the reference/)).toBeInTheDocument();
  });

  it('reports a correct answer when the guess is within tolerance', () => {
    // Force the acute-only range to resolve to 45° (10 + 0.5 * 70).
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    try {
      const { onAnswer } = renderDrill({ angleMin: 10, angleMax: 80, magnitudeTolerance: 5, autoContinue: false });
      submitValue('45');
      fireEvent.click(screen.getByText('CONTINUE'));
      expect(onAnswer).toHaveBeenCalledTimes(1);
      expect(onAnswer.mock.calls[0]![0]).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });

  it('reports an incorrect answer when the guess is outside tolerance', () => {
    const { onAnswer } = renderDrill({ angleMin: 10, angleMax: 80, magnitudeTolerance: 1, autoContinue: false });
    submitValue('89');
    fireEvent.click(screen.getByText('CONTINUE'));
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer.mock.calls[0]![0]).toBe(false);
  });

  it('classifies a submitted answer and labels the angle type', () => {
    renderDrill({ angleMin: 70, angleMax: 110, magnitudeTolerance: 5, autoContinue: false });
    // The generated angle is in [70,110]; classify the display type is shown.
    expect(screen.getByText(/(acute|right|obtuse|reflex) angle/)).toBeInTheDocument();
  });

  it('tolerance falls back to the default when unset', () => {
    renderDrill({ angleMin: 10, angleMax: 80 });
    expect(screen.getByText(/Within 5° of the true angle/)).toBeInTheDocument();
  });

  it('tolerates a legacy string tolerance via the fallback', () => {
    renderDrill({ angleMin: 10, angleMax: 80, magnitudeTolerance: 'moderate' as any });
    expect(screen.getByText(/Within 5° of the true angle/)).toBeInTheDocument();
  });
});
