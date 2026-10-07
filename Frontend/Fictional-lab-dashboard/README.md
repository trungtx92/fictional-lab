# Sales Dashboard — frontend

React (Vite) app built from the three wireframes (`login`, `homepage`, `details`). It is
separate from `Fictional-lab-frontend` and shares no code with it.

| Route | Screen |
|---|---|
| `/login` | Split sign-in page |
| `/` | Sales overview: KPI strip, state heat map, widget row |
| `/states/:code` | State details, e.g. `/states/vic` |

## Run it

```bash
npm install
npm run dev      # http://localhost:5174
```

## Map data

- Overview map: state outlines from the `@svg-maps/australia` package (CC BY-SA 4.0).
- State details map: `src/data/postcodes/<state>.json`, one file per state, loaded on demand.
  Generated from the ABS ASGS Edition 3 (2021) State and Postal Area (POA) boundary files
  (CC BY 4.0), clipped to each state and simplified with mapshaper. POAs are the ABS
  approximation of Australia Post postcodes, not the official delivery areas.

## Mock data and auth

Nothing calls the backend yet: it has no login or aggregate (per-state, over-time) endpoints.

- `src/api/client.js` is the only data entry point. Each function resolves from
  `src/data/mockSales.js`; replace the bodies with `fetch()` calls when endpoints exist.
- Sign-in accepts any well-formed email with a non-empty password. "Continue with Gmail"
  signs in a demo user. The session is kept in `localStorage` ("Remember me") or `sessionStorage`.
- Date range and product category are stored in the URL (`?range=90d&category=apparel`).
