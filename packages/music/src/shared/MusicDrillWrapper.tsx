import { useEffect, useRef, useState, type ReactNode } from 'react';
import { getAudioContext, getMasterBus } from '@kata/audio';
import { startBackgroundNoise, stopBackgroundNoise, preloadSoundfont } from './SoundfontLoader';

export interface MusicStimulusHandle {
  /** Play the default (both) stimulus. */
  play: (startTime: number, duration: number) => void;
  /** Play only part A (if the drill provides it). */
  playA?: () => void;
  /** Play only part B (if the drill provides it). */
  playB?: () => void;
  /** Stop all currently playing sounds. */
  stop: () => void;
  /** Analyser node for visualisation. */
  analyser: AnalyserNode;
}

interface MusicDrillWrapperProps {
  createStimulus: (
    ctx: AudioContext,
    destination: AudioNode
  ) => Omit<MusicStimulusHandle, 'analyser'>;
  children: (handle: MusicStimulusHandle | null) => ReactNode;
  autoPlay?: boolean;
  /** When true, the stimulus is re-created on every render (useful for A/B drills). */
  dependencyKey?: string;
}

/**
 * Music drill wrapper.
 *
 * Responsibilities:
 *   1. Preload the soundfont on mount so first PLAY doesn't race the
 *      2-second soundfont load (which causes both notes of an ascending
 *      interval to fire "now" simultaneously → you hear a chord).
 *   2. Create the analyser once and connect it to the master bus ONCE
 *      (guarded by a ref so re-renders don't stack analysers).
 *   3. Hand the stable stimulus handle to children.
 */
export function MusicDrillWrapper({
  createStimulus,
  children,
  autoPlay = false,
  dependencyKey,
}: MusicDrillWrapperProps) {
  const [handle, setHandle] = useState<MusicStimulusHandle | null>(null);
  const initialisedKey = useRef<string | undefined>(undefined);
  const stimulusRef = useRef<Omit<MusicStimulusHandle, 'analyser'> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const preloadStarted = useRef(false);

  // ── PRELOAD SOUNDFONT ONCE ────────────────────────────────────
  // Fire and forget. The soundfont takes ~2s to load. If we don't
  // preload, then when the user clicks PLAY, playTone() awaits
  // ensureSynth() for 2s, and the scheduled startTime becomes 2s in
  // the past. Both notes (root and target) then fire "now"
  // simultaneously, so the ascending interval sounds like a chord.
  useEffect(() => {
    if (preloadStarted.current) return;
    preloadStarted.current = true;
    console.log('[MusicDrillWrapper] Preloading soundfont...');
    preloadSoundfont().catch((err) => {
      console.warn('[MusicDrillWrapper] Soundfont preload failed:', err);
    });
  }, []);

  // ── SET UP STIMULUS + ANALYSER ONCE ───────────────────────────
  useEffect(() => {
    // Start background noise if configured
    const noise = (window as any).__kataBackgroundNoise;
    if (noise && noise.colour !== 'silence') {
      try {
        startBackgroundNoise(noise.colour, noise.level);
      } catch (e) {
        console.warn('[MusicDrillWrapper] Background noise failed:', e);
      }
    }
    return () => {
      try { stopBackgroundNoise(); } catch {}
    };
  }, []);

  useEffect(() => {
    if (initialisedKey.current === dependencyKey && handle) return;
    initialisedKey.current = dependencyKey;

    const ctx = getAudioContext();
    const bus = getMasterBus();

    // Only create the analyser ONCE per wrapper instance. If we
    // recreate it on every render, the bus would accumulate
    // connections and the analyser would read a louder signal.
    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.7;
      bus.connect(analyser);
      analyserRef.current = analyser;
    }

    const analyser = analyserRef.current;

    const stimulus = createStimulus(ctx, bus);
    stimulusRef.current = stimulus;

    const withAnalyser: MusicStimulusHandle = {
      play: stimulus.play,
      playA: stimulus.playA,
      playB: stimulus.playB,
      stop: stimulus.stop,
      analyser,
    };
    setHandle(withAnalyser);

    if (autoPlay) {
      setTimeout(() => {
        stimulus.play(ctx.currentTime + 0.1, 1.0);
      }, 100);
    }

    return () => {
      try { stimulus.stop(); } catch {}
    };
  }, [createStimulus, autoPlay, dependencyKey, handle]);

  return <>{children(handle)}</>;
}

