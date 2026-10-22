import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from '@kata/app';
import { setDbAdapter, MemoryAdapter } from '@kata/db';
import { getAudioContext, resumeAudio } from '@kata/audio';
import { preloadSoundfont } from '@kata/music/src/shared/SoundfontLoader';
import './index.css';

setDbAdapter(new MemoryAdapter());

// Resume the AudioContext on the first user gesture.
// Browsers require a user gesture before audio can play; this pre-arms
// the context so the first PLAY click in a drill works immediately.
document.addEventListener(
  'pointerdown',
  () => {
    try {
      getAudioContext();
      resumeAudio().catch(() => {});
    } catch {
      // Silent — the drill's MusicStimulusView will retry on Play
    }
  },
  { once: true }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

