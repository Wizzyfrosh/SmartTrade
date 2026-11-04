# SmartTrade offline synchronization

## Scope

The current offline path supports:
- Reading the last account-scoped product and sales cache.
- Recording a sale locally while offline.
- Decrementing local stock, inserting the local sale and writing its outbox event in one SQLite transaction.
- Sending queued sales, product metadata changes and inventory adjustment events to `POST /api/sync` after connectivity returns.
- Refreshing server product and sales caches without overwriting unsynced local rows.
- Manual retries from Settings and exponential retry backoff for background attempts.

Product create/edit/delete and private image uploads are not yet a supported offline user workflow. The sync protocol can now represent metadata changes and stock adjustments separately, but the product UI must not be advertised as fully offline-capable until its conflict/recovery flow is tested.

## Identity and isolation

- Each authenticated account gets a separate SQLite database filename.
- Every sync request includes the local account ID; the server compares it with the Better Auth session identity before processing the batch.
- The client never supplies the server's owner ID or database connection credentials.
- Each outbox item is processed in its own database transaction with RLS context set by the server.
- A sale uses its stable local sale ID as an idempotency key. The server takes a transaction-scoped advisory lock, checks for an existing sale, locks the owned product and calculates cost/profit from the server's product record.
- Product metadata updates never overwrite the server's stock quantity.
- A manual stock change is emitted as a separate immutable `stock_adjustment` event with a stable outbox ID and signed integer delta. The server inserts the event and applies the delta to the owned product in the same transaction. Replaying the same event ID does not apply the delta twice.
- Stock adjustments that would make server stock negative are rejected; their outbox records remain pending for reconciliation.
- The server returns per-item results. The client only deletes an outbox record after a successful acknowledgement.

## Retry behaviour

Failed items remain in SQLite with a bounded error message and exponential retry delay, capped at one hour. A manual Sync now action clears the delay so the user can retry immediately. The pending count includes deferred items, not only items eligible for the current automatic attempt.

## Conflict handling

A server stock conflict is not silently overwritten. The sale remains in the local queue and Settings reports that synchronization needs attention. The user should reconcile the stock discrepancy before retrying. Do not automatically change a failed sale quantity or silently discard the sale.

## Inventory adjustment schema

The migration `database/migrations/20261104_inventory_adjustments.sql` creates `public.inventory_adjustments`, enables row-level security, and scopes rows to `smarttrade_app` through the transaction-local `app.user_id` setting. The migration is committed to the branch but has **not** been applied to production. Apply it only through the reviewed migration process after confirming the production role grants and backup/rollback plan.

## Required verification before production

1. Create a product online, sign out, sign in as a second user and verify the first user's products and sales are not visible.
2. Load products, turn off connectivity, record a sale, force-close the app, reopen it and confirm the sale and stock decrement remain.
3. Reconnect and verify the sale appears exactly once on the server and stock is decremented exactly once.
4. Simulate a timeout after the server commits but before the client receives the response; retry and confirm the same sale ID is returned without a second decrement.
5. Record two offline sales against the same cached stock and verify server stock constraints reject over-selling without deleting the local records.
6. Make a manual stock adjustment offline, sync it twice with the same event ID and verify the server applies the delta exactly once.
7. Attempt a negative adjustment that would take stock below zero and verify the server rejects it while preserving the local event.
8. Run a sale and a manual adjustment concurrently from separate devices and verify row locking produces a consistent final stock quantity.
9. Change accounts while a sync is pending and verify the account-ID guard rejects any batch whose local account does not match the authenticated session.
10. Verify manual retry, exponential backoff, local deletion and image-key caching.
11. Test the browser build in a secure context. Confirm `crossOriginIsolated` is true, `SharedArrayBuffer` exists and the SQLite WASM file loads.

## Known limitations

- Offline product create/edit/delete workflows are not complete, and no conflict-resolution UI exists for failed inventory adjustments.
- Product image files themselves are not cached offline; only private object keys are stored locally.
- Conflict resolution is manual. There is no merge UI or server-side product revision history yet.
- Background sync currently runs on app start, app resume and network reconnection; it is not a guaranteed OS background task.
- A user must be authenticated to synchronize queued data.
- Expo SQLite web support is alpha and requires Metro WASM asset handling plus cross-origin isolation headers.
