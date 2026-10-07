// Line icons for the KPI cards, drawn on a 24x24 grid in the current text colour.
const ICONS = {
  // Two people
  customers: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  // Shopfront with awning and door
  stores: (
    <>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      <path d="M5 12.5V20h14v-7.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  // Payment card
  transactions: (
    <>
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <path d="M1 10h22" />
      <path d="M5 15h4" />
    </>
  ),
  // Parcel box
  products: (
    <>
      <path d="M16.5 9.4L7.5 4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </>
  ),
};

// Decorative: the card's label already says what the number is.
export function KpiIcon({ name }) {
  return (
    <span className="kpi__icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICONS[name]}
      </svg>
    </span>
  );
}
