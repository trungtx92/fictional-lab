import { CATEGORIES, useFilters } from "../filters.js";

export function CategoryFilter({ hint }) {
  const { category, setCategory } = useFilters();
  return (
    <div className="filter-row">
      <label htmlFor="category-filter">Product category</label>
      <select
        id="category-filter"
        className="select select--wide"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      {hint && <span className="filter-row__hint">{hint}</span>}
    </div>
  );
}
