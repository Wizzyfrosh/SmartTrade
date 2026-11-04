import * as Network from "expo-network";
import { apiFetch } from "../auth/api";
import { dbService } from "../database/sqlite.service";
import type { OutboxItem } from "../../types";

type SyncResult = {
  synced: number;
  failed: number;
  pending: number;
  offline: boolean;
};

let activeSync: { userId: string; promise: Promise<SyncResult> } | null = null;

export const syncService = {
  syncNow(userId: string): Promise<SyncResult> {
    if (!userId) return Promise.reject(new Error('A signed-in user is required to synchronize local data'));
    if (activeSync) {
      if (activeSync.userId === userId) return activeSync.promise;
      return activeSync.promise.catch(() => undefined).then(() => this.syncNow(userId));
    }
    const promise = this.runSync(userId);
    const tracked = promise.finally(() => {
      if (activeSync?.promise === tracked) activeSync = null;
    });
    activeSync = { userId, promise: tracked };
    return tracked;
  },

  async runSync(userId: string): Promise<SyncResult> {
    if (!userId) throw new Error('A signed-in user is required to synchronize local data');
    await dbService.init(userId);
    const network = await Network.getNetworkStateAsync();
    if (network.isConnected === false || network.isInternetReachable === false) {
      return {
        synced: 0,
        failed: 0,
        pending: await dbService.getPendingOutboxCount(),
        offline: true,
      };
    }

    let synced = 0;
    let failed = 0;
    const pending = await dbService.getOutboxItems();

    for (let offset = 0; offset < pending.length; offset += 50) {
      const batch = pending.slice(offset, offset + 50);
      const response = await apiFetch("/api/sync", {
        method: "POST",
        body: JSON.stringify({
          items: batch.map((item: OutboxItem) => ({
            id: item.id,
            entityType: item.entityType,
            entityId: item.entityId,
            operation: item.operation,
            payload: JSON.parse(item.payload),
          })),
        }),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(body?.results)) {
        // A transport or authentication failure should stop this run. Keep
        // every queued record intact so the next authenticated run can retry.
        throw new Error(body?.error || "Could not synchronize offline changes");
      }

      const byId = new Map<string, { status: string; error?: string }>(
        body.results.map((result: any) => [String(result.id), result]),
      );
      for (const item of batch) {
        const result = byId.get(item.id);
        if (result?.status === "synced") {
          await dbService.acknowledgeOutboxItem(item);
          synced += 1;
        } else {
          await dbService.recordOutboxFailure(item.id, result?.error || "No successful acknowledgement from server");
          failed += 1;
        }
      }
    }

    return {
      synced,
      failed,
      pending: await dbService.getPendingOutboxCount(),
      offline: false,
    };
  },
};
