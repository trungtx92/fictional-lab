import { getCategoryIds, getRangeIds } from "./data/sales.js";

const DEFAULT_RANGE = "30d";

// Reads the dashboard filters from the query string. A missing filter means
// "last 30 days" / "all categories" / "whole state"; an unrecognised one is a
// client error. Returns { error } or { filters }.
export async function parseFilters(query) {
  const range = query.range || DEFAULT_RANGE;
  const category = query.category || "";
  const postcode = query.postcode || "";

  const [ranges, categories] = await Promise.all([getRangeIds(), getCategoryIds()]);
  if (!ranges.includes(range)) return { error: `Unknown range "${range}"` };
  if (category && !categories.includes(category)) return { error: `Unknown category "${category}"` };
  if (postcode && !/^\d{4}$/.test(postcode)) return { error: `Invalid postcode "${postcode}"` };

  return { filters: { range, category, postcode } };
}
