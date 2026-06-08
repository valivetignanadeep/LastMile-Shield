import React, { useState, useEffect } from 'react';

const DISRUPTION_DESCRIPTIONS = {
  Weather: {
    Moderate: 'Heavy rainfall leading to localized traffic slowdowns and delayed deliveries.',
    Severe: 'Torrential downpour with severe waterlogging. Delivery speeds reduced by 80%. Riders advised to hold.',
    Extreme: 'Flash flood and thunderstorm warning. Waterlogging up to 2 feet in water logging hotspots. Outdoor operations unsafe.'
  },
  Outage: {
    Moderate: 'Short server instability causing intermittent driver login failures.',
    Severe: 'Gig delivery platform server crash. Partners unable to accept, pick up, or complete orders for 1.5 hours.',
    Extreme: 'Complete cloud service outage. App offline nationwide for 4 hours. Absolute loss of shifts.'
  },
  Curfew: {
    Moderate: 'Temporary road blocks and security checkpoints due to local VIP movements.',
    Severe: 'Sudden local trade strikes and zoning restrictions. Transit forbidden in shopping hubs.',
    Extreme: 'Unplanned local curfew order following civil protests. Zone access completely barred.'
  }
};

const CITY_ZONES = {
  'Noida': ['Sector 62', 'Sector 18', 'Sector 150'],
  'Mumbai': ['Andheri West', 'Bandra', 'Colaba'],
  'Delhi': ['Saket', 'Connaught Place', 'Dwarka'],
  'Bengaluru': ['Koramangala', 'Indiranagar', 'Whitefield']
};

export default function AdminSimulator({ onTriggerSimulation, refreshTrigger }) {
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  
  // Simulator form states
  const [eventType, setEventType] = useState('Weather');
  const [city, setCity] = useState('Noida');
  const [zone, setZone] = useState('Sector 62');
  const [severity, setSeverity] = useState('Severe');
  const [desc, setDesc] = useState(DISRUPTION_DESCRIPTIONS.Weather.Severe);

  // Live simulation log state
  const [simLogs, setSimLogs] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchClaims();
  }, [refreshTrigger]);

  // Update description automatically when types change
  useEffect(() => {
    if (DISRUPTION_DESCRIPTIONS[eventType]?.[severity]) {
      setDesc(DISRUPTION_DESCRIPTIONS[eventType][severity]);
    }
  }, [eventType, severity]);

  // Update zone automatically when city changes
  useEffect(() => {
    if (CITY_ZONES[city]) {
      setZone(CITY_ZONES[city][0]);
    }
  }, [city]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchClaims = async () => {
    try {
      const res = await fetch('/api/claims');
      const data = await res.json();
      setClaims(data || []);
    } catch (err) {
      console.error('Error fetching claims:', err);
    }
  };

  const triggerDisruption = async (e) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimLogs([
      { type: 'info', text: `[12:15:00] Initializing parametric disruption broadcast: ${eventType} in ${zone}, ${city}...` },
      { type: 'info', text: `[12:15:01] Querying active policy list from SQLite database for ${city} region...` }
    ]);

    try {
      const res = await fetch('/api/disruptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: eventType,
          city,
          zone,
          severity,
          description: desc
        })
      });
      const data = await res.json();

      if (res.ok) {
        // Build simulation logs sequentially for high fidelity visual impact
        setTimeout(() => {
          setSimLogs(prev => [...prev, { type: 'info', text: `[12:15:02] Found active policies. Initiating smart contract/parametric verification...` }]);
        }, 600);

        setTimeout(() => {
          if (data.claimsProcessed && data.claimsProcessed.length > 0) {
            data.claimsProcessed.forEach((claim, idx) => {
              setTimeout(() => {
                const isPaid = claim.status === 'Paid';
                const logType = isPaid ? 'success' : 'error';
                const prefix = isPaid ? '✅ APPROVAL:' : '❌ FLAG/REJECT:';
                setSimLogs(prev => [
                  ...prev,
                  { 
                    type: logType, 
                    text: `[12:15:03] ${prefix} Rider: ${claim.riderName} (${claim.platform}) | Risk: ${claim.riskScore}% | Outcome: ${claim.status} (Payout: ₹${claim.amount}) | Reason: ${claim.reason}` 
                  }
                ]);
              }, idx * 400);
            });
          } else {
            setSimLogs(prev => [...prev, { type: 'info', text: `[12:15:03] No active policies found in ${city} for this event.` }]);
          }
        }, 1200);

        setTimeout(() => {
          setSimLogs(prev => [...prev, { type: 'success', text: `[12:15:05] Parametric processing complete. DB updated. Wallet transfers completed.` }]);
          setIsSimulating(false);
          // Refresh global dashboard and portal states
          onTriggerSimulation();
        }, 1200 + (data.claimsProcessed?.length || 0) * 450);

      } else {
        setSimLogs(prev => [...prev, { type: 'error', text: `[12:15:03] Failed to trigger disruption: ${data.error}` }]);
        setIsSimulating(false);
      }

    } catch (err) {
      setSimLogs(prev => [...prev, { type: 'error', text: `[12:15:03] Connection error: ${err.message}` }]);
      setIsSimulating(false);
    }
  };

  return (
    <div className="dashboard-container">
      
      {/* KPI Stats Widgets */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Active Protected Riders</span>
            <span className="stat-value secondary-color">{stats.activePolicies}</span>
            <span className="stat-subtext">Active weekly subscriptions</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Premiums Collected</span>
            <span className="stat-value primary-color">₹{stats.totalPremiumsCollected}</span>
            <span className="stat-subtext">Gig worker weekly contributions</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Disbursed Wages Payout</span>
            <span className="stat-value success-color">₹{stats.totalPayoutsDisbursed}</span>
            <span className="stat-subtext">Immediate income recovery paid out</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">System Loss Ratio</span>
            <span className="stat-value" style={{ color: stats.lossRatioPercent > 70 ? 'var(--danger)' : 'var(--success)' }}>
              {stats.lossRatioPercent}%
            </span>
            <span className="stat-subtext">Healthy financial ratio target &lt; 60%</span>
          </div>
        </div>
      )}

      {/* Simulator and Log Section */}
      <div className="simulator-layout">
        
        {/* Parametric Event Trigger Form */}
        <div className="card">
          <div className="card-title-row">
            <div className="card-title">
              <span>⛈️</span>
              <span>Parametric Disruption Simulator</span>
            </div>
            <span className="badge-tag" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>Simulation Tool</span>
          </div>

          <form onSubmit={triggerDisruption} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div className="form-group">
                <label>Disruption Type</label>
                <select value={eventType} onChange={e => setEventType(e.target.value)}>
                  <option value="Weather">Weather Event (Rain/Heat)</option>
                  <option value="Outage">Platform App Outage</option>
                  <option value="Curfew">Local curfew / Strike</option>
                </select>
              </div>

              <div className="form-group">
                <label>Severity</label>
                <select value={severity} onChange={e => setSeverity(e.target.value)}>
                  <option value="Moderate">Moderate Disruption</option>
                  <option value="Severe">Severe Disruption</option>
                  <option value="Extreme">Extreme Disruption</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div className="form-group">
                <label>Target City</label>
                <select value={city} onChange={e => setCity(e.target.value)}>
                  <option value="Noida">Noida (Delhi NCR)</option>
                  <option value="Mumbai">Mumbai (Maharashtra)</option>
                  <option value="Delhi">New Delhi</option>
                  <option value="Bengaluru">Bengaluru (Karnataka)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Zone (Centroid)</label>
                <select value={zone} onChange={e => setZone(e.target.value)}>
                  {(CITY_ZONES[city] || []).map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Event Description (Empathetic context)</label>
              <textarea 
                rows="3" 
                value={desc} 
                onChange={e => setDesc(e.target.value)}
                placeholder="Describe the disruption details..."
              ></textarea>
            </div>

            <button type="submit" disabled={isSimulating} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              {isSimulating ? 'Processing Parametric Trigger...' : '🚀 Broadcast Disruption & Auto-Settle Claims'}
            </button>
          </form>
        </div>

        {/* Real-time ML Evaluation logs */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title-row">
            <div className="card-title">
              <span>🧠</span>
              <span>AI Validation & Processing Logs</span>
            </div>
            <span className="pulse-dot"></span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div className="sim-log-box" style={{ flex: 1, minHeight: '180px' }}>
              {simLogs.length === 0 ? (
                <div style={{ color: '#888', fontStyle: 'italic', padding: '1rem 0' }}>
                  System ready. Select a disruption type on the left and click Broadcast to watch real-time AI fraud analysis logs...
                </div>
              ) : (
                simLogs.map((log, index) => (
                  <div key={index} className={`sim-log-line ${log.type}`}>
                    {log.text}
                  </div>
                ))
              )}
            </div>

            {/* Smart Fraud Detection Stats */}
            {stats && stats.recentAnomalies.length > 0 && (
              <div className="anomaly-alert-box">
                <div className="anomaly-alert-title">
                  <span>🛡️</span>
                  <span>Recent Anomalies Flagged</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {stats.recentAnomalies.map(anomaly => (
                    <div key={anomaly.id} className="anomaly-alert-item">
                      <strong>{anomaly.rider_name}</strong> - Flagged in <strong>{anomaly.event_zone}</strong>: {anomaly.reason.replace('Fraud Detection:', '')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Global Claims History Table */}
      <div className="card">
        <div className="card-title-row">
          <div className="card-title">
            <span>📋</span>
            <span>Global Parametric Transaction Ledger</span>
          </div>
          <span className="badge-tag">{claims.length} Records</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.6rem' }}>Rider Name</th>
                <th style={{ padding: '0.6rem' }}>Platform</th>
                <th style={{ padding: '0.6rem' }}>Disruption Type</th>
                <th style={{ padding: '0.6rem' }}>Compensation</th>
                <th style={{ padding: '0.6rem' }}>Settle Time</th>
                <th style={{ padding: '0.6rem' }}>Verdict</th>
                <th style={{ padding: '0.6rem' }}>Validation details</th>
              </tr>
            </thead>
            <tbody>
              {claims.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '1rem', color: '#999', fontStyle: 'italic' }}>
                    No parametric transactions logged yet. Run a simulation to populate.
                  </td>
                </tr>
              ) : (
                claims.map(claim => (
                  <tr key={claim.id} style={{ borderBottom: '1px solid #f1ece2' }}>
                    <td style={{ padding: '0.6rem', fontWeight: 600 }}>{claim.rider_name}</td>
                    <td style={{ padding: '0.6rem' }}>{claim.platform}</td>
                    <td style={{ padding: '0.6rem' }}>{claim.event_type}</td>
                    <td style={{ padding: '0.6rem', fontWeight: 800 }}>₹{claim.amount}</td>
                    <td style={{ padding: '0.6rem' }}>{new Date(claim.triggered_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</td>
                    <td style={{ padding: '0.6rem' }}>
                      <span className={`status-badge ${claim.status.toLowerCase()}`}>{claim.status}</span>
                    </td>
                    <td style={{ padding: '0.6rem', fontSize: '0.75rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={claim.reason}>
                      {claim.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
