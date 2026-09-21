import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useFetch } from "../api/useFetch.js";
import { Loading, ErrorBanner, EmptyState } from "../components/StatusBanner.jsx";
import { StatusPill, formatCurrency, formatDate } from "../components/StatusPill.jsx";

export function Transactions() {
  const [status, setStatus] = useState("");
  const { data: transactions, loading, error } = useFetch(
    () => api.getTransactions(status ? { status } : {}),
    [status]
  );

  if (loading) return <Loading />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <h1>Transactions</h1>
      <select className="text-input" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option>
        <option value="completed">Completed</option>
        <option value="refunded">Refunded</option>
        <option value="voided">Voided</option>
      </select>

      {transactions.length === 0 ? (
        <EmptyState label="No transactions match this filter." />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Store</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.transaction_id}>
                <td>
                  <Link to={`/transactions/${t.transaction_id}`}>{formatDate(t.transaction_date)}</Link>
                </td>
                <td>{t.customer_name}</td>
                <td>{t.store_name}</td>
                <td><StatusPill status={t.status} /></td>
                <td>{formatCurrency(t.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
