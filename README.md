# ArcadeApp — Referral Tracking System

A full-stack web application that lets users sign up, invite friends via a unique referral link, and track conversion rates in real time.

**Live demo:** [https://arcade-interview-project.vercel.app](https://arcade-interview-project.vercel.app)

---

## Features

- **Authentication** — Sign up and sign in with email/password (JWT-based, HttpOnly cookies)
- **Unique referral links** — Each user gets a personal link (`/r/<code>`) to share
- **Click tracking** — Every click on a referral link is recorded
- **Conversion attribution** — New signups are attributed to the referring user via a short-lived cookie
- **Analytics dashboard** — View total clicks, conversions, and conversion rate in real time
- **Referrals table** — See exactly who joined through your link

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL via [Neon](https://neon.tech) |
| ORM | Prisma 5 |
| Auth | Custom JWT with `jose` + `bcryptjs` |
| Styling | Tailwind CSS |
| Linting | Biome |
| Testing | Vitest + Testing Library |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (see options below)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/arcade-interview-project.git
cd arcade-interview-project
npm install
```

### 2. Set up the database

**Option A — Neon (recommended, free cloud PostgreSQL)**

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project and copy the connection string
3. Use that string as `DATABASE_URL` below

**Option B — Local PostgreSQL with Docker**

```bash
docker run --name arcade-pg -e POSTGRES_PASSWORD=password -e POSTGRES_DB=arcade_dev -p 5432:5432 -d postgres:16
```

Set `DATABASE_URL="postgresql://postgres:password@localhost:5432/arcade_dev"`

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://..."         # Your PostgreSQL connection string
JWT_SECRET="..."                        # Run: openssl rand -hex 32
VERCEL_URL="http://localhost:3000"
```

### 4. Apply the database schema

```bash
npm run db:push
```

### 5. (Optional) Seed demo data

```bash
npm run db:seed
```

This creates 4 demo accounts (password: `password123`):
- `alice@example.com` — has 2 referrals, 3 clicks (66.7% rate)
- `bob@example.com` — has 1 referral, 1 click
- `carol@example.com` — no referrals
- `dave@example.com` — no referrals

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How the Referral System Works

```
User A signs up
    → Gets a unique referral code (e.g. "X7K2M9PQ")
    → Their link: https://yourapp.com/r/X7K2M9PQ

User A shares the link

Friend clicks the link
    → GET /r/X7K2M9PQ
    → A ReferralClick record is created (User A's click count goes up)
    → A short-lived HttpOnly cookie (ref_code=X7K2M9PQ) is set
    → Friend is redirected to /signup

Friend signs up
    → POST /api/auth/signup reads the ref_code cookie
    → New user is created with referredById = User A's ID (conversion!)
    → Cookie is cleared

User A's dashboard now shows:
    Clicks: 1   Conversions: 1   Rate: 100%
```

Clicks and conversions are tracked separately, so the conversion rate is meaningful even if only some visitors sign up.

---

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
npm run lint         # Lint with Biome
npm run lint:fix     # Auto-fix lint issues
npm run db:push      # Sync schema to database
npm run db:migrate   # Create a new migration
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio (DB GUI)
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Sign in / Sign up pages
│   ├── dashboard/        # Analytics dashboard (protected)
│   ├── r/[code]/         # Referral redirect + click tracking
│   └── api/              # REST API routes
│       ├── auth/         # signup, signin, signout
│       ├── me/           # Current user + stats
│       └── referrals/    # List of referred users
├── components/
│   ├── auth/             # SignInForm, SignUpForm
│   └── dashboard/        # StatsOverview, ReferralLinkCard, ReferralsTable
├── lib/
│   ├── auth.ts           # JWT sign/verify (jose)
│   ├── password.ts       # bcryptjs hash/verify
│   ├── prisma.ts         # Prisma client singleton
│   ├── referral.ts       # Referral code generator
│   └── session.ts        # Cookie helpers
├── middleware.ts          # Route protection (Edge Runtime)
└── types/                # Shared TypeScript types

tests/
├── unit/                 # Auth, password, referral code utils
├── components/           # SignInForm, SignUpForm (jsdom)
└── integration/          # API behavior tests (stubbed, DB-agnostic)
```

---

## Deploying to Vercel

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add these environment variables in the Vercel dashboard:
   - `DATABASE_URL` — your Neon connection string
   - `JWT_SECRET` — a 32+ char random secret (`openssl rand -hex 32`)
   - `VERCEL_URL` — your Vercel URL (e.g. `https://arcade-app.vercel.app`)
4. Deploy — Vercel auto-detects Next.js

After deploying, run the DB migration once:

```bash
DATABASE_URL="<your-neon-url>" npx prisma db push
```

---

## Testing

```bash
npm test
```

27 tests across 6 test files:

| Suite | Tests | Coverage |
|-------|-------|----------|
| `tests/unit/auth.test.ts` | 5 | JWT sign, verify, tamper detection |
| `tests/unit/password.test.ts` | 5 | bcrypt hash, verify, edge cases |
| `tests/unit/referral.test.ts` | 4 | Code generation, uniqueness |
| `tests/components/sign-in-form.test.tsx` | 4 | Form render, loading, success, error |
| `tests/components/sign-up-form.test.tsx` | 5 | Validation, success, server errors |
| `tests/integration/api-auth.test.ts` | 4 | Attribution flow (stubbed) |

Integration tests are stubbed (Prisma is mocked) so they run without a real database. To run against a live DB, set `DATABASE_URL` in `.env.test` and remove the `vi.mock` calls.

---

## Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- JWTs are stored in HttpOnly cookies — inaccessible to JavaScript (XSS-safe)
- Sign-in uses a single error message for missing email and wrong password (prevents email enumeration)
- Referral attribution uses server-set HttpOnly cookies (not URL params) to prevent tampering

---

## License

MIT
