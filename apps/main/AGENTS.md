# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains the Next.js App Router routes, layouts, and page entry points (e.g., `app/page.tsx`).
- `components/` holds shared UI building blocks; `components/ui/` is used for reusable primitives.
- `hooks/` and `lib/` store React hooks and shared utilities.
- `public/` contains static assets served at the site root.
- `workflows/` holds workflow definitions used by the app.
- `drizzle.config.ts` configures the database layer; `scripts/` contains local tooling.

## Build, Test, and Development Commands
- `npm run dev`: start the Next.js dev server at `http://localhost:3000`.
- `npm run dev:https`: run the dev server with experimental HTTPS (uses local certs).
- `npm run build`: generate the production build.
- `npm run start`: serve the production build locally.
- `npm run lint`: run ESLint with zero warnings allowed.
- `npm run check-types`: generate Next.js types and run `tsc --noEmit`.
- `npm run db:generate`: generate Drizzle migrations.
- `npm run db:migrate`: apply Drizzle migrations.
- `npm run db:studio`: open the Drizzle Studio UI.

## Coding Style & Naming Conventions
- Use TypeScript and React conventions; prefer `.tsx` for components and `.ts` for utilities.
- Follow existing file formatting and rely on ESLint (`eslint.config.js`) as the source of truth.
- Use the `@/*` path alias for imports (e.g., `@/components/ui/button`).
- Route folders in `app/` are lowercase and descriptive (e.g., `app/onboarding`).

## Testing Guidelines
- There is no dedicated test runner in `package.json` yet.
- If adding tests, keep them close to the feature (e.g., `components/__tests__/...`) and document the new command in this file.

## Commit & Pull Request Guidelines
- Recent commit history favors short, present-tense messages (e.g., "update sidebar").
- Include issue references when relevant (e.g., `(#3)`). Avoid landing PRs with only "wip" messages.
- PRs should include a brief summary, test notes, and screenshots or recordings for UI changes.

## Configuration & Environment
- Local configuration lives in `.env`; keep secrets out of source control.
- If using `dev:https`, ensure local certificates are configured under `certificates/`.
