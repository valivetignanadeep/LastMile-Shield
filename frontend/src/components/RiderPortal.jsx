import React, { useState, useEffect } from 'react';
import AudioNarrator from './AudioNarrator';

const TRANSLATIONS = {
  en: {
    title: "LastMile Shield",
    subtitle: "Partner Safety Net",
    onboardTitle: "Protect Your Daily Wages",
    onboardDesc: "Secure your week's income against heavy rain, app crashes, and curfews in less than 2 minutes.",
    name: "Full Name (Letters only)",
    phone: "Gmail Address",
    platform: "Delivery App",
    vehicle: "Vehicle Type",
    city: "City",
    zone: "Delivery Zone",
    upi: "UPI ID (for instant payouts)",
    onboardBtn: "Complete Registration & Secure Wages",
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
    withdrawSuccess: "Cashout completed successfully!",
    
    // Auth translations
    loginTab: "Log In",
    registerTab: "Register",
    otpLabel: "Verification OTP",
    sendOtpBtn: "Send OTP to Gmail",
    sendingOtp: "Sending...",
    verifyLoginBtn: "Verify & Log In",
    verifyMobileBtn: "Verify Gmail",
    aadharLabel: "Aadhaar Card Number (12 digits)",
    sendAadharOtpBtn: "Send Aadhaar OTP",
    verifyAadharBtn: "Verify Aadhaar",
    addressLabel: "Permanent Home Address",
    logoutBtn: "Logout",
    stepLabel: "Step",
    step1Title: "Gmail Verification",
    step2Title: "Aadhaar Identity Verification",
    step3Title: "Address & Profile Setup",
    otpAlertTitle: "💬 Simulated Email Notification",
    otpAlertDesc: "Your verification code is: ",
    nameError: "Name must strictly contain only letters.",
    phoneError: "Please enter a valid Gmail / email address.",
    aadharError: "Aadhaar number must be exactly 12 digits.",
    regSuccess: "Registration complete! Welcome to LastMile Shield.",
    
    // Orders & Claims tabs
    tabProfile: "Profile & Wallet",
    tabAllOrders: "Delivered Orders (All)",
    tabDisruptedOrders: "Disrupted Claims & Payouts",
    tabClaimsSettled: "Settled Claims Ledger",
    colOrderNum: "Order Number",
    colStore: "Store / Restaurant",
    colAddress: "Delivery Address",
    colEarnings: "Earnings",
    colDisruption: "Disruption Event",
    colCompensation: "Extra Compensation",
    colStatus: "Claim Status",
    btnClaimPayout: "Claim Payout",
    statusClaimed: "Claimed",
    statusUnclaimed: "Claim Now"
  },
  hi: {
    title: "लास्टमाइल शील्ड",
    subtitle: "डिलिवरी पार्टनर सुरक्षा कवच",
    onboardTitle: "अपनी दैनिक मजदूरी सुरक्षित करें",
    onboardDesc: "भारी बारिश, ऐप क्रैश और कर्फ्यू जैसी बाधाओं से अपनी साप्ताहिक आय को 2 मिनट में सुरक्षित करें।",
    name: "पूरा नाम (केवल अक्षर)",
    phone: "जीमेल एड्रेस",
    platform: "डिलिवरी ऐप",
    vehicle: "वाहन का प्रकार",
    city: "शहर",
    zone: "डिलिवरी क्षेत्र (ज़ोन)",
    upi: "UPI आईडी (तुरंत निकासी के लिए)",
    onboardBtn: "पंजीकरण पूरा करें और आय सुरक्षित करें",
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
    withdrawSuccess: "निकासी सफलतापूर्वक पूरी हो गई!",

    // Auth translations
    loginTab: "लॉग इन",
    registerTab: "रजिस्टर",
    otpLabel: "सत्यापन ओटीपी",
    sendOtpBtn: "जीमेल पर ओटीपी भेजें",
    sendingOtp: "भेजा जा रहा है...",
    verifyLoginBtn: "सत्यापित करें और लॉग इन करें",
    verifyMobileBtn: "जीमेल सत्यापित करें",
    aadharLabel: "आधार कार्ड संख्या (12 अंक)",
    sendAadharOtpBtn: "आधार ओटीपी भेजें",
    verifyAadharBtn: "आधार सत्यापित करें",
    addressLabel: "स्थाई घर का पता",
    logoutBtn: "लॉगआउट",
    stepLabel: "चरण",
    step1Title: "जीमेल सत्यापन",
    step2Title: "आधार कार्ड सत्यापन",
    step3Title: "पता और प्रोफाइल सेट करें",
    otpAlertTitle: "💬 सिम्युलेटेड ईमेल संदेश",
    otpAlertDesc: "आपका सत्यापन कोड है: ",
    nameError: "नाम में केवल वर्णमाला के अक्षर होने चाहिए।",
    phoneError: "कृपया एक वैध जीमेल / ईमेल पता दर्ज करें।",
    aadharError: "आधार संख्या ठीक 12 अंकों की होनी चाहिए।",
    regSuccess: "पंजीकरण पूरा हुआ! लास्टमाइल शील्ड में आपका स्वागत है।",

    // Orders & Claims tabs
    tabProfile: "प्रोफाइल और वॉलेट",
    tabAllOrders: "डिलिवर किए गए ऑर्डर (सभी)",
    tabDisruptedOrders: "मौसम/कर्फ्यू अतिरिक्त दावा",
    tabClaimsSettled: "दावे निपटान इतिहास",
    colOrderNum: "ऑर्डर नंबर",
    colStore: "स्टोर / रेस्तरां",
    colAddress: "ग्राहक का पता",
    colEarnings: "कमाई",
    colDisruption: "बाधा स्थिति",
    colCompensation: "अतिरिक्त मुआवजा",
    colStatus: "दावा स्थिति",
    btnClaimPayout: "मुआवजा दावा करें",
    statusClaimed: "प्राप्त किया",
    statusUnclaimed: "अभी दावा करें"
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
  
  // Auth Tab state ('login' or 'register')
  const [authTab, setAuthTab] = useState('login');

  // Login States
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);

  // Registration States (Step Wizard)
  // Step 1: Email verification, Step 2: Aadhaar verification, Step 3: Address & Profile Details
  const [regStep, setRegStep] = useState(1);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpVerified, setRegOtpVerified] = useState(false);

  // Aadhaar States
  const [regAadhar, setRegAadhar] = useState('');
  const [regAadharOtp, setRegAadharOtp] = useState('');
  const [regAadharOtpSent, setRegAadharOtpSent] = useState(false);
  const [regAadharVerified, setRegAadharVerified] = useState(false);

  // Profile Details States
  const [regAddress, setRegAddress] = useState('');
  const [regPlatform, setRegPlatform] = useState('Zomato');
  const [regVehicle, setRegVehicle] = useState('Petrol Bike');
  const [regCity, setRegCity] = useState('Noida');
  const [regZone, setRegZone] = useState('Sector 62');
  const [regUpi, setRegUpi] = useState('');


  // Pricing Quote State
  const [quote, setQuote] = useState(null);

  // Cashout State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState('');
  const [orders, setOrders] = useState([]);
  const [dashboardTab, setDashboardTab] = useState('profile'); // 'profile', 'orders', 'claims'

  // Load session from LocalStorage on mount
  useEffect(() => {
    const cachedRiderId = localStorage.getItem('lastmile_shield_rider_id');
    if (cachedRiderId) {
      setActiveRiderId(parseInt(cachedRiderId));
    }
  }, []);

  // Fetch riders list for testing swapper
  useEffect(() => {
    fetchRidersList();
  }, [activeRiderId, refreshTrigger]);

  // Fetch active rider details when switched
  useEffect(() => {
    if (activeRiderId) {
      fetchRiderDetails(activeRiderId);
      fetchOrders(activeRiderId);
      localStorage.setItem('lastmile_shield_rider_id', activeRiderId);
    } else {
      setRiderData(null);
      setQuote(null);
      setOrders([]);
      localStorage.removeItem('lastmile_shield_rider_id');
    }
  }, [activeRiderId, refreshTrigger]);

  // Sync Zone select when City changes in registration step 3
  useEffect(() => {
    if (CITY_ZONES[regCity]) {
      setRegZone(CITY_ZONES[regCity][0]);
    }
  }, [regCity]);

  const t = TRANSLATIONS[lang];

  // Helper: validate Name strictly contains letters and spaces
  const isLettersOnly = (str) => /^[a-zA-Z\s]*$/.test(str);

  const makeBoldDigits = (numStr) => {
    const boldDigits = {
      '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰',
      '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
    };
    return numStr ? numStr.toString().split('').map(char => boldDigits[char] || char).join('') : '';
  };

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

  const fetchOrders = async (riderId) => {
    try {
      const res = await fetch(`/api/riders/${riderId}/orders`);
      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleClaimCompensation = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        alert(lang === 'hi'
          ? `बधाई हो! ₹${data.claimAmount} आपके खाते में सफलतापूर्वक जोड़ दिया गया है।`
          : `Success! ₹${data.claimAmount} has been successfully added to your account.`);
        if (activeRiderId) {
          fetchRiderDetails(activeRiderId);
          fetchOrders(activeRiderId);
        }
      } else {
        alert(data.error || 'Claim failed.');
      }
    } catch (err) {
      console.error('Claim compensation error:', err);
    }
  };

  // Auth Action 1: Request Email OTP (Login / Register)
  const handleRequestOtp = async (email, name, purpose) => {
    if (purpose === 'login') {
      if (!name.trim()) {
        alert(lang === 'hi' ? 'कृपया उपयोगकर्ता नाम दर्ज करें।' : 'Please enter your username.');
        return;
      }
      if (!isLettersOnly(name)) {
        alert(t.nameError);
        return;
      }
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert(t.phoneError);
      return;
    }

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, purpose })
      });
      const data = await res.json();
      
      if (res.ok) {
        if (purpose === 'login') {
          setLoginOtpSent(true);
        } else {
          setRegOtpSent(true);
        }

        // If Web3Forms key is returned, send email directly from client browser (bypasses Cloudflare block)
        if (data.web3formsKey) {
          console.log("Sending OTP email via client-side Web3Forms...");
          fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_key: data.web3formsKey,
              subject: purpose === 'login' ? 'LastMile Shield Verification Code' : 'LastMile Shield Registration Code',
              message: `Hello,\n\nYour LastMile Shield verification code is:\n\n✨ [ ${makeBoldDigits(data.otp)} ] ✨\n\nValid for 5 minutes.`,
              from_name: 'LastMile Shield'
            })
          }).then(() => {
            console.log("Web3Forms email OTP sent successfully from client browser!");
          }).catch(err => {
            console.error("Web3Forms client-side sending failed:", err);
          });
        }


      } else {
        alert(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error('Error requesting OTP:', err);
    }
  };

  // Auth Action 2: Verify Email OTP & Log In
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    if (!loginOtp) {
      alert(lang === 'hi' ? 'कृपया ओटीपी दर्ज करें।' : 'Please enter the OTP.');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          otp: loginOtp,
          purpose: 'login'
        })
      });
      const data = await res.json();

      if (res.ok) {
        setRiderData(data);
        setActiveRiderId(data.rider.id);
        // Clear login form states
        setLoginName('');
        setLoginEmail('');
        setLoginOtp('');
        setLoginOtpSent(false);
      } else {
        alert(data.error || 'Invalid OTP.');
      }
    } catch (err) {
      console.error('Error logging in:', err);
    }
  };

  // Auth Action 3: Verify Registration Email OTP
  const handleVerifyRegisterOtp = async (e) => {
    e.preventDefault();
    if (!regOtp) {
      alert('Please enter OTP');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          otp: regOtp,
          purpose: 'register'
        })
      });
      const data = await res.json();

      if (res.ok) {
        setRegOtpVerified(true);
        setRegStep(2); // Proceed to Aadhaar Verification step
      } else {
        alert(data.error || 'Invalid mobile verification code.');
      }
    } catch (err) {
      console.error('Error verifying registration OTP:', err);
    }
  };

  // Auth Action 4: Request Aadhaar verification OTP
  const handleRequestAadharOtp = async () => {
    if (!regAadhar || regAadhar.length !== 12 || !/^\d+$/.test(regAadhar)) {
      alert(t.aadharError);
      return;
    }

    try {
      const res = await fetch('/api/auth/aadhar-send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadharNumber: regAadhar, email: regEmail })
      });
      const data = await res.json();

      if (res.ok) {
        setRegAadharOtpSent(true);

        // If Web3Forms key is returned, send email directly from client browser
        if (data.web3formsKey && regEmail) {
          console.log("Sending Aadhaar OTP email via client-side Web3Forms...");
          fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_key: data.web3formsKey,
              subject: 'Aadhaar Verification Code',
              message: `Hello,\n\nYour Aadhaar verification code is:\n\n✨ [ ${makeBoldDigits(data.otp)} ] ✨\n\nValid for 5 minutes.`,
              from_name: 'LastMile Shield'
            })
          }).then(() => {
            console.log("Web3Forms Aadhaar email OTP sent successfully from client browser!");
          }).catch(err => {
            console.error("Web3Forms client-side Aadhaar sending failed:", err);
          });
        }


      } else {
        alert(data.error || 'Failed to request Aadhaar check.');
      }
    } catch (err) {
      console.error('Aadhaar request failed:', err);
    }
  };

  // Auth Action 5: Verify Aadhaar OTP
  const handleVerifyAadharOtp = async (e) => {
    e.preventDefault();
    if (!regAadharOtp) {
      alert('Please enter Aadhaar OTP');
      return;
    }

    try {
      const res = await fetch('/api/auth/aadhar-verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadharNumber: regAadhar,
          otp: regAadharOtp
        })
      });
      const data = await res.json();

      if (res.ok) {
        setRegAadharVerified(true);
        setRegStep(3); // Proceed to Profile details and address step
      } else {
        alert(data.error || 'Invalid Aadhaar code.');
      }
    } catch (err) {
      console.error('Aadhaar OTP verification failed:', err);
    }
  };

  // Auth Action 6: Complete registration with address & profile info
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!regAddress.trim() || !regUpi.trim()) {
      alert('Please fill out your home address and UPI ID.');
      return;
    }

    try {
      const res = await fetch('/api/riders/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          platform: regPlatform,
          vehicleType: regVehicle,
          city: regCity,
          zone: regZone,
          preferredLanguage: lang,
          upiId: regUpi,
          aadharNumber: regAadhar,
          address: regAddress
        })
      });
      const data = await res.json();

      if (res.ok) {
        alert(t.regSuccess);
        setRiderData(data);
        setActiveRiderId(data.rider.id);
        
        // Reset registration wizard states
        setRegStep(1);
        setRegName('');
        setRegEmail('');
        setRegOtp('');
        setRegOtpSent(false);
        setRegOtpVerified(false);
        setRegAadhar('');
        setRegAadharOtp('');
        setRegAadharOtpSent(false);
        setRegAadharVerified(false);
        setRegAddress('');
        setRegUpi('');
      } else {
        alert(data.error || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration processing error:', err);
    }
  };

  const handleLogout = () => {
    setActiveRiderId(null);
    setRiderData(null);
    setQuote(null);
    localStorage.removeItem('lastmile_shield_rider_id');
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

  if (!activeRiderId) {
    return (
      <div className="full-page-auth-container">
        <div className="auth-bg-blob blob-1"></div>
        <div className="auth-bg-blob blob-2"></div>
        
        <div className="auth-card">
          {/* Header logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="logo-icon">LM</div>
              <div>
                <h2 className="logo-text" style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                  LastMile <span>Shield</span>
                </h2>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginTop: '-2px' }}>
                  AI Parametric Income Protection
                </span>
              </div>
            </div>
          </div>

          {/* Lang Selector inside card */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <div className="lang-selector">
              <button className={`lang-tab ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
              <button className={`lang-tab ${lang === 'hi' ? 'active' : ''}`} onClick={() => setLang('hi')}>हिन्दी</button>
            </div>
          </div>



          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: 'var(--secondary-light)', borderRadius: '8px', padding: '0.2rem', marginBottom: '1.2rem' }}>
            <button 
              onClick={() => { setAuthTab('login'); }}
              style={{ padding: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: authTab === 'login' ? '#fff' : 'transparent', color: authTab === 'login' ? 'var(--secondary)' : 'var(--text-secondary)' }}
            >
              🔒 {t.loginTab}
            </button>
            <button 
              onClick={() => { setAuthTab('register'); }}
              style={{ padding: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: authTab === 'register' ? '#fff' : 'transparent', color: authTab === 'register' ? 'var(--secondary)' : 'var(--text-secondary)' }}
            >
              📝 {t.registerTab}
            </button>
          </div>

          {authTab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleVerifyLoginOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.4rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>{lang === 'hi' ? 'सुरक्षित राइडर लॉगिन' : 'Partner Secure Login'}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {lang === 'hi' ? 'ओटीपी प्राप्त करने के लिए नाम और जीमेल दर्ज करें।' : 'Enter your registered name and email to verify.'}
                </p>
              </div>

              <div className="form-group">
                <label>{t.name}</label>
                <input 
                  type="text" 
                  placeholder="Only letters (e.g. Rajesh Kumar)" 
                  value={loginName}
                  disabled={loginOtpSent}
                  onChange={e => {
                    if (isLettersOnly(e.target.value)) {
                      setLoginName(e.target.value);
                    }
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.phone}</label>
                <input 
                  type="email" 
                  placeholder="Enter your Gmail address" 
                  value={loginEmail}
                  disabled={loginOtpSent}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              {!loginOtpSent ? (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => handleRequestOtp(loginEmail, loginName, 'login')}
                  style={{ padding: '0.6rem', marginTop: '0.4rem' }}
                >
                  📲 {t.sendOtpBtn}
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.4rem' }}>
                  <div className="form-group">
                    <label style={{ color: 'var(--primary)', fontWeight: 'bold' }}>🔑 {t.otpLabel}</label>
                    <input 
                      type="text" 
                      placeholder="Enter 4-digit code" 
                      value={loginOtp}
                      maxLength={4}
                      onChange={e => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                      required
                      style={{ borderColor: 'var(--primary)', backgroundColor: 'var(--primary-light)' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ padding: '0.5rem', flex: 1, fontSize: '0.8rem' }}
                      onClick={() => setLoginOtpSent(false)}
                    >
                      ✏️ {lang === 'hi' ? 'बदलें' : 'Edit Email'}
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ padding: '0.5rem', flex: 2, fontSize: '0.8rem' }}
                    >
                      🔓 {t.verifyLoginBtn}
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* REGISTRATION WIZARD */
            <div>
              {/* Step indicators */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <span style={{ color: regStep >= 1 ? 'var(--primary)' : 'inherit' }}>1. {lang === 'hi' ? 'जीमेल' : 'Gmail'}</span>
                <span style={{ color: regStep >= 2 ? 'var(--primary)' : 'inherit' }}>2. {lang === 'hi' ? 'आधार' : 'Aadhaar'}</span>
                <span style={{ color: regStep >= 3 ? 'var(--primary)' : 'inherit' }}>3. {lang === 'hi' ? 'पता और प्रोफाइल' : 'Profile'}</span>
              </div>

              {/* Step 1: Mobile verification */}
              {regStep === 1 && (
                <form onSubmit={handleVerifyRegisterOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>{t.stepLabel} 1/3: {t.step1Title}</h4>
                  </div>

                  <div className="form-group">
                    <label>{t.name}</label>
                    <input 
                      type="text" 
                      placeholder="Letters only" 
                      value={regName}
                      disabled={regOtpSent}
                      onChange={e => {
                        if (isLettersOnly(e.target.value)) {
                          setRegName(e.target.value);
                        }
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t.phone}</label>
                    <input 
                      type="email" 
                      placeholder="Enter your Gmail address" 
                      value={regEmail}
                      disabled={regOtpSent}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                    />
                  </div>

                  {!regOtpSent ? (
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => handleRequestOtp(regEmail, regName, 'register')}
                      style={{ padding: '0.6rem' }}
                    >
                      📲 {t.sendOtpBtn}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <div className="form-group">
                        <label style={{ color: 'var(--primary)' }}>🔑 {t.otpLabel}</label>
                        <input 
                          type="text" 
                          placeholder="Enter 4-digit code" 
                          value={regOtp}
                          maxLength={4}
                          onChange={e => setRegOtp(e.target.value.replace(/\D/g, ''))}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setRegOtpSent(false)} style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}>
                          ✏️ {lang === 'hi' ? 'बदलें' : 'Edit'}
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '0.5rem', fontSize: '0.8rem' }}>
                          ✅ {t.verifyMobileBtn}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* Step 2: Aadhaar Identity verification */}
              {regStep === 2 && (
                <form onSubmit={handleVerifyAadharOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>{t.stepLabel} 2/3: {t.step2Title}</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                      {lang === 'hi' ? 'अपनी पहचान सत्यापित करने के लिए आधार दर्ज करें।' : 'Enter Aadhaar number to verify your identity.'}
                    </p>
                  </div>

                  <div className="form-group">
                    <label>{t.aadharLabel}</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 123456789012" 
                      value={regAadhar}
                      disabled={regAadharOtpSent}
                      maxLength={12}
                      onChange={e => setRegAadhar(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>

                  {!regAadharOtpSent ? (
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleRequestAadharOtp}
                      style={{ padding: '0.6rem' }}
                    >
                      🛡️ {t.sendAadharOtpBtn}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <div className="form-group">
                        <label style={{ color: 'var(--primary)' }}>🔑 {lang === 'hi' ? 'आधार ओटीपी दर्ज करें' : 'Enter Aadhaar OTP'}</label>
                        <input 
                          type="text" 
                          placeholder="Enter 4-digit code" 
                          value={regAadharOtp}
                          maxLength={4}
                          onChange={e => setRegAadharOtp(e.target.value.replace(/\D/g, ''))}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setRegAadharOtpSent(false)} style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}>
                          ✏️ {lang === 'hi' ? 'बदलें' : 'Edit'}
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '0.5rem', fontSize: '0.8rem' }}>
                          ✅ {t.verifyAadharBtn}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* Step 3: Address & Profile Setup */}
              {regStep === 3 && (
                <form onSubmit={handleCompleteRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.2rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>{t.stepLabel} 3/3: {t.step3Title}</h4>
                  </div>

                  <div className="form-group">
                    <label>{t.addressLabel}</label>
                    <textarea 
                      placeholder="Enter your complete permanent address" 
                      value={regAddress} 
                      onChange={e => setRegAddress(e.target.value)}
                      rows="2"
                      required
                      style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                    ></textarea>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    <div className="form-group">
                      <label>{t.platform}</label>
                      <select value={regPlatform} onChange={e => setRegPlatform(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem' }}>
                        <option value="Zomato">Zomato</option>
                        <option value="Swiggy">Swiggy</option>
                        <option value="Zepto">Zepto</option>
                        <option value="Blinkit">Blinkit</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t.vehicle}</label>
                      <select value={regVehicle} onChange={e => setRegVehicle(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem' }}>
                        <option value="Petrol Bike">Petrol Bike</option>
                        <option value="Electric Scooter">Electric Scooter</option>
                        <option value="Bicycle">Bicycle</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    <div className="form-group">
                      <label>{t.city}</label>
                      <select value={regCity} onChange={e => setRegCity(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem' }}>
                        <option value="Noida">Noida</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Bengaluru">Bengaluru</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t.zone}</label>
                      <select value={regZone} onChange={e => setRegZone(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.85rem' }}>
                        {(CITY_ZONES[regCity] || []).map(z => (
                          <option key={z} value={z}>{z}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t.upi}</label>
                    <input 
                      type="text" 
                      placeholder="e.g. name@oksbi" 
                      value={regUpi} 
                      onChange={e => setRegUpi(e.target.value)}
                      required
                      style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '0.4rem', padding: '0.6rem' }}>
                    🛡️ {t.onboardBtn}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-fullpage">
      {/* 1. Header Bar */}
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="logo-icon">LM</div>
          <div>
            <h2 className="logo-text" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              LastMile <span>Shield</span>
            </h2>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginTop: '-2px' }}>
              AI Parametric Income Protection
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span className="pulse-dot"></span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Automation Engine Active</span>
          </div>

          <div className="lang-selector">
            <button className={`lang-tab ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`lang-tab ${lang === 'hi' ? 'active' : ''}`} onClick={() => setLang('hi')}>हिन्दी</button>
          </div>

          <button 
            onClick={handleLogout} 
            className="btn"
            style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
          >
            🚪 {t.logoutBtn}
          </button>
        </div>
      </header>



      {/* 3. Main Dashboard Grid */}
      <main className="dashboard-grid">
        
        {/* Left Column: Profile, Wallet & Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          


          {/* Profile Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="dashboard-panel-title">
              <span>👤</span> {lang === 'hi' ? 'डिलिवरी पार्टनर प्रोफाइल' : 'Delivery Partner Profile'}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{riderData?.rider?.name}</h3>
                <span className="badge-tag" style={{ marginTop: '0.2rem', display: 'inline-block' }}>
                  {riderData?.rider?.platform} • {riderData?.rider?.vehicle_type}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  ⭐ {riderData?.rider?.rating}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #f6f0e8', paddingTop: '0.8rem' }}>
              <div><strong>📧 {lang === 'hi' ? 'जीमेल' : 'Gmail'}:</strong> {riderData?.rider?.email}</div>
              <div><strong>📍 {lang === 'hi' ? 'डिलिवरी क्षेत्र' : 'Zone'}:</strong> {riderData?.rider?.zone}, {riderData?.rider?.city}</div>
              <div><strong>💳 UPI ID:</strong> {riderData?.rider?.upi_id}</div>
              <div><strong>🆔 Aadhaar Link:</strong> Verified (XXXX-XXXX-{riderData?.rider?.aadhar_number?.slice(-4)})</div>
              <div><strong>🏠 Address:</strong> {riderData?.rider?.address}</div>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="card wallet-box" style={{ margin: 0 }}>
            <div className="wallet-title">{t.wallet}</div>
            <div className="wallet-balance">₹{Number(riderData?.rider?.wallet_balance || 0).toFixed(2)}</div>
            
            {Number(riderData?.rider?.wallet_balance || 0) > 0 && (
              <form onSubmit={handleWithdraw} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
                <input 
                  type="number" 
                  placeholder="₹ Amount" 
                  value={withdrawAmount} 
                  onChange={e => setWithdrawAmount(e.target.value)}
                  style={{ padding: '0.4rem', fontSize: '0.85rem', width: '100px', borderRadius: '6px', border: 'none', background: '#fff', color: '#000' }}
                  max={riderData?.rider?.wallet_balance}
                  required
                />
                <button type="submit" className="btn-wallet-withdraw" style={{ flex: 1, padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: 'bold' }}>
                  {t.withdrawBtn}
                </button>
              </form>
            )}
            {withdrawMsg && <div style={{ fontSize: '0.75rem', color: '#81c784', marginTop: '0.4rem', fontWeight: 'bold' }}>{withdrawMsg}</div>}
          </div>

          {/* Telemetry Simulator panel */}
          <div className="card">
            <div className="dashboard-panel-title">
              <span>📡</span> {t.telemetry}
              <span className={`pulse-dot ${(!riderData?.latestPing || riderData?.latestPing?.active_status === 'Offline') ? 'danger' : ''}`} style={{ marginLeft: 'auto' }}></span>
            </div>
            <div className="telemetry-dashboard" style={{ background: '#fff', border: 'none', padding: 0 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.8rem' }}>
                <button onClick={toggleAppStatus} className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.75rem' }}>
                  🔌 {riderData?.latestPing?.active_status === 'Online' ? t.goOffline : t.goOnline}
                </button>
                {riderData?.latestPing?.active_status === 'Online' && (
                  <button onClick={handleSimulateMovement} className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.75rem' }}>
                    🚗 {t.movePing}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Tabs (All Orders, Disrupted Claims, Claim History) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '600px' }}>
          
          {/* Tabs header */}
          <div className="dashboard-tabs">
            <button 
              className={`dashboard-tab-btn ${dashboardTab === 'profile' ? 'active' : ''}`} 
              onClick={() => setDashboardTab('profile')}
            >
              🛡️ {lang === 'hi' ? 'बीमा कवरेज' : 'Insurance Policy'}
            </button>
            <button 
              className={`dashboard-tab-btn ${dashboardTab === 'orders' ? 'active' : ''}`} 
              onClick={() => setDashboardTab('orders')}
            >
              📦 {t.tabAllOrders}
            </button>
            <button 
              className={`dashboard-tab-btn ${dashboardTab === 'claims' ? 'active' : ''}`} 
              onClick={() => setDashboardTab('claims')}
            >
              ⛈️ {t.tabDisruptedOrders}
            </button>
            <button 
              className={`dashboard-tab-btn ${dashboardTab === 'history' ? 'active' : ''}`} 
              onClick={() => setDashboardTab('history')}
            >
              💰 {t.claimsHistory}
            </button>
          </div>

          {/* Tab 1: Insurance Cover details */}
          {dashboardTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="dashboard-panel-title" style={{ border: 'none', marginBottom: 0 }}>
                {lang === 'hi' ? 'सक्रिय साप्ताहिक इनकम सुरक्षा कवच' : 'Active Weekly Income Protection Cover'}
              </div>
              
              {riderData?.activePolicy ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="empathy-banner" style={{ backgroundColor: 'var(--success-light)', borderLeftColor: 'var(--success)', margin: 0 }}>
                    <div className="empathy-banner-title" style={{ color: 'var(--success)', fontSize: '0.95rem' }}>
                      🛡️ LastMile Shield Active <span className="pulse-dot"></span>
                    </div>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.3rem', color: '#1b5e20', lineHeight: 1.4 }}>
                      {t.activeRiderText}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: '#fcfbfa' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.coverageLimit}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.2rem' }}>₹{Number(riderData.activePolicy.coverage_limit || 0).toFixed(2)}</div>
                    </div>
                    <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: '#fcfbfa' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.validUntil}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '0.2rem' }}>{riderData.activePolicy.end_date}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="empathy-banner" style={{ margin: 0 }}>
                    <div className="empathy-banner-title">🛡️ {t.unprotected}</div>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{t.unprotectedDesc}</p>
                  </div>

                  {!quote ? (
                    <button onClick={getPricingQuote} className="btn btn-primary" style={{ padding: '0.8rem', alignSelf: 'flex-start' }}>
                      ⚡ {t.getQuote}
                    </button>
                  ) : (
                    <div className="card" style={{ border: '1px solid var(--border-color)', width: '100%', maxWidth: '500px', backgroundColor: '#fcfbfa' }}>
                      <h4 style={{ fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                        📋 {t.premiumEstimate}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{t.baseRate}:</span>
                          <span>₹{Number(quote.breakdown.baseRate || 0).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{t.ratingMod} ({riderData?.rider?.rating}★):</span>
                          <span>{quote.breakdown.ratingMod > 1 ? `+${Number((quote.breakdown.ratingMod - 1) * 100).toFixed(0)}%` : `${Number((quote.breakdown.ratingMod - 1) * 100).toFixed(0)}%`}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{t.vehicleMod} ({riderData?.rider?.vehicle_type}):</span>
                          <span>x{quote.breakdown.vehicleMod}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{t.zoneRisk} ({riderData?.rider?.zone}):</span>
                          <span>x{quote.breakdown.zoneRisk}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f6f0e8', paddingBottom: '0.4rem' }}>
                          <span>{t.weatherMod}:</span>
                          <span>x{quote.breakdown.weatherForecastMod}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                          <span>{t.estPremium} (1 {lang === 'hi' ? 'सप्ताह' : 'Week'}):</span>
                          <span>₹{Number(quote.premium || 0).toFixed(2)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem' }}>
                        <button onClick={() => setQuote(null)} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }}>
                          🔄 {lang === 'hi' ? 'रद्द करें' : 'Recalculate'}
                        </button>
                        <button onClick={activatePolicy} className="btn btn-primary" style={{ flex: 2, padding: '0.5rem' }}>
                          🔒 {t.activate}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: All Delivered Orders */}
          {dashboardTab === 'orders' && (
            <div>
              <div className="dashboard-panel-title" style={{ border: 'none', marginBottom: '0.5rem' }}>
                📦 {lang === 'hi' ? 'सभी डिलीवर किए गए ऑर्डर इतिहास' : 'Complete Delivered Orders Log'}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {lang === 'hi' ? 'नीचे आपके द्वारा डिलीवर किए गए सभी ऑर्डर की सूची दी गई है।' : 'Below is the log of all deliveries completed by your account.'}
              </p>
              
              {orders.length === 0 ? (
                <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {lang === 'hi' ? 'कोई ऑर्डर नहीं मिला।' : 'No orders found for this rider.'}
                </p>
              ) : (
                <div className="orders-table-wrapper">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>{t.colOrderNum}</th>
                        <th>{t.colStore}</th>
                        <th>{t.colAddress}</th>
                        <th>{lang === 'hi' ? 'तारीख और समय' : 'Delivered At'}</th>
                        <th>{t.colEarnings}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{order.order_number}</td>
                          <td>{order.store_name}</td>
                          <td style={{ maxWidth: '240px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={order.customer_address}>
                            {order.customer_address}
                          </td>
                          <td>{new Date(order.delivered_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                          <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>₹{Number(order.earnings || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Disrupted Claims & Payouts */}
          {dashboardTab === 'claims' && (
            <div>
              <div className="dashboard-panel-title" style={{ border: 'none', marginBottom: '0.5rem' }}>
                ⛈️ {lang === 'hi' ? 'खराब मौसम और अन्य आपदा मुआवजा दावे' : 'Disrupted Delivery Parametric Compensation'}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {lang === 'hi' ? 'खराब मौसम, भारी ट्रैफिक जाम, या स्थानीय कर्फ्यू के दौरान डिलीवर किए गए ऑर्डर विशेष मुआवजे के हकदार हैं। दावा करने के लिए "मुआवजा दावा करें" पर क्लिक करें।' : 'Deliveries completed under severe weather storms, major traffic bottlenecks, or localized curfews are eligible for parametric shield top-ups. Click "Claim Payout" to instantly credit your wallet.'}
              </p>
              
              {orders.filter(o => o.disruption_type !== 'None').length === 0 ? (
                <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {lang === 'hi' ? 'आपदा परिस्थितियों में डिलीवर किया गया कोई ऑर्डर नहीं मिला।' : 'No orders found delivered under disruption conditions.'}
                </p>
              ) : (
                <div className="orders-table-wrapper">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>{t.colOrderNum}</th>
                        <th>{t.colStore}</th>
                        <th>{t.colDisruption}</th>
                        <th>{t.colCompensation}</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.filter(o => o.disruption_type !== 'None').map(order => {
                        const isClaimed = order.claim_status === 'Claimed';
                        return (
                          <tr key={order.id}>
                            <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{order.order_number}</td>
                            <td>{order.store_name}</td>
                            <td>
                              <span className={`disruption-badge ${order.disruption_type}`}>
                                {order.disruption_type === 'Weather' ? '⛈️ Weather' : order.disruption_type === 'Traffic' ? '🚦 Traffic' : '🚧 Curfew'} ({order.disruption_severity})
                              </span>
                            </td>
                            <td style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.9rem' }}>
                              ₹{Number(order.disruption_compensation || 0).toFixed(2)}
                            </td>
                            <td>
                              {isClaimed ? (
                                <span style={{ color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                                  ✅ {t.statusClaimed}
                                </span>
                              ) : (
                                <button 
                                  onClick={() => handleClaimCompensation(order.id)}
                                  className="btn btn-primary"
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 'bold' }}
                                >
                                  💸 {t.btnClaimPayout}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Settled Claims History */}
          {dashboardTab === 'history' && (
            <div>
              <div className="dashboard-panel-title" style={{ border: 'none', marginBottom: '0.5rem' }}>
                💰 {t.claimsHistory}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {lang === 'hi' ? 'नीचे आपके स्वीकृत बीमा दावों और तत्काल नकद अंतरण का इतिहास दिया गया है।' : 'Below is the ledger of all parametric claims processed and payouts deposited to your wallet.'}
              </p>
              
              {(riderData?.claims || []).length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{t.noClaims}</p>
              ) : (
                <div className="history-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {(riderData?.claims || []).map(claim => {
                    const isPaid = claim.status === 'Paid';
                    const isRejected = claim.status === 'Rejected';
                    let outcomeMsg = '';
                    if (isPaid) {
                      outcomeMsg = lang === 'hi' 
                        ? `${claim.reason.replace('Automatic parametric trigger approved: ', '')}`
                        : `${claim.reason}`;
                    } else if (isRejected) {
                      outcomeMsg = lang === 'hi'
                        ? `दावा अस्वीकृत। कारण: ${claim.reason.replace('Fraud Detection:', '')}`
                        : `Claim Denied. Reason: ${claim.reason.replace('Fraud Detection:', '')}`;
                    } else {
                      outcomeMsg = `Claim processing initiated: ${claim.reason}`;
                    }

                    return (
                      <div key={claim.id} className="history-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.4rem', margin: 0, padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="history-item-title" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {claim.event_type === 'Weather' ? '⛈️ Weather' : claim.event_type === 'Outage' ? '📱 App Outage' : claim.event_type === 'Traffic' ? '🚦 Traffic' : '🚧 Curfew'} Disruption
                          </div>
                          <div className="history-item-status-col" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className={`status-badge ${claim.status.toLowerCase()}`}>{claim.status}</span>
                            <span className="history-item-amount" style={{ color: isPaid ? 'var(--success)' : isRejected ? 'var(--danger)' : 'inherit', fontWeight: 'bold' }}>
                              ₹{claim.amount}
                            </span>
                          </div>
                        </div>
                        
                        <p style={{ fontSize: '0.75rem', color: isRejected ? 'var(--danger)' : 'var(--text-secondary)', borderLeft: `2px solid ${isPaid ? 'var(--success)' : isRejected ? 'var(--danger)' : 'var(--warning)'}`, paddingLeft: '5px', margin: '0.4rem 0', lineHeight: 1.3 }}>
                          {outcomeMsg}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', opacity: 0.8, marginTop: '0.2rem' }}>
                          <span>{claim.triggered_at.split('T')[0]}</span>
                          <AudioNarrator text={outcomeMsg} lang={lang} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
