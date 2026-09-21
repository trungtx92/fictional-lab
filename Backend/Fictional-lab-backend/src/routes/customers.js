import { Router } from "express";
import { query } from "../db.js";
import { asyncHandler, parseId } from "../http.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search } = req.query;
    if (!search) {
      const { rows } = await query("SELECT * FROM customers ORDER BY customer_id");
      return res.json(rows);
    }
    // Escape LIKE wildcards so the search stays a plain substring match.
    const term = `%${String(search).replace(/[\\%_]/g, "\\$&")}%`;
    const { rows } = await query(
      `SELECT * FROM customers
       WHERE first_name || ' ' || last_name ILIKE $1 OR email ILIKE $1
       ORDER BY customer_id`,
      [term]
    );
    res.json(rows);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const { rows } = id ? await query("SELECT * FROM customers WHERE customer_id = $1", [id]) : { rows: [] };
    if (rows.length === 0) return res.status(404).json({ error: "Customer not found" });
    res.json(rows[0]);
  })
);

router.get(
  "/:id/transactions",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const customer = id ? await query("SELECT 1 FROM customers WHERE customer_id = $1", [id]) : { rows: [] };
    if (customer.rows.length === 0) return res.status(404).json({ error: "Customer not found" });
    const { rows } = await query(
      "SELECT * FROM transactions WHERE customer_id = $1 ORDER BY transaction_id",
      [id]
    );
    res.json(rows);
  })
);

export default router;
