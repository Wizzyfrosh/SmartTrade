import { randomUUID } from "node:crypto";
import { requireAuth } from "../../src/lib/require-auth";
import { withUserTransaction } from "../../src/lib/db";
import { verifyPrivateImageObject } from "../../src/lib/storage";

const fields: Record<string, string> = {
  name: "name",
  sku: "sku",
  category: "category",
  costPrice: "cost_price",
  sellingPrice: "selling_price",
  lowStockThreshold: "low_stock_threshold",
  barcode: "barcode",
  imageUrl: "image_url",
  imageObjectKey: "image_object_key",
};

function json(res: any, status: number, body: unknown) {
  res.status(status).json(body);
}

export default async function handler(req: any, res: any) {
  const session = await requireAuth(req, res);
  if (!session) return;
  const userId = session.user.id;
  const id = String(req.query?.id ?? "");

  if (!id) return json(res, 400, { error: "Product ID is required" });

  try {
    if (req.method === "GET") {
      const product = await withUserTransaction(userId, async (db) => {
        const result = await db.query("SELECT * FROM public.products WHERE id = $1", [id]);
        return result.rows[0] ?? null;
      });
      if (!product) return json(res, 404, { error: "Product not found" });
      return json(res, 200, product);
    }

    if (req.method === "PATCH" || req.method === "PUT") {
      const body = req.body ?? {};
      const entries = Object.entries(fields).filter(([key]) => body[key] !== undefined);
      const hasStockUpdate = body.stockQuantity !== undefined;
      const stockQuantity = hasStockUpdate ? Number(body.stockQuantity) : undefined;

      if (!entries.length && !hasStockUpdate) {
        return json(res, 400, { error: "No valid product fields supplied" });
      }
      if (hasStockUpdate && (!Number.isInteger(stockQuantity) || stockQuantity! < 0)) {
        return json(res, 400, { error: "Invalid stockQuantity" });
      }

      for (const [key] of entries) {
        const value = body[key];
        if (["costPrice", "sellingPrice"].includes(key) && (!Number.isFinite(Number(value)) || Number(value) < 0))
          return json(res, 400, { error: `Invalid ${key}` });
        if (key === "lowStockThreshold" && (!Number.isInteger(Number(value)) || Number(value) < 0))
          return json(res, 400, { error: `Invalid ${key}` });
        if (key === "name" && (typeof value !== "string" || !value.trim()))
          return json(res, 400, { error: "Product name cannot be empty" });
        if (key === "imageObjectKey" && value !== null &&
            (typeof value !== "string" || !value.startsWith(`users/${userId}/products/${id}/`) || value.length > 1024))
          return json(res, 400, { error: "Invalid product image key" });
      }

      if (body.imageObjectKey !== undefined && body.imageObjectKey !== null &&
          !(await verifyPrivateImageObject(body.imageObjectKey, `users/${userId}/products/${id}/`))) {
        return json(res, 400, { error: "Product image upload is missing, invalid or exceeds 5 MB" });
      }

      const product = await withUserTransaction(userId, async (db) => {
        let stockDelta = 0;
        if (hasStockUpdate) {
          const current = await db.query(
            "SELECT stock_quantity FROM public.products WHERE id = $1 FOR UPDATE",
            [id],
          );
          if (!current.rows[0]) return null;
          stockDelta = stockQuantity! - Number(current.rows[0].stock_quantity);
        }

        const values = entries.map(([key]) => body[key]);
        const assignments = entries.map(([key], i) => `${fields[key]} = $${i + 1}`);
        if (hasStockUpdate) {
          values.push(stockQuantity);
          assignments.push(`stock_quantity = $${values.length}`);
        }

        const result = await db.query(
          `UPDATE public.products SET ${assignments.join(", ")}, updated_at = NOW()
           WHERE id = $${values.length + 1} RETURNING *`,
          [...values, id],
        );
        const updated = result.rows[0] ?? null;
        if (!updated) return null;

        if (stockDelta !== 0) {
          await db.query(
            `INSERT INTO public.inventory_adjustments
              (id, user_id, product_id, quantity_delta, reason, created_at)
             VALUES ($1, $2, $3, $4, 'manual_adjustment', NOW())`,
            [randomUUID(), userId, id, stockDelta],
          );
        }
        return updated;
      });
      if (!product) return json(res, 404, { error: "Product not found" });
      return json(res, 200, product);
    }

    if (req.method === "DELETE") {
      const deleted = await withUserTransaction(userId, async (db) => {
        const result = await db.query("DELETE FROM public.products WHERE id = $1 RETURNING id", [id]);
        return result.rows[0] ?? null;
      });
      if (!deleted) return json(res, 404, { error: "Product not found" });
      return json(res, 200, { id: deleted.id });
    }

    res.setHeader("Allow", "GET, PUT, PATCH, DELETE");
    return json(res, 405, { error: "Method not allowed" });
  } catch (error: any) {
    console.error("Product API error", error);
    return json(res, 500, { error: "Unable to process product request" });
  }
}
