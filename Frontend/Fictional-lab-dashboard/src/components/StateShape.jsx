import { useEffect, useState } from "react";
import { STATE_COLORS } from "./AustraliaMap.jsx";

// One file per state: { viewBox, outline, postcodes: [[code, path], ...] },
// generated from ABS 2021 state and Postal Area boundaries (CC BY 4.0).
// Loaded on demand so each state's shapes are only fetched when it is opened.
const LOADERS = import.meta.glob("../data/postcodes/*.json", { import: "default" });

// Map of a single state in its overview-map colour, divided by postcode.
// Clicking a postcode selects it (clicking it again clears it); the text box
// does the same for keyboard users and for city postcodes too small to hit.
export function StateShape({ code, name, selected, onSelect }) {
  const [map, setMap] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [text, setText] = useState(selected);

  // Keep the box in step when the postcode changes elsewhere (map click, "show whole state").
  useEffect(() => setText(selected), [selected]);

  useEffect(() => {
    let cancelled = false;
    setMap(null);
    setHovered(null);
    LOADERS[`../data/postcodes/${code.toLowerCase()}.json`]().then((loaded) => {
      if (!cancelled) setMap(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (!map) return <div className="state-shape state-shape--loading">Loading map…</div>;

  const selectedPath = map.postcodes.find(([id]) => id === selected)?.[1];
  const isKnown = (id) => map.postcodes.some(([known]) => known === id);
  const unknown = text.length === 4 && !isKnown(text);

  // Applies as soon as four digits match a postcode in this state; emptying the box clears it.
  const handleType = (e) => {
    const next = e.target.value.replace(/\D/g, "").slice(0, 4);
    setText(next);
    if (next === "" || (next.length === 4 && isKnown(next))) onSelect(next);
  };

  const handleClick = (e) => {
    const id = e.target.dataset.postcode;
    if (id) onSelect(id === selected ? "" : id);
  };

  return (
    <figure className="state-shape">
      <svg
        viewBox={map.viewBox}
        role="img"
        aria-label={`Map of ${name} divided by postcode`}
        onClick={handleClick}
        onMouseOver={(e) => setHovered(e.target.dataset.postcode ?? null)}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Areas with no postcode (some parks and remote land) show as plain fill. */}
        <path className="state-shape__base" d={map.outline} fill={STATE_COLORS[code]} />
        {map.postcodes.map(([id, d]) => (
          <path key={id} className="state-shape__postcode" data-postcode={id} d={d} fill={STATE_COLORS[code]} />
        ))}
        <path className="state-shape__outline" d={map.outline} />
        {selectedPath && <path className="state-shape__selected" d={selectedPath} />}
      </svg>
      <figcaption>
        {hovered ? `Postcode ${hovered}` : `${map.postcodes.length} postcodes · click one to filter`}
      </figcaption>
      <input
        className="input state-shape__input"
        type="text"
        inputMode="numeric"
        placeholder="Type a postcode"
        aria-label="Postcode"
        aria-invalid={unknown}
        list="state-postcodes"
        value={text}
        onChange={handleType}
      />
      <datalist id="state-postcodes">
        {map.postcodes.map(([id]) => (
          <option key={id} value={id} />
        ))}
      </datalist>
      {unknown && (
        <p className="form-error" role="alert">
          No postcode {text} in {code}.
        </p>
      )}
    </figure>
  );
}
