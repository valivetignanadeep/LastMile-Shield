const express = require('express');
const cors = require('cors');
const { initDb, dbRun, dbAll, dbGet } = require('./database');
const { calculateWeeklyPremium, runFraudDetection, ZONE_CENTROIDS } = require('./ai-engine');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database on startup
initDb().then(() => {
  console.log('Database tables verified/initialized.');
}).catch(err => {
  console.error('Error during database initialization:', err);
});

// API Routes

// 1. Get all riders
app.get('/api/riders', async (req, res) => {
  try {
    const riders = await dbAll('SELECT * FROM riders ORDER BY joined_at DESC');
    res.json(riders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Onboard a new rider
app.post('/api/riders', async (req, res) => {
  const { name, phone, platform, vehicleType, city, zone, preferredLanguage, upiId } = req.body;
  if (!name || !phone || !platform || !vehicleType || !city || !zone || !upiId) {
    return res.status(400).json({ error: 'Please provide all required registration details.' });
  }

  try {
    // Basic formatting
    const rating = 4.8; // Initial starting rating
    const result = await dbRun(
      `INSERT INTO riders (name, phone, platform, vehicle_type, city, zone, preferred_language, rating, wallet_balance, upi_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0.0, ?)`,
      [name, phone, platform, vehicleType, city, zone, preferredLanguage || 'en', rating, upiId]
    );
    const newRider = await dbGet('SELECT * FROM riders WHERE id = ?', [result.id]);
    res.status(201).json(newRider);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Phone number already registered on LastMile Shield.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// 3. Get single rider details (including active policy, pings, and claim history)
app.get('/api/riders/:id', async (req, res) => {
  try {
    const rider = await dbGet('SELECT * FROM riders WHERE id = ?', [req.params.id]);
    if (!rider) {
      return res.status(404).json({ error: 'Rider partner not found.' });
    }

    const policy = await dbGet(
      'SELECT * FROM policies WHERE rider_id = ? AND status = "Active" LIMIT 1',
      [rider.id]
    );

    const claims = await dbAll(
      `SELECT c.*, de.type as event_type, de.description as event_desc, de.severity as event_severity
       FROM claims c 
       JOIN disruption_events de ON c.disruption_event_id = de.id 
       WHERE c.rider_id = ? 
       ORDER BY c.triggered_at DESC`,
      [rider.id]
    );

    const latestPing = await dbGet(
      'SELECT * FROM location_pings WHERE rider_id = ? ORDER BY pinged_at DESC LIMIT 1',
      [rider.id]
    );

    res.json({
      rider,
      activePolicy: policy || null,
      claims,
      latestPing: latestPing || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Update rider GPS ping (simulate device telemetry)
app.post('/api/riders/:id/pings', async (req, res) => {
  const { latitude, longitude, activeStatus } = req.body;
  if (!latitude || !longitude || !activeStatus) {
    return res.status(400).json({ error: 'Incomplete coordinate telemetry.' });
  }

  try {
    await dbRun(
      'INSERT INTO location_pings (rider_id, latitude, longitude, active_status) VALUES (?, ?, ?, ?)',
      [req.params.id, latitude, longitude, activeStatus]
    );
    res.json({ message: 'GPS ping updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get premium estimation
app.post('/api/pricing-estimate', (req, res) => {
  const { city, zone, vehicleType, rating } = req.body;
  if (!city || !zone || !vehicleType) {
    return res.status(400).json({ error: 'Profile parameters missing.' });
  }
  
  try {
    const estimate = calculateWeeklyPremium({
      city,
      zone,
      vehicleType,
      rating: parseFloat(rating) || 4.8
    });
    res.json(estimate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Buy a weekly policy (Subscription purchase)
app.post('/api/policies', async (req, res) => {
  const { riderId, premium, coverageLimit } = req.body;
  if (!riderId || !premium || !coverageLimit) {
    return res.status(400).json({ error: 'Policy setup parameters missing.' });
  }

  try {
    // Check if rider already has an active policy
    const existing = await dbGet('SELECT id FROM policies WHERE rider_id = ? AND status = "Active"', [riderId]);
    if (existing) {
      return res.status(400).json({ error: 'Rider already has an active weekly coverage policy.' });
    }

    const today = new Date();
    const format = (d) => d.toISOString().split('T')[0];
    const oneWeekLater = new Date();
    oneWeekLater.setDate(today.getDate() + 7);

    const result = await dbRun(
      `INSERT INTO policies (rider_id, start_date, end_date, weekly_premium, coverage_limit, status)
       VALUES (?, '${format(today)}', '${format(oneWeekLater)}', ?, ?, 'Active')`,
      [riderId, premium, coverageLimit]
    );

    res.status(201).json({
      id: result.id,
      riderId,
      startDate: format(today),
      endDate: format(oneWeekLater),
      weeklyPremium: premium,
      coverageLimit,
      status: 'Active'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Get claims list
app.get('/api/claims', async (req, res) => {
  try {
    const claims = await dbAll(`
      SELECT c.*, r.name as rider_name, r.phone as rider_phone, r.platform, de.type as event_type, de.description as event_desc 
      FROM claims c
      JOIN riders r ON c.rider_id = r.id
      JOIN disruption_events de ON c.disruption_event_id = de.id
      ORDER BY c.triggered_at DESC
    `);
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Trigger a parametric disruption event (Simulation Tool & Automated Claims Process)
app.post('/api/disruptions', async (req, res) => {
  const { type, city, zone, severity, description } = req.body;
  if (!type || !city || !zone || !severity || !description) {
    return res.status(400).json({ error: 'Missing disruption properties.' });
  }

  try {
    const today = new Date();
    const formatTime = (d) => d.toISOString().slice(0, 19).replace('T', ' ');
    const startTimeStr = formatTime(today);
    
    // Disruption runs for 4 hours
    const fourHoursLater = new Date(today.getTime() + 4 * 60 * 60 * 1000);
    const endTimeStr = formatTime(fourHoursLater);

    // Save event
    const eventResult = await dbRun(
      `INSERT INTO disruption_events (type, city, zone, start_time, end_time, severity, description, processed)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [type, city, zone, startTimeStr, endTimeStr, severity, description]
    );
    const eventId = eventResult.id;
    const disruptionEvent = { id: eventId, type, city, zone, start_time: startTimeStr, end_time: endTimeStr, severity, description };

    // PARAMETRIC AUTOMATION: Find all riders in this city/zone with active policies
    const policies = await dbAll(
      `SELECT p.*, r.id as rider_id, r.name, r.phone, r.city, r.zone, r.platform, r.wallet_balance
       FROM policies p
       JOIN riders r ON p.rider_id = r.id
       WHERE r.city = ? AND p.status = 'Active'`,
      [city]
    );

    const outcomes = [];

    // Evaluate payouts for each active policy holder
    for (const policy of policies) {
      const rider = { id: policy.rider_id, name: policy.name, phone: policy.phone, city: policy.city, zone: policy.zone };
      
      // Calculate loss of income payout amount based on severity and event type
      let payoutAmount = 150.0; // standard hourly loss base
      if (severity === 'Extreme') payoutAmount = 250.0;
      else if (severity === 'Severe') payoutAmount = 200.0;
      else payoutAmount = 120.0;

      // Cap payout at coverage limit
      payoutAmount = Math.min(payoutAmount, policy.coverage_limit);

      // Run Fraud Check
      const fraudCheck = await runFraudDetection(dbGet, dbAll, {}, rider, disruptionEvent);

      let claimStatus = 'Rejected';
      let claimReason = fraudCheck.flags.join(' | ');

      if (fraudCheck.isApproved) {
        claimStatus = 'Paid';
        claimReason = `Automatic parametric trigger approved: ${type} disruption in ${zone}. GPS verified. Platform online status verified.`;
        
        // Credit the rider's wallet
        const newBalance = policy.wallet_balance + payoutAmount;
        await dbRun('UPDATE riders SET wallet_balance = ? WHERE id = ?', [newBalance, rider.id]);
      }

      // Record Claim
      await dbRun(
        `INSERT INTO claims (policy_id, rider_id, disruption_event_id, amount, status, reason, triggered_at, processed_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [policy.id, rider.id, eventId, payoutAmount, claimStatus, claimReason]
      );

      outcomes.push({
        riderName: rider.name,
        platform: policy.platform,
        amount: payoutAmount,
        status: claimStatus,
        reason: claimReason,
        riskScore: fraudCheck.riskScore
      });
    }

    res.status(201).json({
      message: `Parametric event created. Processed ${policies.length} claims automatically.`,
      event: disruptionEvent,
      claimsProcessed: outcomes
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Wallet Withdrawal
app.post('/api/wallet/withdraw', async (req, res) => {
  const { riderId, amount } = req.body;
  if (!riderId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid withdrawal payload.' });
  }

  try {
    const rider = await dbGet('SELECT wallet_balance, upi_id FROM riders WHERE id = ?', [riderId]);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found.' });
    }

    if (rider.wallet_balance < amount) {
      return res.status(400).json({ error: 'Insufficient wallet balance.' });
    }

    const newBalance = rider.wallet_balance - amount;
    await dbRun('UPDATE riders SET wallet_balance = ? WHERE id = ?', [newBalance, riderId]);

    res.json({
      message: `Instant cashout successful! ₹${amount} has been wired to UPI ID: ${rider.upi_id}.`,
      newBalance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Dashboard Aggregate Statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const activePoliciesCount = await dbGet('SELECT COUNT(*) as count FROM policies WHERE status = "Active"');
    const totalRidersCount = await dbGet('SELECT COUNT(*) as count FROM riders');
    
    // Total premiums collected
    const totalPremiums = await dbGet('SELECT SUM(weekly_premium) as sum FROM policies');
    
    // Total payouts disbursed
    const totalPayouts = await dbGet('SELECT SUM(amount) as sum FROM claims WHERE status = "Paid"');
    
    // Claim status counts
    const claimCounts = await dbAll('SELECT status, COUNT(*) as count FROM claims GROUP BY status');

    // Recent anomalies/fraud flags
    const recentAnomalies = await dbAll(`
      SELECT c.*, r.name as rider_name, de.type as event_type, de.zone as event_zone 
      FROM claims c
      JOIN riders r ON c.rider_id = r.id
      JOIN disruption_events de ON c.disruption_event_id = de.id
      WHERE c.status = "Rejected"
      ORDER BY c.triggered_at DESC
      LIMIT 5
    `);

    const claimsStats = { Paid: 0, Rejected: 0, Initiated: 0 };
    claimCounts.forEach(c => {
      if (claimsStats[c.status] !== undefined) {
        claimsStats[c.status] = c.count;
      }
    });

    const collectedVal = totalPremiums.sum || 0;
    const paidVal = totalPayouts.sum || 0;
    const lossRatio = collectedVal > 0 ? ((paidVal / collectedVal) * 100).toFixed(1) : 0;

    res.json({
      activePolicies: activePoliciesCount.count,
      totalRiders: totalRidersCount.count,
      totalPremiumsCollected: parseFloat(collectedVal.toFixed(2)),
      totalPayoutsDisbursed: parseFloat(paidVal.toFixed(2)),
      lossRatioPercent: parseFloat(lossRatio),
      claimsStats,
      recentAnomalies
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const path = require('path');
// Serve static assets from frontend build folder
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle client-side routing, return index.html for all other routes
app.get('*', (req, res) => {
  if (!req.url.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`LastMile Shield API server running on port ${PORT}`);
});
