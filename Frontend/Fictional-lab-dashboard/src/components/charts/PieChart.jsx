import { useState } from "react";
import { formatNumber, formatPercent } from "../../format.js";

const SIZE = 140;
const RADIUS = SIZE / 2 - 2;
const CENTER = SIZE / 2;
// One hue, dark to light. Slices are outlined and every one is labelled in
// the legend, so the lightest tint doesn't depend on contrast with the page.
const COLORS = ["#3d5f85", "#8ca7c5", "#dde4ee"];

const point = (angle) => [CENTER + RADIUS * Math.cos(angle), CENTER + RADIUS * Math.sin(angle)];

// data: [{ name, value }], at most three slices.
export function PieChart({ data, ariaLabel }) {
  const [active, setActive] = useState(null);
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;

  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const fraction = d.value / total;
    const start = angle;
    angle += fraction * Math.PI * 2;
    const [x0, y0] = point(start);
    const [x1, y1] = point(angle);
    const path = `M${CENTER},${CENTER} L${x0},${y0} A${RADIUS},${RADIUS} 0 ${fraction > 0.5 ? 1 : 0} 1 ${x1},${y1} Z`;
    return { ...d, fraction, path, color: COLORS[i] };
  });

  return (
    <div className="pie">
      <svg width={SIZE} height={SIZE} role="img" aria-label={ariaLabel} onMouseLeave={() => setActive(null)}>
        {slices.map((s) =>
          s.fraction > 0.999 ? (
            <circle key={s.name} className="pie__slice" cx={CENTER} cy={CENTER} r={RADIUS} fill={s.color} />
          ) : (
            <path
              key={s.name}
              className={`pie__slice ${active && active !== s.name ? "is-dimmed" : ""}`}
              d={s.path}
              fill={s.color}
              onMouseEnter={() => setActive(s.name)}
            />
          )
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
            <b>{formatPercent(s.fraction)}</b>
            <span className="pie__count">{formatNumber(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
