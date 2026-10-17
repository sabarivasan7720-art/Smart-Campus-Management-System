# Excel Engineering College — Smart Campus Management System

Visitor navigation site for **Excel Engineering College**, Komarapalayam. The main feature is an interactive schematic map with search, category filters, and walking routes from the Welcome Block (Main Entrance).

## Stack

- HTML5, Tailwind CSS (CDN), vanilla JavaScript
- Leaflet.js (`CRS.Simple`) over a custom campus SVG
- JSON data files (no backend)

## Run locally

Do **not** open the HTML files with `file://` — `fetch()` for JSON will be blocked.

From this folder:

```bash
npx --yes serve .
```

Or use VS Code / Cursor **Live Server**. Then open `http://localhost:3000` (or the port shown).

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Campus map, search, filters, directions |
| `qr.html` | Simulated QR “you are here” + route from that origin |
| `portal.html` | Demo login, attendance & timetable placeholders |
| `hostel.html` | Room list + maintenance tickets (`localStorage`) |
| `placement.html` | Sample drives and news |
| `cafe.html` | Menu and token-order placeholder |

## Data

- [`data/campus.json`](data/campus.json) — 20 locations, aliases, categories, pixel coordinates, walking steps from Welcome Block, road graph
- [`data/placements.json`](data/placements.json)
- [`data/cafe-menu.json`](data/cafe-menu.json)

Coordinates are `[x, y]` in SVG pixel space (`map.width` × `map.height`). Leaflet plots them as `[y, x]`.

## Replace the map with the official college drawing

1. Export the printed campus map as PNG/SVG into `assets/` (same aspect if possible).
2. Set `map.image`, `map.width`, and `map.height` in `data/campus.json`.
3. Update each location `coords` to match the new image (pin on the building).
4. Adjust `walkGraph` nodes to follow real roads, or keep curated `routesFrom.welcome-block.path` arrays.

## QR posters

Point a QR generator at:

```
https://YOUR-HOST/qr.html?loc=welcome-block
```

Valid `loc` values are the `id` fields in `campus.json` (`central-library`, `mech-aero`, `fusion-cafe`, …). The QR page also has buttons to simulate every poster.

## Host

Any static host works: GitHub Pages, Netlify, Cloudflare Pages, college IIS. Upload the whole folder; keep the relative paths (`data/`, `js/`, `assets/`).

## Later API (optional)

Swap `CampusData.load()` to `fetch("/api/campus")` without changing the map UI. Portal / hostel / café currently use `sessionStorage` / `localStorage` only.
