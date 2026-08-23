# QuickKart – Hyperlocal Product Discovery & Shop-Customer Connectivity Platform

> **"Find Nearby. Compare Prices. Buy Quickly."**  
> B.Tech Project Exhibition – I, Department of Computer Science & Engineering (2026)

---

## 🌟 Executive Summary

**QuickKart** bridges the gap between customers who need a product urgently and nearby brick-and-mortar neighborhood stores that already have it in stock. Unlike conventional delivery-based e-commerce marketplaces (Amazon, Flipkart) that bypass local businesses and induce delivery delays, QuickKart puts **discovery, transparent price comparison, and shop-customer connectivity** at the center of the experience.

---

## 🚀 Key Architectural Modules

1. **Hyperlocal Geospatial Engine (`2dsphere` / GeoJSON)**:
   - Dynamic location detection via browser GPS or Indian locality presets (Karol Bagh, Connaught Place, Lajpat Nagar, Noida, Cyber Hub, Bandra, Indiranagar).
   - Adjustable radius filtering (1km, 3km, 5km, 10km, 25km).
   - Interactive OpenStreetMap/Leaflet map with interactive shop pins, distance indicators, and route directions.

2. **1-to-Many Broadcast Request & Price Comparison Engine (Chapter 10.3 / Fig 10.2)**:
   - Customers broadcast a single structured request (*Product, Quantity, Unit, Expected Budget, Urgency, Notes*).
   - Nearby shopkeepers receive real-time alerts and submit quotes (*In Stock / Alternative Offer / Out of Stock + Price + Preparation ETA*).
   - System renders a side-by-side comparison screen automatically computing and highlighting the **"BEST VALUE"** offer.

3. **In-Store Reservation State Machine (Chapter 5.4 / Fig 5.4)**:
   - Holds product exclusively for 30 to 120 minutes with unique reservation code (`QK-XXXX`).
   - Strict lifecycle transitions: `PENDING` ➔ `CONFIRMED` ➔ `READY` ➔ `COMPLETED` / `CANCELLED` / `EXPIRED`.
   - Automated background worker to auto-expire unclaimed holds.

4. **Live Business Capability Model (Chapter 16.4 / Fig 16.4)**:
   - Replaces static listings with a live operational state: *Currently serving count, estimated counter queue wait time, prompt response rate %, and open/closed storefront status*.

5. **Contextual Real-Time Messaging (Socket.IO)**:
   - Protected real-time chat between customer and shopkeeper with typing indicators, read receipts, and product inquiry ribbons.

6. **Admin Verification & Moderation**:
   - Store registration approval queue, category management, platform-wide analytics, and role-based user management.

---

## 🔑 Fast Persona Test Accounts (1-Click Demo Logins)

The UI includes a **1-Click Role Switcher** in the top navigation bar:

| Role | Account Name | Email | Password | Primary Functions |
|---|---|---|---|---|
| **Customer** | Rahul Sharma | `customer@quickkart.com` | `password123` | Search, Broadcast Requests, Compare, Holds, Chat |
| **Shopkeeper 1** | Sharma Hardware Store | `sharma@quickkart.com` | `password123` | Live Business State, Quote Requests, Inventory |
| **Shopkeeper 2** | Gupta Building Materials | `gupta@quickkart.com` | `password123` | Inventory, Quotations, Reservation Orders |
| **Admin** | QuickKart Admin | `admin@quickkart.com` | `password123` | Shop Verification, Stats, Users, Categories |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Router v6, Leaflet & React-Leaflet, Axios, Canvas Confetti.
- **Backend**: Node.js, Express.js, Socket.IO, MongoDB (with Mongoose & automatic In-Memory fallback for zero-setup execution), JWT, Bcrypt.js, Express Rate Limit.

---

## 📦 How to Run the Project

### 1. Start the Backend API & WebSocket Server
```bash
cd backend
npm install
npm run dev
# Server starts on http://localhost:5000 with sample seed data pre-loaded
```

### 2. Start the Frontend React App
```bash
cd frontend
npm install
npm run dev
# App starts on http://localhost:5173
```

---

## 🗺️ REST API Endpoints Overview

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`
- **Shops**: `GET /api/shops/nearby`, `GET /api/shops/:id`, `POST /api/shops`, `GET /api/shops/my-shop`, `PUT /api/shops/my-shop`
- **Products**: `GET /api/products`, `GET /api/products/:id`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- **Requests & Quotes**: `POST /api/requests`, `GET /api/requests/my`, `GET /api/requests/shop`, `POST /api/requests/:id/respond`, `GET /api/requests/:id`
- **Reservations**: `POST /api/reservations`, `GET /api/reservations/my`, `GET /api/reservations/shop`, `PUT /api/reservations/:id/status`
- **Chat & Alerts**: `GET /api/chat/conversations`, `POST /api/chat/conversations`, `GET /api/chat/conversations/:id/messages`, `POST /api/chat/conversations/:id/messages`
- **Admin**: `GET /api/admin/stats`, `GET /api/admin/shops`, `PUT /api/admin/shops/:id/verify`, `GET /api/admin/users`, `PUT /api/admin/users/:id/status`, `GET & POST /api/admin/categories`
