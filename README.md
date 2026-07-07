# Rentiful

A full-stack rental property marketplace. Tenants can search, filter, and apply for properties. Managers can list properties, review applications, and manage leases.

---

## Tech Stack

**Client**
- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS + shadcn/ui
- Redux Toolkit + RTK Query
- Mapbox GL (property maps)
- Framer Motion
- Zod (form validation)

**Server**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL + PostGIS (via Neon)
- JWT (bcryptjs + jsonwebtoken)
- Multer (file uploads)

---

## Features

- **Auth**: Register and sign in as a tenant or property manager. Role-based access enforced on all protected routes.
- **Property search**: Filter by price, beds, baths, property type, amenities, square footage, availability date, and map radius.
- **Paginated listings**: Grid and list view with Mapbox markers.
- **Applications**: Tenants submit rental applications. Managers approve or deny. Lease is created only on approval.
- **Favorites**: Tenants save and manage favorite properties.
- **Leases**: View active leases and payment history scoped to the authenticated user.
- **Settings**: Update name, email, and phone number.
- **File uploads**: Property photos stored locally, validated by type (JPEG/PNG/WebP/AVIF) and size (10MB max).

---

## Project Structure

```
rentiful/
├── client/                  # Next.js frontend
│   └── src/
│       ├── app/             # Pages (Next.js App Router)
│       │   ├── (auth)/      # Sign in / sign up
│       │   ├── (dashboard)/ # Tenant + manager dashboards
│       │   └── (nondashboard)/ # Landing + property search
│       ├── features/
│       │   ├── auth/        # AuthProvider, token utils
│       │   ├── properties/  # Card, CardCompact, enums/icons
│       │   ├── applications/# ApplicationCard
│       │   └── settings/    # SettingsForm
│       └── shared/
│           ├── components/  # Navbar, Header, Loading, ui/
│           ├── hooks/
│           ├── lib/         # utils, schemas
│           ├── state/       # Redux store, RTK Query API, global slice
│           └── types/
│
└── server/                  # Express backend
    └── src/
        ├── features/
        │   ├── auth/        # controller, middleware, routes
        │   ├── properties/  # controller, routes
        │   ├── applications/# controller, routes
        │   ├── leases/      # controller, routes
        │   ├── tenants/     # controller, routes
        │   └── managers/    # controller, routes
        └── lib/
            └── prisma.ts    # Prisma singleton
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database with the PostGIS extension enabled
- A [Mapbox](https://mapbox.com) account (for map tiles)

### 1. Clone the repo

```bash
git clone https://github.com/cirostackdev/RENTIFUL.git
cd RENTIFUL
```

### 2. Configure environment variables

**Server** — copy and fill in `server/.env.example`:

```bash
cp server/.env.example server/.env
```

```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/rentiful?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/rentiful?sslmode=require"
JWT_SECRET="your-secure-random-secret-min-32-chars"
PORT=3002
CLIENT_URL="http://localhost:3000"
NODE_ENV="development"
```

**Client** — copy and fill in `client/.env.example`:

```bash
cp client/.env.example client/.env.local
```

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3002"
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your-mapbox-token"
```

### 3. Set up the database

```bash
cd server
npm install
npx prisma db push
```

> Neon requires PostGIS. Enable it in your Neon project under **Extensions** before running `db push`.

### 4. Run the server

```bash
cd server
npm run dev
```

Server starts on `http://localhost:3002`.

### 5. Run the client

```bash
cd client
npm install
npm run dev
```

Client starts on `http://localhost:3000`.

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Register a new user |
| POST | `/auth/login` | None | Sign in, returns JWT |
| GET | `/auth/me` | Required | Get current user |
| PUT | `/auth/me` | Required | Update profile |

**Register body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "role": "tenant",
  "phoneNumber": "555-0100"
}
```

**Login response:**
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "email": "...", "role": "tenant", "name": "...", "phoneNumber": "..." }
}
```

### Properties

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/properties` | None | List properties (paginated, filterable) |
| GET | `/properties/:id` | None | Get single property |
| POST | `/properties` | Manager | Create property (multipart/form-data) |

**GET /properties query params:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20, max: 100) |
| `priceMin` | number | Minimum monthly rent |
| `priceMax` | number | Maximum monthly rent |
| `beds` | number \| `"any"` | Minimum bedrooms |
| `baths` | number \| `"any"` | Minimum bathrooms |
| `propertyType` | string \| `"any"` | `Rooms`, `Apartment`, `Villa`, etc. |
| `amenities` | string | Comma-separated amenity list |
| `squareFeetMin` | number | Minimum square footage |
| `squareFeetMax` | number | Maximum square footage |
| `availableFrom` | date | Filter by lease start date |
| `latitude` | number | Map center latitude |
| `longitude` | number | Map center longitude |
| `favoriteIds` | string | Comma-separated property IDs |

### Applications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/applications?userId=&userType=` | Tenant/Manager | List applications |
| POST | `/applications` | Tenant | Submit application |
| PUT | `/applications/:id/status` | Manager | Approve or deny |

### Leases

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/leases` | Tenant/Manager | Get leases for current user |
| GET | `/leases/:id/payments` | Tenant/Manager | Get payment history |

### Tenants

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tenants/:userId` | Required | Get tenant profile |
| GET | `/tenants/:userId/current-residences` | Required | Get active rentals |
| POST | `/tenants/:userId/favorites/:propertyId` | Required | Add favorite |
| DELETE | `/tenants/:userId/favorites/:propertyId` | Required | Remove favorite |

### Managers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/managers/:userId` | Required | Get manager profile |
| GET | `/managers/:userId/properties` | Required | Get manager's listings |

---

## Data Models

```
User
  id           String (UUID)
  email        String (unique)
  passwordHash String
  role         tenant | manager
  name         String
  phoneNumber  String

Property
  id                Int
  name, description String
  pricePerMonth     Float
  securityDeposit   Float
  applicationFee    Float
  beds, baths       Int/Float
  squareFeet        Int
  propertyType      Rooms | Tinyhouse | Apartment | Villa | Townhouse | Cottage
  amenities         Amenity[]
  highlights        Highlight[]
  isPetsAllowed     Boolean
  isParkingIncluded Boolean
  photoUrls         String[]
  managerId         String → User

Location
  id         Int
  address, city, state, country, postalCode
  coordinates  geography(Point, 4326)  -- PostGIS

Application
  id              Int
  status          Pending | Approved | Denied
  propertyId      Int → Property
  tenantId        String → User
  leaseId         Int? → Lease (set on approval)

Lease
  id         Int
  startDate  DateTime
  endDate    DateTime
  rent       Float
  deposit    Float
  propertyId Int → Property
  tenantId   String → User

Payment
  id            Int
  amountDue     Float
  amountPaid    Float
  dueDate       DateTime
  paymentStatus Pending | Paid | PartiallyPaid | Overdue
  leaseId       Int → Lease
```

---

## Authentication

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <jwt>
```

The token is issued at login/register, stored in `localStorage`, and attached to every API request by RTK Query's `prepareHeaders`. Tokens expire after 7 days.

---

## Scripts

### Server

```bash
npm run dev          # Start with ts-node + nodemon
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled output
npx prisma db push   # Push schema to database
npx prisma generate  # Regenerate Prisma client
npx prisma studio    # Open database GUI
```

### Client

```bash
npm run dev     # Start Next.js dev server
npm run build   # Production build
npm run start   # Serve production build
npm run lint    # Run ESLint
```

---

## Windows Note

npm may show `TAR_ENTRY_ERROR` warnings during install due to the Windows 260-character path limit. These are non-fatal. To avoid them entirely, enable long paths:

1. Run `git config --system core.longpaths true`
2. Enable **Win32 Long Paths** in Group Policy or registry (`HKLM\SYSTEM\CurrentControlSet\Control\FileSystem\LongPathsEnabled = 1`)
