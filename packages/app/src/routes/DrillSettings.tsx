import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@kata/db';
import { DRILL_VARIABLE_SETTING_FIELDS } from '@kata/core';
import type { DrillSettings, VariableDimension } from '@kata/core';
import { getSubskill } from '../registry';

interface UiField {
  key: string;
  label: string;
  description?: string;
  type: 'select' | 'toggle' | 'number';
  options?: Array<{ value: string | number; label: string }>;
  default?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  group: 'variable' | 'stimulus' | 'task';
}

function dimensionToField(d: VariableDimension): UiField {
  const group: UiField['group'] = d.id.startsWith('stim_')
    ? 'stimulus'
    : d.id.startsWith('task_')
    ? 'task'
    : 'variable';
  const type: UiField['type'] =
    d.kind === 'toggle' ? 'toggle' : d.kind === 'range' ? 'number' : 'select';
  return {
    key: d.id,
    label: d.label,
    description: d.description,
    type,
    options: d.options,
    default: d.defaultValue,
    min: d.range?.min,
    max: d.range?.max,
    step: d.range?.step,
    group,
  };
}

export function DrillSettings() {
  const { domainId, subskillId, drillId } = useParams<{
    domainId: string;
    subskillId: string;
    drillId: string;
  }>();
  const navigate = useNavigate();
  const getDrillConfig = useStore((s) => s.getDrillConfig);
  const saveDrillConfig = useStore((s) => s.saveDrillConfig);

  const did = drillId ?? '';
  const sid = subskillId ?? '';
  const dom = domainId ?? '';

  const [local, setLocal] = useState<Partial<DrillSettings>>({});
  const [loaded, setLoaded] = useState(false);

  const drillDef = useMemo(() => {
    if (!dom || !sid || !did) return undefined;
    const sub = getSubskill(dom, sid);
    return sub?.drills[did];
  }, [dom, sid, did]);

     const varFields = useMemo<UiField[]>(() => {
    const dyn = drillDef?.variableParams?.dimensions;
    if (dyn && dyn.length > 0) return dyn.map(dimensionToField);

    const out: UiField[] = [];
    for (const raw of DRILL_VARIABLE_SETTING_FIELDS as unknown[]) {
      const anyF = raw as Record<string, unknown>;
      const applies = typeof anyF.appliesTo === 'function'
        ? (anyF.appliesTo as (s: string, d: string) => boolean)(sid, did)
        : true;
      if (!applies) continue;
      out.push({
        key: anyF.key as string,
        label: anyF.label as string,
        description: anyF.description as string | undefined,
        type: anyF.type as UiField['type'],
        options: anyF.options as UiField['options'],
        default: anyF.default as UiField['default'],
        min: anyF.min as number | undefined,
        max: anyF.max as number | undefined,
        step: anyF.step as number | undefined,
        group: 'variable',
      });
    }
    return out;
  }, [drillDef, sid, did]);

  const grouped = useMemo(() => {
    const variable: UiField[] = [];
    const stimulus: UiField[] = [];
    const task: UiField[] = [];
    for (const f of varFields) {
      if (f.group === 'stimulus') stimulus.push(f);
      else if (f.group === 'task') task.push(f);
      else variable.push(f);
    }
    return { variable, stimulus, task };
  }, [varFields]);

  useEffect(() => {
    if (!sid || !did) return;
    setLoaded(false);
    getDrillConfig(sid, did)
      .then((cfg: any) => {
        const merged: any = {
          timed: cfg?.task?.timed,
          secondsPerTrial: cfg?.task?.secondsPerTrial,
          endless: cfg?.task?.endless,
          trialsPerSession: cfg?.task?.repetitions,
          streakThreshold: cfg?.task?.streakThreshold,
          answerDisplayDuration: cfg?.task?.feedbackDurationMs,
          autoContinue: cfg?.task?.autoContinue,
        };
        for (const f of varFields) {
          merged[f.key] = cfg?.variable?.[f.key] ?? f.default;
        }
        setLocal(merged);
        setLoaded(true);
      })
      .catch(() => {
        setLocal({});
        setLoaded(true);
      });
  }, [sid, did, getDrillConfig, varFields]);

  const update = <K extends keyof DrillSettings>(key: K, value: DrillSettings[K]) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!sid || !did) return;
    const partial: any = { variable: {}, task: {} };

    for (const f of varFields) {
      if ((local as any)[f.key] !== undefined) {
        partial.variable[f.key] = (local as any)[f.key];
      }
    }
    const sessionMap: Record<string, string> = {
      timed: 'timed',
      secondsPerTrial: 'secondsPerTrial',
      endless: 'endless',
      trialsPerSession: 'repetitions',
      streakThreshold: 'streakThreshold',
      answerDisplayDuration: 'feedbackDurationMs',
      autoContinue: 'autoContinue',
    };
    for (const [uiKey, savedKey] of Object.entries(sessionMap)) {
      const v = (local as any)[uiKey];
      if (v !== undefined) partial.task[savedKey] = v;
    }

    if (Object.keys(partial.variable).length === 0) delete partial.variable;
    if (Object.keys(partial.task).length === 0) delete partial.task;

    try {
      await saveDrillConfig(sid, did, partial as any);
      navigate(`/${dom}/${sid}/${did}`);
    } catch (e) {
      console.error('[DrillSettings] save failed', e);
      alert('Failed to save settings: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const capitalizedDomain = dom.charAt(0).toUpperCase() + dom.slice(1);

  if (!loaded) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-neutral-400">Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <Link to={`/${dom}/${sid}/${did}`} className="text-neutral-400 hover:text-neutral-200">
          ← {capitalizedDomain}
        </Link>
        <h1 className="text-3xl font-bold">Drill Settings</h1>
        <div className="w-10"></div>
      </div>

      {grouped.variable.length > 0 && (
        <Section title="Variable Parameters">
          <div className="space-y-5">
            {grouped.variable.map((field) => (
              <DrillField key={field.key} field={field} local={local} update={update} />
            ))}
          </div>
        </Section>
      )}

      {grouped.stimulus.length > 0 && (
        <Section title="Stimulus Parameters">
          <div className="space-y-5">
            {grouped.stimulus.map((field) => (
              <DrillField key={field.key} field={field} local={local} update={update} />
            ))}
          </div>
        </Section>
      )}

      {grouped.task.length > 0 && (
        <Section title="Task Parameters">
          <div className="space-y-5">
            {grouped.task.map((field) => (
              <DrillField key={field.key} field={field} local={local} update={update} />
            ))}
          </div>
        </Section>
      )}

      <Section title="Session">
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={local.timed ?? false}
            onChange={(e) => setLocal({ ...local, timed: e.target.checked })}
            className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-blue-600"
          />
          <span className="text-sm text-neutral-300">Enable timed trials</span>
        </label>
        <div className={local.timed ? '' : 'opacity-40 pointer-events-none'}>
          <label className="block text-xs text-neutral-500 mb-1">Seconds per trial</label>
          <select
            value={String(local.secondsPerTrial ?? 15)}
            onChange={(e) => setLocal({ ...local, secondsPerTrial: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100"
          >
            <option value="5">5s</option>
            <option value="10">10s</option>
            <option value="15">15s</option>
            <option value="30">30s</option>
            <option value="60">60s</option>
          </select>
        </div>
      </Section>

      <Section title="Session Length">
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={local.endless ?? false}
            onChange={(e) => setLocal({ ...local, endless: e.target.checked })}
            className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-blue-600"
          />
          <span className="text-sm text-neutral-300">Endless mode</span>
        </label>
        <div className={local.endless ? 'opacity-40 pointer-events-none' : ''}>
          <label className="block text-xs text-neutral-500 mb-1">Trials per session</label>
          <input
            type="number"
            min={1}
            max={200}
            step={1}
            value={local.trialsPerSession ?? 20}
            onChange={(e) => setLocal({ ...local, trialsPerSession: Number(e.target.value) })}
            className="w-32 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100"
          />
        </div>
      </Section>

      <Section title="Streak Threshold">
        <input
          type="number"
          min={1}
          max={50}
          step={1}
          value={local.streakThreshold ?? 5}
          onChange={(e) => setLocal({ ...local, streakThreshold: Number(e.target.value) })}
          className="w-32 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100"
        />
      </Section>

      <Section title="Feedback Duration (ms)">
        <input
          type="number"
          min={500}
          max={10000}
          step={100}
          value={local.answerDisplayDuration ?? 1500}
          onChange={(e) => setLocal({ ...local, answerDisplayDuration: Number(e.target.value) })}
          className="w-32 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100"
        />
      </Section>

      <Section title="Auto Continue">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={local.autoContinue ?? true}
            onChange={(e) => setLocal({ ...local, autoContinue: e.target.checked })}
            className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-blue-600"
          />
          <span className="text-sm text-neutral-300">Auto-continue after feedback</span>
        </label>
      </Section>

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-neutral-800">
        <Link
          to={`/${dom}/${sid}/${did}`}
          className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition-colors"
        >
          CANCEL
        </Link>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
        >
          SAVE SETTINGS
        </button>
      </div>
    </div>
  );
}

function DrillField({
  field,
  local,
  update,
}: {
  field: UiField;
  local: Partial<DrillSettings>;
  update: <K extends keyof DrillSettings>(key: K, value: DrillSettings[K]) => void;
}) {
  const value = (local as any)[field.key];

  if (field.type === 'toggle') {
    return (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(value ?? field.default)}
          onChange={(e) => update(field.key as any, e.target.checked as any)}
          className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-blue-600"
        />
        <span className="text-sm text-neutral-300">{field.label}</span>
      </label>
    );
  }

  if (field.type === 'number') {
    return (
      <label className="block">
        <span className="block text-xs text-neutral-500 mb-1">{field.label}</span>
        <input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          value={value ?? field.default ?? 0}
          onChange={(e) => update(field.key as any, Number(e.target.value) as any)}
          className="w-32 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100"
        />
        {field.description && (
          <p className="text-xs text-neutral-600 mt-1">{field.description}</p>
        )}
      </label>
    );
  }

  if (field.options && field.options.length > 0) {
    return (
      <label className="block">
        <span className="block text-xs text-neutral-500 mb-1">{field.label}</span>
        <select
          value={String(value ?? field.default ?? '')}
          onChange={(e) => {
            // Preserve numeric values for numeric options
            const raw = e.target.value;
            const matched = field.options!.find((o) => String(o.value) === raw);
            const out = matched ? matched.value : raw;
            update(field.key as any, out as any);
          }}
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100"
        >
          {field.options.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
        {field.description && (
          <p className="text-xs text-neutral-600 mt-1">{field.description}</p>
        )}
      </label>
    );
  }

  return null;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}