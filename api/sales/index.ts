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
          "SELECT * FROM public.sales ORDER BY sale_date DESC",
        );
        return result.rows;
      });
      return json(res, 200, rows);
    }

    if (req.method === "POST") {
      const body = req.body ?? {};
      const productId = typeof body.productId === "string" ? body.productId : "";
      const quantity = Number(body.quantity);
      const unitPriceInput = body.unitPrice === undefined ? null : Number(body.unitPrice);
      if (!productId || !Number.isInteger(quantity) || quantity <= 0 ||
          (unitPriceInput !== null && (!Number.isFinite(unitPriceInput) || unitPriceInput < 0))) {
        return json(res, 400, { error: "Invalid sale fields" });
      }

      const sale = await withUserTransaction(userId, async (db) => {
        const productResult = await db.query(
          "SELECT selling_price, cost_price FROM public.products WHERE id = $1 FOR UPDATE",
          [productId],
        );
        const product = productResult.rows[0];
        if (!product) return null;

        const unitPrice = unitPriceInput ?? Number(product.selling_price);
        const costPrice = Number(product.cost_price);
        const totalRevenue = unitPrice * quantity;
        const totalCost = costPrice * quantity;
        const result = await db.query(
          `SELECT * FROM public.create_sale_for_user(
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
          )`,
          [userId, randomUUID(), productId, quantity, unitPrice, costPrice,
            totalRevenue, totalCost, totalRevenue - totalCost, Number(body.saleDate) || Date.now()],
        );
        return result.rows[0] ?? null;
      });
      if (!sale) return json(res, 404, { error: "Product not found" });
      return json(res, 201, sale);
    }

    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed" });
  } catch (error: any) {
    const message = String(error?.message ?? "");
    if (message.includes("Insufficient stock")) return json(res, 409, { error: "Insufficient stock" });
    if (message.includes("Quantity must")) return json(res, 400, { error: "Quantity must be greater than zero" });
    console.error("Sales API error", error);
    return json(res, 500, { error: "Unable to process sale" });
  }
}
