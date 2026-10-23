import { useEffect, useState } from 'react';
import type {
  Variable,
  VariableDimension,
  StimulusParameter,
  TaskConditions,
  DrillConfiguration,
} from '@kata/core';

interface SettingsPanelProps {
  variable: Variable;
  config: DrillConfiguration;
  onUpdateTaskConditions: (patch: Partial<TaskConditions>) => void;
  onUpdateVariableParams: (patch: Record<string, string | number>) => void;
  onUpdateStimulusParams: (patch: Record<string, string | number>) => void;
  onReset: () => void;
  onClose: () => void;
}

export function SettingsPanel({
  variable,
  config,
  onUpdateTaskConditions,
  onUpdateVariableParams,
  onUpdateStimulusParams,
  onReset,
  onClose,
}: SettingsPanelProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-lg font-bold">Drill Settings</h2>
            <p className="text-xs text-neutral-500 mt-1">
              {variable.id} · {variable.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold"
          >
            DONE
          </button>
        </div>

        <Section
          title="Task Conditions"
          subtitle="How the drill runs. Same for all variables."
        >
          <TaskConditionsControls
            values={config.taskConditions}
            onChange={onUpdateTaskConditions}
          />
        </Section>

        <Section
          title="Variable Parameters"
          subtitle="What the variable itself takes. Specific to this drill."
        >
          {variable.variableDimensions.map((dim) => (
            <DimensionControl
              key={dim.id}
              dimension={dim}
              value={config.variableParams[dim.id] ?? dim.defaultValue}
              onChange={(v) => onUpdateVariableParams({ [dim.id]: v })}
              allValues={config.variableParams}
            />
          ))}
        </Section>

        <Section
          title="Stimulus Parameters"
          subtitle="Properties of the stimulus that make the variable harder or easier to perceive."
        >
          {variable.stimulusParameters.map((p) => (
            <StimulusControl
              key={p.id}
              parameter={p}
              value={config.stimulusParams[p.id] ?? p.defaultValue}
              onChange={(v) => onUpdateStimulusParams({ [p.id]: v })}
            />
          ))}
        </Section>

        <div className="sticky bottom-0 bg-neutral-900 border-t border-neutral-800 px-6 py-4 flex justify-between">
          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold"
          >
            RESET TO GLOBAL
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-5 border-b border-neutral-800">
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
        {title}
      </h3>
      <p className="text-xs text-neutral-600 mb-4">{subtitle}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function TaskConditionsControls({
  values,
  onChange,
}: {
  values: TaskConditions;
  onChange: (patch: Partial<TaskConditions>) => void;
}) {
  return (
    <>
      <Row label="Repetitions">
        <SelectOrNumber
          presets={[5, 10, 20, 50, 100]}
          value={values.repetitions}
          allowEndless
          onChange={(v) => onChange({ repetitions: v })}
        />
      </Row>
      <Row label="Speed (time per trial)">
        <SelectOrNumber
          presets={[5, 3, 2, 1, 0.5]}
          value={values.speedSeconds}
          allowUntimed
          unit="s"
          onChange={(v) => onChange({ speedSeconds: v })}
        />
      </Row>
      <Row label="Inter-trial interval">
        <SelectOrNumber
          presets={[0.5, 1, 2, 5]}
          value={values.interTrialIntervalSeconds}
          unit="s"
          onChange={(v) =>
            onChange({ interTrialIntervalSeconds: typeof v === 'number' ? v : 2 })
          }
        />
      </Row>
      <Row label="Response deadline">
        <SelectOrNumber
          presets={[10, 5, 3, 2, 1]}
          value={values.responseDeadlineSeconds}
          allowNone
          unit="s"
          onChange={(v) => onChange({ responseDeadlineSeconds: v })}
        />
      </Row>
      <Row label="Feedback timing">
        <select
          value={values.feedbackTiming}
          onChange={(e) =>
            onChange({
              feedbackTiming: e.target.value as TaskConditions['feedbackTiming'],
            })
          }
          className="w-48 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
        >
          <option value="immediate">Immediate</option>
          <option value="delayed">Delayed</option>
          <option value="session-end">Session end</option>
        </select>
      </Row>
      {values.feedbackTiming === 'delayed' && (
        <Row label="Feedback delay">
          <SelectOrNumber
            presets={[0.5, 1, 2, 5]}
            value={values.feedbackDelaySeconds}
            unit="s"
            onChange={(v) =>
              onChange({
                feedbackDelaySeconds: typeof v === 'number' ? v : 1,
              })
            }
          />
        </Row>
      )}
      <Row label="Feedback type">
        <select
          value={values.feedbackType}
          onChange={(e) =>
            onChange({
              feedbackType: e.target.value as TaskConditions['feedbackType'],
            })
          }
          className="w-48 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
        >
          <option value="correct-incorrect">Correct / incorrect</option>
          <option value="specific-error">Specific error</option>
          <option value="timed">Timed</option>
        </select>
      </Row>
      <Row label="Session length">
        <SelectOrNumber
          presets={[5, 10, 20, 30]}
          value={values.sessionLengthMinutes}
          allowEndless
          unit="min"
          onChange={(v) => onChange({ sessionLengthMinutes: v })}
        />
      </Row>
      <Row label="Enable perceptual ratings">
        <button
          onClick={() => onChange({ enableRatings: !values.enableRatings })}
          className={
            'px-4 py-2 rounded-lg text-sm font-semibold ' +
            (values.enableRatings
              ? 'bg-blue-600 hover:bg-blue-500'
              : 'bg-neutral-800 hover:bg-neutral-700')
          }
        >
          {values.enableRatings ? 'ON' : 'OFF'}
        </button>
      </Row>

      <Row label="Show audio visualisation">
        <button
          onClick={() =>
            onChange({ showVisualisation: !values.showVisualisation })
          }
          className={
            'px-4 py-2 rounded-lg text-sm font-semibold ' +
            (values.showVisualisation
              ? 'bg-blue-600 hover:bg-blue-500'
              : 'bg-neutral-800 hover:bg-neutral-700')
          }
        >
          {values.showVisualisation ? 'ON' : 'OFF'}
        </button>
      </Row>
    </>
  );
}

function DimensionControl({
  dimension,
  value,
  onChange,
  allValues,
}: {
  dimension: VariableDimension;
  value: string | number;
  onChange: (v: string | number) => void;
  allValues: Record<string, string | number>;
}) {
  if (dimension.appliesWhen) {
    const { dimension: depDim, values } = dimension.appliesWhen;
    const depValue = allValues[depDim];
    if (depValue === undefined || !values.includes(String(depValue))) {
      return null;
    }
  }

  return (
    <Row label={dimension.label} help={dimension.helpText}>
      {dimension.kind === 'select' && (
        <GroupedSelect
          value={String(value)}
          options={
            (dimension.options ?? []) as Array<{
              value: string;
              label: string;
              group?: string;
            }>
          }
          onChange={(v) => onChange(v)}
        />
      )}
      {dimension.kind === 'number' && (
        <NumberInput
          value={Number(value)}
          min={dimension.range?.min}
          max={dimension.range?.max}
          step={dimension.range?.step ?? 1}
          unit={dimension.range?.unit}
          extendable={dimension.range?.extendable ?? true}
          onChange={(v) => onChange(v)}
        />
      )}
      {dimension.kind === 'range' && (
        <RangeWithNumber
          value={Number(value)}
          min={dimension.range?.min ?? 0}
          max={dimension.range?.max ?? 100}
          step={dimension.range?.step ?? 1}
          unit={dimension.range?.unit}
          extendable={dimension.range?.extendable ?? true}
          onChange={(v) => onChange(v)}
        />
      )}
      {dimension.kind === 'text' && (
        <input
          type="text"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-64 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
        />
      )}
    </Row>
  );
}

function StimulusControl({
  parameter,
  value,
  onChange,
}: {
  parameter: StimulusParameter;
  value: string | number;
  onChange: (v: string | number) => void;
}) {
  return (
    <Row label={parameter.label} help={parameter.helpText}>
      {parameter.kind === 'select' && (
        <GroupedSelect
          value={String(value)}
          options={
            (parameter.options ?? []) as Array<{
              value: string;
              label: string;
              group?: string;
            }>
          }
          onChange={(v) => onChange(v)}
        />
      )}
      {parameter.kind === 'number' && (
        <NumberInput
          value={Number(value)}
          min={parameter.range?.min}
          max={parameter.range?.max}
          step={parameter.range?.step ?? 1}
          unit={parameter.range?.unit}
          extendable={parameter.range?.extendable ?? true}
          onChange={(v) => onChange(v)}
        />
      )}
    </Row>
  );
}

function GroupedSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string; group?: string }>;
  onChange: (v: string) => void;
}) {
  const hasGroups = options.some((o) => o.group);

  if (!hasGroups) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-64 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  const groups = new Map<string, typeof options>();
  for (const o of options) {
    const g = o.group ?? '';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(o);
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-64 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
    >
      {Array.from(groups.entries()).map(([groupName, groupOpts]) =>
        groupName ? (
          <optgroup key={groupName} label={groupName}>
            {groupOpts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ) : (
          groupOpts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))
        )
      )}
    </select>
  );
}

function Row({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className="text-sm text-neutral-300">{label}</div>
        {help && (
          <div className="text-xs text-neutral-600 mt-0.5">{help}</div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function NumberInput({
  value,
  min,
  max,
  step,
  unit,
  extendable,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  step: number;
  unit?: string;
  extendable: boolean;
  onChange: (v: number) => void;
}) {
  const [local, setLocal] = useState(String(value));

  useEffect(() => {
    setLocal(String(value));
  }, [value]);

  const commit = () => {
    const num = Number(local);
    if (Number.isFinite(num)) {
      onChange(num);
    } else {
      setLocal(String(value));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={local}
        min={extendable ? undefined : min}
        max={extendable ? undefined : max}
        step={step}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
        }}
        className="w-28 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm font-mono"
      />
      {unit && <span className="text-xs text-neutral-500 w-10">{unit}</span>}
    </div>
  );
}

function RangeWithNumber({
  value,
  min,
  max,
  step,
  unit,
  extendable,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  extendable: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-40"
      />
      {extendable ? (
        <NumberInput
          value={value}
          min={min}
          max={max}
          step={step}
          unit={unit}
          extendable={extendable}
          onChange={onChange}
        />
      ) : (
        <span className="text-xs text-neutral-500 font-mono w-16">
          {value}
          {unit ? ' ' + unit : ''}
        </span>
      )}
    </div>
  );
}

function SelectOrNumber({
  presets,
  value,
  unit,
  allowEndless,
  allowUntimed,
  allowNone,
  onChange,
}: {
  presets: number[];
  value: number | 'endless' | 'untimed' | 'none';
  unit?: string;
  allowEndless?: boolean;
  allowUntimed?: boolean;
  allowNone?: boolean;
  onChange: (v: any) => void;
}) {
  const isCustom =
    typeof value === 'number' && !presets.includes(value);
  const [customMode, setCustomMode] = useState(isCustom);

  if (customMode) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={typeof value === 'number' ? value : 0}
          step={0.5}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm font-mono"
        />
        {unit && <span className="text-xs text-neutral-500">{unit}</span>}
        <button
          onClick={() => setCustomMode(false)}
          className="px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200"
        >
          presets
        </button>
      </div>
    );
  }

  return (
    <select
      value={String(value)}
      onChange={(e) => {
        const v = e.target.value;
        if (v === 'custom') {
          setCustomMode(true);
          return;
        }
        if (v === 'endless' || v === 'untimed' || v === 'none') {
          onChange(v);
          return;
        }
        onChange(Number(v));
      }}
      className="w-48 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
    >
      {presets.map((p) => (
        <option key={p} value={p}>
          {p}
          {unit ? ' ' + unit : ''}
        </option>
      ))}
      {allowEndless && <option value="endless">Endless</option>}
      {allowUntimed && <option value="untimed">Untimed</option>}
      {allowNone && <option value="none">None</option>}
      <option value="custom">Custom…</option>
    </select>
  );
}

