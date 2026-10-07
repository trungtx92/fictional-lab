import { Link, useMatch } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { RANGES, useFilters } from "../filters.js";

export function TopBar() {
  const { user, signOut } = useAuth();
  const { range, setRange, search } = useFilters();
  const onStatePage = useMatch("/states/:code");

  return (
    <header className="topbar">
      {/* Breadcrumb: the page you are on is plain text, pages above it are links. */}
      <nav className="topbar__title" aria-label="Breadcrumb">
        {onStatePage ? (
          <>
            <Link to={{ pathname: "/", search }}>Country Economy</Link>
            <span className="topbar__separator" aria-hidden="true">
              |
            </span>
            <span aria-current="page">State Economy</span>
          </>
        ) : (
          <span aria-current="page">Country Economy</span>
        )}
      </nav>
      <div className="topbar__actions">
        <select
          className="select"
          aria-label="Date range"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          {RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <details className="account">
          <summary className="account__avatar" aria-label="Account menu">
            {user.email[0].toUpperCase()}
          </summary>
          <div className="account__menu">
            <span className="account__email">{user.email}</span>
            <button type="button" className="button button--outline" onClick={signOut}>
              Sign out
            </button>
          </div>
        </details>
      </div>
    </header>
  );
}
