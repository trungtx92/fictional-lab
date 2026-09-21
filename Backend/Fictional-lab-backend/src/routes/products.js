import { Router } from "express";
import { query } from "../db.js";
import { asyncHandler, parseId } from "../http.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, active } = req.query;
    const conditions = [];
    const params = [];
    if (category) {
      params.push(category);
      conditions.push(`LOWER(category) = LOWER($${params.length})`);
    }
    if (active !== undefined) {
      params.push(active === "true");
      conditions.push(`is_active = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await query(`SELECT * FROM products ${where} ORDER BY product_id`, params);
    res.json(rows);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const { rows } = id ? await query("SELECT * FROM products WHERE product_id = $1", [id]) : { rows: [] };
    if (rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(rows[0]);
  })
);

export default router;
