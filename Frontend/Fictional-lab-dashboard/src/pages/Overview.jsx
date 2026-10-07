import { useState } from "react";
import { api } from "../api/client.js";
import { useFetch } from "../api/useFetch.js";
import { CategoryFilter } from "../components/CategoryFilter.jsx";
import { AustraliaMap, STATE_COLORS } from "../components/AustraliaMap.jsx";
import { TopBar } from "../components/TopBar.jsx";
import { Widget } from "../components/Widget.jsx";
import { BarChart } from "../components/charts/BarChart.jsx";
import { LineChart } from "../components/charts/LineChart.jsx";
import { PieChart } from "../components/charts/PieChart.jsx";
import { useFilters } from "../filters.js";
import { formatNumber, formatRevenue } from "../format.js";

const KPIS = [
  ["customers", "Customers"],
  ["stores", "Stores"],
  ["transactions", "Transactions"],
  ["products", "Products"],
];

export function Overview() {
  const { range, category, search } = useFilters();
  const { data, loading, error } = useFetch(() => api.getOverview({ range, category }), [range, category]);
  const [hovered, setHovered] = useState(null);

  const hoveredState = data?.states.find((s) => s.code === hovered);
  const panel = hoveredState
    ? { title: `Hover: ${hoveredState.code}`, ...hoveredState }
    : data && {
        title: "All states",
        revenue: data.states.reduce((acc, s) => acc + s.revenue, 0),
        customers: data.kpis.customers,
        txns: data.kpis.transactions,
      };

  return (
    <div className="page">
      <TopBar />
      <main className={`page__body ${loading ? "is-loading" : ""}`}>
        <CategoryFilter hint="filters map + all widgets" />

        {error && <p className="form-error">{error}</p>}
        {!data && !error && <p className="page-message">Loading…</p>}

        {data && (
          <>
            <div className="kpis">
              {KPIS.map(([key, label]) => (
                <div className="kpi" key={key}>
                  <span className="kpi__label">{label}</span>
                  <span className="kpi__value">{formatNumber(data.kpis[key])}</span>
                </div>
              ))}
            </div>

            <section className="map-card">
              <div className="map-card__map">
                <AustraliaMap states={data.states} hovered={hovered} onHover={setHovered} linkSearch={search} />
              </div>
              <div className="map-card__panel">
                <h3>
                  {hoveredState && (
                    <i className="map-card__swatch" style={{ background: STATE_COLORS[hoveredState.code] }} />
                  )}
                  {panel.title}
                </h3>
                <p>Revenue {formatRevenue(panel.revenue)}</p>
                <p>Customers {formatNumber(panel.customers)}</p>
                <p>Txns {formatNumber(panel.txns)}</p>
                <span className="map-card__hint">click → state details</span>
              </div>
            </section>

            <div className="widgets widgets--three">
              <Widget title="Txns over time" kind="line">
                <LineChart
                  labels={data.txnsOverTime.labels}
                  series={[{ name: "Transactions", values: data.txnsOverTime.values }]}
                  ariaLabel="Transactions over time"
                />
              </Widget>
              <Widget title="Top products" kind="bar">
                <BarChart data={data.topProducts} ariaLabel="Top products by units sold" />
              </Widget>
              <Widget title="Gender distribution" kind="pie">
                <PieChart data={data.genderDistribution} ariaLabel="Customers by gender: male and female" />
              </Widget>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
