import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@kata/app';
import { initDatabase, useStore } from '@kata/db';
import './index.css';

async function bootstrap() {
  await initDatabase();
  await useStore.getState().load();

  const root = document.getElementById('root');
  if (!root) throw new Error('#root not found');

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();