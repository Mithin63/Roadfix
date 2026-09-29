# 🚗 RoadRescue AI — AI-Powered Roadside Assistance & Mechanic Booking Platform

RoadRescue AI is a modern, responsive, full-stack web application designed to help motorists when their vehicle breaks down or gets damaged on the road.

Built with **React, TypeScript, Vite, Tailwind CSS, Leaflet Maps, Node.js, and Express**, RoadRescue AI provides an end-to-end emergency assistance platform with AI diagnostics, smart equipment recommendations, multi-factor mechanic matching, real-time live telemetry tracking, digital GST invoicing, and dedicated dashboards for Customers, Mechanics, and Administrators.

---

## 🌟 Key Features

### 1. Customer Experience
* **🆘 Emergency Callout**: Prominent hero banner with pulsing beacon and "Get Help Now" action.
* **⚡ Quick Services Grid**: 1-click direct reporting for Battery Dead, Flat Tyre, Fuel Starvation, Engine Fault, Electrical, Accident Damage, Key Lockout, and Other.
* **📍 6-Step Breakdown Reporting Wizard**:
  1. *Location Detection*: Automatic GPS detection + Leaflet interactive map with custom location pin.
  2. *Vehicle Selection*: Select existing car/bike/scooter or register a new vehicle (Bike, Scooter, Car, SUV, Auto, Van, Fuel type, Reg No).
  3. *Problem Reporting*: Symptoms selection, text description, simulated voice transcription, and photo/video upload.
  4. *AI Diagnostics Engine*: Possible causes, severity level (Low / Medium / High / Critical), recommended roadside service, **smart equipment checklist**, transparent cost estimate, and safe roadside checks.
  5. *Smart Mechanic Matching*: Multi-factor ranking by proximity, equipment possession, ratings, experience, and arrival ETA.
  6. *Booking Confirmation*: Instant generation of unique booking IDs (e.g. `RR-2026-00125`).
* **📡 Real-Time Live Tracking**:
  * 9-step progression (Requested → Accepted → Preparing Equipment → Travelling → Arrived → Diagnosis Started → Repair In Progress → Repair Completed → Payment Settled).
  * Interactive Leaflet map with simulated route polyline connecting mechanic to customer.
  * Live ETA, Call Mechanic, In-App Chat, and Share Trip link.
  * **On-Site Additional Charge Approvals**: Customer approves or rejects extra parts/labour before billing.
* **💳 Payment Gateway & Digital Tax Invoices**:
  * Supports UPI (dynamic QR code + VPA), Credit/Debit Card, Wallets, and Cash on site.
  * Printable statutory digital tax invoices with 18% GST and itemized parts/labour breakdown.
* **⭐ Multi-Criteria Ratings & Reviews**:
  * Overall service, Response time, Professionalism, Repair quality, and Pricing transparency ratings.
* **🤖 RoadRescue AI Vehicle Assistant**:
  * Interactive chatbot providing vehicle troubleshooting, safe checks, urgency level, and recommended specialist.
* **📸 Image-Based Damage Analysis**:
  * Computer vision simulation classifying damaged bumpers, deflated tyres, battery terminals, and engine bay components.
* **🚨 SOS & Safety Response**:
  * 1-click emergency broadcast to configured emergency contacts with exact GPS coordinates and direct verified helplines (112, 1033, 108).
* **🔐 Login & Registration Portal**:
  * Seamless sign in with email/password and password visibility toggle.
  * Role-based registration: register as a **Vehicle Owner** (with optional vehicle linking) or an **Independent Mechanic / Workshop**.
  * 1-Click Fast Demo Login cards for instant switching between Rohan, Priya, Rajesh, Vikram, and Operations Director.
* **👤 User Profile & Account Details Page**:
  * View and update personal information (Legal Name, Phone, Base Address, and Preset Avatars).
  * Role-specific tabs: Linked vehicles & emergency contacts for vehicle owners; workshop details, skills, verification documents, and billing rates for mechanics; permissions overview for administrators.
  * Account actions: Switch Account, Sign Out with confirmation.

### 2. Mechanic Portal
* **Availability Switch**: Online / Offline toggle with GPS telemetry.
* **Emergency Dispatch Queue**: Incoming request cards showing Customer details, Vehicle, Problem, Distance, ETA, AI Diagnosis, and Pre-dispatched Equipment checklist.
* **Active Job Screen**:
  * Turn-by-turn navigation link to customer GPS coordinates.
  * Job status controller: *Arrived on Site* → *Diagnosis Started* → *Repair Started* → *Repair Completed*.
  * Diagnostic findings and technical work performed log.
  * Spare parts addition (name, quantity, unit price).
  * Labour charge and additional charge requests requiring customer approval.
  * Earnings counter (Today's earnings, Lifetime revenue, Total repairs, Rating).

---

### 3. Admin Control Center
* **Executive Analytics**: Total Customers, Total Mechanics, Active Incidents, Completed Repairs, Total Revenue, Average Platform Rating.
* **Data Trends**: Daily booking and revenue charts, breakdown problem category distribution.
* **Mechanic Verification**: Review uploaded identity proof and driving license to approve or revoke the **Verified Pro** badge.
* **Account Controls**: Manage registered users with 1-click account suspension/unblock.
* **Live Incident Monitor**: Real-time status table of active roadside calls.
* **Dispute & Complaints Management**: Review and resolve customer complaints.
* **Tariff Catalog**: Adjust baseline callout fees and labour estimates for each breakdown type.

---

### 4. In-App Communication
* Real-time customer-to-mechanic chat drawer with system status notifications and quick-reply snippets.

---

## 👥 Demo Accounts & 1-Click Role Switcher

A **1-Click Role Switcher** is built into the top right navigation bar. Click your profile avatar to switch between demo accounts instantly:

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Customer** | Rohan Sharma | `rohan@roadrescue.ai` | `demo123` | Hyundai Creta & Royal Enfield Hunter in Mumbai |
| **Customer** | Priya Deshmukh | `priya@roadrescue.ai` | `demo123` | Tata Nexon EV & Ather 450X |
| **Mechanic** | Rajesh Solanki | `rajesh@roadrescue.ai` | `demo123` | Solanki Auto Works, 11y exp, 4.9★, Verified Pro |
| **Mechanic** | Vikram Jadhav | `vikram@roadrescue.ai` | `demo123` | Jadhav Super Garage, 8y exp, 4.8★, Verified Pro |
| **Admin** | Operations Director | `admin@roadrescue.ai` | `demo123` | System Administrator & Compliance Controller |

---

## 🚀 How to Run Locally

### Prerequisites
* **Node.js** (v18+ recommended)
* **npm** (v9+)

### Installation & Starting Dev Servers

1. **Start the Backend Server (Express + TypeScript)**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
   *Backend runs on: `http://localhost:5000/api`*

2. **Start the Frontend Client (React + Vite + Tailwind CSS)**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *Frontend runs on: `http://localhost:5173`*

3. **Or run both simultaneously from the root directory**:
   ```bash
   npm run dev
   ```

---

## 🏗️ Architecture & Project Structure

```
mech_help/
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, BottomNav, MapLeaflet
│   │   │   ├── customer/       # Dashboard, BreakdownModal, Tracking, Payment, Reviews, SOS, Maintenance
│   │   │   ├── mechanic/       # MechanicDashboard, MechanicJobScreen
│   │   │   ├── admin/          # AdminDashboard (Charts, Verification, User Management)
│   │   │   └── chat/           # ChatDrawer
│   │   ├── context/            # AuthContext (Role Switcher, GPS Location, Notifications)
│   │   ├── services/           # API Client
│   │   ├── types/              # TypeScript Types
│   │   ├── App.tsx             # Main App Shell
│   │   ├── index.css           # Tailwind + Automotive Styling
│   │   └── main.tsx            # React Entry Point
│   ├── tailwind.config.js      # Automotive Theme Configuration
│   └── vite.config.ts          # Vite Proxy Configuration
│
└── server/                     # Backend API (Node.js + Express + TypeScript)
    ├── src/
    │   ├── data/seeds.ts       # 10 Customers, 10 Mechanics, 15 Vehicles, 20 Bookings, Reviews, Tariffs
    │   ├── routes/             # Auth, Vehicles, Mechanics, Bookings, AI, Payments, SOS, Admin, Chat
    │   ├── services/           # In-Memory DB, AI Diagnostics, Matching Algorithm, Pricing
    │   ├── types/              # Relational Model Types
    │   └── server.ts           # Express Application Entry Point
    └── tsconfig.json
```

---

## 🔒 Security & Best Practices
* **Environment Variables**: API keys and secrets decoupled from client code.
* **Role-Based Access Control**: Strict customer / mechanic / admin partition.
* **Mock Fail-safe Layer**: Robust offline and simulated fallbacks for payments, speech recognition, and image classification.
* **Safety First**: AI assistant explicitly warns against dangerous roadside actions and directs severe failures to professional mechanics or emergency helplines.
