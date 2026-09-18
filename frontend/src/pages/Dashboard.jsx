import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useFetch } from "../api/useFetch.js";
import { Loading, ErrorBanner } from "../components/StatusBanner.jsx";
import { formatCurrency } from "../components/StatusPill.jsx";

export function Dashboard() {
  const { data: customers, loading: l1, error: e1 } = useFetch(api.getCustomers, []);
  const { data: stores, loading: l2, error: e2 } = useFetch(api.getStores, []);
  const { data: products, loading: l3, error: e3 } = useFetch(api.getProducts, []);
  const { data: transactions, loading: l4, error: e4 } = useFetch(api.getTransactions, []);

  const loading = l1 || l2 || l3 || l4;
  const error = e1 || e2 || e3 || e4;

  if (loading) return <Loading label="Loading dashboard…" />;
  if (error) return <ErrorBanner message={error} />;

  const completed = transactions.filter((t) => t.status === "completed");
  const totalRevenue = completed.reduce((sum, t) => sum + t.total_amount, 0);

  const revenueByStore = stores.map((store) => {
    const storeTxns = completed.filter((t) => t.store_id === store.store_id);
    const revenue = storeTxns.reduce((sum, t) => sum + t.total_amount, 0);
    return { store, revenue, count: storeTxns.length };
  });

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="card-grid">
        <SummaryCard label="Customers" value={customers.length} to="/customers" />
        <SummaryCard label="Stores" value={stores.length} to="/stores" />
        <SummaryCard label="Products" value={products.length} to="/products" />
        <SummaryCard label="Transactions" value={transactions.length} to="/transactions" />
        <SummaryCard label="Revenue (completed)" value={formatCurrency(totalRevenue)} />
      </div>

      <h2>Revenue by Store</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Store</th>
            <th>Region</th>
            <th>Completed Transactions</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {revenueByStore.map(({ store, revenue, count }) => (
            <tr key={store.store_id}>
              <td>
                <Link to={`/stores/${store.store_id}`}>{store.store_name}</Link>
              </td>
              <td>{store.region}</td>
              <td>{count}</td>
              <td>{formatCurrency(revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryCard({ label, value, to }) {
  const content = (
    <>
      <div className="summary-card__value">{value}</div>
      <div className="summary-card__label">{label}</div>
    </>
  );
  return to ? (
    <Link to={to} className="summary-card summary-card--link">
      {content}
    </Link>
  ) : (
    <div className="summary-card">{content}</div>
  );
}
