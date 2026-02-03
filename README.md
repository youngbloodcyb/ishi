# Outr

Outreach AI auto-sequencer that creates Outreach sequences with AI-generated personalized email copy. Users create campaigns, define prompts, and assign sending mailboxes. AI-generated emails land in their Outreach tasks queue ready for review/send.

## Tech Stack

- **Framework:** Next.js 16 with App Router, React 19, TypeScript 5.9
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **Auth:** WorkOS AuthKit
- **UI:** Tailwind CSS 4, Radix UI, shadcn/ui, Framer Motion
- **AI:** AI SDK with Vercel AI Gateway
- **Jobs:** Vercel Workflows for async processing

## Monorepo Structure

```
apps/
  main/     # Core Outr application (Next.js)
  web/      # Marketing site with Velite MDX content
  docs/     # Internal documentation
packages/
  ui/                   # Shared UI components
  eslint-config/        # Shared ESLint configs
  typescript-config/    # Shared TypeScript configs
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev          # Start all dev servers
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm check-types  # Type check all packages
pnpm format       # Format with Prettier
```

## Apps

- **Main App** (`apps/main`): Core application at [localhost:3000](http://localhost:3000) - see [apps/main/README.md](apps/main/README.md)
- **Web** (`apps/web`): Marketing site at [localhost:3001](http://localhost:3001)
