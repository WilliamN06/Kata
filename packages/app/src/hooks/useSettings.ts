import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  const configRef = useRef<DrillConfiguration | null>(null);

  const configId = useMemo(
    () => `${subskillId}:${variableId}:${taskType}`,
    [subskillId, variableId, taskType]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
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

        configRef.current = resolved;
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

  const persist = useCallback((next: DrillConfiguration) => {
    configRef.current = next;
    setConfig(next);
    saveDrillConfig(next).catch((err) => {
      console.warn('[useSettings] saveDrillConfig failed:', err);
    });
  }, []);

  const updateTaskConditions = useCallback(
    (patch: Partial<TaskConditions>) => {
      const prev = configRef.current;
      if (!prev) return;
      persist({
        ...prev,
        taskConditions: { ...prev.taskConditions, ...patch },
      });
    },
    [persist]
  );

  const updateVariableParams = useCallback(
    (patch: Record<string, string | number>) => {
      const prev = configRef.current;
      if (!prev) return;
      persist({
        ...prev,
        variableParams: { ...prev.variableParams, ...patch },
      });
    },
    [persist]
  );

  const updateStimulusParams = useCallback(
    (patch: Record<string, string | number>) => {
      const prev = configRef.current;
      if (!prev) return;
      persist({
        ...prev,
        stimulusParams: { ...prev.stimulusParams, ...patch },
      });
    },
    [persist]
  );

  const reset = useCallback(async () => {
    await resetDrillConfig(configId);
    const variable = getVariable(variableId);
    if (!variable) return;

    const variableParams: Record<string, string | number> = {};
    const stimulusParams: Record<string, string | number> = {};
    for (const dim of variable.variableDimensions) variableParams[dim.id] = dim.defaultValue;
    for (const p of variable.stimulusParameters) stimulusParams[p.id] = p.defaultValue;

    const domain = (subskillId.split(':')[0] === 'drawing' ? 'drawing' : 'music') as 'drawing' | 'music';

    const next: DrillConfiguration = {
      id: configId,
      domain,
      subskillId: subskillId as any,
      variableId: variableId as VariableId,
      taskType: taskType as TaskType,
      taskConditions: DEFAULT_TASK_CONDITIONS,
      variableParams,
      stimulusParams,
    };
    configRef.current = next;
    setConfig(next);
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
