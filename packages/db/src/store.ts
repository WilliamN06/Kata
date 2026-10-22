import { create } from 'zustand';
import type {
  VariableState,
  DrillSettings,
  CalibrationData,
  UnlockState,
} from '@kata/core';
import { DEFAULT_SETTINGS, computeNewAccuracy, checkGroupUnlock } from '@kata/core';
import * as queries from './queries';
import type { DrillConfiguration } from './queries';

interface AppState {
  variables: VariableState[];
  settings: DrillSettings;
  calibration: CalibrationData | null;
  unlocks: UnlockState;
  loaded: boolean;
  currentSessionId: string | null;
  sessionStartedAt: string | null;

  load: () => Promise<void>;
  saveSettings: (settings: DrillSettings) => Promise<void>;
  saveCalibration: (cal: CalibrationData) => Promise<void>;
  recordTrial: (
    stateId: string,
    correct: boolean,
    deltaValue: number,
    responseTimeMs: number
  ) => Promise<void>;
  refresh: () => Promise<void>;
  ensureState: (stateId: string, domain: string, subskillId: string, variableId: string) => Promise<void>;
  startSession: (type: 'adaptive' | 'freeplay') => void;
  endSession: (drills: string[], accuracy: number) => Promise<void>;
  // Drill configuration persistence
  getDrillConfig: (subskillId: string, drillId: string) => Promise<DrillConfiguration>;
  saveDrillConfig: (subskillId: string, drillId: string, config: Partial<DrillConfiguration>) => Promise<void>;
  resetDrillConfig: (subskillId: string, drillId: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  variables: [],
  settings: { ...DEFAULT_SETTINGS } as DrillSettings,
  calibration: null,
  unlocks: {
    groupA: false,
    groupB: false,
    groupC: false,
    taskConditions: false,
    backgroundConditions: false,
    level3A: false,
    automaticity: false,
  },
  loaded: false,
  currentSessionId: null,
  sessionStartedAt: null,

  load: async () => {
    const [variables, settings, calibration, unlocks] = await Promise.all([
      queries.getAllVariableStates(),
      queries.getGlobalSettings(),
      queries.getCalibration(),
      queries.getUnlockState(),
    ]);

    set({
      variables,
      settings,
      calibration,
      unlocks,
      loaded: true,
      currentSessionId: `session_${Date.now()}`,
      sessionStartedAt: new Date().toISOString(),
    });
  },

  saveSettings: async (settings) => {
    await queries.saveSettings(settings);
    set({ settings });
  },

  saveCalibration: async (cal) => {
    await queries.saveCalibration(cal);
    set({ calibration: cal });
  },

  recordTrial: async (stateId, correct, deltaValue, responseTimeMs) => {
    const state = get();
    const sessionId = state.currentSessionId ?? `session_${Date.now()}`;

    await queries.logTrial(
      { stateId, level: '1A', correct, deltaValue, responseTimeMs },
      sessionId
    );

    const varState = state.variables.find((v) => v.id === stateId);
    const oldAccuracy = varState?.accuracy ?? 0;
    const oldTrialCount = varState?.trialCount ?? 0;
    const newAccuracy = computeNewAccuracy(oldAccuracy, correct);

    await queries.updateVariableState(stateId, {
      accuracy: newAccuracy,
      trialCount: oldTrialCount + 1,
      lastPracticed: new Date().toISOString(),
    });

    await get().refresh();
  },

  ensureState: async (stateId, domain, subskillId, variableId) => {
    await queries.ensureVariableState(stateId, domain, subskillId, variableId);
    await get().refresh();
  },

  refresh: async () => {
    const [variables, unlocks] = await Promise.all([
      queries.getAllVariableStates(),
      queries.getUnlockState(),
    ]);

    // Check for group unlocks
    const accuracies: Record<string, number> = {};
    for (const v of variables) accuracies[v.id] = v.accuracy;

    const updates: Partial<UnlockState> = {};

    // P3 groups (hardcoded for now — later, use subskill.integrationGroups)
    if (
      !unlocks.groupA &&
      checkGroupUnlock(
        ['drawing:p3-value:V1', 'drawing:p3-value:V3', 'drawing:p3-value:V11'],
        accuracies
      )
    ) {
      await queries.unlock('group_A');
      updates.groupA = true;
    }

    if (
      !unlocks.groupB &&
      checkGroupUnlock(
        ['drawing:p3-value:V2', 'drawing:p3-value:V5', 'drawing:p3-value:V7'],
        accuracies
      )
    ) {
      await queries.unlock('group_B');
      updates.groupB = true;
    }

    if (
      !unlocks.groupC &&
      checkGroupUnlock(
        ['drawing:p3-value:V6', 'drawing:p3-value:V8', 'drawing:p3-value:V9'],
        accuracies
      )
    ) {
      await queries.unlock('group_C');
      updates.groupC = true;
    }

    set({
      variables,
      unlocks: { ...unlocks, ...updates },
    });
  },

  startSession: (_type) => {
    set({
      currentSessionId: `session_${Date.now()}`,
      sessionStartedAt: new Date().toISOString(),
    });
  },

  endSession: async (drills, accuracy) => {
    const state = get();
    const sessionId = state.currentSessionId ?? `session_${Date.now()}`;
    const startedAt = state.sessionStartedAt ?? new Date().toISOString();

    await queries.saveSessionSummary({
      id: sessionId,
      type: 'adaptive',
      startedAt,
      endedAt: new Date().toISOString(),
      drillCount: drills.length,
      accuracy,
      drills,
    });

    set({
      currentSessionId: null,
      sessionStartedAt: null,
    });
  },

  // Drill configuration persistence
  getDrillConfig: async (subskillId, drillId) => {
    const drillConfigId = `drawing:${subskillId}:${drillId}`;
    let stored = null;
    try {
      stored = await queries.getDrillConfiguration(drillConfigId);
    } catch {
      stored = null;
    }
    const global = get().settings;
    
    // Get the drill's variable parameters metadata for defaults
    // For now, use the default variable params
    const defaultVariableParams: Record<string, string | number> = {
      baseRange: 'full',
      baseLuminance: 'mid',
      deltaStart: 25,
    };

    // Merge: global defaults + per-drill overrides
    const mergedConfig: DrillConfiguration = {
      id: drillConfigId,
      tier: 'drill',
      difficultyMode: 'auto',
      manualDelta: 5.0,
      variable: {
        ...defaultVariableParams,
        ...(stored?.variable ?? {}),
      },
      stimulus: {
        ...{
          texture: 'smooth',
          colour: 'neutral',
          backgroundValue: 'mid',
          backgroundColour: 'neutral',
          backgroundComplexity: 'plain',
          contrast: 'moderate',
          lightingDirection: 'front',
          lightingIntensity: 'moderate',
          lightingColour: 'neutral',
          viewingDistance: 'close',
          viewingAngle: 'frontal',
          surfaceOrientation: 'flat',
          surfaceTexture: 'smooth',
          surfaceColour: 'white',
          ambientNoise: 'quiet',
          temperature: 'moderate',
          timeOfDay: 'morning',
        },
        ...(stored?.stimulus ?? {}),
      },
      task: {
        ...{
          timed: false,
          secondsPerTrial: 15,
          endless: false,
          repetitions: 20,
          streakThreshold: null,
          autoContinue: true,
          feedbackDurationMs: 1500,
          feedbackDelay: 'immediate',
          feedbackType: 'visual',
          tolerance: 'moderate',
          distraction: 'none',
          fatigue: 'fresh',
          complexity: '1',
          interaction: 'independent',
          variability: 'predictable',
          conditions: '1',
        },
        ...(stored?.task ?? {}),
      },
    };

    return mergedConfig;
  },

  saveDrillConfig: async (subskillId, drillId, partial) => {
    console.log('[store] saveDrillConfig called', { subskillId, drillId, partial });
    const drillConfigId = `drawing:${subskillId}:${drillId}`;
    const current = await get().getDrillConfig(subskillId, drillId);
    console.log('[store] current config', current);

    const merged: DrillConfiguration = {
      ...current,
      ...partial,
      id: drillConfigId,
      tier: 'drill',
    };

    await queries.saveDrillConfiguration(merged);
    console.log('[store] saveDrillConfig completed');
  },

  resetDrillConfig: async (subskillId, drillId) => {
    const drillConfigId = `drawing:${subskillId}:${drillId}`;
    const adapter = await import('./index').then((m) => m.getAdapter());
    await adapter.exec('DELETE FROM drill_configurations WHERE id = ?', [drillConfigId]);
  },
}));