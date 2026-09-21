import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useFetch } from "../api/useFetch.js";
import { Loading, ErrorBanner } from "../components/StatusBanner.jsx";

export function Stores() {
  const { data: stores, loading, error } = useFetch(api.getStores, []);

  if (loading) return <Loading />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <h1>Stores</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Store</th>
            <th>Region</th>
            <th>Address</th>
            <th>Manager</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.store_id}>
              <td>
                <Link to={`/stores/${s.store_id}`}>{s.store_name}</Link>
              </td>
              <td>{s.region}</td>
              <td>{s.address}</td>
              <td>{s.manager_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
