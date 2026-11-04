import { requireAuth } from "../../src/lib/require-auth";
import { withUserTransaction } from "../../src/lib/db";

function json(res: any, status: number, body: unknown) {
  res.status(status).json(body);
}

function number(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default async function handler(req: any, res: any) {
  const session = await requireAuth(req, res);
  if (!session) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  if (typeof req.body?.userId !== "string" || req.body.userId !== session.user.id) {
    return json(res, 403, { error: "Account changed. Sign in again before synchronizing local data." });
  }

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (items.length < 1 || items.length > 50) {
    return json(res, 400, { error: "Send between 1 and 50 outbox items" });
  }

  const results: Array<{ id: string; status: "synced" | "failed"; error?: string }> = [];
  for (const item of items) {
    const id = typeof item?.id === "string" ? item.id : "";
    const entityType = item?.entityType;
    const operation = item?.operation;
    const payload = item?.payload && typeof item.payload === "object" ? item.payload : null;
    if (!id || !payload || !["product", "sale"].includes(entityType) ||
        !["INSERT", "UPDATE", "DELETE"].includes(operation)) {
      results.push({ id, status: "failed", error: "Invalid outbox item" });
      continue;
    }

    try {
      await withUserTransaction(session.user.id, async (db) => {
        if (entityType === "product") {
          const productId = typeof item.entityId === "string" ? item.entityId : payload.id;
          if (typeof productId !== "string" || !productId || productId.length > 128) {
            throw new Error("Invalid product ID");
          }
          if (operation === "DELETE") {
            await db.query(
              "DELETE FROM public.products WHERE id = $1 AND user_id = $2",
              [productId, session.user.id],
            );
            return;
          }

          const name = typeof payload.name === "string" ? payload.name.trim() : "";
          const costPrice = number(payload.costPrice, NaN);
          const sellingPrice = number(payload.sellingPrice, NaN);
          const stockQuantity = number(payload.stockQuantity, NaN);
          const threshold = number(payload.lowStockThreshold, 5);
          if (!name || !Number.isFinite(costPrice) || costPrice < 0 ||
              !Number.isFinite(sellingPrice) || sellingPrice < 0 ||
              !Number.isInteger(stockQuantity) || stockQuantity < 0 ||
              !Number.isInteger(threshold) || threshold < 0) {
            throw new Error("Invalid product data");
          }

          const upserted = await db.query(
            `INSERT INTO public.products
              (id,user_id,name,sku,category,cost_price,selling_price,stock_quantity,
               low_stock_threshold,barcode,image_url,image_object_key,created_at,updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
               COALESCE(to_timestamp($13 / 1000.0),NOW()),
               COALESCE(to_timestamp($14 / 1000.0),NOW()))
             ON CONFLICT (id) DO UPDATE SET
               name=EXCLUDED.name,sku=EXCLUDED.sku,category=EXCLUDED.category,
               cost_price=EXCLUDED.cost_price,selling_price=EXCLUDED.selling_price,
               low_stock_threshold=EXCLUDED.low_stock_threshold,
               barcode=EXCLUDED.barcode,image_url=EXCLUDED.image_url,image_object_key=EXCLUDED.image_object_key,updated_at=NOW()
             WHERE public.products.user_id = EXCLUDED.user_id
             RETURNING id`,
            [productId, session.user.id, name, payload.sku || null, payload.category || null,
              costPrice, sellingPrice, stockQuantity, threshold, payload.barcode || null,
              payload.imageUrl || null, payload.imageObjectKey || null, number(payload.createdAt, Date.now()),
              number(payload.updatedAt, Date.now())],
          );
          if (!upserted.rows[0]) {
            throw new Error("Product ID belongs to another account");
          }
          return;
        }

        if (operation !== "INSERT" && operation !== "UPDATE") {
          throw new Error("Sale deletion is not supported");
        }
        const saleId = typeof item.entityId === "string" ? item.entityId : payload.id;
        const productId = typeof payload.productId === "string" ? payload.productId : "";
        const quantity = number(payload.quantity, NaN);
        const unitPrice = number(payload.unitPrice, NaN);
        const costPrice = number(payload.costPrice, NaN);
        if (typeof saleId !== "string" || !saleId || saleId.length > 128 ||
            !productId || !Number.isInteger(quantity) || quantity <= 0 ||
            !Number.isFinite(unitPrice) || unitPrice < 0 ||
            !Number.isFinite(costPrice) || costPrice < 0) {
          throw new Error("Invalid sale data");
        }

        await db.query("SELECT pg_advisory_xact_lock(hashtext($1)::bigint)", [saleId]);
        const existing = await db.query(
          "SELECT id FROM public.sales WHERE id = $1 AND user_id = $2",
          [saleId, session.user.id],
        );
        if (existing.rows[0]) return;

        // Never trust the offline payload's cost price. Lock the owned product
        // and derive cost from the server before calculating profit.
        const productResult = await db.query(
          "SELECT cost_price FROM public.products WHERE id = $1 AND user_id = $2 FOR UPDATE",
          [productId, session.user.id],
        );
        const product = productResult.rows[0];
        if (!product) throw new Error("Product not found");
        const trustedCostPrice = Number(product.cost_price);
        const revenue = unitPrice * quantity;
        const totalCost = trustedCostPrice * quantity;
        await db.query(
          `SELECT * FROM public.create_sale_for_user($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [session.user.id, saleId, productId, quantity, unitPrice, trustedCostPrice,
            revenue, totalCost, revenue - totalCost, number(payload.saleDate, Date.now())],
        );
      });
      results.push({ id, status: "synced" });
    } catch (error: any) {
      const message = String(error?.message ?? "Sync failed");
      results.push({
        id,
        status: "failed",
        error: message.includes("Insufficient stock") ? "Insufficient stock on server" :
          message.includes("Product not found") ? "Product no longer exists on server" :
          message.includes("duplicate key") ? "A product with this SKU already exists" :
          "Could not sync this item",
      });
    }
  }

  return json(res, 200, {
    results,
    synced: results.filter((result) => result.status === "synced").length,
    failed: results.filter((result) => result.status === "failed").length,
  });
}
