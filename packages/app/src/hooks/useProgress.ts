import { useEffect, useState, useCallback } from 'react';
import type { VariableState } from '@kata/core';
import { getAllVariableStates } from '@kata/db';

export interface ProgressSummary {
  states: Record<string, VariableState>;
  bySubskill: Record<string, { accuracy: number; count: number }>;
  weakest: VariableState[];
  strongest: VariableState[];
  recentlyPracticed: VariableState[];
}

export function useProgress() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const states = await getAllVariableStates();
      const byId: Record<string, VariableState> = {};
      for (const s of states) byId[s.variableId] = s;

      const bySubskill: Record<string, { accuracy: number; count: number }> = {};
      for (const s of states) {
        const parts = s.variableId.split(':');
        const subskillId = parts.slice(0, 2).join(':');
        const bucket = bySubskill[subskillId] ?? { accuracy: 0, count: 0 };
        bucket.accuracy += s.accuracy;
        bucket.count += 1;
        bySubskill[subskillId] = bucket;
      }
      for (const key of Object.keys(bySubskill)) {
        const bucket = bySubskill[key];
        if (bucket && bucket.count > 0) {
          bucket.accuracy = bucket.accuracy / bucket.count;
        }
      }

      const sorted = [...states].sort((a, b) => a.accuracy - b.accuracy);

      setSummary({
        states: byId,
        bySubskill,
        weakest: sorted.filter((s) => s.trialCount >= 5).slice(0, 5),
        strongest: sorted
          .filter((s) => s.trialCount >= 5)
          .slice(-5)
          .reverse(),
        recentlyPracticed: [...states]
          .filter((s) => s.lastPracticed)
          .sort(
            (a, b) =>
              new Date(b.lastPracticed!).getTime() -
              new Date(a.lastPracticed!).getTime()
          )
          .slice(0, 5),
      });
    } catch (e) {
      console.error('[useProgress] Failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, loading, refresh };
}
