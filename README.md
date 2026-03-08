# DriveSmart

> A full-stack ride-hailing platform with real-time driver tracking, customer booking, and an admin dispatch console.

![React](https://img.shields.io/badge/React_18-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

---

## Overview

DriveSmart is a three-portal ride-hailing system:

| Portal | Who uses it | Key capabilities |
|---|---|---|
| **Customer** | Riders | Book rides, track active ride, wallet, history |
| **Driver** | Operators | Accept requests, navigate active ride, view earnings |
| **Admin** | Platform team | Dispatch console, user/driver management, payments, settings |

Built with a skeuomorphic blue/white design system, real-time Supabase subscriptions, and interactive Leaflet maps.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript 5, Vite 7 |
| Styling | Tailwind CSS v4, ShadCN UI, Outfit font |
| Routing | React Router DOM v7 |
| Maps | Leaflet + React-Leaflet (OpenStreetMap) |
| Backend | Supabase (PostgreSQL + PostGIS + Realtime + Auth) |
| Charts | Recharts |
| Animation | Framer Motion |
| Notifications | Sonner |

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/mizanmail/DriveSmart.git
cd DriveSmart
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from **Supabase Dashboard → Project Settings → API**.

### 3. Set Up the Database

Open the **Supabase SQL Editor** and run `database/schema.sql`. This creates all tables, RLS policies, enums, indexes, and PostGIS configuration.

### 4. Run the Dev Server

```bash
npm run dev
```

App runs on **http://localhost:5173**

---

## Project Structure

```
src/
├── components/
│   ├── driver/          # Driver-specific reusable components
│   ├── ui/              # ShadCN UI primitives
│   ├── MapSelector.tsx  # Interactive map with tactile pins
│   └── ProtectedRoute.tsx
├── hooks/
│   ├── useDriverPool.ts        # Real-time driver lifecycle hook
│   └── useLocationBroadcast.ts # GPS broadcast hook
├── layouts/
│   ├── CustomerLayout.tsx
│   ├── DriverLayout.tsx
│   └── DashboardLayout.tsx
├── lib/
│   ├── supabase.ts   # Supabase client
│   ├── geoUtils.ts   # Distance & fare calculations
│   └── utils.ts      # cn() helper
├── pages/
│   ├── auth/         # Login, Signup
│   ├── customer/     # Home, BookRide, ActiveRide, Wallet, History
│   ├── driver/       # DriverHome, Requests, DriverActiveRide, Earnings
│   ├── dashboard/    # Dashboard, Users, Drivers, Bookings, Payments,
│   │                 # DispatchConsole, Simulation, Settings
│   └── onboarding/   # RoleSelection
├── styles/
│   └── design-tokens.ts   # Design system tokens
└── tests/
    └── geoUtils.test.ts   # Geo utility unit tests
```

---

## Routes

### Customer (`/customer/*`)
| Route | Page |
|---|---|
| `/customer` | Home — book a ride |
| `/customer/active-ride/:id` | Live ride view |
| `/customer/wallet` | Capital Hub / Wallet |
| `/customer/history` | Ride history |

### Driver (`/driver/*`)
| Route | Page |
|---|---|
| `/driver` | Station (status & availability) |
| `/driver/requests` | Incoming ride requests |
| `/driver/active-ride/:id` | Active ride navigation |
| `/driver/earnings` | Revenue dashboard |

### Admin (`/dashboard/*`)
| Route | Page |
|---|---|
| `/dashboard` | Overview & stats |
| `/dashboard/users` | User management |
| `/dashboard/drivers` | Driver approval |
| `/dashboard/dispatch` | Live map dispatch console |
| `/dashboard/bookings` | All bookings |
| `/dashboard/payments` | Financial ledger |
| `/dashboard/simulation` | Driver simulation |
| `/dashboard/settings` | Pricing & system controls |

---

## Admin Setup

After signing up, run this in the **Supabase SQL Editor** to grant admin access:

```sql
-- Find your user ID
SELECT id, email FROM profiles;

-- Grant admin role (replace with your actual UUID)
INSERT INTO admins (id, role) VALUES ('YOUR_USER_ID', 'admin');
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Add the same environment variables in site settings

---

## Troubleshooting

**Supabase not connecting** — Ensure `.env` is in the project root and restart the dev server after editing it. All Vite env vars must be prefixed with `VITE_`.

**Map not showing** — Requires an internet connection for OpenStreetMap tiles. Ensure PostGIS is enabled in your Supabase project.

**TypeScript errors** — Run `npx tsc --noEmit` to check. If packages are missing, try `rm -rf node_modules && npm install`.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

*Built with React, Supabase, and a lot of ☕*
