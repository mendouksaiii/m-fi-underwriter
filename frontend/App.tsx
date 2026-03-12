import React, { useState } from 'react';
import { MFiLanding } from './pages/MFiLanding';
import { LandingPage } from './pages/LandingPage';

export function App() {
  const [showEngine, setShowEngine] = useState(false);

  if (showEngine) {
    return <MFiLanding />;
  }

  return <LandingPage onEnterCoreEngine={() => setShowEngine(true)} />;
}