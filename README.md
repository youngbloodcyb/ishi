# SaaS Starter Template

A modern, full-stack SaaS starter template built with Next.js, TypeScript, and Tailwind CSS. Includes authentication, database, team management, and a marketing site — everything you need to ship your product faster.

## Tech Stack

- **Framework:** Next.js 16 with App Router, React 19, TypeScript 5.9
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **Auth:** WorkOS AuthKit
- **UI:** Tailwind CSS 4, Radix UI, shadcn/ui, Framer Motion
- **Jobs:** Vercel Workflows for async processing

## Monorepo Structure

```
apps/
  main/     # Core application (Next.js)
  web/      # Marketing site with Velite MDX content
  docs/     # Internal documentation
packages/
  ui/                   # Shared UI components
  eslint-config/        # Shared ESLint configs
  typescript-config/    # Shared TypeScript configs
```

## Features

### Main App (`apps/main`)
- **Authentication:** WorkOS AuthKit with login, logout, and session management
- **Organizations:** Multi-tenant support with organization switching
- **Team Management:** Invite team members, manage roles (owner, admin, member)
- **Database:** PostgreSQL with Drizzle ORM, migrations included
- **UI Components:** shadcn/ui components pre-configured
- **Workflows:** Vercel Workflows setup for background jobs

### Marketing Site (`apps/web`)
- **MDX Content:** Blog and documentation with Velite
- **Landing Page:** Hero, features, pricing, testimonials sections
- **Contact Form:** Ready-to-use contact form
- **Dark Mode:** Theme switching support
- **Animations:** Smooth scroll reveals and transitions

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL database (or Neon account)
- WorkOS account

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd <your-repo-name>

# Install dependencies
pnpm install
```

### Environment Setup

Copy the example environment files and fill in your values:

```bash
# Main app
cp apps/main/.env.example apps/main/.env.local

# Web app
cp apps/web/.env.example apps/web/.env.local
```

Required environment variables for the main app:
- `DATABASE_URL` - PostgreSQL connection string
- `WORKOS_API_KEY` - WorkOS API key
- `WORKOS_CLIENT_ID` - WorkOS client ID
- `WORKOS_WEBHOOK_SECRET` - WorkOS webhook secret
- `NEXT_PUBLIC_WORKOS_REDIRECT_URI` - OAuth callback URL

### Database Setup

```bash
# Generate migrations (if schema changed)
pnpm --filter main db:generate

# Apply migrations
pnpm --filter main db:migrate
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

| App | Port | Description |
|-----|------|-------------|
| Main | [localhost:3000](http://localhost:3000) | Core application with auth and dashboard |
| Web | [localhost:3001](http://localhost:3001) | Marketing site and blog |

## Customization

1. **Branding:** Update logos in `public/` directories and metadata in `layout.tsx` files
2. **Colors:** Modify the theme in `globals.css` or `tailwind.config.ts`
3. **Content:** Edit MDX files in `apps/web/content/` for blog and docs
4. **Database:** Add tables to `apps/main/lib/db/schema.ts` and generate migrations

## Deployment

This template is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy

## License

MIT
