import { Router } from "express";
import { pool, query } from "../db.js";
import { asyncHandler, parseId } from "../http.js";

const router = Router();

const PAYMENT_METHODS = ["card", "cash", "wallet"];

async function itemsWithProducts(transactionId) {
  const { rows: items } = await query(
    "SELECT * FROM transaction_items WHERE transaction_id = $1 ORDER BY transaction_item_id",
    [transactionId]
  );
  const productIds = [...new Set(items.map((i) => i.product_id))];
  const { rows: products } = productIds.length
    ? await query("SELECT * FROM products WHERE product_id = ANY($1::int[])", [productIds])
    : { rows: [] };
  const productById = new Map(products.map((p) => [p.product_id, p]));
  return items.map((i) => ({ ...i, product: productById.get(i.product_id) ?? null }));
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { customer_id, store_id, status } = req.query;
    const conditions = [];
    const params = [];

    for (const [column, value] of [["customer_id", customer_id], ["store_id", store_id]]) {
      if (!value) continue;
      const id = parseId(value);
      if (id === null) return res.json([]); // a non-numeric id can never match
      params.push(id);
      conditions.push(`t.${column} = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`t.status = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // list view returns the transaction plus lightweight customer/store labels,
    // without the full nested item list (kept for the detail endpoint)
    const { rows } = await query(
      `SELECT t.*,
              c.first_name || ' ' || c.last_name AS customer_name,
              s.store_name
       FROM transactions t
       LEFT JOIN customers c ON c.customer_id = t.customer_id
       LEFT JOIN stores s ON s.store_id = t.store_id
       ${where}
       ORDER BY t.transaction_id`,
      params
    );
    res.json(rows);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const txn = id ? await query("SELECT * FROM transactions WHERE transaction_id = $1", [id]) : { rows: [] };
    if (txn.rows.length === 0) return res.status(404).json({ error: "Transaction not found" });
    const transaction = txn.rows[0];

    const [items, customer, store] = await Promise.all([
      itemsWithProducts(id),
      query("SELECT * FROM customers WHERE customer_id = $1", [transaction.customer_id]),
      query("SELECT * FROM stores WHERE store_id = $1", [transaction.store_id]),
    ]);
    res.json({
      ...transaction,
      items,
      customer: customer.rows[0] ?? null,
      store: store.rows[0] ?? null,
    });
  })
);

// Creates a transaction with its line items in one call — mirrors the
// atomic "insert transaction + transaction_items" behavior described
// for POST /api/transactions in the Technical Requirements Document.
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { customer_id, store_id, payment_method, items } = req.body ?? {};

    if (!customer_id || !store_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "customer_id, store_id, and a non-empty items array are required",
      });
    }
    const customerId = parseId(customer_id);
    const storeId = parseId(store_id);
    const method = payment_method ?? "card";
    if (!PAYMENT_METHODS.includes(method)) {
      return res.status(400).json({ error: `Invalid payment_method ${method}` });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const customer = customerId
        ? await client.query("SELECT 1 FROM customers WHERE customer_id = $1", [customerId])
        : { rows: [] };
      if (customer.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Unknown customer_id ${customer_id}` });
      }
      const store = storeId
        ? await client.query("SELECT 1 FROM stores WHERE store_id = $1", [storeId])
        : { rows: [] };
      if (store.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Unknown store_id ${store_id}` });
      }

      const productIds = items.map((i) => parseId(i?.product_id)).filter((id) => id !== null);
      const { rows: products } = await client.query(
        "SELECT * FROM products WHERE product_id = ANY($1::int[])",
        [productIds]
      );
      const productById = new Map(products.map((p) => [p.product_id, p]));

      let totalAmount = 0;
      const lines = [];
      for (const { product_id, quantity } of items) {
        const product = productById.get(parseId(product_id));
        if (!product) {
          await client.query("ROLLBACK");
          return res.status(400).json({ error: `Unknown product_id ${product_id}` });
        }
        if (!Number.isInteger(quantity) || quantity <= 0) {
          await client.query("ROLLBACK");
          return res.status(400).json({ error: `Invalid quantity for product_id ${product_id}` });
        }
        // Snapshot the price at time of sale.
        const line_total = Math.round(product.unit_price * quantity * 100) / 100;
        totalAmount += line_total;
        lines.push({ product, quantity, unit_price: product.unit_price, line_total });
      }

      const { rows } = await client.query(
        `INSERT INTO transactions (customer_id, store_id, payment_method, status, total_amount)
         VALUES ($1, $2, $3, 'completed', $4)
         RETURNING *`,
        [customerId, storeId, method, Math.round(totalAmount * 100) / 100]
      );
      const transaction = rows[0];

      const newItems = [];
      for (const { product, quantity, unit_price, line_total } of lines) {
        const inserted = await client.query(
          `INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, line_total)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [transaction.transaction_id, product.product_id, quantity, unit_price, line_total]
        );
        newItems.push({ ...inserted.rows[0], product });
      }

      await client.query("COMMIT");
      res.status(201).json({ ...transaction, items: newItems });
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  })
);

export default router;
