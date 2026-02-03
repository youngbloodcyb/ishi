# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Outr is an Outreach AI auto-sequencer that creates Outreach sequences with AI-generated personalized email copy. Users create campaigns, define prompts, and assign sending mailboxes. AI-generated emails land in their Outreach tasks queue ready for review/send.

## Commands

### Root (Turbo monorepo)
```bash
pnpm dev          # Start all dev servers
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm check-types  # Type check all packages
pnpm format       # Format with Prettier
```

### Main App (apps/main)
```bash
pnpm dev              # Next.js dev server at localhost:3000
pnpm dev:https        # Dev with HTTPS (requires certs in certificates/)
pnpm lint             # ESLint (zero warnings enforced)
pnpm check-types      # Next.js typegen + tsc --noEmit
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Apply migrations
pnpm db:studio        # Open Drizzle Studio UI
pnpm db:seed          # Seed database with test data
```

### Environment Files
```
.env.local            # Local development (used by default)
.env.production       # Production environment
```

### Web App (apps/web)
```bash
pnpm dev    # Velite watch + Next.js dev at localhost:3001
```

## Architecture

### Monorepo Structure
- `apps/main` - Core Outr application (Next.js 16, App Router)
- `apps/web` - Marketing site with Velite MDX content
- `apps/docs` - Internal documentation
- `packages/ui` - Shared UI components
- `packages/eslint-config` - Shared ESLint configs
- `packages/typescript-config` - Shared TypeScript configs

### Tech Stack
- **Framework:** Next.js 16 with App Router, React 19, TypeScript 5.9
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **Auth:** WorkOS AuthKit
- **UI:** Tailwind CSS 4, Radix UI, shadcn/ui, Framer Motion
- **AI:** AI SDK with Vercel AI Gateway
- **Jobs:** Vercel Workflows for async processing

### Key Directories (apps/main)
- `app/` - Next.js App Router pages and API routes
- `components/ui/` - shadcn/ui primitives
- `lib/db/` - Drizzle schema and migrations
- `lib/services/` - Server actions with `"use server"` directive
- `lib/outreach.ts` - Outreach API client
- `lib/models.ts` - AI model configuration
- `workflows/` - Vercel Workflow definitions

### Database Schema
Key tables in `lib/db/schema.ts`:
- `users`, `organizations`, `organizationMembers` - WorkOS-synced identity
- `outreachConnections` - OAuth tokens linking users to Outreach
- `campaigns` - Campaign config with JSONB data column
- `contactJobs` - Async contact processing queue
- `prompts`, `promptVersions` - Reusable prompts with version history

### Authentication Pattern
Server actions use `withAuth` from WorkOS AuthKit:
```typescript
"use server";
import { withAuth } from "@workos-inc/authkit-nextjs";

export async function someAction() {
  const { user } = await withAuth({ ensureSignedIn: true });
  if (!user) throw new Error("Not authenticated");
  // user.id is the WorkOS user ID
}
```

### Vercel Workflows
Workflows use special directives for durable execution:
```typescript
export async function workflowProcessContact(params) {
  "use workflow";  // Marks function as a workflow
  await stepOne();
}

const stepOne = async () => {
  "use step";      // Marks function as a durable step
  // Step logic...
};
```

### JSONB Typed Columns
Schema uses typed JSONB for flexible data storage:
```typescript
data: jsonb("data").notNull().$type<CampaignData>()
```

### Outreach Integration
- OAuth flow stores tokens in `outreachConnections` table
- Custom fields: `custom80` (subject), `custom81-90` (email bodies)
- Token auto-refresh when expiring within 5 minutes

## Conventions

- Path alias `@/*` maps to root directory
- Route folders are lowercase (e.g., `app/onboarding`)
- Use `.tsx` for components, `.ts` for utilities
- Commits: short, present-tense (e.g., "update sidebar")
- Include issue references when relevant (e.g., `(#3)`)
