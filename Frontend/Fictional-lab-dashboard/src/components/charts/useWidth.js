import { useLayoutEffect, useRef, useState } from "react";

// Tracks an element's content width so SVG charts can be drawn at real pixel
// size (keeps text and stroke widths constant as the layout resizes).
export function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
