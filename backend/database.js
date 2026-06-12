const fs = require('fs');
const path = require('path');

const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const dbPath = isVercel 
  ? path.join('/tmp', 'lastmile_shield_db.json') 
  : path.join(__dirname, 'lastmile_shield_db.json');

// Memory cache of our tables
let data = {
  riders: [],
  policies: [],
  disruption_events: [],
  claims: [],
  location_pings: [],
  orders: []
};

// Helper to save cache to file
const saveToDbFile = () => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to database file:', err.message);
  }
};

// Helper to load cache from file
const loadFromDbFile = () => {
  try {
    if (fs.existsSync(dbPath)) {
      const fileContent = fs.readFileSync(dbPath, 'utf-8');
      data = JSON.parse(fileContent);
      if (!data.orders) {
        data.orders = [];
      }
    }
  } catch (err) {
    console.error('Failed to read database file:', err.message);
  }
};

const dbRun = async (query, params = []) => {
  loadFromDbFile();
  let lastID = 0;
  let changes = 0;

  // 1. Insert Rider
  if (query.match(/INSERT\s+INTO\s+riders/i)) {
    const [name, email, platform, vehicle_type, city, zone, preferred_language, rating, upi_id, aadhar_number, address] = params;
    const wallet_balance = 0.0;
    
    // Check unique email constraint case-insensitively
    const emailExists = data.riders.some(r => r.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      throw new Error('UNIQUE constraint failed: riders.email');
    }

    lastID = data.riders.length > 0 ? Math.max(...data.riders.map(r => r.id)) + 1 : 1;
    data.riders.push({
      id: lastID,
      name,
      email,
      platform,
      vehicle_type,
      city,
      zone,
      preferred_language: preferred_language || 'en',
      rating: rating || 4.8,
      wallet_balance: wallet_balance || 0.0,
      upi_id,
      aadhar_number,
      address,
      joined_at: new Date().toISOString()
    });
    changes = 1;
  }
  
  // 2. Insert Policy
  else if (query.match(/INSERT\s+INTO\s+policies/i)) {
    const [rider_id, premium, coverage_limit] = params;
    const today = new Date();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(today.getDate() + 7);
    const format = (d) => d.toISOString().split('T')[0];

    lastID = data.policies.length > 0 ? Math.max(...data.policies.map(p => p.id)) + 1 : 1;
    data.policies.push({
      id: lastID,
      rider_id,
      start_date: format(today),
      end_date: format(oneWeekLater),
      weekly_premium: premium,
      coverage_limit,
      status: 'Active',
      created_at: new Date().toISOString()
    });
    changes = 1;
  }

  // 3. Insert Disruption Event
  else if (query.match(/INSERT\s+INTO\s+disruption_events/i)) {
    const [type, city, zone, start_time, end_time, severity, description] = params;
    
    lastID = data.disruption_events.length > 0 ? Math.max(...data.disruption_events.map(e => e.id)) + 1 : 1;
    data.disruption_events.push({
      id: lastID,
      type,
      city,
      zone,
      start_time,
      end_time,
      severity,
      description,
      processed: 1,
      created_at: new Date().toISOString()
    });
    changes = 1;
  }

  // 4. Insert Claim
  else if (query.match(/INSERT\s+INTO\s+claims/i)) {
    const [policy_id, rider_id, disruption_event_id, amount, status, reason] = params;
    
    lastID = data.claims.length > 0 ? Math.max(...data.claims.map(c => c.id)) + 1 : 1;
    data.claims.push({
      id: lastID,
      policy_id,
      rider_id,
      disruption_event_id,
      amount,
      status,
      reason,
      triggered_at: new Date().toISOString(),
      processed_at: new Date().toISOString()
    });
    changes = 1;
  }

  // 5. Insert Location Ping
  else if (query.match(/INSERT\s+INTO\s+location_pings/i)) {
    const [rider_id, latitude, longitude, active_status] = params;
    
    lastID = data.location_pings.length > 0 ? Math.max(...data.location_pings.map(lp => lp.id)) + 1 : 1;
    data.location_pings.push({
      id: lastID,
      rider_id,
      latitude,
      longitude,
      active_status,
      pinged_at: new Date().toISOString()
    });
    changes = 1;
  }

  // 6. Update Rider Wallet Balance
  else if (query.match(/UPDATE\s+riders\s+SET\s+wallet_balance\s*=\s*\?\s*WHERE\s+id\s*=\s*\?/i)) {
    const [wallet_balance, id] = params;
    const rider = data.riders.find(r => r.id === parseInt(id));
    if (rider) {
      rider.wallet_balance = parseFloat(wallet_balance);
      changes = 1;
    }
  }
  
  // 7. Update Order Claim Status
  else if (query.match(/UPDATE\s+orders\s+SET\s+claim_status\s*=\s*\?\s*WHERE\s+id\s*=\s*\?/i)) {
    const [claim_status, id] = params;
    const order = data.orders.find(o => o.id === parseInt(id));
    if (order) {
      order.claim_status = String(claim_status);
      changes = 1;
    }
  }

  saveToDbFile();
  return { id: lastID, changes };
};

const dbAll = async (query, params = []) => {
  loadFromDbFile();

  // 1. Get all riders
  if (query.match(/SELECT\s+\*\s+FROM\s+riders\s+ORDER\s+BY\s+joined_at\s+DESC/i)) {
    return [...data.riders].sort((a, b) => new Date(b.joined_at) - new Date(a.joined_at));
  }

  // 2. Get global claims history table
  if (query.match(/SELECT\s+c\.\*,\s*r\.name\s+as\s+rider_name,\s*r\.(phone|email)/i)) {
    return data.claims.map(c => {
      const rider = data.riders.find(r => r.id === c.rider_id) || {};
      const event = data.disruption_events.find(e => e.id === c.disruption_event_id) || {};
      return {
        ...c,
        rider_name: rider.name || 'Unknown',
        rider_email: rider.email || '',
        platform: rider.platform || '',
        event_type: event.type || 'Disruption',
        event_desc: event.description || ''
      };
    }).sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at));
  }

  // 3. Get list of active policies matching city disruption
  if (query.match(/WHERE\s+r\.city\s*=\s*\?\s*AND\s+p\.status\s*=\s*'Active'/i)) {
    const [city] = params;
    const activePolicies = data.policies.filter(p => p.status === 'Active');
    const results = [];
    for (const p of activePolicies) {
      const r = data.riders.find(rider => rider.id === p.rider_id);
      if (r && r.city === city) {
        results.push({
          ...p,
          rider_id: r.id,
          name: r.name,
          email: r.email,
          city: r.city,
          zone: r.zone,
          platform: r.platform,
          wallet_balance: r.wallet_balance
        });
      }
    }
    return results;
  }

  // 4. Get last 5 pings for fraud checks
  if (query.match(/FROM\s+location_pings\s+WHERE\s+rider_id\s*=\s*\?\s*ORDER\s+BY\s+pinged_at\s+DESC\s+LIMIT\s+5/i)) {
    const [rider_id] = params;
    return data.location_pings
      .filter(lp => lp.rider_id === parseInt(rider_id))
      .sort((a, b) => new Date(b.pinged_at) - new Date(a.pinged_at))
      .slice(0, 5);
  }

  // 5. Get recent anomalies/rejected claims for dashboard statistics
  if (query.match(/c\.status\s*=\s*"Rejected"\s*ORDER\s+BY\s+c\.triggered_at\s+DESC\s+LIMIT\s+5/i)) {
    const rejectedClaims = data.claims.filter(c => c.status === 'Rejected');
    return rejectedClaims.map(c => {
      const rider = data.riders.find(r => r.id === c.rider_id) || {};
      const event = data.disruption_events.find(e => e.id === c.disruption_event_id) || {};
      return {
        ...c,
        rider_name: rider.name || 'Unknown',
        event_type: event.type || 'Disruption',
        event_zone: event.zone || ''
      };
    }).sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at)).slice(0, 5);
  }

  // 6. Get claim status counts
  if (query.match(/SELECT\s+status,\s*COUNT\(\*\)\s+as\s+count\s+FROM\s+claims\s+GROUP\s+BY\s+status/i)) {
    const counts = {};
    data.claims.forEach(c => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return Object.keys(counts).map(status => ({ status, count: counts[status] }));
  }

  // 7. Get claims for a specific rider
  if (query.match(/FROM\s+claims\s+c\s+JOIN\s+disruption_events/i)) {
    const [rider_id] = params;
    return data.claims.filter(c => c.rider_id === parseInt(rider_id)).map(c => {
      const event = data.disruption_events.find(e => e.id === c.disruption_event_id) || {};
      return {
        ...c,
        event_type: event.type,
        event_desc: event.description,
        event_severity: event.severity
      };
    }).sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at));
  }

  // 8. Get all orders for a specific rider
  if (query.match(/SELECT\s+\*\s+FROM\s+orders\s+WHERE\s+rider_id\s*=\s*\?/i)) {
    const [rider_id] = params;
    return data.orders
      .filter(o => o.rider_id === parseInt(rider_id))
      .sort((a, b) => new Date(b.delivered_at) - new Date(a.delivered_at));
  }

  // 9. Get all disruption events
  if (query.match(/SELECT\s+\*\s+FROM\s+disruption_events/i)) {
    return [...data.disruption_events];
  }

  return [];
};

const dbGet = async (query, params = []) => {
  loadFromDbFile();

  // 1. Get single rider
  if (query.match(/SELECT\s+\*\s+FROM\s+riders\s+WHERE\s+id\s*=\s*\?/i)) {
    const [id] = params;
    return data.riders.find(r => r.id === parseInt(id)) || null;
  }

  // Support lookup of rider by email
  if (query.match(/SELECT\s+\*\s+FROM\s+riders\s+WHERE\s+email\s*=\s*\?/i)) {
    const [email] = params;
    return data.riders.find(r => r.email.toLowerCase() === String(email).toLowerCase()) || null;
  }

  // Support lookup of rider ID by email
  if (query.match(/SELECT\s+id\s+FROM\s+riders\s+WHERE\s+email\s*=\s*\?/i)) {
    const [email] = params;
    const rider = data.riders.find(r => r.email.toLowerCase() === String(email).toLowerCase());
    return rider ? { id: rider.id } : null;
  }

  // Support lookup of rider ID by Aadhaar number
  if (query.match(/SELECT\s+id\s+FROM\s+riders\s+WHERE\s+aadhar_number\s*=\s*\?/i)) {
    const [aadharNumber] = params;
    const rider = data.riders.find(r => r.aadhar_number === String(aadharNumber));
    return rider ? { id: rider.id } : null;
  }

  // Support lookup of active policy ID by rider_id
  if (query.match(/SELECT\s+id\s+FROM\s+policies\s+WHERE\s+rider_id\s*=\s*\?\s*AND\s+status\s*=\s*"Active"/i)) {
    const [rider_id] = params;
    const policy = data.policies.find(p => p.rider_id === parseInt(rider_id) && p.status === 'Active');
    return policy ? { id: policy.id } : null;
  }

  // 2. Get single active policy for rider
  if (query.match(/SELECT\s+\*\s+FROM\s+policies\s+WHERE\s+rider_id\s*=\s*\?\s*AND\s+status\s*=\s*"Active"/i)) {
    const [rider_id] = params;
    return data.policies.find(p => p.rider_id === parseInt(rider_id) && p.status === 'Active') || null;
  }

  // 3. Get latest location ping
  if (query.match(/SELECT\s+\*\s+FROM\s+location_pings\s+WHERE\s+rider_id\s*=\s*\?\s*ORDER\s+BY\s+pinged_at\s+DESC\s+LIMIT\s+1/i)) {
    const [rider_id] = params;
    const pings = data.location_pings.filter(lp => lp.rider_id === parseInt(rider_id));
    if (pings.length === 0) return null;
    return pings.sort((a, b) => new Date(b.pinged_at) - new Date(a.pinged_at))[0];
  }

  // 4. Duplicate claim checks
  if (query.match(/SELECT\s+id\s+FROM\s+claims\s+WHERE\s+rider_id\s*=\s*\?\s*AND\s+disruption_event_id\s*=\s*\?/i)) {
    const [rider_id, event_id] = params;
    return data.claims.find(c => c.rider_id === parseInt(rider_id) && c.disruption_event_id === parseInt(event_id) && c.status !== 'Rejected') || null;
  }

  // 5. Active policy verification during disruption window
  if (query.match(/SELECT\s+id\s+FROM\s+policies\s+WHERE\s+rider_id\s*=\s*\?\s*AND\s+status\s*=\s*"Active"\s+AND\s+start_date\s*<=\s*\?\s*AND\s+end_date\s*>=\s*\?/i)) {
    const [rider_id, start_time, start_time_dup] = params;
    const policy = data.policies.find(p => p.rider_id === parseInt(rider_id) && p.status === 'Active');
    // Basic date parsing and checking
    if (policy) {
      const start = new Date(policy.start_date + 'T00:00:00');
      const end = new Date(policy.end_date + 'T23:59:59');
      const evTime = new Date(start_time);
      if (evTime >= start && evTime <= end) {
        return policy;
      }
    }
    return null;
  }

  // 6. Get rider wallet details
  if (query.match(/SELECT\s+wallet_balance,\s*upi_id\s+FROM\s+riders\s+WHERE\s+id\s*=\s*\?/i)) {
    const [id] = params;
    const rider = data.riders.find(r => r.id === parseInt(id));
    if (rider) {
      return { wallet_balance: rider.wallet_balance, upi_id: rider.upi_id };
    }
    return null;
  }

  // Support lookup of order by id
  if (query.match(/SELECT\s+\*\s+FROM\s+orders\s+WHERE\s+id\s*=\s*\?/i)) {
    const [id] = params;
    return data.orders.find(o => o.id === parseInt(id)) || null;
  }

  // 7. General Rider Counts
  if (query.match(/SELECT\s+COUNT\(\*\)\s+as\s+count\s+FROM\s+riders/i)) {
    return { count: data.riders.length };
  }

  // 8. General Active Policy Count
  if (query.match(/SELECT\s+COUNT\(\*\)\s+as\s+count\s+FROM\s+policies\s+WHERE\s+status\s*=\s*"Active"/i)) {
    return { count: data.policies.filter(p => p.status === 'Active').length };
  }

  // 9. Premium Sum
  if (query.match(/SELECT\s+SUM\(weekly_premium\)\s+as\s+sum\s+FROM\s+policies/i)) {
    const sum = data.policies.reduce((acc, p) => acc + p.weekly_premium, 0);
    return { sum };
  }

  // 10. Paid Payouts Sum
  if (query.match(/SELECT\s+SUM\(amount\)\s+as\s+sum\s+FROM\s+claims\s+WHERE\s+status\s*=\s*"Paid"/i)) {
    const sum = data.claims.filter(c => c.status === 'Paid').reduce((acc, c) => acc + c.amount, 0);
    return { sum };
  }

  return null;
};

const seedMockOrders = () => {
  const formatDate = (daysAgo, hours, minutes) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  data.orders = [
    // Rider 1: Rajesh Kumar (Zomato)
    { id: 1, rider_id: 1, order_number: 'ORD-ZOM-101', store_name: "McDonald's Noida", customer_address: "B-402, Sector 62, Noida", delivered_at: formatDate(1, 14, 30), earnings: 45.0, disruption_type: 'None', disruption_severity: 'None', disruption_compensation: 0.0, claim_status: 'Unclaimed' },
    { id: 2, rider_id: 1, order_number: 'ORD-ZOM-102', store_name: "Haldiram's Noida", customer_address: "Flat 12, Block C, Sector 62, Noida", delivered_at: formatDate(2, 16, 15), earnings: 55.0, disruption_type: 'Weather', disruption_severity: 'Severe', disruption_compensation: 80.0, claim_status: 'Unclaimed' },
    { id: 3, rider_id: 1, order_number: 'ORD-ZOM-103', store_name: "Pizza Hut Noida", customer_address: "Noida Authority Office, Noida", delivered_at: formatDate(3, 19, 45), earnings: 60.0, disruption_type: 'Traffic', disruption_severity: 'Moderate', disruption_compensation: 40.0, claim_status: 'Unclaimed' },
    { id: 4, rider_id: 1, order_number: 'ORD-ZOM-104', store_name: "Burger King Noida", customer_address: "H-15, Sector 62, Noida", delivered_at: formatDate(4, 21, 0), earnings: 40.0, disruption_type: 'Curfew', disruption_severity: 'Severe', disruption_compensation: 120.0, claim_status: 'Unclaimed' },
    { id: 5, rider_id: 1, order_number: 'ORD-ZOM-105', store_name: "Chaayos Noida", customer_address: "Stellar IT Park, Sector 62, Noida", delivered_at: formatDate(0, 11, 20), earnings: 35.0, disruption_type: 'None', disruption_severity: 'None', disruption_compensation: 0.0, claim_status: 'Unclaimed' },

    // Rider 2: Suresh Patel (Swiggy)
    { id: 6, rider_id: 2, order_number: 'ORD-SWI-201', store_name: "KFC Andheri", customer_address: "Juhu Tara Road, Mumbai", delivered_at: formatDate(1, 20, 10), earnings: 50.0, disruption_type: 'Outage', disruption_severity: 'Severe', disruption_compensation: 90.0, claim_status: 'Unclaimed' },
    { id: 7, rider_id: 2, order_number: 'ORD-SWI-202', store_name: "Subway Versova", customer_address: "Versova Beach Road, Mumbai", delivered_at: formatDate(2, 13, 40), earnings: 40.0, disruption_type: 'None', disruption_severity: 'None', disruption_compensation: 0.0, claim_status: 'Unclaimed' },
    { id: 8, rider_id: 2, order_number: 'ORD-SWI-203', store_name: "Starbucks Complex", customer_address: "Lokhandwala Complex, Mumbai", delivered_at: formatDate(3, 15, 0), earnings: 65.0, disruption_type: 'Traffic', disruption_severity: 'Severe', disruption_compensation: 60.0, claim_status: 'Unclaimed' },

    // Rider 3: Amit Sharma (Zepto)
    { id: 9, rider_id: 3, order_number: 'ORD-ZEP-301', store_name: "Zepto Noida 18 Store", customer_address: "Pocket F, Sector 18, Noida", delivered_at: formatDate(1, 15, 20), earnings: 35.0, disruption_type: 'None', disruption_severity: 'None', disruption_compensation: 0.0, claim_status: 'Unclaimed' },
    { id: 10, rider_id: 3, order_number: 'ORD-ZEP-302', store_name: "Zepto Noida 18 Store", customer_address: "Wave Silver Tower, Sector 18, Noida", delivered_at: formatDate(2, 17, 50), earnings: 38.0, disruption_type: 'Weather', disruption_severity: 'Severe', disruption_compensation: 80.0, claim_status: 'Unclaimed' },

    // Rider 4: Vikram Singh (Blinkit)
    { id: 11, rider_id: 4, order_number: 'ORD-BLI-401', store_name: "Blinkit Saket Store", customer_address: "M-Block, Saket, Delhi", delivered_at: formatDate(1, 20, 30), earnings: 40.0, disruption_type: 'Curfew', disruption_severity: 'Extreme', disruption_compensation: 150.0, claim_status: 'Unclaimed' },
    { id: 12, rider_id: 4, order_number: 'ORD-BLI-402', store_name: "Blinkit Saket Store", customer_address: "J-Block, Saket, Delhi", delivered_at: formatDate(2, 11, 15), earnings: 42.0, disruption_type: 'None', disruption_severity: 'None', disruption_compensation: 0.0, claim_status: 'Unclaimed' }
  ];
};

// Seed function inside database initializing cache file if not present
const initDb = async () => {
  if (fs.existsSync(dbPath)) {
    console.log('Database cache file loaded.');
    loadFromDbFile();
    
    // Automatic migration to add aadhar_number, address, and email to legacy caches
    let migrated = false;
    data.riders.forEach(r => {
      if (r.aadhar_number === undefined) {
        r.aadhar_number = r.id === 1 ? '123456789012' : r.id === 2 ? '987654321098' : r.id === 3 ? '111122223333' : '444455556666';
        migrated = true;
      }
      if (r.address === undefined) {
        r.address = r.id === 1 ? 'Block C, Sector 62, Noida, UP' : r.id === 2 ? 'Linking Road, Bandra West, Mumbai, MH' : r.id === 3 ? 'Market Road, Sector 18, Noida, UP' : 'Near PVR Cinema, Saket, New Delhi';
        migrated = true;
      }
      if (r.email === undefined) {
        r.email = r.phone ? (r.phone === '9876543210' ? 'rajesh.kumar@gmail.com' : r.phone === '9876543211' ? 'suresh.patel@gmail.com' : r.phone === '9876543212' ? 'amit.sharma@gmail.com' : r.phone === '9876543213' ? 'vikram.singh@gmail.com' : `${r.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`) : (r.id === 1 ? 'rajesh.kumar@gmail.com' : r.id === 2 ? 'suresh.patel@gmail.com' : r.id === 3 ? 'amit.sharma@gmail.com' : 'vikram.singh@gmail.com');
        delete r.phone;
        migrated = true;
      }
    });

    if (!data.orders || data.orders.length === 0) {
      seedMockOrders();
      migrated = true;
    }

    if (migrated) {
      saveToDbFile();
      console.log('Database schema migrated to include Aadhaar, Address, and Orders fields.');
    }
    return;
  }

  console.log('Seeding pure JS JSON database with default riders, policies, and pings...');
  
  const today = new Date();
  const format = (d) => d.toISOString().split('T')[0];
  const formatTime = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  const oneWeekLater = new Date();
  oneWeekLater.setDate(today.getDate() + 7);

  // 1. Seed Riders
  data.riders = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh.kumar@gmail.com', platform: 'Zomato', vehicle_type: 'Petrol Bike', city: 'Noida', zone: 'Sector 62', preferred_language: 'hi', rating: 4.9, wallet_balance: 150.0, upi_id: 'rajesh@okaxis', aadhar_number: '123456789012', address: 'Block C, Sector 62, Noida, UP', joined_at: oneWeekAgo.toISOString() },
    { id: 2, name: 'Suresh Patel', email: 'suresh.patel@gmail.com', platform: 'Swiggy', vehicle_type: 'Electric Scooter', city: 'Mumbai', zone: 'Andheri West', preferred_language: 'en', rating: 4.7, wallet_balance: 300.0, upi_id: 'suresh@okpaytm', aadhar_number: '987654321098', address: 'Linking Road, Bandra West, Mumbai, MH', joined_at: oneWeekAgo.toISOString() },
    { id: 3, name: 'Amit Sharma', email: 'amit.sharma@gmail.com', platform: 'Zepto', vehicle_type: 'Bicycle', city: 'Noida', zone: 'Sector 18', preferred_language: 'hi', rating: 4.8, wallet_balance: 0.0, upi_id: 'amit@okicici', aadhar_number: '111122223333', address: 'Market Road, Sector 18, Noida, UP', joined_at: oneWeekAgo.toISOString() },
    { id: 4, name: 'Vikram Singh', email: 'vikram.singh@gmail.com', platform: 'Blinkit', vehicle_type: 'Petrol Bike', city: 'Delhi', zone: 'Saket', preferred_language: 'hi', rating: 4.6, wallet_balance: 50.0, upi_id: 'vikram@oksbi', aadhar_number: '444455556666', address: 'Near PVR Cinema, Saket, New Delhi', joined_at: oneWeekAgo.toISOString() }
  ];

  // 2. Seed Policies
  data.policies = [
    { id: 1, rider_id: 1, start_date: format(oneWeekAgo), end_date: format(oneWeekLater), weekly_premium: 59.0, coverage_limit: 1500.0, status: 'Active', created_at: oneWeekAgo.toISOString() },
    { id: 2, rider_id: 2, start_date: format(oneWeekAgo), end_date: format(oneWeekLater), weekly_premium: 79.0, coverage_limit: 2000.0, status: 'Active', created_at: oneWeekAgo.toISOString() },
    { id: 3, rider_id: 3, start_date: format(oneWeekAgo), end_date: format(oneWeekLater), weekly_premium: 49.0, coverage_limit: 1200.0, status: 'Active', created_at: oneWeekAgo.toISOString() },
    { id: 4, rider_id: 4, start_date: format(oneWeekAgo), end_date: format(oneWeekLater), weekly_premium: 69.0, coverage_limit: 1500.0, status: 'Active', created_at: oneWeekAgo.toISOString() }
  ];

  // 3. Seed Disruption Events
  data.disruption_events = [
    { id: 1, type: 'Weather', city: 'Noida', zone: 'Sector 62', start_time: `${format(oneWeekAgo)} 14:00`, end_time: `${format(oneWeekAgo)} 18:00`, severity: 'Severe', description: 'Torrential rain causing severe waterlogging and flash floods in Sector 62. Water levels up to 2 feet.', processed: 1, created_at: oneWeekAgo.toISOString() },
    { id: 2, type: 'Outage', city: 'Mumbai', zone: 'Andheri West', start_time: `${format(oneWeekAgo)} 19:30`, end_time: `${format(oneWeekAgo)} 21:00`, severity: 'Severe', description: 'Swiggy driver app backend server crash. Delivery partners unable to accept orders for 1.5 hours.', processed: 1, created_at: oneWeekAgo.toISOString() },
    { id: 3, type: 'Curfew', city: 'Delhi', zone: 'Saket', start_time: `${format(oneWeekAgo)} 20:00`, end_time: `${format(oneWeekAgo)} 23:00`, severity: 'Moderate', description: 'Sudden localized shop closure and political protest curfew near Saket mall area.', processed: 1, created_at: oneWeekAgo.toISOString() }
  ];

  // 4. Seed Claims
  data.claims = [
    { id: 1, policy_id: 1, rider_id: 1, disruption_event_id: 1, amount: 200.0, status: 'Paid', reason: 'Automatic parametric trigger approved: Noida rain storm. GPS verified. Platform online status verified.', triggered_at: oneWeekAgo.toISOString(), processed_at: oneWeekAgo.toISOString() },
    { id: 2, policy_id: 2, rider_id: 2, disruption_event_id: 2, amount: 120.0, status: 'Paid', reason: 'Automatic parametric trigger approved: Swiggy app crash outage. Verified rider active status before outage.', triggered_at: oneWeekAgo.toISOString(), processed_at: oneWeekAgo.toISOString() },
    { id: 3, policy_id: 3, rider_id: 3, disruption_event_id: 1, amount: 200.0, status: 'Rejected', reason: 'Fraud Detection: GPS coordinates check failed. Rider location pings placed them in Noida Sector 18 during Sector 62 flash flood.', triggered_at: oneWeekAgo.toISOString(), processed_at: oneWeekAgo.toISOString() }
  ];

  // 5. Seed Location Pings
  data.location_pings = [
    { id: 1, rider_id: 1, latitude: 28.6285, longitude: 77.3654, active_status: 'Online', pinged_at: oneWeekAgo.toISOString() },
    { id: 2, rider_id: 2, latitude: 19.1134, longitude: 72.8698, active_status: 'Online', pinged_at: oneWeekAgo.toISOString() },
    { id: 3, rider_id: 3, latitude: 28.5702, longitude: 77.3261, active_status: 'Online', pinged_at: oneWeekAgo.toISOString() },
    { id: 4, rider_id: 4, latitude: 28.5241, longitude: 77.2065, active_status: 'Online', pinged_at: oneWeekAgo.toISOString() }
  ];

  // 6. Seed Orders
  seedMockOrders();

  saveToDbFile();
  console.log('JSON database seeded and written to', dbPath);
};

module.exports = {
  dbRun,
  dbAll,
  dbGet,
  initDb
};
