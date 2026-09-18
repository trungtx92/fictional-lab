import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useFetch } from "../api/useFetch.js";
import { Loading, ErrorBanner, EmptyState } from "../components/StatusBanner.jsx";
import { StatusPill, formatCurrency, formatDate } from "../components/StatusPill.jsx";

export function CustomerDetail() {
  const { id } = useParams();
  const { data: customer, loading: l1, error: e1 } = useFetch(() => api.getCustomer(id), [id]);
  const { data: transactions, loading: l2, error: e2 } = useFetch(
    () => api.getCustomerTransactions(id),
    [id]
  );

  if (l1 || l2) return <Loading />;
  if (e1 || e2) return <ErrorBanner message={e1 || e2} />;

  return (
    <div>
      <Link to="/customers" className="back-link">&larr; Back to Customers</Link>
      <h1>
        {customer.first_name} {customer.last_name}
      </h1>

      <dl className="detail-list">
        <dt>Email</dt>
        <dd>{customer.email}</dd>
        <dt>Phone</dt>
        <dd>{customer.phone}</dd>
        <dt>Address</dt>
        <dd>{customer.address}</dd>
        <dt>Customer Since</dt>
        <dd>{formatDate(customer.created_at)}</dd>
      </dl>

      <h2>Transaction History</h2>
      {transactions.length === 0 ? (
        <EmptyState label="This customer has no transactions yet." />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Payment</th>
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
                <td>{t.payment_method}</td>
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
