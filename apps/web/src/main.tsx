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

bootstrap().catch((err) => {
  console.error('Failed to bootstrap:', err);
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #0a0a0a;
      color: #fafafa;
      font-family: sans-serif;
      padding: 24px;
      text-align: center;
    ">
      <div>
        <h1 style="font-size: 24px; margin-bottom: 12px;">Failed to start</h1>
        <p style="color: #888; margin-bottom: 20px;">${err.message}</p>
        <button onclick="location.reload()" style="
          padding: 12px 24px;
          background: #4A9EFF;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        ">Reload</button>
      </div>
    </div>
  `;
});