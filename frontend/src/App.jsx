import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SimulatorPage from './pages/SimulatorPage';
import './App.css';

/**
 * Standalone Simulator App
 *
 * Simplified routing: / goes directly to the simulator.
 * No auth, no landing page, no dataspaces management — this is a self-contained tool.
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimulatorPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
