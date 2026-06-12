import React, { useState } from 'react';
import RiderPortal from './components/RiderPortal';
import AdminSimulator from './components/AdminSimulator';

function App() {
  const [activeRiderId, setActiveRiderId] = useState(() => {
    const cached = localStorage.getItem('lastmile_shield_rider_id');
    return cached ? parseInt(cached) : null; // Start logged out if no cached session exists
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleTriggerSimulation = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!activeRiderId) {
    return (
      <RiderPortal 
        activeRiderId={activeRiderId} 
        setActiveRiderId={setActiveRiderId} 
        refreshTrigger={refreshTrigger}
      />
    );
  }

  return (
    <div className="dashboard-fullpage">
      <RiderPortal 
        activeRiderId={activeRiderId} 
        setActiveRiderId={setActiveRiderId} 
        refreshTrigger={refreshTrigger}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      {/* Floating admin sandbox panel trigger */}
      <button className="floating-admin-btn" onClick={() => setShowAdmin(true)}>
        ⚙️ Admin Simulation Sandbox
      </button>

      {/* Slide-out Admin drawer overlay */}
      {showAdmin && (
        <div className="admin-drawer-overlay" onClick={() => setShowAdmin(false)}>
          <div className="admin-drawer-content" onClick={e => e.stopPropagation()}>
            <div className="admin-drawer-header-bar">
              <h3>⚡ Parametric Disruption Simulator</h3>
              <button className="btn-close" onClick={() => setShowAdmin(false)}>✖</button>
            </div>
            <div className="admin-drawer-body">
              <AdminSimulator 
                onTriggerSimulation={handleTriggerSimulation} 
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
