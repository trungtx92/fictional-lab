import { useState } from "react";
import { formatNumber, formatPercent } from "../../format.js";

const SIZE = 140;
const RADIUS = SIZE / 2 - 2;
const CENTER = SIZE / 2;
const HOLE_RADIUS = RADIUS * 0.54;
const LABEL_RADIUS = (RADIUS + HOLE_RADIUS) / 2;
// Slices thinner than this can't hold their percentage label.
const MIN_LABEL_FRACTION = 0.07;
// One hue, dark to light. Slices are outlined and every one is labelled in
// the legend, so the lightest tint doesn't depend on contrast with the page.
const COLORS = ["#3d5f85", "#8ca7c5", "#dde4ee"];
// Label colour that reads on each slice colour.
const LABEL_COLORS = ["#fff", "#fff", "#1c1c1c"];

const point = (angle, radius = RADIUS) => [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)];

const circle = (radius) =>
  `M${CENTER - radius},${CENTER} a${radius},${radius} 0 1 0 ${radius * 2},0 a${radius},${radius} 0 1 0 ${-radius * 2},0 Z`;

// data: [{ name, value }], at most three slices. With `donut`, each slice
// carries its percentage and the hole shows the total.
export function PieChart({ data, ariaLabel, donut = false }) {
  const [active, setActive] = useState(null);
  const sum = data.reduce((acc, d) => acc + d.value, 0);
  const total = sum || 1;

  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const fraction = d.value / total;
    const start = angle;
    angle += fraction * Math.PI * 2;
    const [x0, y0] = point(start);
    const [x1, y1] = point(angle);
    const large = fraction > 0.5 ? 1 : 0;
    let path;
    if (fraction > 0.999) {
      path = donut ? `${circle(RADIUS)} ${circle(HOLE_RADIUS)}` : circle(RADIUS);
    } else if (donut) {
      const [ix0, iy0] = point(start, HOLE_RADIUS);
      const [ix1, iy1] = point(angle, HOLE_RADIUS);
      path = `M${x0},${y0} A${RADIUS},${RADIUS} 0 ${large} 1 ${x1},${y1} L${ix1},${iy1} A${HOLE_RADIUS},${HOLE_RADIUS} 0 ${large} 0 ${ix0},${iy0} Z`;
    } else {
      path = `M${CENTER},${CENTER} L${x0},${y0} A${RADIUS},${RADIUS} 0 ${large} 1 ${x1},${y1} Z`;
    }
    const [labelX, labelY] = point((start + angle) / 2, LABEL_RADIUS);
    return { ...d, fraction, path, labelX, labelY, color: COLORS[i], labelColor: LABEL_COLORS[i] };
  });

  return (
    <div className="pie">
      <svg width={SIZE} height={SIZE} role="img" aria-label={ariaLabel} onMouseLeave={() => setActive(null)}>
        {slices.map((s) => (
          <path
            key={s.name}
            className={`pie__slice ${active && active !== s.name ? "is-dimmed" : ""}`}
            d={s.path}
            fill={s.color}
            fillRule="evenodd"
            onMouseEnter={() => setActive(s.name)}
          />
        ))}
        {donut &&
          slices.map(
            (s) =>
              s.fraction >= MIN_LABEL_FRACTION && (
                <text key={s.name} className="pie__label" x={s.labelX} y={s.labelY} fill={s.labelColor}>
                  {formatPercent(s.fraction)}
                </text>
              )
          )}
        {donut && (
          <>
            <text className="pie__total" x={CENTER} y={CENTER - 3}>
              {formatNumber(sum)}
            </text>
            <text className="pie__total-caption" x={CENTER} y={CENTER + 11}>
              Total
            </text>
          </>
        )}
      </svg>
      <ul className="pie__legend">
        {slices.map((s) => (
          <li
            key={s.name}
            className={active === s.name ? "is-active" : ""}
            onMouseEnter={() => setActive(s.name)}
            onMouseLeave={() => setActive(null)}
          >
            <i className="chart__swatch chart__swatch--outlined" style={{ background: s.color }} />
            <span>{s.name}</span>
            {!donut && (
              <>
                <b>{formatPercent(s.fraction)}</b>
                <span className="pie__count">{formatNumber(s.value)}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
