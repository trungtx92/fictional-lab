// Express 4 does not catch rejected promises from async handlers.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Ids are SERIAL (int4) columns; anything else cannot match a row and would
// make Postgres throw, so callers treat null as "not found".
export function parseId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n <= 2147483647 ? n : null;
}
