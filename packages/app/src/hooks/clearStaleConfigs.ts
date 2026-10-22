import { useEffect } from 'react';
import { setDbAdapter, MemoryAdapter } from '@kata/db';

/**
 * Sound source config clearing helper.
 * Call this once at app startup to wipe any saved drill configs that
 * had old defaults (like 'sine' before the default was 'piano_acoustic').
 */
export function clearStaleDrillConfigs() {
  try {
    // Reset the memory DB adapter — this wipes all saved configs
    setDbAdapter(new MemoryAdapter());
    console.log('[clearStaleDrillConfigs] Memory adapter reset — saved configs wiped');
  } catch (e) {
    console.warn('[clearStaleDrillConfigs] failed:', e);
  }
}
