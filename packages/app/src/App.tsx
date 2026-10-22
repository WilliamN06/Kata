import { Routes, Route } from 'react-router-dom';
import { Home } from './routes/Home';
import { DrillPicker } from './routes/DrillPicker';
import { DrillScreen } from './routes/DrillScreen';
import { Progress } from './routes/Progress';
import { Analysis } from './routes/Analysis';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/drill-picker/:domain" element={<DrillPicker />} />
      <Route path="/drill/:subskillId/:variableId/:taskType" element={<DrillScreen />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/analysis" element={<Analysis />} />
    </Routes>
  );
}

