# Outr Main App

Core Outr application - Next.js 16 with App Router.

## Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL database (Neon recommended)
- WorkOS account for authentication
- Outreach account for integration

## Environment Setup

Create `.env.local` with:

```env
DATABASE_URL=           # PostgreSQL connection string
WORKOS_API_KEY=         # WorkOS API key
WORKOS_CLIENT_ID=       # WorkOS client ID
WORKOS_COOKIE_PASSWORD= # 32+ character secret
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback
OUTREACH_CLIENT_ID=     # Outreach OAuth client ID
OUTREACH_CLIENT_SECRET= # Outreach OAuth client secret
EXA_API_KEY=            # Exa API key for company research
```

## Development

```bash
pnpm dev              # Start dev server at localhost:3000
pnpm dev:https        # Dev with HTTPS (requires certs in certificates/)
pnpm lint             # ESLint (zero warnings enforced)
pnpm check-types      # Type check with Next.js typegen
```

## Database

```bash
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Apply migrations
pnpm db:studio        # Open Drizzle Studio UI
pnpm db:seed          # Seed database with test data
```

## Project Structure

```
app/              # Next.js App Router pages and API routes
components/       # React components
  ui/             # shadcn/ui primitives
lib/
  db/             # Drizzle schema and migrations
  services/       # Server actions
  outreach.ts     # Outreach API client
  models.ts       # AI model configuration
workflows/        # Vercel Workflow definitions
```
