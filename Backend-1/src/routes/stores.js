import { Router } from "express";
import { stores, transactions } from "../data/mockData.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(stores);
});

router.get("/:id", (req, res) => {
  const store = stores.find((s) => s.store_id === Number(req.params.id));
  if (!store) return res.status(404).json({ error: "Store not found" });
  res.json(store);
});

// Aggregate sales summary for a store — illustrates what the dbt-built
// analytics model (agg_daily_sales_by_store) would ultimately serve.
router.get("/:id/sales-summary", (req, res) => {
  const storeId = Number(req.params.id);
  const store = stores.find((s) => s.store_id === storeId);
  if (!store) return res.status(404).json({ error: "Store not found" });

  const storeTransactions = transactions.filter(
    (t) => t.store_id === storeId && t.status === "completed"
  );
  const totalRevenue = storeTransactions.reduce((sum, t) => sum + t.total_amount, 0);
  const transactionCount = storeTransactions.length;
  const averageOrderValue = transactionCount ? totalRevenue / transactionCount : 0;

  res.json({
    store_id: storeId,
    store_name: store.store_name,
    transaction_count: transactionCount,
    total_revenue: Math.round(totalRevenue * 100) / 100,
    average_order_value: Math.round(averageOrderValue * 100) / 100,
  });
});

export default router;
