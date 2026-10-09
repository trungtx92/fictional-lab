import { useState } from "react";
import { Link, useMatch } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { RANGES, useFilters } from "../filters.js";
import { ChatBox } from "./ChatBox.jsx";

export function TopBar() {
  const { user, signOut } = useAuth();
  const { range, category, setRange, search } = useFilters();
  const onStatePage = useMatch("/states/:code");
  const [chatOpen, setChatOpen] = useState(false);

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
        <button
          type="button"
          className="topbar__add"
          aria-label="Ask about the data"
          aria-expanded={chatOpen}
          onClick={() => setChatOpen((open) => !open)}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
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
      <ChatBox
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        context={{ range, category, state: onStatePage?.params.code }}
      />
    </header>
  );
}
