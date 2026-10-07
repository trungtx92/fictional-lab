import { formatCompact, formatNumber } from "../../format.js";

// data: [{ name, value }]. Every bar carries its value on top and its name
// underneath; the full name and exact value are in the hover title.
export function BarChart({ data, height = 190, ariaLabel }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  // Past six bars the columns are too narrow for horizontal names, so they slant.
  const dense = data.length > 6;

  return (
    <div className={`bars ${dense ? "bars--dense" : ""}`} style={{ height }} role="img" aria-label={ariaLabel}>
      {data.map((d) => (
        <div className="bars__col" key={d.name} title={`${d.name}: ${formatNumber(d.value)}`}>
          <div className="bars__track">
            <span className="bars__value">{formatCompact(d.value)}</span>
            <div className="bars__bar" style={{ height: `calc((100% - 18px) * ${d.value / max})` }} />
          </div>
          <span className="bars__label">
            <span>{d.name}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
