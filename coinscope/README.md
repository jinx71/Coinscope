# CoinScope

> Live crypto dashboard with watchlist & portfolio P/L. Built on the MERN stack with 2021–2022 dependency versions.
> **Engineering lesson:** Data visualization (Recharts) on top of a proxied + per-endpoint-cached CoinGecko API, with portfolio P/L computed live against current market prices.

App #11 of the 12-app MERN portfolio.

---

## Features

- **Live markets dashboard.** Global stats (total market cap, 24h volume, BTC/ETH dominance, active coins), trending coins strip, and a paginated 50-coin market table with 1h / 24h / 7d changes and 7-day sparklines. Auto-refreshes every 30 seconds via React Query polling.
- **Coin detail pages.** Area chart with 24h / 7d / 30d / 90d / 1y range tabs, full market data grid (market cap, volume, supply, ATH, 24h high/low, multi-window performance), and description.
- **Watchlist.** One-click star to follow coins, rendered as a live-price table that polls in the background.
- **Portfolio with live P/L.** Add positions (coin + amount + average buy price + buy date + notes), edit & delete inline. The backend joins your holdings to current `simple/price` data, returns cost basis, current value, and P/L per position and in total. Visualised with an allocation donut chart.
- **Auth.** Email/password JWT auth (bcrypt, 7-day token), protected routes, persistent session via localStorage with backend re-validation on mount.
- **Visible caching.** Every proxied response carries `X-Cache: HIT | INFLIGHT | MISS`, `X-Cache-TTL`, and `X-Data-Source` headers, and the UI surfaces them via a `<CacheBadge>` so the caching lesson is observable.
- **Search.** Debounced coin search powered by `/coins/search` with thumbnail + rank in the dropdown.
- **Deterministic mock fallback.** If CoinGecko is unreachable (or `USE_MOCK_DATA=true`), the server serves a stable 20-coin mock dataset so the full UX is demonstrable offline.
- **Responsive + a11y basics.** Mobile-first layout, semantic table headers, labelled forms, keyboard focus rings, alt text on images, loading/empty/error states on every async view.

---

## Tech stack (locked, 2021–2022)

**Backend (`server/`)**
- Node.js 16 · Express 4.18.1
- Mongoose 6.5.4 (MongoDB 5/6)
- jsonwebtoken 8.5.1 · bcryptjs 2.4.3
- node-cache 5.1.2 · express-rate-limit 6.7.0
- helmet 6 · cors · morgan · express-validator 6
- axios 0.27.2 (for upstream CoinGecko)

**Frontend (`client/`)**
- React 17.0.2 · CRA 5.0.1 · React Router 6.3.0
- `@tanstack/react-query` 4.0.10 (polling + cache invalidation)
- Tailwind CSS 3.1.8 (emerald + gold accent)
- Recharts 2.1.16 (price area chart + sparklines + allocation donut)
- react-hook-form 7.34.2 · axios 0.27.2 · dayjs 1.11.5 · react-toastify 9

---

## Project structure

```
coinscope/
├── client/                       # React (CRA 5)
│   ├── src/
│   │   ├── api/                  # axios instance + endpoint wrappers
│   │   ├── components/           # Button, Card, CacheBadge, CoinRow, …
│   │   ├── context/AuthContext.js
│   │   ├── hooks/useAuth.js
│   │   ├── pages/                # Home, CoinDetail, Watchlist, Portfolio, …
│   │   ├── utils/format.js
│   │   ├── App.js
│   │   └── index.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
├── server/                       # Express + Mongoose
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/          # auth, coin, portfolio, watchlist
│   │   ├── middleware/           # auth (protect), errorHandler, notFound
│   │   ├── models/               # User, Holding, WatchlistItem
│   │   ├── routes/               # auth, coins, portfolio, watchlist
│   │   ├── services/             # coingecko.js (cache + dedup), mockData.js
│   │   ├── utils/                # asyncHandler, apiResponse
│   │   └── server.js
│   └── .env.example
├── .gitignore
├── package.json                  # `npm run dev` boots both via concurrently
└── README.md
```

---

## Getting started

### 1. Prerequisites
- Node.js 16.x LTS (Gallium)
- A running MongoDB instance (local `mongod`, Docker, or MongoDB Atlas connection string)

### 2. Install
From the repo root:
```bash
npm install
npm --prefix server install
npm --prefix client install
```
Or, in one go:
```bash
npm run install:all
```

### 3. Configure environment

Copy the example files and edit:

**`server/.env`**
```ini
PORT=5000
MONGO_URI=mongodb://localhost:27017/coinscope
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000

# CoinGecko is keyless on the free tier. Optional Demo/Pro key:
COINGECKO_API_KEY=

# Set to true to skip CoinGecko entirely and serve deterministic mock data.
USE_MOCK_DATA=false
```

**`client/.env`**
```ini
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_POLL_INTERVAL=30000
```

### 4. Run

From the root, one command boots both:
```bash
npm run dev
```
- Server: http://localhost:5000  (health check at `/api/health`)
- Client: http://localhost:3000

To run them separately:
```bash
npm run server   # server only
npm run client   # client only
```

---

## API reference

All responses use the shared envelope:
```json
{ "success": true, "data": <payload>, "message": "Optional" }
```
On failure:
```json
{ "success": false, "message": "What went wrong", "errors": [] }
```

### Public (no auth)
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness + mock-mode flag |
| `GET` | `/api/coins/markets?per_page=&page=&ids=` | Top markets (sparklines included) |
| `GET` | `/api/coins/trending` | Trending coins (24h) |
| `GET` | `/api/coins/global` | Global market stats |
| `GET` | `/api/coins/search?q=` | Coin name/symbol search |
| `GET` | `/api/coins/:id` | Full coin detail (description, links, market data) |
| `GET` | `/api/coins/:id/chart?days=` | OHLC-ish price series for the requested window |
| `GET` | `/api/coins/cache/stats` | Cache size + hit/miss counters (lesson observability) |

### Auth
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | `{ name, email, password }` → `{ token, user }` |
| `POST` | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| `GET` | `/api/auth/me` | Returns the current user (requires `Authorization: Bearer …`) |

### Protected
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/portfolio` | All holdings + live valuation + totals (cost basis / current value / P/L / P/L%) |
| `POST` | `/api/portfolio` | Add a holding |
| `PUT` | `/api/portfolio/:id` | Update amount / avgBuyPrice / buyDate / notes |
| `DELETE` | `/api/portfolio/:id` | Remove a holding |
| `GET` | `/api/watchlist` | Watched coins + enriched live market rows |
| `POST` | `/api/watchlist` | Add a coin to the watchlist |
| `DELETE` | `/api/watchlist/:coinId` | Remove a coin |

Every coin endpoint response carries:
- `X-Cache: HIT | INFLIGHT | MISS`
- `X-Cache-TTL: <seconds>`
- `X-Data-Source: live | mock-or-live | cache`

---

## The engineering lesson, in detail

### 1. Data visualization with Recharts
- **Area chart on Coin Detail** (`pages/CoinDetail.js`) uses gradient fills (emerald on uptrend, red on downtrend), tabular-numeric ticks, custom tooltip formatting via `dayjs`, and an unanimated render so re-paints during polling stay smooth.
- **Sparklines** in market tables (`components/SparklineMini.js`) reuse Recharts' `LineChart` with the axis hidden and a single stroke color flipped by 7d direction.
- **Allocation donut** (`pages/Portfolio.js`) uses Recharts `PieChart` with a 12-color palette and a labelled legend below.

### 2. The cache as a first-class object
The lesson from PitchSide & CricLive applied to a different upstream:

- **Per-endpoint TTLs** in `server/src/services/coingecko.js`:
  - `markets` 60s, `simple/price` 30s — feel live but ride free-tier limits
  - `coin` 120s, `chart` 300s, `trending` 300s, `global` 300s
- **Inflight de-duplication**: if a second request for the same key lands while the first is still in-flight upstream, both await the same promise (`inflight` map).
- **Mock fallback**: on upstream failure, return deterministic mock data with a *short* TTL so we retry upstream soon. Set `USE_MOCK_DATA=true` to opt in unconditionally.
- **Headers as observability**: `X-Cache`, `X-Cache-TTL`, `X-Data-Source` are exposed via `Access-Control-Expose-Headers` and rendered by `<CacheBadge>` next to every cached view.

### 3. Portfolio P/L computation
- Holdings persist only the **cost basis** (amount × avgBuyPrice + buyDate).
- On read, the backend collects all distinct `coinId`s and issues one `simple/price` call (cached 30s) to value the whole portfolio in a single upstream hit.
- For each position: `currentValue = amount × currentPrice`, `pnl = currentValue – cost`, `pnlPercent = pnl / cost × 100`. Totals are aggregated server-side so the client doesn't need to reconcile.

### 4. Polling, not pushing
Live feel without a WebSocket: React Query's `refetchInterval` (configurable via `REACT_APP_POLL_INTERVAL`) polls the backend every 30s. The backend cache absorbs the load — even 100 simultaneous clients hitting `/markets` generate at most one upstream call per minute.

---

## Definition of Done

- [x] `npm install` in both folders, then `npm run dev` boots client + server via `concurrently`
- [x] `.env.example` in both client and server; `.env` git-ignored; no secrets committed
- [x] README with features, tech stack + versions, setup, env, API reference
- [x] Mobile-first responsive, semantic HTML, focus states, alt text
- [x] Loading / empty / error states on every async view
- [x] Shared design system applied (emerald + gold accent)
- [x] Forms validated client (`react-hook-form`) **and** server (`express-validator`)
- [x] Keyed-or-not upstream proxied through backend; per-endpoint cache + inflight dedup
- [x] JWT auth with `protect` middleware; passwords hashed, never returned
- [x] Zero unresolved imports (verified by full esbuild bundle pass)
- [x] Mock fallback so the app is demoable without external connectivity

---

## Scripts

| Location | Script | Does |
|---|---|---|
| root | `npm run dev` | Boots client + server with `concurrently` |
| root | `npm run install:all` | Installs deps in root, server, and client |
| root | `npm run server` | Server only (nodemon) |
| root | `npm run client` | Client only (CRA) |
| `server/` | `npm run dev` | nodemon `src/server.js` |
| `server/` | `npm start` | node `src/server.js` |
| `client/` | `npm start` | CRA dev server |
| `client/` | `npm run build` | Production build |

---

## Screenshots

> Place real screenshots under `docs/screenshots/` once the app is running.
- Markets dashboard with global stats + trending + live table
- Coin detail with area chart and range tabs
- Watchlist
- Portfolio with allocation donut and live P/L
- Login / Register
