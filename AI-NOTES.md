# AI Notes — Arcade Interview Project

This file documents how AI (Claude) was used in this project, including plans, prompts, and key decisions made during development.

---

## Tool Used

**Claude Code** (Anthropic) — an agentic AI coding assistant running in the terminal.
Models used: `claude-sonnet-4-6`, `claude-opus-4-6`, `claude-haiku-4-5`

---

## Initial Planning Prompt

The project requirements were provided verbatim from the interview:

> Build a new web app for a fictional product. The application should include a user-management system that allows users to sign up/in, and invite their friends. Be sure that you can track the conversion rates of our new users, and attribute them back to the referring friend.

Claude was asked to help plan the architecture before writing any code. The planning phase produced:
- File structure
- Database schema (Prisma models)
- API routes design
- Key implementation decisions
- Testing strategy

---

## Key Architectural Decisions

### Why JWT + HttpOnly Cookies (not NextAuth)?

NextAuth v5 has significant setup complexity for a 6-hour project. A custom JWT approach with `jose` (Web Crypto–based, works in Next.js Edge Runtime) and `bcryptjs` gives full control with minimal overhead.

### Why PostgreSQL + Prisma (not SQLite)?

SQLite doesn't work on Vercel's serverless environment (ephemeral filesystem). PostgreSQL via Neon provides a free-tier cloud database that works both locally and in production with the same connection string.

### Why separate `ReferralClick` and `User.referredById`?

These answer different questions:
- `ReferralClick` → how many times was the link clicked? (numerator insight for funnel analysis)
- `User.referredById` → who actually signed up? (conversion)

Conversion rate = `referrals.count / referralClicks.count`.

If only `referredById` was tracked, you'd know conversions but not clicks, making it impossible to compute a meaningful conversion rate.

### Referral attribution via HttpOnly cookie (not URL param)

Using `?ref=CODE` in the URL is fragile — the user might navigate away, open a new tab, or the param could be stripped by redirects. A short-lived (1 hour) HttpOnly cookie set at `/r/[code]` survives navigation and is not accessible to JavaScript.

The cookie is cleared after a successful signup to prevent double-attribution.

### Why Biome instead of ESLint + Prettier?

Biome is a single tool that handles both linting and formatting. It's significantly faster than the ESLint + Prettier combination and has fewer configuration files. Good choice for a project starting from scratch.

---

## Agent Skills Applied

After the initial implementation, all 11 applicable agent skills in `.agents/skills/` were run against the codebase. Each skill was executed as a parallel subagent in an isolated git worktree, then the results were merged back to `main`.

Skills that were skipped as not applicable:
- `next-cache-components` — requires Next.js 16 (project is on 15)
- `next-upgrade` — no upgrade needed
- `nodejs-backend-patterns` — Express/Fastify specific (project uses Next.js API routes)
- `prisma-cli`, `prisma-database-setup`, `prisma-postgres` — reference/setup docs, no code to generate

### 1. `next-best-practices`
- Moved `serverActions` out of `experimental` (stable in Next.js 15)
- Added `Metadata` type annotation to all page exports
- Removed redundant `headers()` import in referral route (used `request.headers` directly)
- Removed dead code (`getDashboardData`, `getSessionToken` helpers)

### 2. `vercel-react-best-practices`
- Wrapped `getSession()` with `React.cache()` for per-request deduplication — eliminates redundant JWT verifications within a single render pass
- Moved `prisma.referralClick.create()` into `after()` — click recording is now non-blocking; redirect fires immediately
- Replaced manual `loading` state with `useTransition` in all three forms (sign-in, sign-up, sign-out) — also fixed a subtle bug where `setLoading(false)` was never called after navigation
- Hoisted static `FEATURES` and `STAT_META` arrays to module level — no re-creation on every render
- Converted dynamic `import("@/lib/prisma")` to a static top-level import in the dashboard

### 3. `vercel-composition-patterns`
- No changes needed — all components are appropriately simple with no boolean prop proliferation

### 4. `accessibility`
- Added skip-to-content link in root layout targeting `#main-content` (WCAG 2.4.1)
- Wrapped all pages in `<main id="main-content">` landmarks
- Added `aria-label` to all nav elements
- Added `aria-hidden="true"` on all decorative emoji icons
- Added `aria-invalid` and `aria-describedby` linking form inputs to their error messages
- Made input IDs unique per-form (`signin-email`, `signup-name`, etc.)
- Added `noValidate` on forms (using custom validation)
- Added password hint text linked via `aria-describedby`
- Added `aria-live="polite"` region for clipboard copy feedback
- Added `scope="col"` on table headers; `aria-label` on table element
- Improved text contrast (`text-slate-400` → `text-slate-500/600` throughout)
- Replaced "..." loading text with "Signing out" + `aria-busy`

### 5. `seo`
- Created `src/app/robots.ts` — generates `/robots.txt` at build time (disallows `/api/`, `/dashboard/`)
- Created `src/app/sitemap.ts` — generates `/sitemap.xml` with landing, signin, signup entries
- Added `metadataBase`, title template (`%s | ArcadeApp`), expanded description, Open Graph, Twitter Card, and JSON-LD `WebApplication` structured data to root layout
- Auth and dashboard pages: `robots: { index: false }` (private pages not indexed), canonical URLs, description meta

### 6. `vitest`
- Added `clearMocks: true`, `restoreMocks: true`, `unstubEnvs: true`, `unstubGlobals: true` to vitest config — mocks and env stubs are now automatically cleaned between tests
- Added `coverage.all: true` and explicit `coverage.include` scope
- Replaced top-level `process.env.JWT_SECRET =` mutation with `vi.stubEnv()` (automatic cleanup, no cross-test pollution)
- Replaced `global.fetch = vi.fn()` with `vi.stubGlobal("fetch", vi.fn())`
- Used `vi.hoisted()` for mock references used inside `vi.mock` factory functions

### 7. `typescript-advanced-types`
- Added `SignInRequest`, `SignUpRequest` interfaces for typed request bodies
- Added `ApiResult<T>` discriminated union for generic API responses
- Added `ReferralsResponse` and `AuthSuccessResponse` interfaces
- Replaced unsafe `as string` casts in `verifyToken` with proper `typeof` type guards
- Added `NextResponse.json<T>()` type parameters to all API route responses
- Fixed unsafe `email.split("@")` destructuring (destructured `domain` could be `undefined`); replaced with `indexOf`/`slice`
- Replaced duplicate `StatsOverviewProps` interface with `type StatsOverviewProps = ReferralStats`

### 8. `nodejs-best-practices`
- **Timing attack mitigation**: When a user is not found on signin, a dummy `hashPassword` call is now executed so both the "user not found" and "wrong password" paths take comparable time — prevents email enumeration via response timing
- Added `typeof` checks on `email` and `password` in signin to ensure string inputs
- Added referral code format validation (`/^[0-9A-Z]{8}$/`) before DB lookup in `/r/[code]`
- Added `try/catch` with `console.error` logging to all API route handlers (signout, me, referrals, referral redirect)
- Wrapped `after()` callback in its own `try/catch` — click-tracking failures are logged but never crash the background task
- `getSecret()` in middleware now throws instead of silently falling back to `""` when `JWT_SECRET` is missing

### 9. `prisma-client-api`
- Replaced 3 separate queries in `/api/me` (findUnique + 2 counts) with a single query using `_count: { select: { referralClicks: true, referrals: true } }` — one DB round-trip instead of three
- Reduced dashboard from 4 parallel queries to 2 by folding counts into the user query via `_count`
- Added `select` to all `findUnique`/`create` calls to avoid over-fetching
- Replaced `findUnique` with `count` for referral code collision checks (cheaper, no row data needed)
- Added `Prisma.PrismaClientKnownRequestError` P2002 catch for race-condition duplicate email signup
- Wrapped all seed operations in `prisma.$transaction()` for atomicity

### 10. `tailwind-css-patterns`
- Added `darkMode: "class"` to tailwind config
- Added `dark:` variants to all UI surfaces, text, and borders
- Added `motion-reduce:transition-none` and `motion-reduce:animate-none` throughout
- Improved responsive breakpoints (`sm:grid-cols-2 lg:grid-cols-3`, `sm:px-6 lg:px-8`)
- Hidden email column on mobile (`hidden sm:table-cell`) to prevent horizontal overflow
- Replaced `focus:ring-*` with `focus-visible:ring-*` (keyboard-only focus indicators)
- Added `suppressHydrationWarning` on `<html>` for dark mode compatibility

### 11. `frontend-design`
- Swapped Inter for **DM Sans** (more distinctive geometric sans-serif)
- Added `::selection` styling with brand colors
- Added `hover-lift` utility (translateY + shadow on hover) and `btn-press` utility (scale on click)
- Gradient text on hero headline (`Track Your Impact`)
- `animate-pulse` on the beta badge dot
- `group-hover:scale-110` on feature card emoji icons
- `group-hover:scale-105` on stat card icons
- Ring accent (`ring-2 ring-brand-50`) on referral table avatar circles
- Proper `active:` states on all interactive elements

---

## Prompts Used

### Architecture planning
```
Plan a complete Next.js 14 web application with these requirements:
1. User management: sign up, sign in, sign out
2. Referral system: each user gets a unique referral code/link
3. Track referral link clicks and conversions (who signed up via which link)
4. Dashboard showing conversion rate analytics attributed to referring friend
[...tech stack and constraints...]
```

### Skill execution
Each skill was invoked by describing the skill's name and directory, asking the agent to:
1. Read all rule files in `.agents/skills/<name>/`
2. Audit the relevant source files
3. Apply warranted fixes
4. Run `npm run lint:fix` (and `npm test` for backend skills)

---

## Bugs Fixed During Development

1. **jsdom/Node environment mismatch** — `jose`'s `Uint8Array` instance check fails in jsdom. Fixed by adding `environmentMatchGlobs` to vitest config so unit/integration tests run in Node environment, component tests in jsdom.

2. **bcryptjs hash prefix** — bcryptjs generates `$2a$` hashes, not `$2b$`. Fixed test assertion to use regex `/^\$2[ab]\$/`.

3. **Loading state bug in sign-out** — `setLoading(false)` was never called after `router.push()` navigation, leaving the button permanently disabled. Fixed by migrating to `useTransition` (state managed automatically).

4. **Unsafe email split** — `email.split("@")` destructuring produced `undefined` for `domain` when input has no `@`. Fixed with `indexOf`/`slice` approach across all `maskEmail` usages.

---

## Files Generated / Modified by AI

All files in this repository were written or substantially modified with AI assistance. Key files created from scratch:
- All `src/` application code
- All `tests/` test files
- `prisma/schema.prisma` and `prisma/seed.ts`
- Configuration files (Biome, Vitest, Tailwind, Prisma, Next.js)
- `src/app/robots.ts` and `src/app/sitemap.ts`
- This README and these AI notes

---

## External Libraries Cited

| Library | Purpose |
|---------|---------|
| `next` | Full-stack React framework |
| `@prisma/client` + `prisma` | Type-safe ORM |
| `jose` | JWT signing/verification (Web Crypto API) |
| `bcryptjs` | Password hashing |
| `@biomejs/biome` | Linting + formatting |
| `vitest` | Test runner |
| `@testing-library/react` | Component testing |
| `@testing-library/jest-dom` | DOM matchers |
| `tailwindcss` | Utility-first CSS |
