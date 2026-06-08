import React, { useState, useEffect } from 'react';
import AudioNarrator from './AudioNarrator';

const TRANSLATIONS = {
  en: {
    title: "LastMile Shield",
    subtitle: "Partner Safety Net",
    onboardTitle: "Protect Your Daily Wages",
    onboardDesc: "Secure your week's income against heavy rain, app crashes, and curfews in less than 2 minutes.",
    name: "Full Name",
    phone: "Phone Number",
    platform: "Delivery App",
    vehicle: "Vehicle Type",
    city: "City",
    zone: "Delivery Zone",
    upi: "UPI ID (for instant payouts)",
    onboardBtn: "Secure My Weekly Income",
    wallet: "LastMile Wallet",
    withdrawBtn: "Cashout to UPI",
    unprotected: "You are currently Unprotected!",
    unprotectedDesc: "One severe storm or curfew can wipe out your weekly earnings. Activate coverage to safeguard your livelihood.",
    getQuote: "Calculate Weekly Premium",
    activate: "Activate Weekly Cover",
    protected: "Shield Cover is Active",
    validUntil: "Protected Until:",
    coverageLimit: "Maximum Weekly Cover:",
    activeRiderText: "Drive safely! We are monitoring weather and outages. Payouts will trigger automatically if disruptions occur.",
    claimsHistory: "Wage Protection Payouts",
    noClaims: "No payouts claimed this week. Safe riding!",
    telemetry: "Simulated Delivery App Status",
    status: "App Status",
    gps: "Location Coordinates",
    goOnline: "Go Online",
    goOffline: "Go Offline",
    movePing: "Simulate Moving location",
    loading: "Synchronizing details...",
    premiumEstimate: "Weekly Premium Estimate",
    baseRate: "Base Rate",
    ratingMod: "Rider Rating Factor",
    vehicleMod: "Vehicle Type Factor",
    zoneRisk: "Zone Waterlog Risk",
    weatherMod: "Weather Risk Factor",
    estPremium: "Estimated Premium",
    activeLabel: "Online & Safe",
    offlineLabel: "Offline",
    withdrawSuccess: "Cashout completed successfully!"
  },
  hi: {
    title: "लास्टमाइल शील्ड",
    subtitle: "डिलिवरी पार्टनर सुरक्षा कवच",
    onboardTitle: "अपनी दैनिक मजदूरी सुरक्षित करें",
    onboardDesc: "भारी बारिश, ऐप क्रैश और कर्फ्यू जैसी बाधाओं से अपनी साप्ताहिक आय को 2 मिनट में सुरक्षित करें।",
    name: "पूरा नाम",
    phone: "फ़ोन नंबर",
    platform: "डिलिवरी ऐप",
    vehicle: "वाहन का प्रकार",
    city: "शहर",
    zone: "डिलिवरी क्षेत्र (ज़ोन)",
    upi: "UPI आईडी (तुरंत निकासी के लिए)",
    onboardBtn: "मेरी साप्ताहिक आय सुरक्षित करें",
    wallet: "लास्टमाइल वॉलेट",
    withdrawBtn: "UPI में निकालें",
    unprotected: "आपकी कमाई अभी असुरक्षित है!",
    unprotectedDesc: "एक गंभीर तूफान या कर्फ्यू आपकी साप्ताहिक कमाई को खत्म कर सकता है। आज ही सुरक्षा कवच सक्रिय करें।",
    getQuote: "साप्ताहिक प्रीमियम जानें",
    activate: "सुरक्षा कवच सक्रिय करें",
    protected: "सुरक्षा कवच सक्रिय है",
    validUntil: "सुरक्षा की अंतिम तिथि:",
    coverageLimit: "अधिकतम साप्ताहिक सुरक्षा:",
    activeRiderText: "सड़क पर सुरक्षित रहें! हम मौसम और ऐप बाधाओं की निगरानी कर रहे हैं। समस्या होने पर पैसे अपने आप क्रेडिट होंगे।",
    claimsHistory: "साप्ताहिक कमाई सुरक्षा दावे",
    noClaims: "इस सप्ताह कोई दावा नहीं है। सुरक्षित सवारी करें!",
    telemetry: "डिलिवरी ऐप स्थिति (सिम्युलेटेड)",
    status: "ऐप स्थिति",
    gps: "जीपीएस निर्देशांक",
    goOnline: "ऑनलाइन जाएं",
    goOffline: "ऑफ़लाइन जाएं",
    movePing: "स्थान बदलने का अनुकरण करें",
    loading: "जानकारी अपडेट हो रही है...",
    premiumEstimate: "साप्ताहिक प्रीमियम अनुमान",
    baseRate: "मूल दर",
    ratingMod: "रेटिंग छूट/अधिभार",
    vehicleMod: "वाहन छूट/अधिभार",
    zoneRisk: "जलभराव क्षेत्र जोखिम",
    weatherMod: "मौसम पूर्वानुमान जोखिम",
    estPremium: "अनुमानित प्रीमियम",
    activeLabel: "ऑनलाइन और कार्यरत",
    offlineLabel: "ऑफ़लाइन",
    withdrawSuccess: "निकासी सफलतापूर्वक पूरी हो गई!"
  }
};

const CITY_ZONES = {
  'Noida': ['Sector 62', 'Sector 18', 'Sector 150'],
  'Mumbai': ['Andheri West', 'Bandra', 'Colaba'],
  'Delhi': ['Saket', 'Connaught Place', 'Dwarka'],
  'Bengaluru': ['Koramangala', 'Indiranagar', 'Whitefield']
};

// Zone centroids mapping for local simulation
const ZONE_CENTROIDS = {
  'Noida': {
    'Sector 62': { lat: 28.628, lng: 77.365 },
    'Sector 18': { lat: 28.570, lng: 77.326 },
    'Sector 150': { lat: 28.468, lng: 77.462 }
  },
  'Mumbai': {
    'Andheri West': { lat: 19.113, lng: 72.869 },
    'Bandra': { lat: 19.059, lng: 72.830 },
    'Colaba': { lat: 18.906, lng: 72.814 }
  },
  'Delhi': {
    'Saket': { lat: 28.524, lng: 77.206 },
    'Connaught Place': { lat: 28.630, lng: 77.218 },
    'Dwarka': { lat: 28.582, lng: 77.050 }
  },
  'Bengaluru': {
    'Koramangala': { lat: 12.935, lng: 77.624 },
    'Indiranagar': { lat: 12.971, lng: 77.641 },
    'Whitefield': { lat: 12.969, lng: 77.750 }
  }
};

export default function RiderPortal({ activeRiderId, setActiveRiderId, refreshTrigger }) {
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [riderData, setRiderData] = useState(null);
  const [availableRiders, setAvailableRiders] = useState([]);
  
  // Form States
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPlatform, setFormPlatform] = useState('Zomato');
  const [formVehicle, setFormVehicle] = useState('Petrol Bike');
  const [formCity, setFormCity] = useState('Noida');
  const [formZone, setFormZone] = useState('Sector 62');
  const [formUpi, setFormUpi] = useState('');

  // Pricing Quote State
  const [quote, setQuote] = useState(null);

  // Cashout State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState('');

  // Fetch all riders for switching profiles in simulation
  useEffect(() => {
    fetchRidersList();
  }, [activeRiderId, refreshTrigger]);

  // Fetch active rider specific details
  useEffect(() => {
    if (activeRiderId) {
      fetchRiderDetails(activeRiderId);
    } else {
      setRiderData(null);
      setQuote(null);
    }
  }, [activeRiderId, refreshTrigger]);

  // Sync Zone select when City changes
  useEffect(() => {
    if (CITY_ZONES[formCity]) {
      setFormZone(CITY_ZONES[formCity][0]);
    }
  }, [formCity]);

  const t = TRANSLATIONS[lang];

  const fetchRidersList = async () => {
    try {
      const res = await fetch('/api/riders');
      const data = await res.json();
      setAvailableRiders(data || []);
    } catch (err) {
      console.error('Error fetching riders:', err);
    }
  };

  const fetchRiderDetails = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/riders/${id}`);
      const data = await res.json();
      setRiderData(data);
      setWithdrawMsg('');
    } catch (err) {
      console.error('Error fetching rider details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    if (!formName || !formPhone || !formUpi) {
      alert('Please fill out all onboarding fields.');
      return;
    }

    try {
      const res = await fetch('/api/riders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          platform: formPlatform,
          vehicleType: formVehicle,
          city: formCity,
          zone: formZone,
          preferredLanguage: lang,
          upiId: formUpi
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveRiderId(data.id);
        // Reset form
        setFormName('');
        setFormPhone('');
        setFormUpi('');
      } else {
        alert(data.error || 'Onboarding failed.');
      }
    } catch (err) {
      console.error('Onboarding request error:', err);
    }
  };

  const getPricingQuote = async () => {
    if (!riderData || !riderData.rider) return;
    const { city, zone, vehicle_type, rating } = riderData.rider;
    try {
      const res = await fetch('/api/pricing-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          zone,
          vehicleType: vehicle_type,
          rating
        })
      });
      const data = await res.json();
      setQuote(data);
    } catch (err) {
      console.error('Error getting quote:', err);
    }
  };

  const activatePolicy = async () => {
    if (!riderData || !riderData.rider || !quote) return;
    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: riderData.rider.id,
          premium: quote.premium,
          coverageLimit: quote.coverageLimit
        })
      });
      const data = await res.json();
      if (res.ok) {
        fetchRiderDetails(riderData.rider.id);
        setQuote(null);
      } else {
        alert(data.error || 'Activation failed.');
      }
    } catch (err) {
      console.error('Policy purchase error:', err);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!riderData || !riderData.rider) return;
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > riderData.rider.wallet_balance) {
      alert('Please enter a valid cashout amount within your balance.');
      return;
    }

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: riderData.rider.id,
          amount
        })
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawMsg(lang === 'hi' ? `₹${amount} आपके UPI (${riderData.rider.upi_id}) पर भेज दिए गए हैं!` : `₹${amount} cashout wired to UPI ID: ${riderData.rider.upi_id}!`);
        setWithdrawAmount('');
        fetchRiderDetails(riderData.rider.id);
      } else {
        alert(data.error || 'Cashout failed.');
      }
    } catch (err) {
      console.error('Withdrawal error:', err);
    }
  };

  const toggleAppStatus = async () => {
    if (!riderData || !riderData.rider) return;
    const currentPing = riderData.latestPing;
    const newStatus = (!currentPing || currentPing.active_status === 'Offline') ? 'Online' : 'Offline';
    
    // Default coords based on city/zone
    const centroid = ZONE_CENTROIDS[riderData.rider.city]?.[riderData.rider.zone] || { lat: 28.628, lng: 77.365 };

    try {
      const res = await fetch(`/api/riders/${riderData.rider.id}/pings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: centroid.lat,
          longitude: centroid.lng,
          activeStatus: newStatus
        })
      });
      if (res.ok) {
        fetchRiderDetails(riderData.rider.id);
      }
    } catch (err) {
      console.error('Telemetry update failed:', err);
    }
  };

  const handleSimulateMovement = async () => {
    if (!riderData || !riderData.rider || !riderData.latestPing) return;
    // Introduce a slight shift (e.g. 0.05 degrees, which is ~5km out of zone, triggers Geofence fraud detection!)
    const offsetLat = riderData.latestPing.latitude + 0.045;
    const offsetLng = riderData.latestPing.longitude + 0.045;

    try {
      const res = await fetch(`/api/riders/${riderData.rider.id}/pings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: offsetLat,
          longitude: offsetLng,
          activeStatus: riderData.latestPing.active_status
        })
      });
      if (res.ok) {
        fetchRiderDetails(riderData.rider.id);
        alert(lang === 'hi' ? 'जीपीएस स्थान क्षेत्र के बाहर स्थानांतरित किया गया (धोखाधड़ी सिमुलेशन के लिए)!' : 'GPS moved 5km away from zone (simulating out-of-boundary fraud detection)!');
      }
    } catch (err) {
      console.error('Movement simulation failed:', err);
    }
  };

  return (
    <div className="phone-outer-frame">
      <div className="phone-screen">
        
        {/* Status Bar */}
        <div className="phone-status-bar">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>5G 📶 98%</span>
        </div>

        {/* Dynamic Header */}
        <div className="phone-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              🛡️ {t.title}
            </h3>
            <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>{t.subtitle}</span>
          </div>

          {/* Lang Selector */}
          <div className="lang-selector">
            <button className={`lang-tab ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-tab ${lang === 'hi' ? 'active' : ''}`} onClick={() => setLang('hi')}>हिन्दी</button>
          </div>
        </div>

        {/* Content Area */}
        <div className="phone-content">
          
          {/* Rider Profile Swapper (For easy user evaluation/testing) */}
          <div style={{ backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.6rem 0.8rem' }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              {lang === 'hi' ? 'सक्रिय राइडर बदलें (परीक्षण के लिए)' : 'Active Profile Sim (Testing)'}
            </label>
            <select 
              value={activeRiderId || ''} 
              onChange={(e) => setActiveRiderId(e.target.value ? parseInt(e.target.value) : null)}
              style={{ padding: '0.3rem', fontSize: '0.8rem', marginTop: '0.2rem' }}
            >
              <option value="">-- {lang === 'hi' ? 'नया रजिस्ट्रेशन' : 'New Registration'} --</option>
              {availableRiders.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.platform} - {r.city})</option>
              ))}
            </select>
          </div>

          {/* Loading Check (Resolves initial mount null reference crash) */}
          {loading || (activeRiderId && !riderData) ? (
            <div style={{ textAlign: 'center', margin: '4rem 0', color: 'var(--text-secondary)' }}>
              <div className="pulse-dot"></div> <span style={{ marginLeft: '10px' }}>{t.loading}</span>
            </div>
          ) : !activeRiderId ? (
            
            /* ONBOARDING FORM */
            <form onSubmit={handleOnboard} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.3rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800' }}>{t.onboardTitle}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{t.onboardDesc}</p>
              </div>

              <div className="form-group">
                <label>{t.name}</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rajesh Kumar" 
                  value={formName} 
                  onChange={e => setFormName(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem' }}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.phone}</label>
                <input 
                  type="tel" 
                  placeholder="10 digit number" 
                  value={formPhone} 
                  onChange={e => setFormPhone(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label>{t.platform}</label>
                  <select value={formPlatform} onChange={e => setFormPlatform(e.target.value)} style={{ padding: '0.5rem 0.8rem' }}>
                    <option value="Zomato">Zomato</option>
                    <option value="Swiggy">Swiggy</option>
                    <option value="Zepto">Zepto</option>
                    <option value="Blinkit">Blinkit</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t.vehicle}</label>
                  <select value={formVehicle} onChange={e => setFormVehicle(e.target.value)} style={{ padding: '0.5rem 0.8rem' }}>
                    <option value="Petrol Bike">Petrol Bike</option>
                    <option value="Electric Scooter">Electric Scooter</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label>{t.city}</label>
                  <select value={formCity} onChange={e => setFormCity(e.target.value)} style={{ padding: '0.5rem 0.8rem' }}>
                    <option value="Noida">Noida</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bengaluru">Bengaluru</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t.zone}</label>
                  <select value={formZone} onChange={e => setFormZone(e.target.value)} style={{ padding: '0.5rem 0.8rem' }}>
                    {(CITY_ZONES[formCity] || []).map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{t.upi}</label>
                <input 
                  type="text" 
                  placeholder="e.g. rajesh@okaxis" 
                  value={formUpi} 
                  onChange={e => setFormUpi(e.target.value)}
                  style={{ padding: '0.5rem 0.8rem' }}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.6rem' }}>
                {t.onboardBtn}
              </button>
            </form>
          ) : (
            
            /* ACTIVE RIDER DASHBOARD */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Header profile greeting */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>👋 Namaste, {riderData?.rider?.name}!</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    📍 {riderData?.rider?.zone}, {riderData?.rider?.city} | 🏍️ {riderData?.rider?.platform} ({riderData?.rider?.vehicle_type})
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    ⭐ {riderData?.rider?.rating}
                  </span>
                </div>
              </div>

              {/* Wallet Box */}
              <div className="wallet-box">
                <div className="wallet-title">{t.wallet}</div>
                <div className="wallet-balance">₹{(riderData?.rider?.wallet_balance || 0).toFixed(2)}</div>
                
                {(riderData?.rider?.wallet_balance || 0) > 0 && (
                  <form onSubmit={handleWithdraw} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                    <input 
                      type="number" 
                      placeholder="₹ Amount" 
                      value={withdrawAmount} 
                      onChange={e => setWithdrawAmount(e.target.value)}
                      style={{ padding: '0.3rem', fontSize: '0.8rem', width: '90px', borderRadius: '4px', border: 'none', background: '#fff', color: '#000' }}
                      max={riderData?.rider?.wallet_balance}
                    />
                    <button type="submit" className="btn-wallet-withdraw" style={{ flex: 1 }}>{t.withdrawBtn}</button>
                  </form>
                )}
                {withdrawMsg && <div style={{ fontSize: '0.75rem', color: '#81c784', marginTop: '0.2rem', fontWeight: 'bold' }}>{withdrawMsg}</div>}
              </div>

              {/* Policy Status Container */}
              {riderData?.activePolicy ? (
                /* Active Cover Display */
                <div className="empathy-banner" style={{ backgroundColor: 'var(--success-light)', borderLeftColor: 'var(--success)' }}>
                  <div className="empathy-banner-title" style={{ color: 'var(--success)' }}>
                    🛡️ {t.protected} <span className="pulse-dot"></span>
                  </div>
                  <div className="empathy-banner-body" style={{ fontSize: '0.8rem' }}>
                    <div><strong>{t.validUntil}</strong> {riderData.activePolicy.end_date}</div>
                    <div><strong>{t.coverageLimit}</strong> ₹{riderData.activePolicy.coverage_limit}</div>
                    <div style={{ marginTop: '0.4rem', fontStyle: 'italic', fontSize: '0.75rem', opacity: 0.9 }}>
                      "{t.activeRiderText}"
                    </div>
                  </div>
                  <AudioNarrator 
                    text={lang === 'hi' 
                      ? `लास्टमाइल शील्ड सक्रिय है। आपकी साप्ताहिक सुरक्षा सीमा ₹${riderData.activePolicy.coverage_limit} है। सड़क पर सुरक्षित रहें, हम बाधाओं की निगरानी कर रहे हैं।` 
                      : `Your weekly income shield is active. Coverage limit is ₹${riderData.activePolicy.coverage_limit}. Drive safely, we are keeping you covered.`
                    } 
                    lang={lang} 
                  />
                </div>
              ) : (
                /* Unprotected / Calculate and Purchase cover */
                <div className="empathy-banner" style={{ backgroundColor: 'var(--danger-light)', borderLeftColor: 'var(--danger)' }}>
                  <div className="empathy-banner-title" style={{ color: 'var(--danger)' }}>
                    ⚠️ {t.unprotected}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {t.unprotectedDesc}
                  </p>
                  
                  {!quote ? (
                    <button onClick={getPricingQuote} className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                      📊 {t.getQuote}
                    </button>
                  ) : (
                    <div style={{ backgroundColor: '#fff', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '0.2rem' }}>💰 {t.premiumEstimate}</span>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span>{t.baseRate}:</span>
                        <span>₹{quote.basePremium.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span>{t.ratingMod}:</span>
                        <span>{quote.factors.ratingModifier > 1 ? '+' : ''}{((quote.factors.ratingModifier - 1)*100).toFixed(0)}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span>{t.vehicleMod}:</span>
                        <span>{quote.factors.vehicleMultiplier > 1 ? '+' : ''}{((quote.factors.vehicleMultiplier - 1)*100).toFixed(0)}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span>{t.zoneRisk}:</span>
                        <span>x{quote.factors.zoneRisk}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: quote.factors.weatherRisk > 1 ? 'var(--primary)' : 'inherit', fontWeight: quote.factors.weatherRisk > 1 ? 'bold' : 'normal' }}>
                        <span>{t.weatherMod}:</span>
                        <span>x{quote.factors.weatherRisk}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', borderTop: '1px dashed #eee', paddingTop: '0.3rem', marginTop: '0.2rem', color: 'var(--primary)' }}>
                        <span>{t.estPremium}:</span>
                        <span>₹{quote.premium.toFixed(2)}/{lang === 'hi' ? 'सप्ताह' : 'week'}</span>
                      </div>
                      
                      <button onClick={activatePolicy} className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                        🔒 {t.activate} (₹{quote?.premium})
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Live Telemetry Status Widget */}
              <div className="telemetry-dashboard">
                <h5 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  📡 {t.telemetry}
                  <span className={`pulse-dot ${(!riderData?.latestPing || riderData?.latestPing?.active_status === 'Offline') ? 'danger' : ''}`}></span>
                </h5>
                <div className="telemetry-row">
                  <span>{t.status}:</span>
                  <span className="telemetry-value" style={{ color: (riderData?.latestPing?.active_status === 'Online') ? 'var(--success)' : 'var(--danger)' }}>
                    {riderData?.latestPing ? (riderData?.latestPing?.active_status === 'Online' ? t.activeLabel : t.offlineLabel) : t.offlineLabel}
                  </span>
                </div>
                <div className="telemetry-row">
                  <span>{t.gps}:</span>
                  <span className="telemetry-value" style={{ fontSize: '0.75rem' }}>
                    {riderData?.latestPing ? `${riderData.latestPing.latitude.toFixed(5)}, ${riderData.latestPing.longitude.toFixed(5)}` : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <button onClick={toggleAppStatus} className="btn btn-secondary" style={{ padding: '0.3rem', fontSize: '0.75rem' }}>
                    🔌 {riderData?.latestPing?.active_status === 'Online' ? t.goOffline : t.goOnline}
                  </button>
                  {riderData?.latestPing?.active_status === 'Online' && (
                    <button onClick={handleSimulateMovement} className="btn btn-secondary" style={{ padding: '0.3rem', fontSize: '0.75rem' }}>
                      🚗 {t.movePing}
                    </button>
                  )}
                </div>
              </div>

              {/* Claims / Payout History list */}
              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem' }}>💰 {t.claimsHistory}</h5>
                {(riderData?.claims || []).length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{t.noClaims}</p>
                ) : (
                  <div className="history-list">
                    {(riderData?.claims || []).map(claim => {
                      const isPaid = claim.status === 'Paid';
                      const isRejected = claim.status === 'Rejected';
                      let outcomeMsg = '';
                      if (isPaid) {
                        outcomeMsg = lang === 'hi' 
                          ? `सक्रिय भुगतान: ${claim.event_type === 'Weather' ? 'भारी बारिश' : claim.event_type === 'Outage' ? 'सर्वर क्रैश' : 'कर्फ्यू'} के कारण ₹${claim.amount} का क्लेम मंजूर हो गया है और बटुए में भेज दिया गया है!`
                          : `Parametric Payout Approved: ₹${claim.amount} credited to wallet due to ${claim.event_type.toLowerCase()} disruption in your zone. Keep safe!`;
                      } else if (isRejected) {
                        outcomeMsg = lang === 'hi'
                          ? `दावा अस्वीकृत: सुरक्षा जांच में विसंगति पाई गई। कारण: ${claim.reason.replace('Fraud Detection:', '')}`
                          : `Claim Denied: Shield check flagged anomalies. Reason: ${claim.reason.replace('Fraud Detection:', '')}`;
                      } else {
                        outcomeMsg = `Claim processing initiated: ${claim.reason}`;
                      }

                      return (
                        <div key={claim.id} className="history-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.4rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="history-item-title" style={{ fontSize: '0.8rem' }}>
                              {claim.event_type === 'Weather' ? '⛈️ Weather Disruption' : claim.event_type === 'Outage' ? '📱 App Server Crash' : '🚧 Local curfew/Strike'}
                            </div>
                            <div className="history-item-status-col">
                              <span className={`status-badge ${claim.status.toLowerCase()}`}>{claim.status}</span>
                              <span className="history-item-amount" style={{ color: isPaid ? 'var(--success)' : isRejected ? 'var(--danger)' : 'inherit' }}>
                                ₹{claim.amount}
                              </span>
                            </div>
                          </div>
                          
                          <p style={{ fontSize: '0.75rem', color: isRejected ? 'var(--danger)' : 'var(--text-secondary)', borderLeft: `2px solid ${isPaid ? 'var(--success)' : isRejected ? 'var(--danger)' : 'var(--warning)'}`, paddingLeft: '5px', margin: '0.1rem 0' }}>
                            {outcomeMsg}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', opacity: 0.8 }}>
                            <span>{claim.triggered_at.split('T')[0]}</span>
                            <AudioNarrator text={outcomeMsg} lang={lang} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
