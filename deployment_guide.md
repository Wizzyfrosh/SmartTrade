# SmartTrade Deployment Guide

SmartTrade is an Expo Router application built with React Native. The same app codebase supports Android, iOS, and the web.

## Requirements

- Node.js 22.x
- npm
- A Supabase project

## Run locally

Install dependencies:

```bash
npm ci
```

Start the native development server:

```bash
npm start
```

Start the web development server:

```bash
npm run web
```

Create the production web bundle:

```bash
npm run build:web
```

Expo exports the browser application into the `dist/` directory.

To preview the exported bundle locally, run:

```bash
npx serve dist
```

## Deploy to Vercel

The repository includes a root-level `vercel.json`. It configures Vercel to:

- Run `npm run build:web`
- Publish the `dist/` directory
- Use SPA rewrites so Expo Router URLs resolve when refreshed directly

Import the `Wizzyfrosh/SmartTrade` GitHub repository into Vercel. Keep the project root set to the repository root. Vercel should read the build and output settings from `vercel.json`.

For predictable builds, select Node.js 22.x in the Vercel project settings.

After the initial deployment, connect the production branch (normally `main`) so future pushes deploy automatically.

## Required environment variables

Add these in **Vercel → Project → Settings → Environment Variables** for Production, Preview, and Development:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

These values are required because authentication and application data are handled by Supabase. The Supabase publishable/anon key is intended for client applications; never add a Supabase service-role key to this app or expose it in client code.

After adding or changing environment variables, trigger a new deployment so the values are included in the web bundle.

For mobile EAS builds, configure the same two variables in the EAS environment used by the build profile.

## Authentication callback configuration

After the Vercel production URL is known, add that URL to the allowed redirect URLs in the Supabase Authentication URL configuration. Configure the Google provider's web OAuth client and allowed redirect URI in Supabase/Google Cloud before relying on Google sign-in in browsers.

## Important

- Do not commit `.env` files or credentials to GitHub.
- Do not use the Supabase service-role key in the mobile or web application.
- Keep the existing Android and iOS build profiles in `eas.json`; the web export does not replace them.
