# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "おかずNavi" (Okazu Navi), a Next.js-based adult content affiliate site that aggregates and displays doujinshi (adult comics) rankings, new releases, and recommendations. The site focuses on providing purchasing recommendations for legitimate content to compete with illegal upload sites.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Hono.js API routes, deployed on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **UI**: Tailwind CSS, shadcn/ui components, Radix UI
- **State Management**: Jotai for client state, TanStack Query for server state
- **External APIs**: DMM (Digital Media Mart) API for content data
- **Deployment**: Cloudflare Workers via OpenNext

## Key Development Commands

```bash
# Development server with hot reload
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm typecheck

# Linting and formatting
pnpm lint     # Check with Biome
pnpm fix      # Auto-fix with Biome

# Testing
pnpm test           # Run tests once
pnpm test:watch     # Watch mode

# Database migrations
pnpm migrate:generate     # Generate migration files
pnpm migrate:local       # Apply migrations locally
pnpm migrate:prod        # Apply migrations to production

# API schema generation
pnpm schema:generate     # Generate API client from TypeSpec

# Deployment
pnpm deploy    # Deploy to Cloudflare
pnpm preview   # Preview deployment locally
```

## Architecture Overview

### Database Structure
- **Core entities**: Works (doujinshi), Makers (creators), Genres, Series
- **Scoring system**: Maker scoring based on historical performance
- **Relationship tables**: Many-to-many relationships between works and metadata

### API Layer
- **Hono.js** backend in `/src/server/hono/`
- **DMM API integration** in `/src/server/lib/dmmApi/`
- **Repository pattern** for data access in `/src/server/repositories/`
- **Service layer** for business logic in `/src/server/service/`

### Frontend Structure
- **App Router** with nested layouts
- **Server Components** for data fetching
- **Client Components** for interactivity
- **Error boundaries** for graceful error handling

## Important Conventions

### Navigation
- Use **pathpida** for type-safe routing: `pagesPath.doujinshi.works._workId(work.id).$url()`
- Convert to strings with `urlObjectToString()` for dynamic params

### UI Components
- Prefer **shadcn/ui** components over custom implementations
- Add new components via: `pnpm dlx shadcn@latest add [component]`
- Available components listed in `src/components/ui/`

### Database Operations
- Use **Drizzle ORM** for all database operations
- Repository pattern in `/src/server/repositories/`
- Migrations in `/drizzle/migrations/`

### State Management
- **TanStack Query** for server state and caching
- **Jotai** for client-side state (sessions, UI state)
- Session management without login (stateless sessions)

## Environment Setup

### Required Environment Variables
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_DATABASE_ID` 
- `CLOUDFLARE_D1_TOKEN`
- `DATABASE_URL` (for local development)

### Local Development Database
Use `pnpm ts:local` to run TypeScript files with local database access.

## Testing
- **Vitest** with React Testing Library
- **jsdom** environment for DOM testing
- Setup file: `src/test/vitest.setup.ts`

## Deployment
- **Cloudflare Workers** via OpenNext
- **D1 Database** for production data
- **Wrangler** for deployment and configuration