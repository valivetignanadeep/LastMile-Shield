// AI and Parametric Automation Engine

// Haversine formula to calculate distance in km between two GPS coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Zone centroids mapping
const ZONE_CENTROIDS = {
  'Noida': {
    'Sector 62': { lat: 28.628, lng: 77.365, waterlogRisk: 1.3 },
    'Sector 18': { lat: 28.570, lng: 77.326, waterlogRisk: 1.1 },
    'Sector 150': { lat: 28.468, lng: 77.462, waterlogRisk: 1.05 }
  },
  'Mumbai': {
    'Andheri West': { lat: 19.113, lng: 72.869, waterlogRisk: 1.4 },
    'Bandra': { lat: 19.059, lng: 72.830, waterlogRisk: 1.25 },
    'Colaba': { lat: 18.906, lng: 72.814, waterlogRisk: 1.2 }
  },
  'Delhi': {
    'Saket': { lat: 28.524, lng: 77.206, waterlogRisk: 1.15 },
    'Connaught Place': { lat: 28.630, lng: 77.218, waterlogRisk: 1.1 },
    'Dwarka': { lat: 28.582, lng: 77.050, waterlogRisk: 1.0 }
  },
  'Bengaluru': {
    'Koramangala': { lat: 12.935, lng: 77.624, waterlogRisk: 1.2 },
    'Indiranagar': { lat: 12.971, lng: 77.641, waterlogRisk: 1.15 },
    'Whitefield': { lat: 12.969, lng: 77.750, waterlogRisk: 1.1 }
  }
};

// Simulated 7-day weather forecast risks
const CITY_WEATHER_RISKS = {
  'Noida': 1.2, // Upcoming light monsoon rain risk
  'Mumbai': 1.45, // Heavy monsoon downpour forecast
  'Delhi': 1.1, // High summer heatwave forecast
  'Bengaluru': 1.0 // Pleasant weather forecast
};

/**
 * AI-powered Premium Underwriter
 * Calculates customized weekly pricing
 */
function calculateWeeklyPremium({ city, zone, vehicleType, rating }) {
  const BASE_WEEKLY_PREMIUM = 49.00; // base price in INR

  // 1. Rating Modifier (Safe/reliable drivers get rewarded)
  let ratingModifier = 1.0;
  if (rating >= 4.8) {
    ratingModifier = 0.90; // 10% discount for stellar ratings
  } else if (rating < 4.5) {
    ratingModifier = 1.15; // 15% loading fee for high cancel rate/poor rating
  }

  // 2. Vehicle Risk Multiplier
  let vehicleMultiplier = 1.0;
  if (vehicleType === 'Bicycle') {
    vehicleMultiplier = 0.80; // Hyperlocal range, lower risk exposure
  } else if (vehicleType === 'Electric Scooter') {
    vehicleMultiplier = 0.90; // Economical & green incentive discount
  } else {
    vehicleMultiplier = 1.05; // Petrol bikes have wider range, higher road traffic risk
  }

  // 3. Zone Waterlogging & Curfew Risk Modifier
  let zoneRisk = 1.0;
  if (ZONE_CENTROIDS[city] && ZONE_CENTROIDS[city][zone]) {
    zoneRisk = ZONE_CENTROIDS[city][zone].waterlogRisk;
  }

  // 4. City Weather Forecast Risk Factor
  const weatherRisk = CITY_WEATHER_RISKS[city] || 1.0;

  // Calculate underwritten premium
  const rawPremium = BASE_WEEKLY_PREMIUM * ratingModifier * vehicleMultiplier * zoneRisk * weatherRisk;
  
  // Return rounded values and details for UI transparency
  return {
    premium: parseFloat(rawPremium.toFixed(2)),
    basePremium: BASE_WEEKLY_PREMIUM,
    factors: {
      ratingModifier: parseFloat(ratingModifier.toFixed(2)),
      vehicleMultiplier: parseFloat(vehicleMultiplier.toFixed(2)),
      zoneRisk: parseFloat(zoneRisk.toFixed(2)),
      weatherRisk: parseFloat(weatherRisk.toFixed(2))
    },
    coverageLimit: vehicleType === 'Bicycle' ? 1200 : vehicleType === 'Electric Scooter' ? 1500 : 2000
  };
}

/**
 * AI Fraud Detection and Claim Verification Engine
 */
async function runFraudDetection(dbGet, dbAll, claimData, rider, disruptionEvent) {
  const flags = [];
  let score = 0; // Risk score: 0 (perfectly genuine) to 100 (fully fraudulent)

  // 1. Duplicate claim verification
  const duplicateClaim = await dbGet(
    'SELECT id FROM claims WHERE rider_id = ? AND disruption_event_id = ? AND status != "Rejected"',
    [rider.id, disruptionEvent.id]
  );
  if (duplicateClaim) {
    flags.push('DUPLICATE_CLAIM: Policyholder already has a claim registered for this disruption event.');
    score += 100;
  }

  // 2. Active Policy verification
  const activePolicy = await dbGet(
    `SELECT id FROM policies 
     WHERE rider_id = ? AND status = "Active" 
     AND start_date <= ? AND end_date >= ?`,
    [rider.id, disruptionEvent.start_time, disruptionEvent.start_time]
  );
  if (!activePolicy) {
    flags.push('EXPIRED_OR_NO_POLICY: Rider did not have an active subscription cover during the disruption window.');
    score += 100;
  }

  // 3. Location/Geofencing validation
  // Get rider's location pings during the disruption window or latest ping
  const pings = await dbAll(
    'SELECT latitude, longitude, active_status, pinged_at FROM location_pings WHERE rider_id = ? ORDER BY pinged_at DESC LIMIT 5',
    [rider.id]
  );

  let inGeofence = false;
  let minDistance = Infinity;

  const eventCity = disruptionEvent.city;
  const eventZone = disruptionEvent.zone;
  const zoneInfo = ZONE_CENTROIDS[eventCity] && ZONE_CENTROIDS[eventCity][eventZone];

  if (zoneInfo && pings.length > 0) {
    for (const ping of pings) {
      const dist = calculateDistance(ping.latitude, ping.longitude, zoneInfo.lat, zoneInfo.lng);
      if (dist < minDistance) {
        minDistance = dist;
      }
      if (dist <= 3.5) { // 3.5 km geofence radius
        inGeofence = true;
      }
    }
  }

  if (!inGeofence) {
    flags.push(`GPS_GEOFENCE_VIOLATION: Rider was not within the affected zone (${eventZone}, ${eventCity}) during the event. Minimum recorded distance: ${minDistance.toFixed(2)} km.`);
    score += 60;
  }

  // 4. Platform active status check (Was the rider actually online/trying to work?)
  const wasOnline = pings.some(ping => ping.active_status === 'Online');
  if (!wasOnline && disruptionEvent.type !== 'Outage') {
    // If it was a platform outage, they couldn't be online, so don't penalize. But if weather/curfew, they must be trying to work.
    flags.push('ACTIVITY_CHECK_FAILED: Rider was registered offline on the partner app during the disruption. No income loss occurred.');
    score += 40;
  }

  const isApproved = score < 50;

  return {
    isApproved,
    riskScore: score,
    flags,
    details: {
      geofenceMatch: inGeofence,
      minDistanceKm: minDistance === Infinity ? null : parseFloat(minDistance.toFixed(2)),
      platformActivity: wasOnline ? 'Online' : 'Offline',
      policyValidated: !!activePolicy
    }
  };
}

module.exports = {
  calculateWeeklyPremium,
  runFraudDetection,
  calculateDistance,
  ZONE_CENTROIDS
};
