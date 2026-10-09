import { Router } from "express";
import { getStateDetails, getStates } from "../data/sales.js";
import { parseFilters } from "../filters.js";
import { asyncHandler } from "../http.js";

const router = Router();

// One state's widgets, optionally narrowed to a postcode:
// GET /api/states/vic?range=90d&category=apparel&postcode=3000
router.get(
  "/:code",
  asyncHandler(async (req, res) => {
    const code = req.params.code.toUpperCase();
    const states = await getStates();
    if (!states.some((s) => s.code === code)) return res.status(404).json({ error: "State not found" });

    const { error, filters } = await parseFilters(req.query);
    if (error) return res.status(400).json({ error });

    const details = await getStateDetails(code, filters);
    if (!details) return res.status(404).json({ error: "State not found" });
    res.json(details);
  })
);

export default router;
