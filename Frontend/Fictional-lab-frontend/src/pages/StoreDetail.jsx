import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useFetch } from "../api/useFetch.js";
import { Loading, ErrorBanner, EmptyState } from "../components/StatusBanner.jsx";
import { StatusPill, formatCurrency, formatDate } from "../components/StatusPill.jsx";

export function StoreDetail() {
  const { id } = useParams();
  const { data: store, loading: l1, error: e1 } = useFetch(() => api.getStore(id), [id]);
  const { data: summary, loading: l2, error: e2 } = useFetch(() => api.getStoreSalesSummary(id), [id]);
  const { data: transactions, loading: l3, error: e3 } = useFetch(
    () => api.getTransactions({ store_id: id }),
    [id]
  );

  if (l1 || l2 || l3) return <Loading />;
  if (e1 || e2 || e3) return <ErrorBanner message={e1 || e2 || e3} />;

  return (
    <div>
      <Link to="/stores" className="back-link">&larr; Back to Stores</Link>
      <h1>{store.store_name}</h1>

      <dl className="detail-list">
        <dt>Region</dt>
        <dd>{store.region}</dd>
        <dt>Address</dt>
        <dd>{store.address}</dd>
        <dt>Manager</dt>
        <dd>{store.manager_name}</dd>
      </dl>

      <div className="card-grid">
        <div className="summary-card">
          <div className="summary-card__value">{summary.transaction_count}</div>
          <div className="summary-card__label">Completed Transactions</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__value">{formatCurrency(summary.total_revenue)}</div>
          <div className="summary-card__label">Total Revenue</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__value">{formatCurrency(summary.average_order_value)}</div>
          <div className="summary-card__label">Average Order Value</div>
        </div>
      </div>

      <h2>Transactions</h2>
      {transactions.length === 0 ? (
        <EmptyState label="No transactions at this store yet." />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
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
