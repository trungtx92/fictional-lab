import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useFetch } from "../api/useFetch.js";
import { Loading, ErrorBanner, EmptyState } from "../components/StatusBanner.jsx";

export function Customers() {
  const [search, setSearch] = useState("");
  const { data: customers, loading, error } = useFetch(() => api.getCustomers(search), [search]);

  return (
    <div>
      <h1>Customers</h1>
      <input
        className="text-input"
        type="search"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <Loading />}
      {error && <ErrorBanner message={error} />}
      {!loading && !error && customers.length === 0 && <EmptyState label="No customers found." />}

      {!loading && !error && customers.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.customer_id}>
                <td>
                  <Link to={`/customers/${c.customer_id}`}>
                    {c.first_name} {c.last_name}
                  </Link>
                </td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
