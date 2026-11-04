import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { withUserTransaction } from "../../server/db";

type Request = IncomingMessage & { body?: unknown; query?: Record<string, string | string[] | undefined> };
type Response = ServerResponse & {
  status: (code: number) => Response;
  json: (value: unknown) => void;
  end: () => void;
};

function readBody(req: Request): Record<string, any> {
  if (req.body && typeof req.body === "object") return req.body as Record<string, any>;
  if (typeof req.body === "string") return JSON.parse(req.body);
  return {};
}

function mapProduct(row: any) {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    costPrice: Number(row.cost_price),
    sellingPrice: Number(row.selling_price),
    stockQuantity: row.stock_quantity,
    lowStockThreshold: row.low_stock_threshold,
    barcode: row.barcode,
    imageUrl: row.image_url,
    imageObjectKey: row.image_object_key,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at || row.created_at).getTime(),
    synced: true,
  };
}

function mapSale(row: any) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    costPrice: Number(row.cost_price),
    totalRevenue: Number(row.total_revenue),
    totalCost: Number(row.total_cost),
    profit: Number(row.profit),
    saleDate: Number(row.sale_date),
    createdAt: new Date(row.created_at).getTime(),
    synced: true,
  };
}

export default async function handler(req: Request, res: Response) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") headers.set(key, value);
      else if (Array.isArray(value)) headers.set(key, value.join(", "));
    }

    const { auth } = await import("../../server/auth.js");
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const url = new URL(req.url || "/api/data", "https://smarttrade-inventotryapp.vercel.app");
    const path = url.pathname.replace(/^\/api\/data\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
    const [resource, id] = path;
    const userId = session.user.id;

    const result = await withUserTransaction(userId, async (db) => {
      if (resource === "products" && req.method === "GET" && !id) {
        const query = url.searchParams.get("q");
        const values: unknown[] = [userId];
        let sql = "SELECT * FROM public.products WHERE user_id = $1";
        if (query) {
          values.push(`%${query}%`);
          sql += " AND name ILIKE $2";
        }
        sql += " ORDER BY created_at DESC";
        const rows = await db.query(sql, values);
        return rows.rows.map(mapProduct);
      }

      if (resource === "products" && req.method === "POST" && !id) {
        const body = readBody(req);
        const name = String(body.name || "").trim();
        const cost = Number(body.costPrice ?? body.cost_price);
        const price = Number(body.sellingPrice ?? body.selling_price);
        const stock = Number(body.stockQuantity ?? body.stock_quantity ?? 0);
        if (!name || !Number.isFinite(cost) || cost < 0 || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
          throw Object.assign(new Error("Invalid product details"), { statusCode: 400 });
        }
        const candidateKey = body.imageObjectKey ?? body.imageUrl;
        const objectKey = typeof candidateKey === "string" && candidateKey.startsWith(`users/${userId}/`) ? candidateKey : null;
        const row = await db.query(
          `INSERT INTO public.products
           (id,user_id,name,sku,category,cost_price,selling_price,stock_quantity,low_stock_threshold,barcode,image_object_key)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
          [randomUUID(), userId, name, body.sku || null, body.category || null, cost, price, stock, Number(body.lowStockThreshold ?? 5), body.barcode || null, objectKey],
        );
        return mapProduct(row.rows[0]);
      }

      if (resource === "products" && id && req.method === "PATCH") {
        const body = readBody(req);
        const fields: Record<string, string> = {
          name: "name", sku: "sku", category: "category", costPrice: "cost_price",
          sellingPrice: "selling_price", stockQuantity: "stock_quantity",
          lowStockThreshold: "low_stock_threshold", barcode: "barcode",
        };
        const sets: string[] = [];
        const values: unknown[] = [id, userId];
        for (const [key, column] of Object.entries(fields)) {
          if (body[key] !== undefined) {
            values.push(body[key]);
            sets.push(`${column} = $${values.length}`);
          }
        }
        if (body.imageObjectKey !== undefined || body.imageUrl !== undefined) {
          const candidateKey = body.imageObjectKey ?? body.imageUrl;
          values.push(typeof candidateKey === "string" && candidateKey.startsWith(`users/${userId}/`) ? candidateKey : null);
          sets.push(`image_object_key = $${values.length}`);
        }
        if (!sets.length) throw Object.assign(new Error("No product fields supplied"), { statusCode: 400 });
        sets.push("updated_at = now()");
        const row = await db.query(
          `UPDATE public.products SET ${sets.join(", ")} WHERE id=$1 AND user_id=$2 RETURNING *`,
          values,
        );
        if (!row.rowCount) throw Object.assign(new Error("Product not found"), { statusCode: 404 });
        return mapProduct(row.rows[0]);
      }

      if (resource === "products" && id && req.method === "DELETE") {
        const row = await db.query("DELETE FROM public.products WHERE id=$1 AND user_id=$2 RETURNING id", [id, userId]);
        if (!row.rowCount) throw Object.assign(new Error("Product not found"), { statusCode: 404 });
        return { success: true };
      }

      if (resource === "sales" && req.method === "GET") {
        const rows = await db.query(
          `SELECT s.*, p.name AS product_name
           FROM public.sales s JOIN public.products p ON p.id=s.product_id
           WHERE s.user_id=$1 ORDER BY s.sale_date DESC`,
          [userId],
        );
        return rows.rows.map(mapSale);
      }

      if (resource === "sales" && req.method === "POST") {
        const body = readBody(req);
        const quantity = Number(body.quantity);
        const unitPrice = Number(body.unitPrice ?? body.unit_price);
        if (!body.productId || !Number.isInteger(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
          throw Object.assign(new Error("Invalid sale details"), { statusCode: 400 });
        }
        const productResult = await db.query(
          "SELECT id, cost_price FROM public.products WHERE id=$1 AND user_id=$2",
          [body.productId, userId],
        );
        if (!productResult.rowCount) throw Object.assign(new Error("Product not found"), { statusCode: 404 });
        const costPrice = Number(productResult.rows[0].cost_price);
        const totalRevenue = unitPrice * quantity;
        const totalCost = costPrice * quantity;
        const row = await db.query(
          `SELECT * FROM public.create_sale_for_user($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [userId, randomUUID(), body.productId, quantity, unitPrice, costPrice, totalRevenue, totalCost, totalRevenue - totalCost, Number(body.saleDate ?? Date.now())],
        );
        const sale = await db.query(
          "SELECT s.*, p.name AS product_name FROM public.sales s JOIN public.products p ON p.id=s.product_id WHERE s.id=$1 AND s.user_id=$2",
          [row.rows[0].id, userId],
        );
        return mapSale(sale.rows[0]);
      }

      if (resource === "dashboard" && req.method === "GET") {
        const row = await db.query(
          `SELECT
             (SELECT count(*)::int FROM public.products WHERE user_id=$1) AS total_products,
             (SELECT count(*)::int FROM public.products WHERE user_id=$1 AND stock_quantity>0 AND stock_quantity<=5) AS low_stock_items,
             (SELECT count(*)::int FROM public.products WHERE user_id=$1 AND stock_quantity=0) AS out_of_stock_items,
             (SELECT COALESCE(sum(stock_quantity*cost_price),0) FROM public.products WHERE user_id=$1) AS stock_value,
             (SELECT COALESCE(sum(total_revenue),0) FROM public.sales WHERE user_id=$1 AND sale_date >= $2) AS today_revenue,
             (SELECT COALESCE(sum(profit),0) FROM public.sales WHERE user_id=$1 AND sale_date >= $2) AS today_profit,
             (SELECT count(*)::int FROM public.sales WHERE user_id=$1 AND sale_date >= $2) AS today_sales`,
          [userId, new Date().setHours(0,0,0,0)],
        );
        const v = row.rows[0];
        return {
          totalProducts: v.total_products, lowStockItems: v.low_stock_items,
          outOfStockItems: v.out_of_stock_items, stockValue: Number(v.stock_value),
          todayRevenue: Number(v.today_revenue), todayProfit: Number(v.today_profit),
          todaySales: v.today_sales,
        };
      }

      if (resource === "low-stock" && req.method === "GET") {
        const rows = await db.query(
          "SELECT * FROM public.products WHERE user_id=$1 AND stock_quantity>0 AND stock_quantity<=5 ORDER BY stock_quantity ASC LIMIT 3",
          [userId],
        );
        return rows.rows.map(mapProduct);
      }

      if (resource === "today-sales" && req.method === "GET") {
        const start = new Date().setHours(0,0,0,0);
        const rows = await db.query(
          `SELECT s.*, p.name AS product_name FROM public.sales s
           JOIN public.products p ON p.id=s.product_id
           WHERE s.user_id=$1 AND s.sale_date >= $2 ORDER BY s.sale_date DESC LIMIT 5`,
          [userId, start],
        );
        return rows.rows.map(mapSale);
      }

      if (resource === "sales-range" && req.method === "GET") {
        const start = Number(url.searchParams.get("start"));
        const end = Number(url.searchParams.get("end"));
        if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
          throw Object.assign(new Error("Invalid date range"), { statusCode: 400 });
        }
        const rows = await db.query(
          `SELECT s.*, p.name AS product_name FROM public.sales s
           JOIN public.products p ON p.id=s.product_id
           WHERE s.user_id=$1 AND s.sale_date >= $2 AND s.sale_date <= $3
           ORDER BY s.sale_date DESC`,
          [userId, start, end],
        );
        return rows.rows.map(mapSale);
      }

      throw Object.assign(new Error("Route not found"), { statusCode: 404 });
    });

    res.status(200).json(result);
  } catch (error: any) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("SmartTrade data API error:", error);
    res.status(status).json({ error: status >= 500 ? "Internal server error" : error.message });
  }
}
