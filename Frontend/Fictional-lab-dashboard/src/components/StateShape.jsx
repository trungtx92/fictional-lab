import { useEffect, useMemo, useRef, useState } from "react";
import { STATE_COLORS } from "./AustraliaMap.jsx";

// One file per state: { viewBox, outline, postcodes: [[code, path, names], ...] },
// generated from ABS 2021 state and Postal Area boundaries (CC BY 4.0).
// `names` are the postcode's localities (suburbs/towns), main one first.
// Loaded on demand so each state's shapes are only fetched when it is opened.
const LOADERS = import.meta.glob("../data/postcodes/*.json", { import: "default" });

const ZOOM_MS = 450;
const BUTTON_ZOOM_MS = 200;
// A selected postcode fills 70% of the frame (its longer side).
const ZOOM_FILL = 0.7;
// Closest zoom: the view is never shorter than this fraction of the state's height.
const MIN_ZOOM_FRACTION = 0.002;
// Each press of + / − changes the visible height by this factor.
const BUTTON_STEP = 0.6;
// Pointer travel (px) before a press counts as a drag rather than a click.
const DRAG_THRESHOLD = 4;
const MAX_SUGGESTIONS = 8;

// "Ballarat +14 more" - a postcode usually covers several localities.
const placeLabel = (names) =>
  names.length > 1 ? `${names[0]} +${names.length - 1} more` : (names[0] ?? "");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// viewBox [x, y, w, h] of height `h` centred on (cx, cy), shaped like the
// on-screen frame (`aspect` = width / height). The view stays inside the full
// map where it can, and becomes the full map once it would cover all of it.
function frameBox(cx, cy, h, full, aspect) {
  const [, , fullW, fullH] = full;
  const w = h * aspect;
  if (w >= fullW && h >= fullH) return full;
  const place = (centre, size, fullSize) =>
    size >= fullSize ? (fullSize - size) / 2 : clamp(centre - size / 2, 0, fullSize - size);
  return [place(cx, w, fullW), place(cy, h, fullH), w, h];
}

// Map of a single state in its overview-map colour, divided by postcode.
// Selecting a postcode (click, or searching by number or suburb name in the
// text box) highlights it, shows its name and zooms in on it. The map can also be zoomed with the buttons or Ctrl/⌘ + scroll (pinch
// on a trackpad), and dragged around while zoomed in.
export function StateShape({ code, name, selected, onSelect }) {
  const [map, setMap] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [text, setText] = useState(selected);
  const [zoomed, setZoomed] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [active, setActive] = useState(0);
  const svgRef = useRef(null);
  const selectedRef = useRef(null);
  const viewRef = useRef(null);
  const targetRef = useRef(null);
  const animationRef = useRef(0);
  const dragRef = useRef(null);

  const full = useMemo(() => (map ? map.viewBox.split(" ").map(Number) : null), [map]);
  const namesById = useMemo(() => new Map(map?.postcodes.map(([id, , names]) => [id, names])), [map]);

  // Keep the box in step when the postcode changes elsewhere (map click, "show whole state").
  useEffect(() => setText(selected), [selected]);

  useEffect(() => {
    let cancelled = false;
    setMap(null);
    setHovered(null);
    setZoomed(false);
    viewRef.current = null;
    targetRef.current = null;
    LOADERS[`../data/postcodes/${code.toLowerCase()}.json`]().then((loaded) => {
      if (!cancelled) setMap(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const frameAspect = () => {
    const frame = svgRef.current.getBoundingClientRect();
    return frame.width / frame.height;
  };

  // The viewBox is set directly on the element so the hundreds of postcode
  // paths aren't re-rendered on every animation frame.
  const apply = (box) => {
    viewRef.current = box;
    svgRef.current.setAttribute("viewBox", box.join(" "));
  };

  const moveTo = (target, ms) => {
    cancelAnimationFrame(animationRef.current);
    targetRef.current = target;
    setZoomed(target !== full);
    if (!ms || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(target);
      return;
    }
    const from = viewRef.current ?? full;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / ms, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      apply(from.map((v, i) => v + (target[i] - v) * eased));
      if (t < 1) animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);
  };

  // A view as a frame-shaped box: centre and height.
  const describe = (box) => {
    const aspect = frameAspect();
    return { cx: box[0] + box[2] / 2, cy: box[1] + box[3] / 2, h: Math.max(box[3], box[2] / aspect), aspect };
  };

  // Scales the visible height by `factor` (< 1 zooms in). With `anchor`
  // (client x/y) the map point under it stays put; otherwise the centre does.
  const zoomBy = (factor, anchor, ms) => {
    // Start from where the map is heading, not where an animation has got
    // to, so quick repeated presses each count in full.
    const { cx, cy, h, aspect } = describe(targetRef.current ?? full);
    const maxH = Math.max(full[3], full[2] / aspect);
    const nextH = clamp(h * factor, full[3] * MIN_ZOOM_FRACTION, maxH);
    let ax = cx;
    let ay = cy;
    if (anchor) {
      const point = new DOMPoint(anchor.x, anchor.y).matrixTransform(svgRef.current.getScreenCTM().inverse());
      ax = point.x;
      ay = point.y;
    }
    const k = nextH / h;
    moveTo(frameBox(ax + (cx - ax) * k, ay + (cy - ay) * k, nextH, full, aspect), ms);
  };

  // Glide to the selected postcode, or back out to the whole state.
  useEffect(() => {
    if (!full || !svgRef.current) return undefined;
    let target = full;
    if (selectedRef.current) {
      const box = selectedRef.current.getBBox();
      const aspect = frameAspect();
      const h = Math.max(Math.max(box.height, box.width / aspect) / ZOOM_FILL, full[3] * MIN_ZOOM_FRACTION);
      target = frameBox(box.x + box.width / 2, box.y + box.height / 2, h, full, aspect);
    }
    moveTo(target, ZOOM_MS);
    return () => cancelAnimationFrame(animationRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full, selected]);

  // Ctrl/⌘ + scroll (which is also what a trackpad pinch sends) zooms about
  // the pointer. Plain scrolling is left alone so the page still scrolls past
  // the map. Needs a non-passive listener to be able to preventDefault.
  useEffect(() => {
    const svg = svgRef.current;
    if (!full || !svg) return undefined;
    const handleWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomBy(Math.exp(clamp(e.deltaY, -50, 50) * 0.01), { x: e.clientX, y: e.clientY }, 0);
    };
    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  if (!map) return <div className="state-shape state-shape--loading">Loading map…</div>;

  const selectedPath = map.postcodes.find(([id]) => id === selected)?.[1];
  const selectedNames = namesById.get(selected) ?? [];

  // Postcodes whose number starts with the typed text, or that have a
  // locality matching it. Each suggestion shows the locality that matched.
  const query = text.trim().toLowerCase();
  let matches = [];
  if (query && query !== selected) {
    const starts = [];
    const contains = [];
    for (const [id, , names] of map.postcodes) {
      const lower = names.map((n) => n.toLowerCase());
      const startsAt = lower.findIndex((n) => n.startsWith(query));
      if (id.startsWith(query)) starts.push({ id, name: names[0] ?? "" });
      else if (startsAt >= 0) starts.push({ id, name: names[startsAt] });
      else {
        const containsAt = lower.findIndex((n) => n.includes(query));
        if (containsAt >= 0) contains.push({ id, name: names[containsAt] });
      }
    }
    matches = [...starts, ...contains].slice(0, MAX_SUGGESTIONS);
  }
  const noMatch = query !== "" && query !== selected && matches.length === 0;

  const choose = (id) => {
    setText(id);
    setSuggesting(false);
    onSelect(id);
  };

  // A complete postcode number applies as soon as it is typed; a name needs
  // picking from the suggestions (Enter takes the highlighted one). Emptying
  // the box clears the selection.
  const handleType = (e) => {
    const next = e.target.value.slice(0, 40);
    setText(next);
    setActive(0);
    setSuggesting(true);
    const typed = next.trim();
    if (typed === "") onSelect("");
    else if (namesById.has(typed)) choose(typed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") setSuggesting(false);
    if (!matches.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setSuggesting(true);
      setActive((i) => (i + (e.key === "ArrowDown" ? 1 : matches.length - 1)) % matches.length);
    } else if (e.key === "Enter") {
      choose(matches[Math.min(active, matches.length - 1)].id);
    }
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    const { cx, cy, h, aspect } = describe(viewRef.current ?? full);
    const unitsPerPixel = 1 / svgRef.current.getScreenCTM().a;
    dragRef.current = { x: e.clientX, y: e.clientY, cx, cy, h, aspect, unitsPerPixel, moved: false };
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag || !e.buttons) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    drag.moved = true;
    moveTo(
      frameBox(drag.cx - dx * drag.unitsPerPixel, drag.cy - dy * drag.unitsPerPixel, drag.h, full, drag.aspect),
      0
    );
  };

  const handleClick = (e) => {
    // The click that ends a drag is not a selection.
    const dragged = dragRef.current?.moved;
    dragRef.current = null;
    if (dragged) return;
    const id = e.target.dataset.postcode;
    if (id) onSelect(id === selected ? "" : id);
  };

  return (
    <figure className="state-shape">
      <p className="details__scope">
        {selected ? (
          <>
            Postcode <strong>{selected}</strong>
            <button type="button" className="link-button" onClick={() => onSelect("")}>
              show whole state
            </button>
          </>
        ) : (
          "Whole state"
        )}
      </p>
      {selectedNames.length > 0 && (
        <p className="details__place" title={selectedNames.join(", ")}>
          {placeLabel(selectedNames)}
        </p>
      )}
      <div className="state-shape__frame">
        <svg
          ref={svgRef}
          className={zoomed ? "is-zoomed" : ""}
          viewBox={map.viewBox}
          role="img"
          aria-label={`Map of ${name} divided by postcode`}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onMouseOver={(e) => setHovered(e.target.dataset.postcode ?? null)}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Areas with no postcode (some parks and remote land) show as plain fill. */}
          <path className="state-shape__base" d={map.outline} fill={STATE_COLORS[code]} />
          {map.postcodes.map(([id, d]) => (
            <path key={id} className="state-shape__postcode" data-postcode={id} d={d} fill={STATE_COLORS[code]} />
          ))}
          <path className="state-shape__outline" d={map.outline} />
          {selectedPath && <path ref={selectedRef} className="state-shape__selected" d={selectedPath} />}
        </svg>
        <div className="state-shape__zoom">
          <button type="button" aria-label="Zoom in" onClick={() => zoomBy(BUTTON_STEP, null, BUTTON_ZOOM_MS)}>
            +
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            disabled={!zoomed}
            onClick={() => zoomBy(1 / BUTTON_STEP, null, BUTTON_ZOOM_MS)}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Reset zoom"
            title="Reset zoom"
            disabled={!zoomed}
            onClick={() => moveTo(full, ZOOM_MS)}
          >
            ⤢
          </button>
        </div>
      </div>
      <figcaption>
        {hovered
          ? `Postcode ${hovered} · ${namesById.get(hovered)?.[0] ?? ""}`
          : `${map.postcodes.length} postcodes · click one to filter`}
      </figcaption>
      <div className="state-shape__search">
        <input
          className="input state-shape__input"
          type="text"
          role="combobox"
          placeholder="Postcode or suburb"
          aria-label="Search postcode or suburb"
          aria-expanded={suggesting && matches.length > 0}
          aria-controls="postcode-suggestions"
          aria-activedescendant={suggesting && matches.length ? `postcode-option-${active}` : undefined}
          aria-invalid={noMatch}
          autoComplete="off"
          value={text}
          onChange={handleType}
          onKeyDown={handleKeyDown}
          onFocus={() => setSuggesting(true)}
          onBlur={() => setSuggesting(false)}
        />
        {suggesting && matches.length > 0 && (
          // preventDefault on mousedown keeps focus in the box so the click lands before blur closes the list.
          <ul
            id="postcode-suggestions"
            className="state-shape__suggestions"
            role="listbox"
            onMouseDown={(e) => e.preventDefault()}
          >
            {matches.map((match, i) => (
              <li
                key={match.id}
                id={`postcode-option-${i}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? "is-active" : ""}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(match.id)}
              >
                <strong>{match.id}</strong>
                {match.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {noMatch && (
        <p className="form-error" role="alert">
          No postcode or suburb matching “{text.trim()}” in {code}.
        </p>
      )}
    </figure>
  );
}
