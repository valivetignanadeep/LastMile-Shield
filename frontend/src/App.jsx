import React, { useState } from 'react';
import RiderPortal from './components/RiderPortal';
import AdminSimulator from './components/AdminSimulator';

function App() {
  const [activeRiderId, setActiveRiderId] = useState(1); // Default to seeded Rajesh Kumar (Rider 1)
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTriggerSimulation = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-container">
      {/* Platform Header */}
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon">LM</div>
          <div>
            <h1 className="logo-text" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              LastMile <span>Shield</span>
            </h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginTop: '-2px' }}>
              AI Parametric Income Protection
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span className="badge-tag" style={{ border: '1px solid var(--border-color)', background: '#fff' }}>
            Swiggy • Zomato • Zepto • Blinkit
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span className="pulse-dot"></span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Automation Engine Active</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="workspace-grid">
        {/* Left Column: Simulated mobile device containing Rider Companion App */}
        <RiderPortal 
          activeRiderId={activeRiderId} 
          setActiveRiderId={setActiveRiderId} 
          refreshTrigger={refreshTrigger}
        />

        {/* Right Column: Platform Analytics and parametric simulation controls */}
        <AdminSimulator 
          onTriggerSimulation={handleTriggerSimulation} 
          refreshTrigger={refreshTrigger}
        />
      </main>

      {/* Footer detailing Persona and Cover constraints */}
      <footer className="footer">
        <p style={{ fontWeight: 600 }}>© 2026 LastMile Shield (ParaProtect Tech Pvt. Ltd.). Designed with ❤️ for India's platform economy partners.</p>
        <p style={{ fontSize: '0.7rem', marginTop: '0.3rem', opacity: 0.8, maxWidth: '800px', margin: '0.3rem auto 0 auto' }}>
          Disclaimer: LastMile Shield is a parametric wage security product underwritten on a weekly basis. Under Section 4, this platform strictly covers lost income from weather disruptions, platform outages, and curfews. Vehicle repairs, medical bills, life insurance, and accident claims are completely excluded.
        </p>
      </footer>
    </div>
  );
}

export default App;
