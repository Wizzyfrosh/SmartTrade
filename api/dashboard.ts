import { requireAuth } from "../src/lib/require-auth";
import { withUserTransaction } from "../src/lib/db";

export default async function handler(req: any, res: any) {
  const session = await requireAuth(req, res);
  if (!session) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stats = await withUserTransaction(session.user.id, async (db) => {
      const result = await db.query(`
        WITH day_bounds AS (
          SELECT
            (extract(epoch FROM (
              date_trunc('day', NOW() AT TIME ZONE 'Africa/Lagos') AT TIME ZONE 'Africa/Lagos'
            )) * 1000)::bigint AS start_ms,
            (extract(epoch FROM (
              (date_trunc('day', NOW() AT TIME ZONE 'Africa/Lagos') + interval '1 day')
              AT TIME ZONE 'Africa/Lagos'
            )) * 1000)::bigint AS end_ms
        )
        SELECT
          (SELECT COUNT(*)::int FROM public.products) AS total_products,
          (SELECT COUNT(*)::int FROM public.products
            WHERE stock_quantity <= low_stock_threshold AND stock_quantity > 0) AS low_stock_items,
          (SELECT COUNT(*)::int FROM public.products WHERE stock_quantity = 0) AS out_of_stock_items,
          (SELECT COALESCE(SUM(stock_quantity * cost_price), 0)
            FROM public.products) AS stock_value,
          (SELECT COUNT(*)::int FROM public.sales, day_bounds
            WHERE sale_date >= day_bounds.start_ms AND sale_date < day_bounds.end_ms) AS today_sales_count,
          (SELECT COALESCE(SUM(total_revenue), 0) FROM public.sales, day_bounds
            WHERE sale_date >= day_bounds.start_ms AND sale_date < day_bounds.end_ms) AS today_revenue,
          (SELECT COALESCE(SUM(profit), 0) FROM public.sales, day_bounds
            WHERE sale_date >= day_bounds.start_ms AND sale_date < day_bounds.end_ms) AS today_profit
      `);
      return result.rows[0];
    });
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Dashboard API error", error);
    return res.status(500).json({ error: "Unable to load dashboard statistics" });
  }
}
