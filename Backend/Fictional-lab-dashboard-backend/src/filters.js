import { CATEGORY_MODEL, RANGE_MODEL } from "./data/mockSales.js";

const DEFAULT_RANGE = "30d";

// Reads the dashboard filters from the query string. A missing filter means
// "last 30 days" / "all categories" / "whole state"; an unrecognised one is a
// client error. Returns { error } or { filters }.
export function parseFilters(query) {
  const range = query.range || DEFAULT_RANGE;
  const category = query.category || "";
  const postcode = query.postcode || "";

  if (!Object.hasOwn(RANGE_MODEL, range)) return { error: `Unknown range "${range}"` };
  if (category && !Object.hasOwn(CATEGORY_MODEL, category)) return { error: `Unknown category "${category}"` };
  if (postcode && !/^\d{4}$/.test(postcode)) return { error: `Invalid postcode "${postcode}"` };

  return { filters: { range, category, postcode } };
}
