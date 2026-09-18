export function Loading({ label = "Loading…" }) {
  return <div className="status-banner status-banner--loading">{label}</div>;
}

export function ErrorBanner({ message }) {
  return <div className="status-banner status-banner--error">⚠ {message}</div>;
}

export function EmptyState({ label = "Nothing here yet." }) {
  return <div className="status-banner status-banner--empty">{label}</div>;
}
