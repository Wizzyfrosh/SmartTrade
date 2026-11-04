# SmartTrade Neon + Better Auth migration

## Implemented on `neon-better-auth-api`

- Expo SDK 54 / React Native 0.81 / Expo Router 6 client uses self-hosted Better Auth through the Expo plugin and SecureStore.
- Server-side Better Auth handler is mounted at `/api/auth/[...all]`.
- Product, sales, dashboard, profile and private-storage URL APIs authenticate the Better Auth session on the server.
- Business API transactions set transaction-local `app.user_id` and execute against RLS-protected business tables.
- The `smarttrade_app` role is a login role with no superuser, role-creation, database-creation or RLS-bypass privileges. It is not a member of another privileged role.
- Server-side Better Auth uses the public `user`, `account`, `session` and `verification` tables. The separate `neon_auth` schema belongs to Neon Managed Auth and is not the target of this self-hosted Better Auth configuration.
- Local SQLite database names are scoped to the signed-in user. Local sale, stock decrement and outbox insertion run in one SQLite transaction.
- Server sale creation locks the product row, checks stock, decrements inventory and inserts the sale atomically.
- Offline sale replay is idempotent by sale ID; server cost price is derived from the owned product rather than trusted from the client.
- Offline product sync now rejects an ID conflict owned by another account rather than falsely acknowledging it.
- Business and auth database connection strings are now separate required environment variables. The code no longer falls back to the generic `DATABASE_URL`.
- A GitHub Actions verification workflow has been added for dependency installation, TypeScript checking and Expo web export.

## Production database audit findings

The production Neon database is `smarttrade` on branch `br-red-unit-ba6pu440`.

- RLS policies for `products`, `sales` and `smarttrade_profiles` target `smarttrade_app` and use `user_id = smarttrade_current_user_id()` for both row visibility and writes.
- `smarttrade_current_user_id()` reads the transaction-local `app.user_id` setting. API code must continue to set it and perform all protected queries on the same checked-out transaction connection.
- `smarttrade_app` has no RLS bypass and no inherited privileged role in the inspected production role catalog.
- The legacy `user_profiles` table still has UUID user IDs and policies based on Supabase `auth.uid()`. These policies are not compatible with self-hosted Better Auth text user IDs.
- The old `authenticated` role retains legacy grants on business tables and `user_profiles`. It is a no-login role, but these grants and policies must be retired as part of a controlled Supabase cleanup after confirming there are no remaining consumers.
- `smarttrade_auth` is a separate login role. Its privileges and schema/table scope still require a final least-privilege review before production environment configuration.
- The production `SMARTTRADE_DATABASE_URL` Vercel variable was not present during the audit. Do not deploy the strict connection change until the app-role connection string is configured.
- No source Supabase export or credentials were available in this workstream. No customer, product or sales data has been migrated.

## Remaining production blockers

1. Provision and verify a least-privilege `smarttrade_app` connection for `SMARTTRADE_DATABASE_URL`.
2. Verify the `smarttrade_auth` connection can access only the Better Auth tables it needs, and cannot access business records.
3. Verify auth schema indexes, uniqueness constraints, signup, login, session persistence, logout and password reset. Password reset is currently unavailable until an email delivery provider is configured.
4. Resolve the legacy `user_profiles.user_id` UUID model deliberately. Do not cast arbitrary Better Auth IDs or drop legacy rows.
5. Resolve offline stock adjustment semantics. Product update replay currently does not apply the queued `stockQuantity` field on conflict. This avoids blindly overwriting stock after concurrent sales, but it also means an offline manual stock adjustment can be acknowledged without being applied remotely. Implement a server-authoritative stock-adjustment event/delta with idempotency and concurrency tests; do not simply restore an absolute stock overwrite.
6. Verify all offline sync edge cases: cross-account ID collisions, duplicate requests, sale replay, product deletion, concurrent sales, manual stock adjustments and account switching.
7. Test private object storage upload/download authorization, content-type and size restrictions, object-key ownership and credential scope.
8. Run the verification workflow and resolve any failures. The earlier lockfile-only workflow success is not evidence of a successful application build.
9. Only after auth, RLS, offline sync, storage and migration tests pass should Supabase be removed and production data cut over.

## Deployment guardrails

- Keep `DATABASE_URL` out of application fallback logic. Use only `SMARTTRADE_DATABASE_URL` for business APIs and `BETTER_AUTH_DATABASE_URL` for Better Auth.
- Never expose database connection strings, auth secrets or storage credentials to Expo client variables.
- Do not point self-hosted Better Auth at Neon Managed Auth's `neon_auth` schema.
- Do not remove legacy Supabase policies, roles or tables until their dependencies and data have been reconciled.
- Do not merge or deploy this migration branch based only on dependency installation or lockfile checks.
