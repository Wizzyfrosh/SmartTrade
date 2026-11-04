import { randomUUID } from "node:crypto";
import { requireAuth } from "../../src/lib/require-auth";
import { withUserTransaction } from "../../src/lib/db";

function json(res: any, status: number, body: unknown) {
  res.status(status).json(body);
}

export default async function handler(req: any, res: any) {
  const session = await requireAuth(req, res);
  if (!session) return;
  const userId = session.user.id;

  try {
    if (req.method === "GET") {
      const rows = await withUserTransaction(userId, async (db) => {
        const result = await db.query(
          "SELECT id, name, sku, category, cost_price, selling_price, stock_quantity, low_stock_threshold, barcode, image_url, created_at, updated_at FROM public.products ORDER BY created_at DESC",
        );
        return result.rows;
      });
      return json(res, 200, rows);
    }

    if (req.method === "POST") {
      const body = req.body ?? {};
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const costPrice = Number(body.costPrice);
      const sellingPrice = Number(body.sellingPrice);
      const stockQuantity = Number(body.stockQuantity ?? 0);
      const lowStockThreshold = Number(body.lowStockThreshold ?? 5);
      if (!name || !Number.isFinite(costPrice) || costPrice < 0 ||
          !Number.isFinite(sellingPrice) || sellingPrice < 0 ||
          !Number.isInteger(stockQuantity) || stockQuantity < 0 ||
          !Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
        return json(res, 400, { error: "Invalid product fields" });
      }

      const product = await withUserTransaction(userId, async (db) => {
        const result = await db.query(
          `INSERT INTO public.products
            (id, user_id, name, sku, category, cost_price, selling_price, stock_quantity,
             low_stock_threshold, barcode, image_url, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW())
           RETURNING *`,
          [randomUUID(), userId, name, body.sku || null, body.category || null,
            costPrice, sellingPrice, stockQuantity, lowStockThreshold,
            body.barcode || null, body.imageUrl || null],
        );
        return result.rows[0];
      });
      return json(res, 201, product);
    }

    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed" });
  } catch (error: any) {
    console.error("Products API error", error);
    return json(res, 500, { error: "Unable to process products request" });
  }
}
