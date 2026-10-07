import { Link } from "react-router-dom";
// State outlines by Victor Cazanave (@svg-maps/australia), licensed CC BY-SA 4.0.
import australia from "@svg-maps/australia";

// One pastel per state. The assignment keeps look-alike tints (yellow/orange,
// blue/lavender, and ACT's blue against NSW) off shared borders, so don't
// shuffle it without re-checking neighbours.
export const STATE_COLORS = {
  WA: "#fff2cc",
  NT: "#dae8fc",
  SA: "#d5e8d4",
  QLD: "#f8ceec",
  NSW: "#ffe6cc",
  VIC: "#e1d5e7",
  ACT: "#dae8fc",
  TAS: "#b1ddf0",
};

// Label anchor per state, in the map's viewBox units. ACT is too small to
// hold its own label, so it sits off the coast with a leader line.
const LABELS = {
  WA: { x: 62, y: 112 },
  NT: { x: 144, y: 72 },
  SA: { x: 152, y: 152 },
  QLD: { x: 226, y: 86 },
  NSW: { x: 236, y: 160 },
  VIC: { x: 224, y: 197 },
  TAS: { x: 231, y: 244 },
  ACT: { x: 269, y: 196, leaderFrom: { x: 248, y: 189 } },
};

// The package ships islands as separate shapes ("tas-flinders-island"); the
// state code is the part of the id before the first dash.
export const SHAPES = {};
for (const location of australia.locations) {
  const code = location.id.split("-")[0].toUpperCase();
  (SHAPES[code] ??= []).push(location.path);
}

// states: [{ code, name }]. Each state links to its details page.
export function AustraliaMap({ states, hovered, onHover, linkSearch }) {
  return (
    <svg
      className="au-map"
      viewBox={australia.viewBox}
      role="group"
      aria-label="Map of Australia by state"
      onMouseLeave={() => onHover(null)}
    >
      {states.map((state) => {
        const label = LABELS[state.code];
        const className = [
          "au-map__state",
          hovered === state.code ? "is-active" : "",
          hovered && hovered !== state.code ? "is-dimmed" : "",
        ].join(" ");
        return (
          <Link
            key={state.code}
            to={{ pathname: `/states/${state.code.toLowerCase()}`, search: linkSearch }}
            className={className}
            aria-label={`${state.name} details`}
            onMouseEnter={() => onHover(state.code)}
            onFocus={() => onHover(state.code)}
            onBlur={() => onHover(null)}
          >
            {SHAPES[state.code].map((path) => (
              <path key={path} d={path} fill={STATE_COLORS[state.code]} />
            ))}
            {label.leaderFrom && (
              <line
                className="au-map__leader"
                x1={label.leaderFrom.x}
                y1={label.leaderFrom.y}
                x2={label.x - 9}
                y2={label.y - 3}
              />
            )}
            <text className="au-map__label" x={label.x} y={label.y} textAnchor="middle">
              {state.code}
            </text>
          </Link>
        );
      })}
    </svg>
  );
}
