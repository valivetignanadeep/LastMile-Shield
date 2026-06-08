# LastMile Shield

**LastMile Shield** is an AI-powered, parametric wage insurance platform designed exclusively for platform-based Delivery Partners (such as Zomato, Swiggy, Zepto, and Blinkit). Our mission is to safeguard the livelihoods of gig workers from immediate loss of daily wages due to uncontrollable external disruptions.

---

## 🎯 The Core Persona & Focus
* **Persona Segment**: Food & Grocery Delivery Partners (Swiggy, Zomato, Zepto, Blinkit).
* **Coverage Scope**: **LOSS OF INCOME ONLY**. This safety net covers lost hours/wages due to external disruptions. It strictly excludes vehicle repairs, medical bills, or accident insurance.
* **Pricing Cycle**: Structured entirely on a **Weekly premium basis** to align with the weekly payout cycles of gig workers.

---

## ⚡ Core Disruptions Insured
1. **Environmental Weather Event**: Torrential rains, flash waterlogging, and severe heatwaves (>= 42°C) that halt outdoor delivery work.
2. **Platform App Outage**: Gig platform backend crashes (e.g., driver app server outages) preventing shifts from starting.
3. **Social Disruption**: Unplanned curfews, strikes, protests, and sudden zone closures barring delivery access.

---

## 🧠 Smart AI & Automation Features
* **AI Premium Underwriting**: Dynamic weekly premiums calculated based on rider rating, vehicle type (incentivizing bicycles/electric scooters), zone risk (historical flood maps), and upcoming weather forecasts.
* **AI Proximity Geofence Fraud Check**: Measures real-time GPS coordinates against event boundaries (Haversine formula within a 3.5 km geofence) to verify the rider's physical presence.
* **Platform Active Check**: Validates online app telemetry pings during disruptions.
* **Inclusive Accessibility**: Simple language toggles (Hindi/English) and voice narration read-aloud support via native Web Speech Synthesis.
* **Instant Wallet Cashout**: Mock wallet funds transferred instantly via UPI credentials.

---

## 💻 Tech Stack
* **Frontend**: React (Vite), styled with clean Vanilla CSS (empathetic warm theme).
* **Backend**: Node.js & Express API server.
* **Database**: Lightweight JSON file-based database mimicking SQLite, ensuring 100% Windows deployment portability with zero C++ compilation dependencies.

---

## 🚀 Deployment (Render.com ready)
LastMile Shield is configured as a single-process service (Express serving built React client assets on a single port):

### 1. Build Command
```bash
npm run build
```

### 2. Start Command
```bash
npm run start
```

### 3. Local Development
To run HMR frontend (`localhost:5173`) and API backend (`localhost:5000`) concurrently:
```bash
npm run dev
```
