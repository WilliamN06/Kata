import { useState, useEffect, useRef } from 'react';
import { Spectrum } from '@kata/visualisation';
import { WaveformDisplay } from '@kata/visualisation';
import { getAudioContext, resumeAudio } from '@kata/audio';
import type { MusicStimulusHandle } from './MusicDrillWrapper';

type ButtonVariant = 'A' | 'B' | 'both' | 'single' | 'target';

interface PlayButtonSpec {
  label: string;
  variant: ButtonVariant;
  handler?: () => void | Promise<void>;
}

interface MusicStimulusViewProps {
  showVisualisation?: boolean;
  handle: MusicStimulusHandle | null;
  visualisation: 'spectrum' | 'waveform' | 'both' | 'none';
  durationMs?: number;
  onPlayed?: () => void;
  label?: string;
  readouts?: Array<{ label: string; value: string }>;
  /** If provided, renders these buttons instead of a single PLAY button. */
  buttons?: PlayButtonSpec[];
}

/**
 * Renders play button(s) plus an always-visible spectrum/waveform panel.
 *
 * Two modes:
 *   1. Single PLAY button (default) — calls handle.play()
 *   2. A/B buttons — caller provides `buttons` array with per-button handlers.
 *      When the drill needs A and B separate (Discrimination, Detection),
 *      the caller wires each button to a different stimulus.
 */
export function MusicStimulusView({
  showVisualisation = true,
  handle,
  visualisation,
  durationMs = 1000,
  onPlayed,
  label = '♪ PLAY',
  readouts = [],
  buttons,
}: MusicStimulusViewProps) {
  const [playing, setPlaying] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const triggerPlay = async (key: string, customHandler?: () => void | Promise<void>) => {
    await resumeAudio();
    setPlaying(key);
    onPlayed?.();

    if (customHandler) {
      await customHandler();
    } else if (handle) {
      const ctx = getAudioContext();
      handle.play(ctx.currentTime + 0.05, durationMs / 1000);
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPlaying(null), durationMs + 200);
  };

  const renderButtons = () => {
    if (buttons && buttons.length > 0) {
      return (
        <div className="flex flex-wrap gap-3 justify-center">
          {buttons.map((b, i) => {
            const key = `${b.variant}-${i}`;
            const isPlaying = playing === key;
            return (
              <button
                key={key}
                onClick={() => triggerPlay(key, b.handler)}
                disabled={isPlaying}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isPlaying
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white disabled:bg-neutral-800 disabled:text-neutral-600'
                }`}
              >
                {isPlaying ? '♪ Playing…' : b.label}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <button
        onClick={() => triggerPlay('single')}
        disabled={!handle || playing === 'single'}
        className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
          playing === 'single'
            ? 'bg-blue-500 text-white'
            : 'bg-blue-600 hover:bg-blue-500 text-white disabled:bg-neutral-800 disabled:text-neutral-600'
        }`}
      >
        {playing === 'single' ? '♪ Playing…' : label}
      </button>
    );
  };

  const showSpectrum = visualisation === 'spectrum' || visualisation === 'both';
  const showWaveform = visualisation === 'waveform' || visualisation === 'both';

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
      {renderButtons()}

      {readouts.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {readouts.map((r, i) => (
            <div key={i} className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded font-mono text-xs">
              <span className="text-neutral-500 mr-2">{r.label}</span>
              <span className="text-neutral-200">{r.value}</span>
            </div>
          ))}
        </div>
      )}

      {showVisualisation && visualisation !== 'none' && (
        <div className="w-full rounded-lg border border-neutral-800 overflow-hidden bg-neutral-950">
          {showSpectrum && (
            <div className="relative border-b border-neutral-800">
              <div className="absolute top-2 left-3 text-[10px] text-neutral-600 font-mono tracking-wider z-10">
                SPECTRUM
              </div>
              {handle ? (
                <Spectrum analyser={handle.analyser} width={720} height={180} />
              ) : (
                <div className="w-full h-[180px] flex items-center justify-center text-neutral-700 text-xs font-mono">
                  waiting for audio context…
                </div>
              )}
            </div>
          )}
          {showWaveform && (
            <div className="relative">
              <div className="absolute top-2 left-3 text-[10px] text-neutral-600 font-mono tracking-wider z-10">
                WAVEFORM
              </div>
              {handle ? (
                <WaveformDisplay analyser={handle.analyser} width={720} height={100} />
              ) : (
                <div className="w-full h-[100px] flex items-center justify-center text-neutral-700 text-xs font-mono">
                  waiting for audio context…
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

