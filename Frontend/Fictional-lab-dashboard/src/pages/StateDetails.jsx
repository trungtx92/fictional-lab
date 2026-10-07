import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useFetch } from "../api/useFetch.js";
import { CategoryFilter } from "../components/CategoryFilter.jsx";
import { STATE_COLORS } from "../components/AustraliaMap.jsx";
import { StateShape } from "../components/StateShape.jsx";
import { TopBar } from "../components/TopBar.jsx";
import { Widget } from "../components/Widget.jsx";
import { BarChart } from "../components/charts/BarChart.jsx";
import { LineChart } from "../components/charts/LineChart.jsx";
import { PieChart } from "../components/charts/PieChart.jsx";
import { useFilters } from "../filters.js";
import { formatNumber, formatRevenue } from "../format.js";

// Customers and transactions differ by a factor of ~3-4, so instead of a
// second y-axis both are indexed to 100 at the start of the period (or at
// the first non-zero period, which matters for a single postcode's small counts).
const toIndex = (values) => {
  const baseline = values.find((v) => v > 0) || 1;
  return values.map((v) => Math.round((v / baseline) * 100));
};

export function StateDetails() {
  const { code } = useParams();
  const { range, category, postcode, search, setPostcode } = useFilters();
  const { data, loading, error } = useFetch(
    () => api.getStateDetails(code, { range, category, postcode }),
    [code, range, category, postcode]
  );

  // While switching states the previous state's data is still in `data`.
  const current = data?.state.code === code.toUpperCase() ? data : null;

  return (
    <div className="page">
      <TopBar />
      <main className={`page__body ${loading ? "is-loading" : ""}`}>
        {error && (
          <p className="page-message">
            {error}. <Link to={{ pathname: "/", search }}>Back to sales overview</Link>
          </p>
        )}
        {!current && !error && <p className="page-message">Loading…</p>}

        {current && !error && (
          <div className="details">
            <aside className="details__side">
              <h1 className="details__code" title={current.state.name}>
                {current.state.code}
              </h1>
              <StateShape
                code={current.state.code}
                name={current.state.name}
                selected={postcode}
                onSelect={setPostcode}
              />
              <nav className="state-switch" aria-label="Switch state">
                {current.states.map((s) => (
                  <Link
                    key={s.code}
                    to={{ pathname: `/states/${s.code.toLowerCase()}`, search }}
                    title={s.name}
                    aria-current={s.code === current.state.code ? "page" : undefined}
                  >
                    <i style={{ background: STATE_COLORS[s.code] }} />
                    {s.code}
                  </Link>
                ))}
              </nav>
              <p className="details__hint">click another state to switch</p>
              <dl className="stats">
                <div>
                  <dt>Customers</dt>
                  <dd>{formatNumber(current.state.customers)}</dd>
                </div>
                <div>
                  <dt>Txns</dt>
                  <dd>{formatNumber(current.state.txns)}</dd>
                </div>
                {!postcode && (
                  <div>
                    <dt>Stores</dt>
                    <dd>{formatNumber(current.state.stores)}</dd>
                  </div>
                )}
                <div>
                  <dt>Revenue</dt>
                  <dd>{formatRevenue(current.state.revenue)}</dd>
                </div>
              </dl>
            </aside>

            <div className="details__main">
              <CategoryFilter />
              <div className="widgets widgets--two">
                <Widget title="New vs returning" kind="pie">
                  <PieChart data={current.newVsReturning} ariaLabel="New versus returning customers" />
                </Widget>
                <Widget title="Customers vs txns" kind="double line, start = 100">
                  <LineChart
                    labels={current.customersVsTxns.labels}
                    series={[
                      { name: "customers", values: toIndex(current.customersVsTxns.customers) },
                      { name: "txns", values: toIndex(current.customersVsTxns.txns) },
                    ]}
                    ariaLabel="Customers and transactions, indexed to 100 at the start of the period"
                  />
                </Widget>
                <Widget title="Customers by store" kind="bar">
                  <BarChart data={current.customersByStore} ariaLabel="Customers by store" />
                </Widget>
                <Widget title="Transactions over time" kind="line">
                  <LineChart
                    labels={current.txnsOverTime.labels}
                    series={[{ name: "Transactions", values: current.txnsOverTime.values }]}
                    ariaLabel="Transactions over time"
                  />
                </Widget>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
