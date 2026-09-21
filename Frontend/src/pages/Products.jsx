import { useMemo, useState } from "react";
import { api } from "../api/client.js";
import { useFetch } from "../api/useFetch.js";
import { Loading, ErrorBanner, EmptyState } from "../components/StatusBanner.jsx";
import { formatCurrency } from "../components/StatusPill.jsx";

export function Products() {
  const [category, setCategory] = useState("");
  const { data: allProducts, loading, error } = useFetch(api.getProducts, []);

  const categories = useMemo(
    () => (allProducts ? [...new Set(allProducts.map((p) => p.category))].sort() : []),
    [allProducts]
  );

  const filtered = useMemo(() => {
    if (!allProducts) return [];
    return category ? allProducts.filter((p) => p.category === category) : allProducts;
  }, [allProducts, category]);

  if (loading) return <Loading />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <h1>Products</h1>
      <select className="text-input" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {filtered.length === 0 ? (
        <EmptyState label="No products in this category." />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.product_id}>
                <td>{p.sku}</td>
                <td>{p.product_name}</td>
                <td>{p.category}</td>
                <td>{formatCurrency(p.unit_price)}</td>
                <td>
                  <span className={p.is_active ? "pill pill--success" : "pill"}>
                    {p.is_active ? "active" : "inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
