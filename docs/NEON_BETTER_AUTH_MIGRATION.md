# SmartTrade Neon + Better Auth migration

## Implemented on `neon-better-auth-api`

- Expo SDK 54 / React Native 0.81 / Expo Router 6 client uses self-hosted Better Auth through the Expo plugin and SecureStore.
- Server-side Better Auth handler is mounted at `/api/auth/[...all]`.
- Product, sales, dashboard, profile and private-storage URL APIs authenticate the Better Auth session on the server.
- Business API transactions set transaction-local `app.user_id` and execute against RLS-protected business tables.
- `smarttrade_app` is a restricted login role: no superuser, role/database creation, RLS bypass, public-schema CREATE or inherited privileged role.
- `smarttrade_auth` is a separate restricted login role. It can perform CRUD on the Better Auth `user`, `account`, `session` and `verification` tables and cannot read the checked business tables.
- Server-side Better Auth uses the public `user`, `account`, `session` and `verification` tables. The separate `neon_auth` schema belongs to Neon Managed Auth and is not the target of this self-hosted Better Auth configuration.
- Local SQLite database names are scoped to the signed-in user. Local sale, stock decrement and outbox insertion run in one SQLite transaction.
- Server sale creation locks the product row, checks stock, decrements inventory and inserts the sale atomically.
- Offline sale replay is idempotent by sale ID; server cost price is derived from the owned product rather than trusted from the client.
- Offline product sync rejects an ID conflict owned by another account rather than falsely acknowledging it.
- Manual stock changes are represented as deltas in the immutable inventory-adjustment ledger. The sync endpoint applies them idempotently, and the direct product PATCH API now records the stock delta in the same transaction as the product update.
- Business and auth database connection strings are separate required environment variables. The code does not fall back to the generic `DATABASE_URL`.
- GitHub Actions verifies dependency installation, TypeScript and Expo web export. The latest run for the current branch head passed all three steps.

## Production database audit findings

The production Neon database is `smarttrade` on branch `br-red-unit-ba6pu440`.

- RLS policies for `products`, `sales`, `smarttrade_profiles` and `inventory_adjustments` scope business records to `smarttrade_app` and the transaction-local user ID.
- `smarttrade_current_user_id()` reads the transaction-local `app.user_id` setting. API code must set it and perform all protected queries on the same checked-out transaction connection.
- `smarttrade_app` has no RLS bypass, no public-schema CREATE privilege and no inherited privileged role.
- `smarttrade_auth` has no public-schema CREATE privilege, no RLS bypass and no access to the checked business tables.
- The legacy `user_profiles` table still has UUID user IDs and policies based on Supabase `auth.uid()`. These policies are not compatible with self-hosted Better Auth text user IDs.
- The old `authenticated` role retains legacy grants on business tables and `user_profiles`. It is a no-login role, but these grants and policies must be retired as part of a controlled Supabase cleanup after confirming there are no remaining consumers.
- Production Vercel has a `SMARTTRADE_DATABASE_URL` entry targeted to Production and a separate Production `BETTER_AUTH_DATABASE_URL` entry. Role permissions were tested directly in Neon; the masked Vercel secret values were not decrypted in this audit.
- No source Supabase export or credentials were available in this workstream. No customer, product or sales data has been migrated.

## Remaining production blockers

1. Prove the Production `BETTER_AUTH_DATABASE_URL` value authenticates specifically as `smarttrade_auth` using a runtime auth smoke test. The Vercel value is masked, so the exact role mapping cannot be proven from environment metadata alone.
2. Verify auth schema indexes, uniqueness constraints, signup, login, session persistence, logout and password reset. Password reset is unavailable until an email delivery provider is configured.
3. Resolve the legacy `user_profiles.user_id` UUID model deliberately. Do not cast arbitrary Better Auth IDs or drop legacy rows.
4. Verify offline sync edge cases under runtime tests: cross-account ID collisions, duplicate requests, sale replay, product deletion, concurrent sales, manual stock adjustments and account switching.
5. Test private object storage upload/download authorization, content-type and size restrictions, object-key ownership and credential scope.
6. Confirm the production API deployment works with the dedicated environment variables before any data cutover.
7. Only after auth, RLS, offline sync, storage and migration tests pass should Supabase be removed and production data cut over.

## Deployment guardrails

- Keep `DATABASE_URL` out of application fallback logic. Use only `SMARTTRADE_DATABASE_URL` for business APIs and `BETTER_AUTH_DATABASE_URL` for Better Auth.
- Never expose database connection strings, auth secrets or storage credentials to Expo client variables.
- Do not point self-hosted Better Auth at Neon Managed Auth's `neon_auth` schema.
- Do not remove legacy Supabase policies, roles or tables until their dependencies and data have been reconciled.
- Do not merge or deploy this migration branch based only on dependency installation or lockfile checks.
