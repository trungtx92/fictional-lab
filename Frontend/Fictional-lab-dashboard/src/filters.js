import { useSearchParams } from "react-router-dom";

export const RANGES = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "12m", label: "Last 12 months" },
];

export const CATEGORIES = [
  { id: "electronics", label: "Electronics" },
  { id: "apparel", label: "Apparel" },
  { id: "home", label: "Home & Garden" },
  { id: "grocery", label: "Grocery" },
  { id: "sports", label: "Sports & Outdoors" },
];

const DEFAULT_RANGE = "30d";

// Date range and product category live in the query string so they survive
// navigating between the overview and a state page (and a page refresh).
export function useFilters() {
  const [params, setParams] = useSearchParams();

  const rangeParam = params.get("range");
  const categoryParam = params.get("category");
  const range = RANGES.some((r) => r.id === rangeParam) ? rangeParam : DEFAULT_RANGE;
  const category = CATEGORIES.some((c) => c.id === categoryParam) ? categoryParam : "";

  const set = (key, value, fallback) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  // A postcode only means something within one state, so it is left out of
  // `search`, which is what links to other pages carry along.
  const postcodeParam = params.get("postcode");
  const postcode = /^\d{4}$/.test(postcodeParam ?? "") ? postcodeParam : "";
  const shared = new URLSearchParams(params);
  shared.delete("postcode");

  const query = shared.toString();
  return {
    range,
    category,
    postcode,
    search: query ? `?${query}` : "",
    setRange: (value) => set("range", value, DEFAULT_RANGE),
    setCategory: (value) => set("category", value, ""),
    setPostcode: (value) => set("postcode", value, ""),
  };
}
