import { create } from 'zustand';
import type { DrillConfiguration, VariableState, TrialResult } from '@kata/core';
import * as queries from './queries.new';

interface Store {
  variables: Record<string, VariableState>;
  drillConfigs: Record<string, DrillConfiguration>;
  loaded: boolean;
  load: () => Promise<void>;
  recordTrial: (result: TrialResult) => Promise<void>;
  saveDrillConfig: (config: DrillConfiguration) => Promise<void>;
  resetDrillConfig: (id: string) => Promise<void>;
}

export const useStoreNew = create<Store>((set, get) => ({
  variables: {},
  drillConfigs: {},
  loaded: false,
  load: async () => { set({ loaded: true }); },
  recordTrial: async (result) => {
    await queries.logTrial(result);
    const existing = get().variables[result.variableId];
    const trialCount = (existing?.trialCount ?? 0) + 1;
    const correctCount = existing ? Math.round(existing.accuracy * existing.trialCount) + (result.correct ? 1 : 0) : (result.correct ? 1 : 0);
    const newAccuracy = correctCount / trialCount;
    const newState: VariableState = {
      variableId: result.variableId,
      accuracy: newAccuracy,
      threshold: null,
      trialCount,
      lastPracticed: new Date().toISOString(),
    };
    await queries.upsertVariableState(newState);
    set((s) => ({ variables: { ...s.variables, [result.variableId]: newState } }));
  },
  saveDrillConfig: async (config) => {
    await queries.saveDrillConfiguration(config);
    set((s) => ({ drillConfigs: { ...s.drillConfigs, [config.id]: config } }));
  },
  resetDrillConfig: async (id) => {
    await queries.resetDrillConfiguration(id);
    set((s) => {
      const next = { ...s.drillConfigs };
      delete next[id];
      return { drillConfigs: next };
    });
  },
}));
