# Sales Dashboard — frontend

React (Vite) app built from the three wireframes (`login`, `homepage`, `details`). It is
separate from `Fictional-lab-frontend` and shares no code with it.

| Route | Screen |
|---|---|
| `/login` | Split sign-in page |
| `/` | Country Economy: KPI strip, map of Australia by state, widget row |
| `/states/:code` | State Economy: postcode map and widgets for one state, e.g. `/states/vic` |

## Run it

Start the API first (`Backend/Fictional-lab-dashboard-backend`), then the app:

```bash
# in Backend/Fictional-lab-dashboard-backend
npm install
npm run dev      # http://localhost:8081

# in Frontend/Fictional-lab-dashboard
npm install
npm run dev      # http://localhost:5174
```

The app calls `http://localhost:8081` unless `VITE_API_BASE_URL` is set, e.g. in a
`.env.local` in this folder.

## Map data

- Overview map: state outlines from the `@svg-maps/australia` package (CC BY-SA 4.0).
- State details map: `src/data/postcodes/<state>.json`, one file per state, loaded on demand.
  Generated from the ABS ASGS Edition 3 (2021) State and Postal Area (POA) boundary files
  (CC BY 4.0), clipped to each state and simplified with mapshaper. POAs are the ABS
  approximation of Australia Post postcodes, not the official delivery areas.
  Each postcode also carries its locality (suburb/town) names, main one first, taken from the
  community-maintained list at github.com/matthewproctor/australianpostcodes.

## Data and auth

- `src/api/client.js` is the only data entry point. The overview and state pages fetch from
  `Fictional-lab-dashboard-backend` (`GET /api/overview`, `GET /api/states/:code`), which
  serves aggregates from the PostgreSQL `consumption` schema (`src/data/sales.js`).
- Sign-in is still mocked in the browser: it accepts any well-formed email with a non-empty
  password. "Continue with Gmail" signs in a demo user. The session is kept in `localStorage`
  ("Remember me") or `sessionStorage`.
- Date range and product category are stored in the URL (`?range=90d&category=apparel`).
