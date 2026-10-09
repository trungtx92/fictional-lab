import { Router } from "express";
import { answer } from "../chat.js";
import { getStates } from "../data/sales.js";
import { parseFilters } from "../filters.js";
import { asyncHandler } from "../http.js";

const router = Router();

const MAX_QUESTION_LENGTH = 500;

// Answers a question about the dashboard data with a sentence and a chart:
// POST /api/chat { question, range?, category?, state? } -> { text, chart }
// range / category / state describe the page the question was asked from.
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { question, state, ...context } = req.body ?? {};
    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Enter a question." });
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({ error: `Keep the question under ${MAX_QUESTION_LENGTH} characters.` });
    }
    const states = await getStates();
    if (state != null && !states.some((s) => s.code === String(state).toUpperCase())) {
      return res.status(400).json({ error: `Unknown state "${state}"` });
    }

    const { error, filters } = await parseFilters(context);
    if (error) return res.status(400).json({ error });
    res.json(await answer(question.trim(), { ...filters, state: state == null ? undefined : String(state) }));
  })
);

export default router;
