# SmartTrade Deployment Guide

SmartTrade is an Expo Router application built with React Native. The application codebase targets web, Android, and iOS. Vercel hosts the web export and the server-side API routes; Neon provides PostgreSQL and private object storage; Better Auth is self-hosted on the API.

## Requirements

- Node.js 22.x
- npm
- A Neon project and private Object Storage bucket
- A Vercel project with Node.js Functions enabled

## Run locally

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm start
```

Start web development:

```bash
npm run web
```

Build the web export:

```bash
npm run build:web
```

Expo exports the browser application into `dist/`.

## Neon setup

Use the dedicated SmartTrade Neon project in `eu-central-1` and the `smarttrade` database.

The backend uses two separate PostgreSQL roles:

- `smarttrade_app`: inventory, sales, and user-scoped business data.
- `smarttrade_auth`: Better Auth users, sessions, accounts, and verification records.

The application connects through server-side Vercel Functions. Never connect to PostgreSQL directly from Expo client code.

The private object bucket is named `smarttrade-private`. Upload and download URLs are generated server-side and expire quickly.

The SQL source migrations are in `database/neon/`. They describe a fresh database setup; do not rerun the initial schema migration against an already populated database.

## Required Vercel environment variables

Set these on the Vercel project:

### Encrypted server-only variables

- `DATABASE_URL` — pooled Neon connection string using the `smarttrade_app` role.
- `BETTER_AUTH_DATABASE_URL` — pooled Neon connection string using the `smarttrade_auth` role.
- `BETTER_AUTH_SECRET` — high-entropy secret used by Better Auth.
- `AWS_ACCESS_KEY_ID` — scoped Neon Object Storage credential ID.
- `AWS_SECRET_ACCESS_KEY` — scoped Neon Object Storage secret.

### Server configuration

- `BETTER_AUTH_URL` — canonical API origin for the current environment.
- `AWS_ENDPOINT_URL_S3` — Neon Object Storage S3 endpoint for this branch.
- `AWS_REGION` — `eu-central-1`.
- `NEON_STORAGE_BUCKET` — `smarttrade-private`.

### Expo public configuration

- `EXPO_PUBLIC_API_URL` — API origin used by web, Android, and iOS clients.

Only values prefixed with `EXPO_PUBLIC_` are bundled into the client. Never use that prefix for database URLs, Better Auth secrets, or storage credentials.

For a Vercel preview, `EXPO_PUBLIC_API_URL` and `BETTER_AUTH_URL` must point to the matching preview API origin. Production values must point to the production domain. The Neon database and storage credentials remain server-only.

## Optional Google OAuth

Google sign-in remains disabled until both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are configured on the server and the callback URL is registered with Google Cloud.

Set `EXPO_PUBLIC_GOOGLE_AUTH_ENABLED=true` only after the provider is configured and tested. Email/password authentication is available independently.

## Mobile builds

The native apps use the same Vercel API. Configure only `EXPO_PUBLIC_API_URL` in the EAS build environment. Do not place PostgreSQL or Object Storage credentials in EAS client build variables.

The app scheme is `smarttrade://`; it must remain listed in Better Auth trusted origins.

## Deployment

Vercel is configured to:

- Run `npm run build:web`.
- Publish `dist/`.
- Keep `/api/*` requests routed to Vercel Functions.
- Serve Expo Router client routes through the SPA fallback.

The current Vercel project is not connected to the GitHub repository for automatic deployments. Until Git integration is connected, deploy the intended branch explicitly from Vercel.

## Known migration limitations

- Existing Supabase user accounts, passwords, records, and files have not been imported. The source Supabase project or a complete export is required to migrate that data. Password hashes generally cannot be transferred directly into Better Auth.
- Password-reset email delivery is not configured yet.
- Google OAuth is disabled until the client secret and callback setup are provided.
- Run the web preview and native Android/iOS smoke tests before promoting the migration branch to production.
