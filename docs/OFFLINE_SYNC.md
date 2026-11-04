# SmartTrade offline synchronization

## Scope

The current offline path supports:
- Reading the last account-scoped product and sales cache.
- Recording a sale locally while offline.
- Decrementing local stock, inserting the local sale and writing its outbox event in one SQLite transaction.
- Sending queued sales to `POST /api/sync` after connectivity returns.
- Refreshing server product and sales caches without overwriting unsynced local rows.
- Manual retries from Settings and exponential retry backoff for background attempts.

Product creation, editing, deletion and private image uploads remain online-only. Do not describe all product mutations as offline-capable yet.

## Identity and isolation

- Each authenticated account gets a separate SQLite database filename.
- Every sync request includes the local account ID; the server compares it with the Better Auth session identity before processing the batch.
- The client never supplies the server's owner ID or database connection credentials.
- Each outbox item is processed in its own database transaction with RLS context set by the server.
- A sale uses its stable local sale ID as an idempotency key. The server takes a transaction-scoped advisory lock, checks for an existing sale, locks the owned product and calculates cost/profit from the server's product record.
- The server returns per-item results. The client only deletes an outbox record after a successful acknowledgement.

## Retry behaviour

Failed items remain in SQLite with a bounded error message and exponential retry delay, capped at one hour. A manual Sync now action clears the delay so the user can retry immediately. The pending count includes deferred items, not only items eligible for the current automatic attempt.

## Conflict handling

A server stock conflict is not silently overwritten. The sale remains in the local queue and Settings reports that synchronization needs attention. The user should reconcile the stock discrepancy before retrying. Do not automatically change a failed sale quantity or silently discard the sale.

## Required verification before production

1. Create a product online, sign out, sign in as a second user and verify the first user's products and sales are not visible.
2. Load products, turn off connectivity, record a sale, force-close the app, reopen it and confirm the sale and stock decrement remain.
3. Reconnect and verify the sale appears exactly once on the server and stock is decremented exactly once.
4. Simulate a timeout after the server commits but before the client receives the response; retry and confirm the same sale ID is returned without a second decrement.
5. Record two offline sales against the same cached stock and verify server stock constraints reject over-selling without deleting the local records.
6. Change accounts while a sync is pending and verify the account-ID guard rejects any batch whose local account does not match the authenticated session.
7. Verify manual retry, exponential backoff, local deletion and image-key caching.
8. Test the browser build in a secure context. Confirm `crossOriginIsolated` is true, `SharedArrayBuffer` exists and the SQLite WASM file loads.

## Known limitations

- Offline product create/edit/delete workflows are not complete.
- Product image files themselves are not cached offline; only private object keys are stored locally.
- Conflict resolution is manual. There is no merge UI or server-side product revision history yet.
- Background sync currently runs on app start, app resume and network reconnection; it is not a guaranteed OS background task.
- A user must be authenticated to synchronize queued data.
- Expo SQLite web support is alpha and requires Metro WASM asset handling plus cross-origin isolation headers.
