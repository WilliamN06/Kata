import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from '@kata/app';
import { setDbAdapter, MemoryAdapter } from '@kata/db';
import { getAudioContext, resumeAudio } from '@kata/audio';
import './index.css';

setDbAdapter(new MemoryAdapter());

document.addEventListener(
  'pointerdown',
  () => {
    try {
      getAudioContext();
      resumeAudio().catch(() => {});
    } catch {}
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
