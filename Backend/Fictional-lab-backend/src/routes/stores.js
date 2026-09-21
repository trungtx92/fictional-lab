import { Router } from "express";
import { query } from "../db.js";
import { asyncHandler, parseId } from "../http.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { rows } = await query("SELECT * FROM stores ORDER BY store_id");
    res.json(rows);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const { rows } = id ? await query("SELECT * FROM stores WHERE store_id = $1", [id]) : { rows: [] };
    if (rows.length === 0) return res.status(404).json({ error: "Store not found" });
    res.json(rows[0]);
  })
);

// Aggregate sales summary for a store — illustrates what the dbt-built
// analytics model (agg_daily_sales_by_store) would ultimately serve.
router.get(
  "/:id/sales-summary",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const store = id ? await query("SELECT * FROM stores WHERE store_id = $1", [id]) : { rows: [] };
    if (store.rows.length === 0) return res.status(404).json({ error: "Store not found" });

    const { rows } = await query(
      `SELECT COUNT(*)::int AS transaction_count,
              COALESCE(SUM(total_amount), 0) AS total_revenue
       FROM transactions
       WHERE store_id = $1 AND status = 'completed'`,
      [id]
    );
    const { transaction_count, total_revenue } = rows[0];
    const averageOrderValue = transaction_count ? total_revenue / transaction_count : 0;

    res.json({
      store_id: id,
      store_name: store.rows[0].store_name,
      transaction_count,
      total_revenue: Math.round(total_revenue * 100) / 100,
      average_order_value: Math.round(averageOrderValue * 100) / 100,
    });
  })
);

export default router;
