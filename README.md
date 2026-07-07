<div align="center">

# Rentiful

**Full-stack rental property marketplace: production-grade architecture, custom auth, spatial search.**

[![Next.js](https://img.shields.io/badge/Next.js_15-0d1117?style=flat-square&logo=nextdotjs&logoColor=58a6ff)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express-0d1117?style=flat-square&logo=express&logoColor=58a6ff)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-0d1117?style=flat-square&logo=typescript&logoColor=58a6ff)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_+_PostGIS-0d1117?style=flat-square&logo=postgresql&logoColor=58a6ff)](https://postgis.net)
[![Prisma](https://img.shields.io/badge/Prisma-0d1117?style=flat-square&logo=prisma&logoColor=58a6ff)](https://prisma.io)
[![Neon](https://img.shields.io/badge/Neon-0d1117?style=flat-square&logo=neon&logoColor=58a6ff)](https://neon.tech)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-0d1117?style=flat-square&logo=redux&logoColor=58a6ff)](https://redux-toolkit.js.org)
[![Mapbox](https://img.shields.io/badge/Mapbox_GL-0d1117?style=flat-square&logo=mapbox&logoColor=58a6ff)](https://mapbox.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0d1117?style=flat-square&logo=tailwindcss&logoColor=58a6ff)](https://tailwindcss.com)

</div>

---

## Overview

Rentiful is a full-stack rental property platform built for tenants to discover and apply for properties, and for property managers to list, manage, and approve tenants. The interface is clean and role-aware throughout.

This project is a deliberate exercise in **production-ready architecture**: custom JWT auth replacing a managed identity provider, PostGIS-powered spatial search, feature-based monorepo structure on both client and server, and a set of security and performance fixes applied systematically across the stack.

---

## Architectural Decisions Worth Noting

**Custom JWT auth over managed identity (Cognito)**
The original codebase used AWS Cognito with `jwt.decode()` (no signature verification), meaning any client could forge a token. This was replaced with `bcryptjs` + `jsonwebtoken` using `jwt.verify()` against a server-held secret, with a unified `User` model (replacing separate `Manager`/`Tenant` tables) and role stored in the token payload.

**PostGIS spatial queries with Neon**
Property search uses raw `ST_DWithin` + `ST_SetSRID` PostGIS queries via Prisma's `$queryRaw`, parameterized to prevent injection. Neon provides the serverless PostgreSQL layer with pooled + direct URL support for Prisma's connection management.

**Feature-based architecture on both ends**
Both the Express server and Next.js client are organized by domain feature rather than by file type. Each server feature owns its controller, routes, and any feature-specific middleware. The client separates feature components, shared UI, and state cleanly.

**RTK Query with proper cache invalidation**
All API calls go through RTK Query endpoints with typed tag-based cache invalidation. Mutations invalidate only the tags they affect, preventing stale data without over-fetching.

**Duplicate lease bug fixed**
The original code created a `Lease` record immediately when an application was submitted, then created a second one on manager approval, leaving orphaned leases on every denial. Applications now create no lease; the lease is created inside a Prisma transaction only on approval, atomically connecting the tenant to the property.

---

## Tech Stack

<table>
<tr>
<td valign="top" width="50%">

**Frontend**

![React 19](https://img.shields.io/badge/React_19-0d1117?style=flat-square&logo=react&logoColor=58a6ff)
![Next.js 15](https://img.shields.io/badge/Next.js_15_App_Router-0d1117?style=flat-square&logo=nextdotjs&logoColor=58a6ff)
![TypeScript](https://img.shields.io/badge/TypeScript-0d1117?style=flat-square&logo=typescript&logoColor=58a6ff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0d1117?style=flat-square&logo=tailwindcss&logoColor=58a6ff)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-0d1117?style=flat-square&logo=shadcnui&logoColor=58a6ff)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-0d1117?style=flat-square&logo=redux&logoColor=58a6ff)
![RTK Query](https://img.shields.io/badge/RTK_Query-0d1117?style=flat-square&logo=redux&logoColor=58a6ff)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0d1117?style=flat-square&logo=framer&logoColor=58a6ff)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-0d1117?style=flat-square&logo=reacthookform&logoColor=58a6ff)
![Zod](https://img.shields.io/badge/Zod-0d1117?style=flat-square&logo=zod&logoColor=58a6ff)
![Mapbox GL](https://img.shields.io/badge/Mapbox_GL-0d1117?style=flat-square&logo=mapbox&logoColor=58a6ff)

</td>
<td valign="top" width="50%">

**Backend**

![Node.js](https://img.shields.io/badge/Node.js-0d1117?style=flat-square&logo=nodedotjs&logoColor=58a6ff)
![Express](https://img.shields.io/badge/Express-0d1117?style=flat-square&logo=express&logoColor=58a6ff)
![TypeScript](https://img.shields.io/badge/TypeScript-0d1117?style=flat-square&logo=typescript&logoColor=58a6ff)
![Prisma](https://img.shields.io/badge/Prisma-0d1117?style=flat-square&logo=prisma&logoColor=58a6ff)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-0d1117?style=flat-square&logo=postgresql&logoColor=58a6ff)
![PostGIS](https://img.shields.io/badge/PostGIS-0d1117?style=flat-square&logo=postgresql&logoColor=58a6ff)
![Neon](https://img.shields.io/badge/Neon-0d1117?style=flat-square&logo=neon&logoColor=58a6ff)
![JWT](https://img.shields.io/badge/JWT-0d1117?style=flat-square&logo=jsonwebtokens&logoColor=58a6ff)
![bcryptjs](https://img.shields.io/badge/bcryptjs-0d1117?style=flat-square&logo=letsencrypt&logoColor=58a6ff)
![Helmet](https://img.shields.io/badge/Helmet-0d1117?style=flat-square&logo=express&logoColor=58a6ff)
![Multer](https://img.shields.io/badge/Multer-0d1117?style=flat-square&logo=nodedotjs&logoColor=58a6ff)

</td>
</tr>
</table>

---

## Project Structure

```
rentiful/
├── client/
│   └── src/
│       ├── app/                        # Next.js App Router pages
│       │   ├── (auth)/                 # /signin  /signup
│       │   ├── (dashboard)/            # /managers/*  /tenants/*
│       │   └── (nondashboard)/         # /  /search  /search/[id]
│       ├── features/
│       │   ├── auth/                   # AuthProvider + token utils
│       │   ├── properties/             # Card, CardCompact, enums/icons
│       │   ├── applications/           # ApplicationCard
│       │   └── settings/              # SettingsForm
│       └── shared/
│           ├── components/             # Navbar, Header, Loading, ui/
│           ├── lib/                    # utils, schemas
│           └── state/                  # Redux store, RTK Query API, global slice
│
└── server/
    └── src/
        ├── features/
        │   ├── auth/                   # controller · middleware · routes
        │   ├── properties/             # controller · routes
        │   ├── applications/           # controller · routes
        │   ├── leases/                 # controller · routes
        │   ├── tenants/               # controller · routes
        │   └── managers/              # controller · routes
        └── lib/
            └── prisma.ts              # Singleton client (connection pooling)
```

---

## Data Model

```
User ──────────────────────────────────────────────────────────────
  id           String (UUID, PK)
  email        String (unique)
  passwordHash String
  role         tenant | manager
  name, phoneNumber

Property ──────────────────────────────────────────────────────────
  managerId    → User
  locationId   → Location
  propertyType Rooms | Tinyhouse | Apartment | Villa | Townhouse | Cottage
  amenities    Amenity[]  ·  highlights  Highlight[]
  photoUrls    String[]
  pricePerMonth, securityDeposit, applicationFee
  beds, baths, squareFeet
  isPetsAllowed, isParkingIncluded

Location ──────────────────────────────────────────────────────────
  coordinates  geography(Point, 4326)   ← PostGIS

Application ───────────────────────────────────────────────────────
  tenantId     → User
  propertyId   → Property
  status       Pending | Approved | Denied
  leaseId      → Lease   (null until Approved)

Lease ─────────────────────────────────────────────────────────────
  tenantId     → User
  propertyId   → Property
  startDate, endDate, rent, deposit

Payment ────────────────────────────────────────────────────────────
  leaseId      → Lease
  paymentStatus  Pending | Paid | PartiallyPaid | Overdue
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- [Neon](https://neon.tech) database with PostGIS extension enabled
- [Mapbox](https://mapbox.com) access token

### 1. Clone

```bash
git clone https://github.com/cirostackdev/RENTIFUL.git
cd RENTIFUL
```

### 2. Environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

**`server/.env`**
```env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/rentiful?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/rentiful?sslmode=require"
JWT_SECRET="min-32-char-random-secret"
PORT=3002
CLIENT_URL="http://localhost:3000"
NODE_ENV="development"
```

**`client/.env.local`**
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3002"
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your-mapbox-token"
```

### 3. Database

Enable PostGIS in your Neon project under **Extensions**, then:

```bash
cd server && npm install && npx prisma db push
```

### 4. Run

```bash
# Terminal 1
cd server && npm run dev      # → http://localhost:3002

# Terminal 2
cd client && npm install && npm run dev   # → http://localhost:3000
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | None | Register (`email`, `password`, `name`, `role`, `phoneNumber`) |
| `POST` | `/auth/login` | None | Sign in → `{ token, user }` |
| `GET` | `/auth/me` | ✓ | Current user |
| `PUT` | `/auth/me` | ✓ | Update profile |

All protected routes require `Authorization: Bearer <token>`.

### Properties

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/properties` | None | Paginated, filterable list |
| `GET` | `/properties/:id` | None | Single property with coordinates |
| `POST` | `/properties` | Manager | Create (`multipart/form-data`) |

**Filter params:** `page`, `limit`, `priceMin`, `priceMax`, `beds`, `baths`, `propertyType`, `amenities`, `squareFeetMin`, `squareFeetMax`, `availableFrom`, `latitude`, `longitude`, `favoriteIds`

### Applications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/applications?userId=&userType=` | ✓ | List by user |
| `POST` | `/applications` | Tenant | Submit (one active per property) |
| `PUT` | `/applications/:id/status` | Manager | `Approved` or `Denied` |

### Leases

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/leases` | ✓ | Current user's leases |
| `GET` | `/leases/:id/payments` | ✓ | Payment history |

### Tenants

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/tenants/:userId` | ✓ | Profile + favorites |
| `GET` | `/tenants/:userId/current-residences` | ✓ | Active rentals |
| `POST` | `/tenants/:userId/favorites/:propertyId` | ✓ | Add favorite |
| `DELETE` | `/tenants/:userId/favorites/:propertyId` | ✓ | Remove favorite |

### Managers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/managers/:userId` | ✓ | Profile |
| `GET` | `/managers/:userId/properties` | ✓ | Listings |

---

## Scripts

```bash
# Server
npm run dev          # ts-node + nodemon
npm run build        # Compile to dist/
npm run start        # Run compiled output
npx prisma db push   # Sync schema → database
npx prisma studio    # Database GUI

# Client
npm run dev          # Next.js dev server
npm run build        # Production build
npm run lint         # ESLint
```

---

<div align="center">

Built by [Jessy Chidera Onah](https://github.com/cirostackdev) · Co-Founder @ [CiroStack](https://github.com/cirostackdev)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/jessyonah)
[![Email](https://img.shields.io/badge/Email-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:jessychideraonah@gmail.com)

</div>
