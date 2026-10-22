import { useEffect, useState, useCallback, useMemo } from 'react';
import type {
  DrillConfiguration,
  TaskConditions,
  VariableId,
  TaskType,
  Variable,
} from '@kata/core';
import { DEFAULT_TASK_CONDITIONS } from '@kata/core';
import { getDrillConfig, saveDrillConfig, resetDrillConfig } from '@kata/db';
import { getVariable } from '../registry';

export function useSettings(
  subskillId: string,
  variableId: string,
  taskType: string
) {
  const [config, setConfig] = useState<DrillConfiguration | null>(null);
  const [loading, setLoading] = useState(true);

  const configId = useMemo(
    () => `${subskillId}:${variableId}:${taskType}`,
    [subskillId, variableId, taskType]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const variable: Variable | undefined = getVariable(variableId);
        const variableParams: Record<string, string | number> = {};
        const stimulusParams: Record<string, string | number> = {};

        if (variable) {
          for (const dim of variable.variableDimensions) {
            variableParams[dim.id] = dim.defaultValue;
          }
          for (const p of variable.stimulusParameters) {
            stimulusParams[p.id] = p.defaultValue;
          }
        }

        let saved: DrillConfiguration | null = null;
        try {
          saved = await getDrillConfig(configId);
        } catch (err) {
          console.warn('[useSettings] getDrillConfig failed:', err);
        }

        if (cancelled) return;

        const domain = (subskillId.split(':')[0] === 'drawing' ? 'drawing' : 'music') as 'drawing' | 'music';

        const resolved: DrillConfiguration = {
          id: configId,
          domain,
          subskillId: subskillId as any,
          variableId: variableId as VariableId,
          taskType: taskType as TaskType,
          taskConditions: {
            ...DEFAULT_TASK_CONDITIONS,
            ...(saved?.taskConditions ?? {}),
          },
          variableParams: {
            ...variableParams,
            ...(saved?.variableParams ?? {}),
          },
          stimulusParams: {
            ...stimulusParams,
            ...(saved?.stimulusParams ?? {}),
          },
        };

        console.log('[useSettings] LOADED', configId, resolved);
        setConfig(resolved);
        setLoading(false);
      } catch (err) {
        console.error('[useSettings] FATAL:', err);
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [configId, subskillId, variableId, taskType]);

  const updateTaskConditions = useCallback(async (patch: Partial<TaskConditions>) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const next = { ...prev, taskConditions: { ...prev.taskConditions, ...patch } };
      saveDrillConfig(next).catch(() => {});
      return next;
    });
  }, []);

  const updateVariableParams = useCallback(async (patch: Record<string, string | number>) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const next = { ...prev, variableParams: { ...prev.variableParams, ...patch } };
      saveDrillConfig(next).catch(() => {});
      return next;
    });
  }, []);

  const updateStimulusParams = useCallback(async (patch: Record<string, string | number>) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const next = { ...prev, stimulusParams: { ...prev.stimulusParams, ...patch } };
      saveDrillConfig(next).catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(async () => {
    await resetDrillConfig(configId);
    const variable = getVariable(variableId);
    if (!variable) return;

    const variableParams: Record<string, string | number> = {};
    const stimulusParams: Record<string, string | number> = {};
    for (const dim of variable.variableDimensions) variableParams[dim.id] = dim.defaultValue;
    for (const p of variable.stimulusParameters) stimulusParams[p.id] = p.defaultValue;

    const domain = (subskillId.split(':')[0] === 'drawing' ? 'drawing' : 'music') as 'drawing' | 'music';

    setConfig({
      id: configId,
      domain,
      subskillId: subskillId as any,
      variableId: variableId as VariableId,
      taskType: taskType as TaskType,
      taskConditions: DEFAULT_TASK_CONDITIONS,
      variableParams,
      stimulusParams,
    });
  }, [configId, variableId, subskillId, taskType]);

  return useMemo(
    () => ({
      config,
      loading,
      updateTaskConditions,
      updateVariableParams,
      updateStimulusParams,
      reset,
    }),
    [config, loading, updateTaskConditions, updateVariableParams, updateStimulusParams, reset]
  );
}
