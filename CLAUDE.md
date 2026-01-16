# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

psql.sh is a browser-native PostgreSQL command-line client that provides a psql-like experience without installation. It leverages Neon's instant branching to create ephemeral databases for each session.

## Development Commands

```bash
# Run client and server in development (use separate terminals)
npm run dev:client    # Vite dev server for client
npm run dev:server    # tsx watch for server

# Production build
npm run build         # Builds client with Vite

# Start production server
npm start             # Runs server/main.ts

# Utility scripts
npm run tool:cleanup          # Clean up idle branches
npm run tool:uploadTemplates  # Upload template databases
```

## Required Environment Variables

- `NEON_API_KEY` - Neon API key for managing branches
- `NEON_PROJECT_ID` - The Neon project ID to create branches in
- `COOKIE_SECRET` - Secret for session encryption
- `CRON_SECRET` - Secret for Vercel cron job authentication (production)
- `PORT` - Server port (default: 3000)
- `BRANCHES_LIMIT` - Maximum concurrent branches (default: 1000)

## Architecture

### Client (`client/`)
- **Entry**: `main.ts` - Initializes `App` class and attaches to DOM
- **App** (`lib/app.ts`) - Main application orchestrator handling connection lifecycle, template selection, and query execution loop
- **TermWrapper** (`lib/termWrapper.ts`) - Custom terminal emulator with cursor management, command history, and SQL syntax highlighting
- **dbQuery** (`lib/dbQuery.ts`) - Query execution using `@neondatabase/serverless` Pool; handles backslash commands via `psql-describe` library
- **Table** (`lib/table.ts`) - ASCII table renderer for query results with responsive column widths
- **ApiClient** (`lib/api.ts`) - Typed HTTP client for server endpoints

### Server (`server/`)
- **app.ts** - Hono-based API with session middleware
  - `POST /api/issue-database` - Creates a Neon branch and returns connection string
  - `GET /api/templates` - Lists available database templates
  - `POST /api/text-to-sql` - AI-powered SQL generation via Neon's AI API
- **config.ts** - Zod-validated environment configuration
- **templates.ts** - Template branch name generation

### Vercel Deployment (`api/`)
- `[...all].ts` - Catch-all route wrapping Hono app with `hono/vercel`
- `cron/cleanup.ts` - Daily cron job to delete idle branches (non-template, non-default)

### Templates (`templates/db.ts`)
Database templates: Empty, Chinook, Pokemon, Netflix, pg_rag demo. Template branches are prefixed with `template/`.

## Key Patterns

- **Branch-per-session**: Each user gets an ephemeral Neon branch. Connection info stored in session.
- **Backslash commands**: Handled client-side using `psql-describe` library against live connection
- **AI SQL generation**: Uses `\ai <prompt>` syntax, proxied through server to Neon's AI API
- **Cleanup**: Idle endpoints on non-default, non-template branches are deleted by cron job

## Dependencies of Note

- `@neondatabase/serverless` - WebSocket-based Postgres driver for browsers
- `@neondatabase/api-client` - Neon management API client
- `psql-describe` - Implements psql backslash command introspection
- `hono` - Lightweight web framework (server)
- `hono-sessions` - Session middleware with in-memory store
