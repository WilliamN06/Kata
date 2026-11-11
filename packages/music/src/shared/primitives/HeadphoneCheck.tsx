import { useMemo, useState } from 'react';
import { resumeAudio } from '@kata/audio';
import { concat, playSequence, single, type Sequence } from './audio';

const KEY = 'kata.headphones-check';

export function headphonesVerified(): boolean {
  try {
    return sessionStorage.getItem(KEY) === 'pass';
  } catch {
    return false;
  }
}

function markVerified() {
  try {
    sessionStorage.setItem(KEY, 'pass');
  } catch {
    /* storage unavailable: the check simply repeats next time */
  }
}

const tone = (extra: Partial<Parameters<typeof single>[0]>) =>
  single({ durationMs: 1000, source: 'sine', frequency: 200, levelDb: -14, attackMs: 50, releaseMs: 50, ...extra });

const EARS = 4;
const PHASE = 6;

/**
 * Headphone screen.
 * 1. Left/right: a tone in one ear, say which.
 * 2. Woods et al. (2017): three 200 Hz tones, one 6 dB quieter, one phase-inverted
 *    between ears. On loudspeakers the inverted tone partly cancels and sounds
 *    quietest, so loudspeaker listeners pick it; on headphones it doesn't.
 */
export function HeadphoneCheck({ onPass }: { onPass: () => void }) {
  const ears = useMemo(() => Array.from({ length: EARS }, () => (Math.random() < 0.5 ? 'left' : 'right') as 'left' | 'right'), []);
  const phase = useMemo(
    () =>
      Array.from({ length: PHASE }, () => {
        const order = [0, 1, 2].sort(() => Math.random() - 0.5);
        return { quiet: order[0]!, inverted: order[1]! };
      }),
    []
  );
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [failed, setFailed] = useState(false);

  const inEars = step < EARS;
  const phaseIdx = step - EARS;

  const seq = (): Sequence => {
    if (inEars) return tone({ durationMs: 500, frequency: 500, channel: ears[step] });
    const t = phase[phaseIdx]!;
    const parts = [0, 1, 2].map((i) => tone({ levelDb: i === t.quiet ? -20 : -14, invertRight: i === t.inverted }));
    return parts.reduce((a, b) => concat(a, b, 0.5));
  };

  const play = async () => {
    await resumeAudio();
    playSequence(seq());
  };

  const answer = (ok: boolean) => {
    const nextScore = score + (ok ? 1 : 0);
    const next = step + 1;
    if (inEars && !ok) {
      setFailed(true);
      return;
    }
    if (next === EARS + PHASE) {
      const phaseScore = nextScore - EARS;
      if (phaseScore >= PHASE - 1) {
        markVerified();
        onPass();
      } else setFailed(true);
      return;
    }
    setScore(nextScore);
    setStep(next);
  };

  const restart = () => {
    setStep(0);
    setScore(0);
    setFailed(false);
  };

  const btn = 'px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg font-semibold';

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 gap-5 text-center">
      <h2 className="text-xl font-semibold">Headphone check</h2>
      <p className="text-sm text-neutral-400 max-w-md">
        Spatial drills need headphones: each ear must get its own signal. Wear headphones the right way round.
      </p>
      {failed ? (
        <>
          <p className="text-red-400">
            {inEars ? 'That tone was in the other ear. Check your headphones are on the right way round.' : 'This sounds like loudspeakers, or headphones that mix the two channels.'}
          </p>
          <button className={btn} onClick={restart}>Try again</button>
        </>
      ) : (
        <>
          <p className="text-xs font-mono text-neutral-500">
            {step + 1} / {EARS + PHASE}
          </p>
          <button className="px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white" onClick={play}>
            ♪ Play
          </button>
          <p className="text-lg">{inEars ? 'Which ear was the tone in?' : 'Which of the three tones was quietest?'}</p>
          <div className="flex gap-3">
            {inEars ? (
              <>
                <button className={btn} onClick={() => answer(ears[step] === 'left')}>LEFT</button>
                <button className={btn} onClick={() => answer(ears[step] === 'right')}>RIGHT</button>
              </>
            ) : (
              [0, 1, 2].map((i) => (
                <button key={i} className={btn} onClick={() => answer(phase[phaseIdx]!.quiet === i)}>
                  {i + 1}
                </button>
              ))
            )}
          </div>
        </>
      )}
      <button className="text-xs text-neutral-600 hover:text-neutral-400 mt-4" onClick={() => { markVerified(); onPass(); }}>
        Skip — I know I'm on headphones
      </button>
    </div>
  );
}
