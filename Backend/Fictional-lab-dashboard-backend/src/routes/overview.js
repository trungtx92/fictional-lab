import { Router } from "express";
import { getOverview } from "../data/sales.js";
import { parseFilters } from "../filters.js";
import { asyncHandler } from "../http.js";

const router = Router();

// Country-wide KPIs and widgets: GET /api/overview?range=90d&category=apparel
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { error, filters } = await parseFilters(req.query);
    if (error) return res.status(400).json({ error });
    res.json(await getOverview(filters));
  })
);

export default router;
