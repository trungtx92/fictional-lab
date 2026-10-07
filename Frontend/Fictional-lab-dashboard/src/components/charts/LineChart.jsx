import { useState } from "react";
import { formatCompact, formatNumber } from "../../format.js";
import { useWidth } from "./useWidth.js";

const MARGIN = { top: 10, right: 14, bottom: 24, left: 42 };
// Second series is dashed as well as lighter, so the two never rely on colour alone.
const STYLES = [
  { color: "#3d5f85", dash: undefined },
  { color: "#5b82ab", dash: "6 4" },
];

function niceTicks(min, max) {
  const span = max - min || Math.abs(max) || 1;
  const rough = span / 3;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 2, 5, 10].find((m) => m * pow >= rough) * pow;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(v);
  return ticks;
}

// series: [{ name, values, color? }], all sharing one y-axis and the same `labels`.
// `color` overrides the default blue for that series and draws it solid.
export function LineChart({ labels, series, height = 190, formatValue = formatNumber, ariaLabel }) {
  const [ref, width] = useWidth();
  const [active, setActive] = useState(null);

  const count = labels.length;
  const innerW = Math.max(width - MARGIN.left - MARGIN.right, 0);
  const innerH = height - MARGIN.top - MARGIN.bottom;
  const all = series.flatMap((s) => s.values);
  const ticks = niceTicks(Math.min(...all), Math.max(...all));
  const lo = ticks[0];
  const hi = ticks[ticks.length - 1];

  const x = (i) => MARGIN.left + (count > 1 ? (i / (count - 1)) * innerW : innerW / 2);
  const y = (v) => MARGIN.top + innerH - ((v - lo) / (hi - lo || 1)) * innerH;

  const handleMove = (e) => {
    const left = e.currentTarget.getBoundingClientRect().left;
    const ratio = innerW ? (e.clientX - left - MARGIN.left) / innerW : 0;
    setActive(Math.min(Math.max(Math.round(ratio * (count - 1)), 0), count - 1));
  };

  const xLabels = count > 2 ? [0, Math.floor((count - 1) / 2), count - 1] : labels.map((_, i) => i);
  const anchors = ["start", "middle", "end"];

  return (
    <div className="chart" ref={ref}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          onPointerMove={handleMove}
          onPointerLeave={() => setActive(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line className="chart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)} />
              <text className="chart__tick" x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end">
                {formatCompact(t)}
              </text>
            </g>
          ))}
          <line className="chart__axis" x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={MARGIN.top + innerH} />
          <line
            className="chart__axis"
            x1={MARGIN.left}
            x2={width - MARGIN.right}
            y1={MARGIN.top + innerH}
            y2={MARGIN.top + innerH}
          />
          {xLabels.map((i, n) => (
            <text
              key={i}
              className="chart__tick"
              x={x(i)}
              y={height - 6}
              textAnchor={xLabels.length === 3 ? anchors[n] : "middle"}
            >
              {labels[i]}
            </text>
          ))}
          {active !== null && (
            <line
              className="chart__crosshair"
              x1={x(active)}
              x2={x(active)}
              y1={MARGIN.top}
              y2={MARGIN.top + innerH}
            />
          )}
          {series.map((s, n) => (
            <polyline
              key={s.name}
              fill="none"
              stroke={s.color ?? STYLES[n].color}
              strokeWidth="2"
              strokeDasharray={s.color ? undefined : STYLES[n].dash}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
            />
          ))}
          {active !== null &&
            series.map((s, n) => (
              <circle
                key={s.name}
                cx={x(active)}
                cy={y(s.values[active])}
                r="4"
                fill={s.color ?? STYLES[n].color}
                stroke="#fff"
                strokeWidth="2"
              />
            ))}
        </svg>
      )}

      {active !== null && (
        <div
          className={`chart__tooltip ${x(active) > width / 2 ? "chart__tooltip--left" : ""}`}
          style={{ left: x(active), top: MARGIN.top }}
        >
          <strong>{labels[active]}</strong>
          {series.map((s, n) => (
            <span key={s.name} className="chart__tooltip-row">
              <i className="chart__swatch" style={{ background: s.color ?? STYLES[n].color }} />
              {s.name}
              <b>{formatValue(s.values[active])}</b>
            </span>
          ))}
        </div>
      )}

      {series.length > 1 && (
        <ul className="chart__legend">
          {series.map((s, n) => (
            <li key={s.name}>
              <svg width="22" height="8" aria-hidden="true">
                <line
                  x1="1"
                  x2="21"
                  y1="4"
                  y2="4"
                  stroke={s.color ?? STYLES[n].color}
                  strokeWidth="2"
                  strokeDasharray={s.color ? undefined : STYLES[n].dash}
                />
              </svg>
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
