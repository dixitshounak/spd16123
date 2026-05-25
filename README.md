# 🌍 AI Trip Planner

A full-stack, production-ready AI-powered travel planning application built with Node.js + Express backend and Vite + React frontend, powered by Google Gemini 1.5 Flash AI.

---

## ✨ Features

- 🤖 **AI Itinerary Generation** — Gemini 1.5 Flash generates hyper-detailed day-by-day plans
- 💰 **Budget-Aware Planning** — Budget breakdown in ₹ with charts
- 🏨 **Real Hotel Picks** — With Booking.com + MakeMyTrip booking links
- 🗺️ **Interactive Maps** — Google Maps embedded view
- 🌤️ **Live Weather** — OpenWeather widget for destination
- 📄 **PDF Export** — Download full itinerary as PDF
- 🔗 **Trip Sharing** — Public share links with unique tokens
- 💬 **AI Chat** — Context-aware trip assistant
- 🔐 **JWT Auth** — Access token (memory) + Refresh token (httpOnly cookie) rotation

---

## 📁 Project Structure

```
AI_trip_planner/
├── server/          # Node.js + Express backend
│   ├── config/      # DB + JWT helpers
│   ├── controllers/ # Auth, Trip, User, AI logic
│   ├── middleware/  # Auth, Error, Validation
│   ├── models/      # User, Trip, RefreshToken schemas
│   ├── routes/      # Express routers
│   ├── utils/       # Token gen, Email sender
│   ├── uploads/     # Avatar uploads
│   └── server.js    # Express app entry point
│
└── client/          # Vite + React frontend
    └── src/
        ├── components/  # UI, Layout, Trip, Chat, Form components
        ├── context/     # AuthContext, TripContext
        ├── hooks/       # useAuth, useTrips, useGemini, useWeather
        ├── lib/         # Axios instance with interceptors
        ├── pages/       # Landing, Login, Register, CreateTrip, ViewTrip, MyTrips, ShareTrip, Profile
        └── utils/       # formatCurrency, stripMarkdown, parseDates
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- API keys (see below)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

#### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ai_trip_planner
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
GEMINI_API_KEY=your_gemini_api_key          # https://aistudio.google.com/apikey
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
```

#### Client (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_key          # Google Cloud Console
VITE_UNSPLASH_ACCESS_KEY=your_key          # https://unsplash.com/developers
VITE_OPENWEATHER_API_KEY=your_key          # https://openweathermap.org/api
```

### 3. Start Development Servers

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

Open http://localhost:5173 🎉

---

## 🔑 Getting API Keys

| Service | Free Tier | Link |
|---------|-----------|------|
| **Google Gemini** | Yes (generous limits) | https://aistudio.google.com/apikey |
| **Google Maps** | $200/month credit | https://console.cloud.google.com |
| **Unsplash** | 50 req/hr free | https://unsplash.com/developers |
| **OpenWeather** | 1000 calls/day free | https://openweathermap.org/api |
| **MongoDB Atlas** | 512MB free | https://cloud.mongodb.com |

> **Note**: The app works without Unsplash, Google Maps, and OpenWeather keys — they just gracefully degrade. Gemini and MongoDB are required for core functionality.

---

## 🔐 Auth Flow

1. User **registers** → password hashed with bcrypt (rounds: 12) → verification email sent
2. User **logs in** → server returns:
   - `accessToken` (15 min, stored in memory)
   - `refreshToken` (7 days, httpOnly cookie)
3. Every API request sends `Authorization: Bearer <accessToken>`
4. On 401 → axios interceptor calls `/api/auth/refresh` → rotates tokens
5. **Logout** → deletes refresh token from DB + clears cookie

---

## 📡 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/verify/:token` | Verify email |
| POST | `/api/auth/login` | Login (returns tokens) |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (revoke refresh) |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |

### Trips (protected)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/trips` | Create trip |
| GET | `/api/trips` | Get all user trips |
| GET | `/api/trips/:id` | Get single trip |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |
| POST | `/api/trips/:id/share` | Toggle public sharing |
| POST | `/api/trips/:id/duplicate` | Duplicate trip |
| GET | `/api/trips/share/:token` | Get public trip (no auth) |

### AI (protected, rate-limited to 10/hr)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/generate` | Generate itinerary with Gemini |
| POST | `/api/ai/chat` | AI chat about trip |
| POST | `/api/ai/regenerate/:id` | Regenerate existing trip |

### Users (protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users/me` | Get profile |
| PUT | `/api/users/me` | Update name/avatar |
| PUT | `/api/users/me/password` | Change password |
| DELETE | `/api/users/me` | Delete account |

---

## 🛡️ Security

- Gemini API key **never exposed to frontend** — all AI calls proxied through backend
- `httpOnly` cookie for refresh tokens (XSS safe)
- bcrypt password hashing (rounds: 12)
- express-validator on all POST routes
- Rate limiting: 200 req/15min globally, 10 req/hr for AI routes
- Helmet.js HTTP security headers
- CORS restricted to CLIENT_URL only
- Refresh token rotation (old token deleted on each use)

---

## 📝 Gmail App Password Setup

1. Enable 2-factor authentication on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an app password for "Mail"
4. Use this password as `EMAIL_PASS` in server `.env`

---

## 🏗️ Build for Production

```bash
# Build client
cd client
npm run build

# The dist/ folder can be served statically
# Point Express to serve /client/dist in production
```

---

## 📄 License

MIT — feel free to use, modify, and distribute.
