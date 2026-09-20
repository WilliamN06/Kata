import { useEffect, useRef } from 'react';

let sharedContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedContext) {
    sharedContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return sharedContext;
}

export function useAudioContext() {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    ctxRef.current = getAudioContext();
  }, []);

  const ensureRunning = async (): Promise<AudioContext> => {
    const ctx = ctxRef.current ?? getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    return ctx;
  };

  return { context: ctxRef, ensureRunning };
}