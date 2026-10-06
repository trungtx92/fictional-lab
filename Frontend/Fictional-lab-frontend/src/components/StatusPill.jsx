const STATUS_CLASS = {
  completed: "pill pill--success",
  refunded: "pill pill--warning",
  voided: "pill pill--danger",
};

export function StatusPill({ status }) {
  return <span className={STATUS_CLASS[status] || "pill"}>{status}</span>;
}

export function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// For DATE-only values such as date_of_birth ("YYYY-MM-DD"): no time part, and
// rendered in UTC so the day does not shift with the viewer's timezone.
export function formatDateOnly(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
