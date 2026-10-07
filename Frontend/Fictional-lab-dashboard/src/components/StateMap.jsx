// Tile cartogram from the wireframe: each state is a block placed roughly
// where it sits on the map, on a 4-column x 5-row grid. Decorative only; it
// is the heat-map preview on the login page.
const TILES = {
  WA: { gridColumn: "1", gridRow: "1 / 5" },
  NT: { gridColumn: "2", gridRow: "1 / 3" },
  SA: { gridColumn: "2", gridRow: "3 / 5" },
  QLD: { gridColumn: "3 / 5", gridRow: "1 / 3" },
  NSW: { gridColumn: "3 / 5", gridRow: "3" },
  VIC: { gridColumn: "3", gridRow: "4" },
  ACT: { gridColumn: "4", gridRow: "4" },
  TAS: { gridColumn: "3", gridRow: "5" },
};

const HEAT_STEPS = 5;

// states: [{ code, revenue }]. Tiles are shaded by revenue relative to the largest.
export function StateMap({ states }) {
  const maxRevenue = Math.max(...states.map((s) => s.revenue), 1);

  return (
    <div className="state-map" aria-hidden="true">
      {states.map((state) => {
        const step = Math.min(Math.floor((state.revenue / maxRevenue) * HEAT_STEPS), HEAT_STEPS - 1);
        return (
          <div
            key={state.code}
            className={`state-map__tile state-map__tile--heat-${step}`}
            style={TILES[state.code]}
          >
            {state.code}
          </div>
        );
      })}
    </div>
  );
}
