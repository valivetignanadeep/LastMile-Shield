require('dotenv').config();
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

// Helper function to send SMS using Twilio (if keys exist) or log to console
const nodemailer = require('nodemailer');

// Helper function to send Email using Nodemailer/Web3Forms or log to console
const sendEmail = async (to, subject, message) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const web3formsKey = process.env.WEB3FORMS_KEY;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465');
  const secure = smtpPort === 465;

  // Option 1: Use Web3Forms (zero password email API, highly recommended!)
  if (web3formsKey && web3formsKey !== 'your_web3forms_access_key') {
    try {
      console.log(`[EMAIL SYSTEM] Sending email to ${to} via Web3Forms API...`);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: web3formsKey,
          subject: subject,
          message: message,
          from_name: "LastMile Shield"
        })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        console.log(`[EMAIL SYSTEM] Web3Forms email sent successfully to ${to}!`);
        return true;
      } else {
        console.error(`[EMAIL SYSTEM] Web3Forms API error: ${resData.message}`);
      }
    } catch (err) {
      console.error(`[EMAIL SYSTEM] Failed to send email via Web3Forms:`, err.message);
    }
  }

  // Option 2: Use SMTP if configured with credentials
  if (emailUser && emailPass && emailUser !== 'your_gmail_username@gmail.com') {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: secure,
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });

      const formattedMessage = message.replace(/\n/g, '<br/>');
      const isOtpMail = subject.toLowerCase().includes('code') || subject.toLowerCase().includes('verification');
      let htmlBody = '';
      
      if (isOtpMail) {
        // Try to match a 4-digit code (either normal or bold unicode characters)
        const otpMatch = message.match(/\b\d{4}\b/);
        const otpVal = otpMatch ? otpMatch[0] : '';
        const styledOtp = otpVal ? `<span style="font-size: 32px; font-weight: 800; color: #1565c0; background-color: #e3f2fd; padding: 8px 16px; border-radius: 8px; display: inline-block; border: 1.5px dashed #1565c0; letter-spacing: 2px;">${otpVal}</span>` : '';
        
        htmlBody = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="color: #1565c0; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">LastMile Shield</h2>
              <p style="font-size: 13px; color: #64748b; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Security Verification</p>
            </div>
            <div style="padding: 20px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
              <p style="font-size: 16px; margin: 0 0 16px 0; font-weight: 500;">Hello,</p>
              <p style="font-size: 15px; color: #475569; margin: 0 0 20px 0; line-height: 1.5;">Your verification code is:</p>
              <div style="text-align: center; margin: 25px 0;">
                ${styledOtp}
              </div>
              <p style="font-size: 14px; color: #ef4444; margin: 20px 0 0 0; font-weight: 600; text-align: center;">Valid for 5 minutes.</p>
            </div>
            <div style="text-align: center; margin-top: 25px; font-size: 11px; color: #94a3b8; line-height: 1.4;">
              This is an automated verification code. Please do not reply or share this code with anyone.
            </div>
          </div>
        `;
      } else {
        htmlBody = `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
            <h2>LastMile Shield</h2>
            <p>${formattedMessage}</p>
            <br/>
            <hr/>
            <p style="font-size: 0.8rem; color: #777;">This is an automated message. Please do not reply.</p>
          </div>
        `;
      }

      const info = await transporter.sendMail({
        from: `"LastMile Shield" <${emailUser}>`,
        to,
        subject,
        text: message,
        html: htmlBody
      });

      console.log(`[EMAIL SYSTEM] Real SMTP Email sent to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error(`[EMAIL SYSTEM] Error sending Email via SMTP:`, err);
    }
  }

  // Fallback: Send a zero-config real email using FormSubmit.co (no passwords needed)
  console.log(`\n==================================================`);
  console.log(`[EMAIL SIMULATION] To: ${to}`);
  console.log(`[EMAIL SIMULATION] Subject: ${subject}`);
  console.log(`[EMAIL SIMULATION] Message: ${message}`);
  console.log(`==================================================\n`);

  try {
    console.log(`[EMAIL SYSTEM] Attempting zero-config email delivery to ${to} via FormSubmit.co...`);
    console.log(`[EMAIL SYSTEM] Note: First-time users for ${to} must check their inbox and click 'Activate' from FormSubmit to enable email deliveries.`);
    
    const response = await fetch(`https://formsubmit.co/ajax/${to}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: subject,
        message: message,
        _honey: ""
      })
    });
    
    const resData = await response.json();
    if (response.ok) {
      console.log(`[EMAIL SYSTEM] Zero-config email request successful for ${to} via FormSubmit.co!`);
      return true;
    } else {
      console.error(`[EMAIL SYSTEM] FormSubmit.co delivery failed: ${resData.message}`);
      return false;
    }
  } catch (err) {
    console.error(`[EMAIL SYSTEM] Failed to send email via FormSubmit.co:`, err.message);
    return false;
  }
};

// Authentication Caches
const otpCache = {};
const aadharCache = {};

// API Routes

// Auth 1: Send OTP to Email Address
app.post('/api/auth/send-otp', async (req, res) => {
  const { email, name, purpose } = req.body;
  if (!email || !purpose) {
    return res.status(400).json({ error: 'Email address and purpose are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  try {
    const rider = await dbGet('SELECT * FROM riders WHERE email = ?', [email]);

    if (purpose === 'login') {
      if (!name) {
        return res.status(400).json({ error: 'Name/Username is required for login.' });
      }
      if (!/^[a-zA-Z\s]+$/.test(name)) {
        return res.status(400).json({ error: 'Name must strictly contain only letters.' });
      }
      if (!rider) {
        return res.status(404).json({ error: 'Email address not registered. Please register first.' });
      }
      
      // Strict letter-only name matching (case insensitive, ignoring spacing symbols)
      const cleanRiderName = rider.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
      const cleanInputName = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (cleanRiderName !== cleanInputName) {
        return res.status(400).json({ error: 'Username does not match the registered name for this email address.' });
      }
    } else if (purpose === 'register') {
      if (rider) {
        return res.status(400).json({ error: 'Email is already registered. Please login.' });
      }
    }

    // Generate random 4-digit OTP
    const otp = (1000 + Math.floor(Math.random() * 9000)).toString();
    otpCache[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    console.log(`[EMAIL SYSTEM] OTP generated for ${email}: ${otp}`);
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const smtpConfigured = !!(emailUser && emailPass && emailUser !== 'your_gmail_username@gmail.com');

    const makeBoldDigits = (numStr) => {
      const boldDigits = {
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰',
        '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
      };
      return numStr ? numStr.toString().split('').map(char => boldDigits[char] || char).join('') : '';
    };
    const boldOtp = makeBoldDigits(otp);
    const msg = `Hello,\n\nYour LastMile Shield verification code is:\n\n✨ [ ${boldOtp} ] ✨\n\nValid for 5 minutes.`;

    await sendEmail(email, 'LastMile Shield Verification Code', msg);
    res.json({ 
      message: 'OTP sent to your email.',
      otp: otp,
      web3formsKey: (process.env.WEB3FORMS_KEY && process.env.WEB3FORMS_KEY !== 'your_web3forms_access_key') ? process.env.WEB3FORMS_KEY : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth 2: Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp, purpose } = req.body;
  if (!email || !otp || !purpose) {
    return res.status(400).json({ error: 'Email, OTP, and purpose are required.' });
  }

  const cached = otpCache[email];
  if (!cached || Date.now() > cached.expires) {
    return res.status(400).json({ error: 'OTP has expired or was not requested. Please try again.' });
  }

  if (cached.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP. Please check the code and try again.' });
  }

  delete otpCache[email];

  try {
    if (purpose === 'login') {
      const rider = await dbGet('SELECT * FROM riders WHERE email = ?', [email]);
      const policy = await dbGet('SELECT * FROM policies WHERE rider_id = ? AND status = "Active" LIMIT 1', [rider.id]);
      const claims = await dbAll(
        `SELECT c.*, de.type as event_type, de.description as event_desc, de.severity as event_severity
         FROM claims c 
         JOIN disruption_events de ON c.disruption_event_id = de.id 
         WHERE c.rider_id = ? 
         ORDER BY c.triggered_at DESC`,
        [rider.id]
      );
      const latestPing = await dbGet('SELECT * FROM location_pings WHERE rider_id = ? ORDER BY pinged_at DESC LIMIT 1', [rider.id]);

      res.json({
        message: 'Login successful!',
        rider,
        activePolicy: policy || null,
        claims,
        latestPing: latestPing || null
      });
    } else {
      res.json({ message: 'Email address verified successfully.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth 3: Send Aadhaar OTP
app.post('/api/auth/aadhar-send-otp', async (req, res) => {
  const { aadharNumber, email } = req.body;
  if (!aadharNumber) {
    return res.status(400).json({ error: 'Aadhar number is required.' });
  }

  if (!/^\d{12}$/.test(aadharNumber)) {
    return res.status(400).json({ error: 'Aadhar number must be strictly 12 digits.' });
  }

  try {
    const existing = await dbGet('SELECT id FROM riders WHERE aadhar_number = ?', [aadharNumber]);
    if (existing) {
      return res.status(400).json({ error: 'This Aadhar number is already linked to a registered rider.' });
    }

    const otp = (1000 + Math.floor(Math.random() * 9000)).toString();
    aadharCache[aadharNumber] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    console.log(`[AADHAAR SYSTEM] OTP generated for Aadhar ${aadharNumber}: ${otp}`);
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const smtpConfigured = !!(emailUser && emailPass && emailUser !== 'your_gmail_username@gmail.com');

    if (email) {
      const makeBoldDigits = (numStr) => {
        const boldDigits = {
          '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰',
          '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
        };
        return numStr ? numStr.toString().split('').map(char => boldDigits[char] || char).join('') : '';
      };
      const boldOtp = makeBoldDigits(otp);
      const msg = `Hello,\n\nYour Aadhaar verification code is:\n\n✨ [ ${boldOtp} ] ✨\n\nValid for 5 minutes.`;
      await sendEmail(email, 'Aadhaar Verification Code', msg);
    }
    res.json({ 
      message: 'OTP sent to your email.',
      otp: otp,
      web3formsKey: (process.env.WEB3FORMS_KEY && process.env.WEB3FORMS_KEY !== 'your_web3forms_access_key') ? process.env.WEB3FORMS_KEY : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth 4: Verify Aadhaar OTP
app.post('/api/auth/aadhar-verify-otp', async (req, res) => {
  const { aadharNumber, otp } = req.body;
  if (!aadharNumber || !otp) {
    return res.status(400).json({ error: 'Aadhar number and OTP are required.' });
  }

  const cached = aadharCache[aadharNumber];
  if (!cached || Date.now() > cached.expires) {
    return res.status(400).json({ error: 'OTP has expired or was not requested. Please try again.' });
  }

  if (cached.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP. Please check the code and try again.' });
  }

  delete aadharCache[aadharNumber];
  res.json({ message: 'Aadhar successfully verified.' });
});

// Auth 5: Register New Rider (Aadhaar & Address verified)
app.post('/api/riders/register', async (req, res) => {
  const { name, email, platform, vehicleType, city, zone, preferredLanguage, upiId, aadharNumber, address } = req.body;
  
  if (!name || !email || !platform || !vehicleType || !city || !zone || !upiId || !aadharNumber || !address) {
    return res.status(400).json({ error: 'Please provide all details (including Aadhar and Address).' });
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return res.status(400).json({ error: 'Name must strictly contain only letters.' });
  }

  try {
    const emailExists = await dbGet('SELECT id FROM riders WHERE email = ?', [email]);
    if (emailExists) {
      return res.status(400).json({ error: 'Email address is already registered.' });
    }

    const aadharExists = await dbGet('SELECT id FROM riders WHERE aadhar_number = ?', [aadharNumber]);
    if (aadharExists) {
      return res.status(400).json({ error: 'This Aadhar number is already linked to a registered rider.' });
    }

    const rating = 4.8; // Initial starting rating
    const result = await dbRun(
      `INSERT INTO riders (name, email, platform, vehicle_type, city, zone, preferred_language, rating, wallet_balance, upi_id, aadhar_number, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0.0, ?, ?, ?)`,
      [name, email, platform, vehicleType, city, zone, preferredLanguage || 'en', rating, upiId, aadharNumber, address]
    );

    const rider = await dbGet('SELECT * FROM riders WHERE id = ?', [result.id]);
    res.status(201).json({
      message: 'Registration successful! Welcome to LastMile Shield.',
      rider,
      activePolicy: null,
      claims: [],
      latestPing: null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1. Get all riders
app.get('/api/riders', async (req, res) => {
  try {
    const riders = await dbAll('SELECT * FROM riders ORDER BY joined_at DESC');
    res.json(riders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Onboard a new rider (Legacy endpoint, updated to support Aadhaar & Address)
app.post('/api/riders', async (req, res) => {
  const { name, email, platform, vehicleType, city, zone, preferredLanguage, upiId } = req.body;
  if (!name || !email || !platform || !vehicleType || !city || !zone || !upiId) {
    return res.status(400).json({ error: 'Please provide all required registration details.' });
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return res.status(400).json({ error: 'Name must strictly contain only letters.' });
  }

  try {
    const rating = 4.8;
    const aadharNumber = req.body.aadharNumber || null;
    const address = req.body.address || null;
    const result = await dbRun(
      `INSERT INTO riders (name, email, platform, vehicle_type, city, zone, preferred_language, rating, wallet_balance, upi_id, aadhar_number, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0.0, ?, ?, ?)`,
      [name, email, platform, vehicleType, city, zone, preferredLanguage || 'en', rating, upiId, aadharNumber, address]
    );
    const newRider = await dbGet('SELECT * FROM riders WHERE id = ?', [result.id]);
    res.status(201).json(newRider);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Email already registered on LastMile Shield.' });
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

// Get orders list for a rider
app.get('/api/riders/:id/orders', async (req, res) => {
  try {
    const orders = await dbAll('SELECT * FROM orders WHERE rider_id = ? ORDER BY delivered_at DESC', [req.params.id]);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Claim compensation for a specific disrupted order
app.post('/api/orders/:id/claim', async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (order.claim_status === 'Claimed') {
      return res.status(400).json({ error: 'This order disruption compensation has already been claimed.' });
    }
    if (order.disruption_compensation <= 0) {
      return res.status(400).json({ error: 'This order has no disruption compensation to claim.' });
    }

    const rider = await dbGet('SELECT * FROM riders WHERE id = ?', [order.rider_id]);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found.' });
    }

    // Update order status
    await dbRun('UPDATE orders SET claim_status = ? WHERE id = ?', ['Claimed', orderId]);

    // Update rider wallet balance
    const newBalance = rider.wallet_balance + order.disruption_compensation;
    await dbRun('UPDATE riders SET wallet_balance = ? WHERE id = ?', [newBalance, rider.id]);

    // Link/Create a disruption event for claims listing
    const policy = await dbGet('SELECT * FROM policies WHERE rider_id = ? AND status = "Active" LIMIT 1', [rider.id]);
    const policyId = policy ? policy.id : null;

    // Check if there is a matching disruption event in the database, if not fallback to 1
    const events = await dbAll('SELECT * FROM disruption_events');
    const matchingEvent = events.find(e => e.type === order.disruption_type && e.city === rider.city && e.zone === rider.zone);
    const eventId = matchingEvent ? matchingEvent.id : 1;

    await dbRun(
      `INSERT INTO claims (policy_id, rider_id, disruption_event_id, amount, status, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        policyId,
        rider.id,
        eventId,
        order.disruption_compensation,
        'Paid',
        `Rider claimed compensation of ₹${order.disruption_compensation} for Order ${order.order_number} delivered during ${order.disruption_type} disruption (${order.disruption_severity}).`
      ]
    );

    res.json({
      message: 'Claim processed successfully!',
      newBalance: newBalance,
      claimAmount: order.disruption_compensation
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
      SELECT c.*, r.name as rider_name, r.email as rider_email, r.platform, de.type as event_type, de.description as event_desc 
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
      `SELECT p.*, r.id as rider_id, r.name, r.email, r.city, r.zone, r.platform, r.wallet_balance
       FROM policies p
       JOIN riders r ON p.rider_id = r.id
       WHERE r.city = ? AND p.status = 'Active'`,
      [city]
    );

    const outcomes = [];

    // Evaluate payouts for each active policy holder
    for (const policy of policies) {
      const rider = { id: policy.rider_id, name: policy.name, email: policy.email, city: policy.city, zone: policy.zone };
      
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
app.use(express.static(path.join(__dirname, '../frontend/dist'), {
  etag: false,
  maxAge: 0,
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Handle client-side routing, return index.html for all other routes
app.get('*', (req, res) => {
  if (!req.url.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`LastMile Shield API server running on port ${PORT}`);
  });
}

module.exports = app;
