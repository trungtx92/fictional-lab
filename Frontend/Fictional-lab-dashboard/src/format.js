const compact = new Intl.NumberFormat("en-AU", { notation: "compact", maximumFractionDigits: 1 });
const compactCurrency = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatNumber = (n) => Math.round(n).toLocaleString("en-AU");
export const formatCompact = (n) => compact.format(n);
export const formatRevenue = (n) => compactCurrency.format(n);
export const formatPercent = (fraction) => `${Math.round(fraction * 100)}%`;
