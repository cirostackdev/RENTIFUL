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

## Architecture

**Custom JWT auth, not a managed identity provider**
Auth is built on `bcryptjs` + `jsonwebtoken` with `jwt.verify()` against a server-held secret. Managed providers like Cognito add vendor lock-in and often push you toward `jwt.decode()` with no signature verification. A single `User` model with a `role` field handles both tenants and managers cleanly, with no split tables.

**PostGIS spatial queries via Prisma raw**
Property search uses `ST_DWithin` + `ST_SetSRID` through Prisma's `$queryRaw` with parameterized inputs to prevent injection. Neon provides the serverless PostgreSQL layer with both pooled and direct URL support, which Prisma requires for connection management in serverless environments.

**Feature-based structure on both client and server**
Both Express and Next.js are organized by domain feature rather than by file type. Each server feature owns its controller, routes, and any feature-specific middleware. The client separates feature components, shared UI, and Redux state by domain. Pages in `app/` are thin wrappers.

**RTK Query with typed cache invalidation**
All API calls go through RTK Query endpoints with typed tag-based cache invalidation. Mutations invalidate only the tags they affect, preventing stale data without over-fetching.

**Lease creation is transactional and gated on approval**
Applications carry a `leaseId` that starts null. On manager approval, the lease is created inside a Prisma transaction and atomically linked to the application. No lease is created on submission or denial, so there are no orphaned records.

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

**Backend**

![Node.js](https://img.shields.io/badge/Node.js-0d1117?style=flat-square&logo=nodedotjs&logoColor=58a6ff)
![Express](https://img.shields.io/badge/Express-0d1117?style=flat-square&logo=express&logoColor=58a6ff)
![TypeScript](https://img.shields.io/badge/TypeScript-0d1117?style=flat-square&logo=typescript&logoColor=58a6ff)
![Multer](https://img.shields.io/badge/Multer-0d1117?style=flat-square&logo=nodedotjs&logoColor=58a6ff)

</td>
<td valign="top" width="50%">

**Database**

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-0d1117?style=flat-square&logo=postgresql&logoColor=58a6ff)
![PostGIS](https://img.shields.io/badge/PostGIS-0d1117?style=flat-square&logo=postgresql&logoColor=58a6ff)
![Prisma](https://img.shields.io/badge/Prisma-0d1117?style=flat-square&logo=prisma&logoColor=58a6ff)
![Neon](https://img.shields.io/badge/Neon-0d1117?style=flat-square&logo=neon&logoColor=58a6ff)

**Security**

![JWT](https://img.shields.io/badge/JWT-0d1117?style=flat-square&logo=jsonwebtokens&logoColor=58a6ff)
![bcryptjs](https://img.shields.io/badge/bcryptjs-0d1117?style=flat-square&logo=letsencrypt&logoColor=58a6ff)
![Helmet](https://img.shields.io/badge/Helmet-0d1117?style=flat-square&logo=express&logoColor=58a6ff)

</td>
</tr>
</table>

---

## Project Structure

```mermaid
graph LR
    root["rentiful"]

    root --> client["client"]
    root --> server["server"]

    client --> csrc["src"]
    server --> ssrc["src"]

    csrc --> app["app\nApp Router pages"]
    csrc --> features_c["features"]
    csrc --> shared["shared"]

    app --> auth_p["(auth)\n/signin · /signup"]
    app --> dash_p["(dashboard)\n/managers/* · /tenants/*"]
    app --> nondash_p["(nondashboard)\n/ · /search · /search/[id]"]

    features_c --> auth_f["auth\nAuthProvider + token utils"]
    features_c --> props_f["properties\nCard, CardCompact, enums"]
    features_c --> apps_f["applications\nApplicationCard"]
    features_c --> settings_f["settings\nSettingsForm"]

    shared --> comp["components\nNavbar, Header, ui"]
    shared --> lib_c["lib\nutils, schemas"]
    shared --> state["state\nRedux store + RTK Query"]

    ssrc --> features_s["features"]
    ssrc --> lib_s["lib"]

    features_s --> auth_s["auth\ncontroller · middleware · routes"]
    features_s --> props_s["properties\ncontroller · routes"]
    features_s --> apps_s["applications\ncontroller · routes"]
    features_s --> leases_s["leases\ncontroller · routes"]
    features_s --> tenants_s["tenants\ncontroller · routes"]
    features_s --> managers_s["managers\ncontroller · routes"]

    lib_s --> prisma["prisma.ts\nsingleton client"]
```

---

## Data Model

```mermaid
erDiagram
    User {
        string id PK
        string email
        string passwordHash
        string role "tenant | manager"
        string name
        string phoneNumber
    }
    Location {
        string id PK
        string coordinates "PostGIS Point(4326)"
    }
    Property {
        string id PK
        string managerId FK
        string locationId FK
        string propertyType "Rooms|Tinyhouse|Apartment|Villa|Townhouse|Cottage"
        float pricePerMonth
        float securityDeposit
        float applicationFee
        int beds
        int baths
        float squareFeet
        bool isPetsAllowed
        bool isParkingIncluded
    }
    Application {
        string id PK
        string tenantId FK
        string propertyId FK
        string status "Pending | Approved | Denied"
        string leaseId FK "null until Approved"
    }
    Lease {
        string id PK
        string tenantId FK
        string propertyId FK
        date startDate
        date endDate
        float rent
        float deposit
    }
    Payment {
        string id PK
        string leaseId FK
        string paymentStatus "Pending | Paid | PartiallyPaid | Overdue"
    }

    User ||--o{ Property        : "manages"
    User ||--o{ Application     : "submits"
    User ||--o{ Lease           : "holds"
    Location ||--o{ Property    : "hosts"
    Property ||--o{ Application : "receives"
    Application ||--o| Lease    : "creates on approval"
    Lease ||--o{ Payment        : "billed via"
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

<a href="https://cirostackdev.github.io/RENTIFUL" target="_blank">
  <img src="https://img.shields.io/badge/API_Docs-View_Interactive_Docs-0d1117?style=for-the-badge&logo=swagger&logoColor=85EA2D" alt="API Docs" />
</a>

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
