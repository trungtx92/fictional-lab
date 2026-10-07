import { Router } from "express";
import { STATES, getStateDetails } from "../data/mockSales.js";
import { parseFilters } from "../filters.js";

const router = Router();

// One state's widgets, optionally narrowed to a postcode:
// GET /api/states/vic?range=90d&category=apparel&postcode=3000
router.get("/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  if (!STATES.some((s) => s.code === code)) return res.status(404).json({ error: "State not found" });

  const { error, filters } = parseFilters(req.query);
  if (error) return res.status(400).json({ error });
  res.json(getStateDetails(code, filters));
});

export default router;
