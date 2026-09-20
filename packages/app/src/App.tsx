import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@kata/db';
import { Home } from './routes/Home';
import { Domain } from './routes/Domain';
import { Subskill } from './routes/Subskill';
import { Drill } from './routes/Drill';
import { DrillSettings } from './routes/DrillSettings';
import { Progress } from './routes/Progress';
import { Settings } from './routes/Settings';
import { Calibration } from './routes/Calibration';
import { AdaptiveSession } from './routes/AdaptiveSession';
import { FreePlay } from './routes/FreePlay';
import { Knowledge } from './routes/Knowledge';

export function App() {
  const calibration = useStore((s) => s.calibration);
  const loaded = useStore((s) => s.loaded);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-neutral-400">Loading…</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <Routes>
          <Route
            path="/"
            element={calibration ? <Home /> : <Navigate to="/calibration" replace />}
          />
          <Route path="/calibration" element={<Calibration />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/adaptive" element={<AdaptiveSession />} />
          <Route path="/free-play" element={<FreePlay />} />
          <Route path="/knowledge/:domainId/:subskillId" element={<Knowledge />} />
          <Route path="/:domainId/:subskillId/:drillId/settings" element={<DrillSettings />} />
          <Route path="/:domainId" element={<Domain />} />
          <Route path="/:domainId/:subskillId" element={<Subskill />} />
          <Route path="/:domainId/:subskillId/:drillId" element={<Drill />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}