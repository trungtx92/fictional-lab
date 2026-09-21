import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useFetch } from "../api/useFetch.js";
import { Loading, ErrorBanner } from "../components/StatusBanner.jsx";
import { StatusPill, formatCurrency, formatDate } from "../components/StatusPill.jsx";

export function TransactionDetail() {
  const { id } = useParams();
  const { data: t, loading, error } = useFetch(() => api.getTransaction(id), [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <Link to="/transactions" className="back-link">&larr; Back to Transactions</Link>
      <h1>Transaction #{t.transaction_id}</h1>

      <dl className="detail-list">
        <dt>Date</dt>
        <dd>{formatDate(t.transaction_date)}</dd>
        <dt>Status</dt>
        <dd><StatusPill status={t.status} /></dd>
        <dt>Payment Method</dt>
        <dd>{t.payment_method}</dd>
        <dt>Customer</dt>
        <dd>
          {t.customer ? (
            <Link to={`/customers/${t.customer.customer_id}`}>
              {t.customer.first_name} {t.customer.last_name}
            </Link>
          ) : (
            "—"
          )}
        </dd>
        <dt>Store</dt>
        <dd>
          {t.store ? <Link to={`/stores/${t.store.store_id}`}>{t.store.store_name}</Link> : "—"}
        </dd>
      </dl>

      <h2>Line Items</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {t.items.map((item) => (
            <tr key={item.transaction_item_id}>
              <td>{item.product?.product_name ?? `#${item.product_id}`}</td>
              <td>{item.product?.sku ?? "—"}</td>
              <td>{item.quantity}</td>
              <td>{formatCurrency(item.unit_price)}</td>
              <td>{formatCurrency(item.line_total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} style={{ textAlign: "right", fontWeight: 600 }}>
              Total
            </td>
            <td style={{ fontWeight: 600 }}>{formatCurrency(t.total_amount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
