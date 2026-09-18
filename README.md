# Sales Website — Local Prototype

Implements the architecture from `Sales_Website_Technical_Requirements.docx` with mock, in-memory
data (no database required yet) so the frontend and backend can be run and demoed locally.

- `backend/` — Node.js + Express REST API, mock data for customers, stores, products,
  transactions, and transaction_items (see `backend/src/data/mockData.js`).
- `frontend/` — React (Vite) single-page app with a dashboard, and list/detail views for
  customers, stores, products, and transactions.

## Run it

```bash
# Terminal 1 — backend (http://localhost:8080)
cd backend
npm install
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in a browser.

## Notes

- The frontend reads the API base URL from `frontend/.env` (`VITE_API_BASE_URL`).
- `mockData.js` is the single source of truth for mock records; swap it for real PostgreSQL
  queries (see Section 6 of the TRD) when the database is provisioned.
- `POST /api/transactions` already implements the atomic "insert transaction + items" behavior
  described in the TRD, against the in-memory store.
