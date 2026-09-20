import { useStore } from '@kata/db';

export function useDrillSettings() {
  const settings = useStore((s) => s.settings);
  return {
    autoContinue: settings.autoContinue ?? true,
    feedbackDurationMs: settings.feedbackDurationMs ?? 1500,
    showAngleLines: settings.showAngleLines ?? true,
  };
}