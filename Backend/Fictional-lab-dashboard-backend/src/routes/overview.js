import { Router } from "express";
import { getOverview } from "../data/mockSales.js";
import { parseFilters } from "../filters.js";

const router = Router();

// Country-wide KPIs and widgets: GET /api/overview?range=90d&category=apparel
router.get("/", (req, res) => {
  const { error, filters } = parseFilters(req.query);
  if (error) return res.status(400).json({ error });
  res.json(getOverview(filters));
});

export default router;
