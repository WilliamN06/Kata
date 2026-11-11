import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { DrillProps } from '@kata/core';
import { getAudioContext, resumeAudio } from '@kata/audio';
import { WaveformDisplay } from '@kata/visualisation';
import { startBackgroundNoise, stopBackgroundNoise } from '../SoundfontLoader';
import { HeadphoneCheck, headphonesVerified } from './HeadphoneCheck';
import { concat, getPrimitiveAnalyser, mulberry32, playSequence, stopAll, type Sequence } from './audio';
import {
  clamp,
  distance,
  fromUnit,
  getPrimitive,
  judge,
  rove,
  shuffle,
  step,
  toUnit,
  type Judged,
} from './model';

type Answer = Parameters<DrillProps['onAnswer']>[0];

/**
 * One renderer for every task type of every primitive variable.
 * All randomness is fixed per trial (DrillScreen remounts us each trial).
 */
export function PrimitiveDrill(props: DrillProps) {
  const { variable, taskType, variableParams, stimulusParams, taskConditions, currentValue, onAnswer } = props;
  const model = getPrimitive(variable.id);
  const p = useMemo(() => ({ ...stimulusParams, ...variableParams }), [stimulusParams, variableParams]);
  const J = useMemo(() => (model ? judge(model, p) : null), [model, p]);
  // Δ is fixed for the whole trial even if the staircase moves while feedback shows.
  const delta = useMemo(
    () => (J ? clamp(Number(currentValue) || 0, J.delta.min, J.delta.max) : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [J]
  );
  const seed = useMemo(() => Math.floor(Math.random() * 2 ** 31), []);
  const [phonesOk, setPhonesOk] = useState(() => headphonesVerified());

  useBackgroundNoise();
  useEffect(() => () => stopAll(), []);

  if (!model || !J) {
    return <div className="p-8 text-neutral-400">No primitive model registered for {variable.id}.</div>;
  }

  if (model.headphones && !phonesOk) return <HeadphoneCheck onPass={() => setPhonesOk(true)} />;

  const shared: TaskProps = {
    J,
    delta,
    seed,
    onAnswer,
    showVisualisation: !!taskConditions.showVisualisation,
  };

  switch (taskType) {
    case 'T1-categorisation':
      return <Categorisation {...shared} categories={clamp(Math.round(Number(p.categories) || 3), 2, 7)} />;
    case 'T2-discrimination':
      return <Discrimination {...shared} />;
    case 'T3-estimation':
      return <Estimation {...shared} />;
    case 'T4-matching':
      return <Matching {...shared} />;
    case 'T5-detection':
      return <Detection {...shared} />;
    case 'T6-ordering':
      return <Ordering {...shared} />;
    case 'T7-identification':
      return <Identification {...shared} />;
    default:
      return <div className="p-8 text-neutral-400">Unknown task type {taskType}.</div>;
  }
}

interface TaskProps {
  J: Judged;
  delta: number;
  seed: number;
  onAnswer: (a: Answer) => void;
  showVisualisation: boolean;
}

// ── Shared pieces ───────────────────────────────────────────────

function useBackgroundNoise() {
  useEffect(() => {
    const noise = (window as any).__kataBackgroundNoise;
    if (noise && noise.colour !== 'silence') {
      try {
        startBackgroundNoise(noise.colour, noise.level);
      } catch {
        /* optional */
      }
    }
    return () => {
      try {
        stopBackgroundNoise();
      } catch {
        /* optional */
      }
    };
  }, []);
}

function usePlayer() {
  const [playing, setPlaying] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const play = async (key: string, seq: Sequence) => {
    await resumeAudio();
    const pb = playSequence(seq);
    setPlaying(key);
    if (timer.current) clearTimeout(timer.current);
    const ms = (pb.endsAt - getAudioContext().currentTime) * 1000 + 100;
    timer.current = setTimeout(() => setPlaying(null), Math.max(0, ms));
  };
  return { playing, play };
}

/** Autoplay the main stimulus once, if audio is already unlocked. */
function useAutoplay(play: () => void) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (getAudioContext().state === 'running') {
      const id = setTimeout(play, 250);
      return () => clearTimeout(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function useAnswer(onAnswer: (a: Answer) => void) {
  const [answered, setAnswered] = useState(false);
  const start = useRef(Date.now());
  const submit = (correct: boolean, userResponse: unknown, correctResponse: string) => {
    if (answered) return;
    setAnswered(true);
    stopAll();
    const responseTimeMs = Date.now() - start.current;
    setTimeout(() => onAnswer({ correct, responseTimeMs, userResponse, correctResponse }), 250);
  };
  return { answered, submit };
}

function PlayButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 rounded-lg font-semibold transition-colors text-white ${
        active ? 'bg-blue-500' : 'bg-blue-600 hover:bg-blue-500'
      }`}
    >
      {active ? '♪ Playing…' : label}
    </button>
  );
}

function Choice({ children, onClick, disabled, selected }: { children: ReactNode; onClick: () => void; disabled?: boolean; selected?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 border rounded-lg font-semibold disabled:opacity-40 ${
        selected ? 'bg-neutral-600 border-neutral-400' : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700'
      }`}
    >
      {children}
    </button>
  );
}

function Frame({
  J,
  delta,
  deltaLabel = 'Δ',
  showVisualisation,
  play,
  question,
  children,
}: {
  J: Judged;
  delta: number;
  deltaLabel?: string;
  showVisualisation: boolean;
  play: ReactNode;
  question: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 gap-6">
      <div className="text-xs font-mono text-neutral-500">
        {J.relative ? 'relative' : 'absolute'} · {deltaLabel} {J.formatDelta(delta)}
      </div>
      <div className="flex flex-wrap gap-3 justify-center">{play}</div>
      {showVisualisation && (
        <div className="w-full max-w-3xl rounded-lg border border-neutral-800 overflow-hidden bg-neutral-950">
          <WaveformDisplay analyser={getPrimitiveAnalyser()} width={720} height={100} />
        </div>
      )}
      <p className="text-lg text-center">{question}</p>
      {children}
    </div>
  );
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// ── T1 Categorisation ───────────────────────────────────────────

function Categorisation({ J, delta, seed, onAnswer, showVisualisation, categories }: TaskProps & { categories: number }) {
  const trial = useMemo(() => {
    const rng = mulberry32(seed);
    const edges = Array.from({ length: categories + 1 }, (_, i) => fromUnit(i / categories, J.bounds, J.scale));
    const bin = Math.floor(rng() * categories);
    const lo = edges[bin]!;
    const hi = edges[bin + 1]!;
    const centre = fromUnit(0.5, [lo, hi], J.scale);
    const inner: Array<{ edge: number; dir: 1 | -1 }> = [];
    if (bin > 0) inner.push({ edge: lo, dir: 1 });
    if (bin < categories - 1) inner.push({ edge: hi, dir: -1 });
    const pick = inner[Math.floor(rng() * inner.length)];
    let value = pick ? step(pick.edge, delta, pick.dir, J.scale) : centre;
    // Never past the centre of the bin.
    if (toUnit(value, [lo, hi], J.scale) > 0.5 === (pick?.dir === 1)) value = centre;
    return { edges, bin, value };
  }, [J, delta, seed, categories]);

  const { playing, play } = usePlayer();
  const { answered, submit } = useAnswer(onAnswer);
  const playIt = () => play('x', J.present(trial.value, seed));
  useAutoplay(playIt);

  const label = (i: number) => `${J.format(trial.edges[i]!)} – ${J.format(trial.edges[i + 1]!)}`;

  return (
    <Frame J={J} delta={delta} deltaLabel="distance from boundary" showVisualisation={showVisualisation} question={`Which ${J.quantity} band?`} play={<PlayButton label="♪ Play" active={playing === 'x'} onClick={playIt} />}>
      <div className="flex flex-wrap gap-3 justify-center max-w-3xl">
        {Array.from({ length: categories }, (_, i) => (
          <Choice key={i} disabled={answered} onClick={() => submit(i === trial.bin, label(i), `${label(trial.bin)} (was ${J.format(trial.value)})`)}>
            <span className="font-mono text-sm">{label(i)}</span>
          </Choice>
        ))}
      </div>
    </Frame>
  );
}

// ── T2 Discrimination (two-interval forced choice) ──────────────

function Discrimination({ J, delta, seed, onAnswer, showVisualisation }: TaskProps) {
  const trial = useMemo(() => {
    const rng = mulberry32(seed);
    const ref = rove(J.bounds, rng, delta, J.scale, 1, 1);
    const comp = step(ref, delta, rng() < 0.5 ? 1 : -1, J.scale);
    const firstIsRef = rng() < 0.5;
    const values = firstIsRef ? [ref, comp] : [comp, ref];
    const higher = values[0]! > values[1]! ? 0 : 1;
    return { values, higher };
  }, [J, delta, seed]);

  const { playing, play } = usePlayer();
  const { answered, submit } = useAnswer(onAnswer);
  const seqs = trial.values.map((v, i) => J.present(v, seed + i + 1));
  const playBoth = () => play('both', concat(seqs[0]!, seqs[1]!, J.intervalGapSec));
  useAutoplay(playBoth);

  const correctText = `${trial.higher === 0 ? 'First' : 'Second'} (${J.format(trial.values[0]!)} vs ${J.format(trial.values[1]!)})`;

  return (
    <Frame
      J={J}
      delta={delta}
      showVisualisation={showVisualisation}
      question={`Which was ${J.highWord}?`}
      play={
        <>
          <PlayButton label="♪ Play both" active={playing === 'both'} onClick={playBoth} />
          <PlayButton label="♪ First" active={playing === '0'} onClick={() => play('0', seqs[0]!)} />
          <PlayButton label="♪ Second" active={playing === '1'} onClick={() => play('1', seqs[1]!)} />
        </>
      }
    >
      <div className="flex gap-4">
        <Choice disabled={answered} onClick={() => submit(trial.higher === 0, 'First', correctText)}>FIRST</Choice>
        <Choice disabled={answered} onClick={() => submit(trial.higher === 1, 'Second', correctText)}>SECOND</Choice>
      </div>
    </Frame>
  );
}

// ── T3 Estimation ───────────────────────────────────────────────

function Estimation({ J, delta, seed, onAnswer, showVisualisation }: TaskProps) {
  const target = useMemo(() => rove(J.bounds, mulberry32(seed), delta, J.scale, 0, 0), [J, delta, seed]);
  const [text, setText] = useState('');
  const { playing, play } = usePlayer();
  const { answered, submit } = useAnswer(onAnswer);
  const playIt = () => play('x', J.present(target, seed));
  useAutoplay(playIt);

  const send = () => {
    const d = Number(text);
    if (!Number.isFinite(d) || text.trim() === '') return;
    const guess = J.display.from(d);
    const ok = (J.scale === 'ratio' && guess <= 0) ? false : distance(guess, target, J.scale) <= delta;
    submit(ok, J.format(guess), `${J.format(target)} (you: ${J.format(guess)}, off by ${J.formatDelta(distance(guess, target, J.scale))})`);
  };

  return (
    <Frame J={J} delta={delta} deltaLabel="tolerance ±" showVisualisation={showVisualisation} question={`Estimate the ${J.quantity}`} play={<PlayButton label="♪ Play" active={playing === 'x'} onClick={playIt} />}>
      <div className="flex items-center gap-3">
        <input
          type="number"
          autoFocus
          value={text}
          disabled={answered}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          className="w-40 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg font-mono text-lg"
        />
        <span className="text-neutral-400 font-mono">{J.display.unit}</span>
        <Choice disabled={answered} onClick={send}>SUBMIT</Choice>
      </div>
      <p className="text-xs text-neutral-500 font-mono">
        range {J.format(J.bounds[0])} – {J.format(J.bounds[1])}
      </p>
    </Frame>
  );
}

// ── T4 Matching ─────────────────────────────────────────────────

function Matching({ J, delta, seed, onAnswer, showVisualisation }: TaskProps) {
  const init = useMemo(() => {
    const rng = mulberry32(seed);
    const target = rove(J.bounds, rng, delta, J.scale, 0, 0);
    // Start the slider well away from the target.
    const tu = toUnit(target, J.bounds, J.scale);
    const startU = tu > 0.5 ? rng() * Math.max(0, tu - 0.25) : tu + 0.25 + rng() * Math.max(0, 0.75 - tu);
    return { target, startU: clamp(startU, 0, 1) };
  }, [J, delta, seed]);
  const [u, setU] = useState(init.startU);
  const mine = fromUnit(u, J.bounds, J.scale);
  const { playing, play } = usePlayer();
  const { answered, submit } = useAnswer(onAnswer);
  const playTarget = () => play('t', J.present(init.target, seed));
  useAutoplay(playTarget);

  const send = () => {
    const err = distance(mine, init.target, J.scale);
    submit(err <= delta, J.format(mine), `${J.format(init.target)} (you: ${J.format(mine)}, off by ${J.formatDelta(err)})`);
  };

  return (
    <Frame
      J={J}
      delta={delta}
      deltaLabel="tolerance ±"
      showVisualisation={showVisualisation}
      question={`Adjust yours until the ${J.quantity} matches the target`}
      play={
        <>
          <PlayButton label="♪ Target" active={playing === 't'} onClick={playTarget} />
          <PlayButton label="♪ Mine" active={playing === 'm'} onClick={() => play('m', J.present(mine, seed + 7))} />
          <PlayButton
            label="♪ Target then mine"
            active={playing === 'tm'}
            onClick={() => play('tm', concat(J.present(init.target, seed), J.present(mine, seed + 7), J.intervalGapSec))}
          />
        </>
      }
    >
      <input
        type="range"
        min={0}
        max={1000}
        value={Math.round(u * 1000)}
        disabled={answered}
        onChange={(e) => setU(Number(e.target.value) / 1000)}
        className="w-full max-w-xl"
      />
      <div className="flex justify-between w-full max-w-xl text-xs font-mono text-neutral-500">
        <span>{J.lowWord}</span>
        <span>{J.highWord}</span>
      </div>
      <Choice disabled={answered} onClick={send}>SUBMIT</Choice>
    </Frame>
  );
}

// ── T5 Detection (oddball in a stream) ──────────────────────────

const STREAM = 5;

function Detection({ J, delta, seed, onAnswer, showVisualisation }: TaskProps) {
  const trial = useMemo(() => {
    const rng = mulberry32(seed);
    const standard = rove(J.bounds, rng, delta, J.scale, 1, 1);
    const present = rng() < 0.5;
    const pos = 1 + Math.floor(rng() * (STREAM - 1));
    const dir = rng() < 0.5 ? 1 : -1;
    const deviant = step(standard, delta, dir, J.scale);
    const values = Array.from({ length: STREAM }, (_, i) => (present && i === pos ? deviant : standard));
    return { values, present, pos, standard, deviant };
  }, [J, delta, seed]);

  const { playing, play } = usePlayer();
  const { answered, submit } = useAnswer(onAnswer);
  const stream = trial.values.reduce<Sequence | null>((acc, v, i) => {
    const s = J.present(v, seed + i + 1);
    return acc ? concat(acc, s, J.pairGapSec) : s;
  }, null)!;
  const playIt = () => play('x', stream);
  useAutoplay(playIt);

  const correctText = trial.present
    ? `Yes — sound ${trial.pos + 1} was ${J.format(trial.deviant)} vs ${J.format(trial.standard)}`
    : `No — all were ${J.format(trial.standard)}`;

  return (
    <Frame J={J} delta={delta} showVisualisation={showVisualisation} question={`Was one of the ${STREAM} sounds different in ${J.quantity}?`} play={<PlayButton label="♪ Play stream" active={playing === 'x'} onClick={playIt} />}>
      <div className="flex gap-4">
        <Choice disabled={answered} onClick={() => submit(!trial.present, 'No', correctText)}>NO</Choice>
        <Choice disabled={answered} onClick={() => submit(trial.present, 'Yes', correctText)}>YES</Choice>
      </div>
    </Frame>
  );
}

// ── T6 Ordering ─────────────────────────────────────────────────

const ORDER_N = 4;

function Ordering({ J, delta, seed, onAnswer, showVisualisation }: TaskProps) {
  const trial = useMemo(() => {
    const rng = mulberry32(seed);
    const half = (ORDER_N - 1) / 2;
    const centre = rove(J.bounds, rng, delta, J.scale, half, half);
    const values = Array.from({ length: ORDER_N }, (_, i) => step(centre, delta, i - half, J.scale));
    return shuffle(values, rng);
  }, [J, delta, seed]);

  const [order, setOrder] = useState<number[]>([]);
  const { playing, play } = usePlayer();
  const { answered, submit } = useAnswer(onAnswer);
  const seqs = trial.map((v, i) => J.present(v, seed + i + 1));
  const playAll = () => play('all', seqs.reduce((acc, s) => concat(acc, s, J.intervalGapSec)));
  useAutoplay(playAll);

  const truth = trial.map((_, i) => i).sort((a, b) => trial[a]! - trial[b]!);
  const send = () => {
    const ok = order.every((v, i) => v === truth[i]);
    submit(ok, order.map((i) => LETTERS[i]).join(' → '), truth.map((i) => `${LETTERS[i]} ${J.format(trial[i]!)}`).join(' → '));
  };

  return (
    <Frame
      J={J}
      delta={delta}
      deltaLabel="spacing"
      showVisualisation={showVisualisation}
      question={`Tap from ${J.lowWord} to ${J.highWord}`}
      play={
        <>
          <PlayButton label="♪ All" active={playing === 'all'} onClick={playAll} />
          {seqs.map((s, i) => (
            <PlayButton key={i} label={`♪ ${LETTERS[i]}`} active={playing === String(i)} onClick={() => play(String(i), s)} />
          ))}
        </>
      }
    >
      <div className="flex gap-3">
        {trial.map((_, i) => (
          <Choice key={i} disabled={answered || order.includes(i)} onClick={() => setOrder([...order, i])}>
            {LETTERS[i]}
          </Choice>
        ))}
      </div>
      <p className="text-sm text-neutral-400 font-mono">Order: {order.map((i) => LETTERS[i]).join(' → ') || '—'}</p>
      <div className="flex gap-3">
        <Choice disabled={answered || order.length === 0} onClick={() => setOrder([])}>RESET</Choice>
        <Choice disabled={answered || order.length !== ORDER_N} onClick={send}>SUBMIT</Choice>
      </div>
    </Frame>
  );
}

// ── T7 Identification ───────────────────────────────────────────

const ID_N = 4;

function Identification({ J, delta, seed, onAnswer, showVisualisation }: TaskProps) {
  const trial = useMemo(() => {
    const rng = mulberry32(seed);
    const half = (ID_N - 1) / 2;
    const centre = rove(J.bounds, rng, delta, J.scale, half, half);
    let options = Array.from({ length: ID_N }, (_, i) => step(centre, delta, i - half, J.scale));
    // Land options on the grid (e.g. whole semitones) when there is one.
    if (J.grid) {
      const shift = Math.round(options[0]! / J.grid) * J.grid - options[0]!;
      options = options.map((o) => o + shift);
    }
    const answer = Math.floor(rng() * ID_N);
    return { options, answer };
  }, [J, delta, seed]);

  const { playing, play } = usePlayer();
  const { answered, submit } = useAnswer(onAnswer);
  const playIt = () => play('x', J.present(trial.options[trial.answer]!, seed));
  useAutoplay(playIt);

  return (
    <Frame J={J} delta={delta} deltaLabel="spacing" showVisualisation={showVisualisation} question={`Which ${J.quantity} was it?`} play={<PlayButton label="♪ Play" active={playing === 'x'} onClick={playIt} />}>
      <div className="flex flex-wrap gap-3 justify-center">
        {trial.options.map((v, i) => (
          <Choice key={i} disabled={answered} onClick={() => submit(i === trial.answer, J.format(v), J.format(trial.options[trial.answer]!))}>
            <span className="font-mono">{J.format(v)}</span>
          </Choice>
        ))}
      </div>
    </Frame>
  );
}
