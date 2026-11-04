# SmartTrade Neon + Better Auth migration notes

## Current state

- Expo SDK 54 / React Native 0.81 / Expo Router 6. The current client still imports Supabase Auth and Supabase database/storage APIs.
- The Neon project contains a Better Auth-compatible schema in `public` (`user`, `account`, `session`, `verification`) and a separate Neon Managed Auth schema in `neon_auth`. The application migration is targeting self-hosted Better Auth; do not point Better Auth at `neon_auth`.
- Business tables currently include `products`, `sales`, and `smarttrade_profiles`. The latter uses text user IDs, which matches Better Auth's default text IDs. The older `user_profiles.user_id` is UUID and is not directly compatible with arbitrary Better Auth text IDs.
- Existing `products` and `sales` RLS policies for role `authenticated` call Neon Managed Auth functions (`auth.user_id()` / `auth.uid()`). Those policies do not authenticate self-hosted Better Auth sessions.
- Separate server-role policies exist for `smarttrade_app`, using `smarttrade_current_user_id()`. The API must authenticate the Better Auth session first, then set transaction-local `app.user_id` on the same database transaction before querying business rows.
- `create_sale_for_user` already locks the product row, checks stock, decrements inventory and inserts the sale atomically. Use this function from the server transaction; do not use the legacy `create_sale`, which depends on Neon Managed Auth.
- The app's local SQLite `createSale` currently performs sale insert, stock decrement and outbox insert as separate operations. This must be wrapped in a SQLite transaction before relying on offline sales.

## Routing change

The Vercel SPA rewrite now excludes `/api/` paths so future server API functions can receive requests instead of being rewritten to the Expo web entry point.

## Required implementation order

1. Add server-only Better Auth configuration and a Vercel catch-all auth handler. Keep `DATABASE_URL` and `BETTER_AUTH_SECRET` server-side only.
2. Add the Expo Better Auth client using the Expo plugin and SecureStore for native token/cookie persistence. Confirm SDK 54 compatibility before adding/upgrading native dependencies.
3. Replace login, signup, password reset, Google sign-in, and AuthContext Supabase usage. Do not remove Supabase dependencies until every import has been migrated and builds pass.
4. Implement authenticated API routes for products, sales, dashboard, profile, and private image upload. The API derives user ID from the verified session; never accept a trusted user ID from the request body.
5. Use one transaction per request for setting `app.user_id` via `set_config('app.user_id', $1, true)` and performing the corresponding RLS-protected query. Use a connection role with no RLS bypass.
6. Migrate or reconcile `user_profiles` with Better Auth text IDs before enabling those profile paths. Do not silently cast UUIDs or drop legacy rows.
7. Make local SQLite sale + stock + outbox writes atomic; add idempotency keys for outbox replay to prevent duplicate remote sales.
8. Verify private object storage signing and authorization before migrating image uploads. Do not expose storage credentials or public object URLs for private files.
9. Only after cross-platform auth, API, RLS, offline sync and image tests pass should Supabase be removed and production data cut over.

## Current blockers / cautions

- No Supabase export or source credentials have been supplied in this workstream, so no customer/product/sales data has been migrated.
- Better Auth schema presence does not prove the running auth handler is configured correctly. Confirm model/table naming and indexes with Better Auth's schema generator before first use.
- Existing Neon Managed Auth policies/functions must not be dropped as part of this incremental branch work. Remove or replace them only after confirming no other app depends on them.
- The Google OAuth button currently uses a Supabase ID-token flow. It must be replaced with Better Auth's supported social sign-in flow and verified redirect/deep-link configuration.
- Dependency lockfile must be updated together with `package.json`; do not add packages by editing only the manifest.
