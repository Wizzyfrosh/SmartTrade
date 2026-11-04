import { requireAuth } from "../../src/lib/require-auth";
import { withUserTransaction } from "../../src/lib/db";

const fields: Record<string, string> = {
  name: "name",
  sku: "sku",
  category: "category",
  costPrice: "cost_price",
  sellingPrice: "selling_price",
  stockQuantity: "stock_quantity",
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
      if (!entries.length) return json(res, 400, { error: "No valid product fields supplied" });

      for (const [key] of entries) {
        const value = body[key];
        if (["costPrice", "sellingPrice"].includes(key) && (!Number.isFinite(Number(value)) || Number(value) < 0))
          return json(res, 400, { error: `Invalid ${key}` });
        if (["stockQuantity", "lowStockThreshold"].includes(key) && (!Number.isInteger(Number(value)) || Number(value) < 0))
          return json(res, 400, { error: `Invalid ${key}` });
        if (key === "name" && (typeof value !== "string" || !value.trim()))
          return json(res, 400, { error: "Product name cannot be empty" });
        if (key === "imageObjectKey" && (typeof value !== "string" || !value.startsWith(`users/${userId}/products/${id}/`) || value.length > 1024))
          return json(res, 400, { error: "Invalid product image key" });
      }

      const product = await withUserTransaction(userId, async (db) => {
        const setSql = entries.map(([key], i) => `${fields[key]} = $${i + 1}`).join(", ");
        const values = entries.map(([key]) => body[key]);
        const result = await db.query(
          `UPDATE public.products SET ${setSql}, updated_at = NOW()
           WHERE id = $${values.length + 1} RETURNING *`,
          [...values, id],
        );
        return result.rows[0] ?? null;
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
