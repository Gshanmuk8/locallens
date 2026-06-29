# Design Document — LocalLens Discovery App

## Overview

LocalLens is a **frontend-only React + Vite SPA** with no backend, no database, and no authentication. All geographic data is sourced from free, open services: place queries via the Overpass API, geocoding via Nominatim, and map tiles from OpenStreetMap. The browser Geolocation API provides GPS coordinates on the Home page. Place data is passed between routes through `sessionStorage` — no server round-trip is needed. The app is fully static and can be deployed to any CDN or file server.

The three pages — Home (`/`), Explore (`/explore`), and Place Details (`/place/:osmType/:osmId`) — are composed from shared components (`Navbar`, `MapView`, `PlaceCard`, `CategoryGrid`, `CategoryFilter`, `SearchBar`) and three service modules (`location.js`, `nominatim.js`, `overpass.js`).

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                         │
│                                                             │
│  ┌──────────┐   ┌───────────┐   ┌──────────────────────┐   │
│  │  Home    │   │  Explore  │   │  PlaceDetails        │   │
│  │  Page    │   │  Page     │   │  Page                │   │
│  └────┬─────┘   └─────┬─────┘   └──────────┬───────────┘   │
│       │               │                     │               │
│  ┌────▼───────────────▼─────────────────────▼───────────┐   │
│  │              Shared Components                        │   │
│  │   Navbar │ MapView │ PlaceCard │ CategoryGrid │ etc.  │   │
│  └────┬──────────────────────────────────────────────────┘   │
│       │                                                     │
│  ┌────▼──────────────────────────────┐                      │
│  │           Service Layer           │                      │
│  │  location.js │ nominatim.js │     │                      │
│  │  overpass.js                      │                      │
│  └────┬──────────────┬───────────────┘                      │
└───────┼──────────────┼──────────────────────────────────────┘
        │              │
        ▼              ▼
┌───────────────┐  ┌──────────────────────────────────────────┐
│ Browser       │  │ External APIs                             │
│ Geolocation   │  │  nominatim.openstreetmap.org  (geocoding) │
│ API           │  │  overpass-api.de  (POI queries)           │
│               │  │  overpass.kumi.systems        (mirror 2)  │
│               │  │  maps.mail.ru overpass        (mirror 3)  │
│               │  │  {s}.tile.openstreetmap.org   (tiles)     │
└───────────────┘  └──────────────────────────────────────────┘
```

Data flow: the user's browser calls the Geolocation API or Nominatim for a coordinate pair, then fires Overpass QL queries (POSTed to whichever mirror responds first). The JSON response is normalised into `Place` objects, stored in React state, and passed to Leaflet for rendering and to `CategoryGrid` / `PlaceCard` for the card UI.

### Technology Stack

| Technology | Version | Role |
|---|---|---|
| React | 18.3.1 | Component model and state management |
| Vite | 5.4.2 | Dev server and production bundler |
| React Router | 6.26.2 | Client-side routing (BrowserRouter) |
| Leaflet | 1.9.4 | Interactive map rendering |
| Nominatim API | — | Forward and reverse geocoding (OSM) |
| Overpass API | — | Nearby POI queries against OSM data |
| OpenStreetMap tiles | — | Raster map tiles via `{s}.tile.openstreetmap.org` |

No state management library (Redux, Zustand, etc.) is used. All state is local to page components and passed down as props.

---

## Components and Interfaces

### 1. Router (`src/router.jsx`)

The root component that mounts `BrowserRouter`, renders `Navbar` outside the `Routes` tree so it appears on every page, and declares three routes.

**Routes table:**

| Path | Component | Notes |
|---|---|---|
| `/` | `Home` | GPS permission gate + nearby-places dashboard |
| `/explore` | `Explore` | Location search + radius/category filtering |
| `/place/:osmType/:osmId` | `PlaceDetails` | Reads place from `sessionStorage` |

**Implementation Note (Requirement 13 C3):** There is currently no catch-all route (e.g., `path="*"`). Any URL that doesn't match these three patterns will render only the `Navbar` with a blank body. A `<Route path="*" element={<Navigate to="/" replace />}/>` (or a 404 page) needs to be added.

---

### 2. Navbar (`src/components/Navbar.jsx`)

A sticky top navigation bar present on all pages. It has no props — it reads the current route internally.

**Key state:**

| State | Type | Purpose |
|---|---|---|
| `scrolled` | `boolean` | Tracks whether the page has scrolled more than 8 px |

**Key behaviors:**

- Mounts a passive `scroll` event listener on `window` via `useEffect`. Sets `scrolled = true` when `window.scrollY > 8`, enabling the `navScrolled` style which adds `box-shadow: 0 2px 16px rgba(28,26,22,0.08)`.
- Uses `useLocation()` from React Router to determine the active route. The "Home" link receives `linkActive` styles (bold weight, `var(--parchment)` background) when `location.pathname === '/'`.
- The "Explore →" button is always rendered in the gradient pill style; it does not get an active-state variant in the current implementation.
- The outer `<nav>` wrapping the logo is implicit; the links container has `aria-label="Main navigation"`.

**Props:** None.

---

### 3. Home Page (`src/pages/Home.jsx`)

The GPS-based discovery dashboard. Renders `LocationGate` until a position is obtained, then renders the full dashboard.

**Key state:**

| State | Type | Purpose |
|---|---|---|
| `location` | `{lat, lon, accuracy} \| null` | GPS coordinates; `null` → show `LocationGate` |
| `locationName` | `string` | Reverse-geocoded city + state string |
| `placesByCategory` | `Record<string, Place[]>` | Results keyed by category ID |
| `loadingCategories` | `Record<string, boolean>` | Per-category loading flag |
| `allPlaces` | `Place[]` | Flat array of all places for `MapView` |

**Sub-component — `LocationGate`:**
Internal component (defined in the same file). Displays the permission prompt. Props: `onAllow: (loc) => void`. Internal state: `requesting: boolean`, `error: string | null`. Calls `getCurrentLocation()` on button click. On success, calls `onAllow(loc)`; on failure, sets `error` to the human-readable message from `location.js`.

**Sub-component — `StatsBar`:**
Internal component. Props: `placesByCategory: Record<string, Place[]>`. Sums all category counts. Currently renders `null` when `total === 0`. Displays one badge per category that has at least one place.

**Implementation Note (Requirement 3 C10 / Requirement 4):** Two gaps exist here:

1. `watchPosition` is **not yet wired up**. After `handleLocationGranted` completes, the Home page never calls `watchLocation()`. The `watchLocation` function exists in `location.js` and is ready to use. A `useEffect` that calls `watchLocation(handleLocationGranted, ...)` after `location` is set, with a cleanup that calls the returned stop function, needs to be added.

2. `StatsBar` hides itself when `total === 0` (`if (!total) return null`). The requirement says it should appear even when all categories return zero results. The guard condition needs to be changed so the bar always renders once loading is complete.

**Key behaviors:**
- After GPS coordinates arrive, calls `reverseGeocode` for the location name (with "Your Location" as fallback).
- Fires `fetchNearbyCategory` concurrently for all 7 categories via `Promise.all`. Each resolves independently and calls `setPlacesByCategory` / `setLoadingCategories` progressively (React batching aside).
- `MapView` receives `userLocation={location}` to render the blue user-location dot.

**Props:** None.

---

### 4. Explore Page (`src/pages/Explore.jsx`)

Search-driven discovery page. Allows the user to search any place by name, then shows nearby-place results for the selected location.

**Key state:**

| State | Type | Purpose |
|---|---|---|
| `selectedLocation` | `{lat, lon, shortName} \| null` | The geocoded location being explored |
| `selectedCategories` | `string[]` | Active category IDs (empty = all) |
| `radius` | `number` | Active search radius in metres (default 3000) |
| `placesByCategory` | `Record<string, Place[]>` | Results keyed by category ID |
| `loadingCategories` | `Record<string, boolean>` | Per-category loading flag |
| `allPlaces` | `Place[]` | Flat array for `MapView` |
| `searchedPlace` | `{lat, lon, shortName} \| null` | Controls the controls-bar and results sections |

**AbortController pattern:**
An `abortRef` (`useRef`) holds the current `AbortController`. Every call to `loadPlaces` calls `abortRef.current?.abort()` first, then creates a fresh controller. Each concurrent `fetchNearbyCategory` call checks `controller.signal.aborted` before and after awaiting to suppress stale updates.

**Radius options:** 1 km / 3 km / 5 km / 10 km. Rendered as pill buttons; the selected value receives `background: var(--ink)` styling.

**Category filtering:** When `selectedCategories` is empty, `visibleCategories` defaults to all `CATEGORIES`. When one or more categories are toggled, only the matching `CategoryGrid` components are rendered and only those categories are fetched.

**Progressive loading:** `fetchNearbyCategory` calls are issued concurrently via `Promise.all`. Each resolves independently: `setPlacesByCategory` is called per-category so the UI updates as each finishes rather than waiting for all.

**Controls bar:** Rendered only when `searchedPlace` is truthy. It is `position: sticky; top: 64px` so it pins below the `Navbar`.

**Props:** None.

---

### 5. PlaceDetails Page (`src/pages/PlaceDetails.jsx`)

Full-detail view for a single place. Reads place data from `sessionStorage` — no network request is made.

**Key state:**

| State | Type | Purpose |
|---|---|---|
| `place` | `Place \| null` | The place object read from `sessionStorage` |
| `category` | `Category \| null` | The category object for the place |
| `notFound` | `boolean` | Set to `true` when `sessionStorage` key is absent or JSON is malformed |

**Route params:** `osmType` (e.g., `"node"`) and `osmId` (e.g., `"1234567"`), both from `useParams()`. The `sessionStorage` key is `place-${osmType}-${osmId}`.

**SessionStorage read:** Performed in a `useEffect` that depends on `[osmType, osmId]`. On success, `JSON.parse` extracts `{ place, category }`. A `try/catch` around the parse sets `notFound = true` on any JSON error.

**Not-found state:** Renders a centred panel with a "Place not found" message and a "← Go Back" button that calls `navigate(-1)`.

**Loading state:** While `place === null && !notFound`, renders a centred "Loading…" text (brief; `sessionStorage` reads are synchronous so this is practically invisible).

**Two-column layout:** `display: grid; gridTemplateColumns: 'minmax(0,1fr) 340px'`. Left column: detail rows (address, hours, phone, website, cuisine, OSM link) + collapsible raw tags + directions button. Right column: sticky `MapView` at zoom 16 + coordinates display.

**Implementation Note (Requirement 14 C3):** The `gridTemplateColumns` is a hardcoded inline style with no media query breakpoint. On narrow screens the layout does not collapse to a single column. A responsive wrapper (e.g., a CSS class with a `@media (max-width: 768px)` rule that switches to `grid-template-columns: 1fr`) needs to be added.

**`DetailRow` sub-component:** Renders a single labelled row with icon, uppercase label, and value. Returns `null` when `value` is falsy. When an `href` is provided, wraps the entire row in an `<a target="_blank" rel="noopener noreferrer">`.

**Props:** None (reads params from the router).

---

### 6. MapView (`src/components/MapView.jsx`)

A Leaflet.js map component that manages its own DOM node. Because Leaflet is imperative, all map interactions happen through `useRef` and `useEffect` — React never re-renders the map DOM.

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `center` | `{lat: number, lon: number} \| null` | — | Map center; triggers `flyTo` when changed |
| `zoom` | `number` | `14` | Zoom level for init and `flyTo` |
| `places` | `Place[]` | `[]` | Place objects to render as category-coloured markers |
| `userLocation` | `{lat: number, lon: number} \| null` | `null` | Renders a blue "you are here" dot |
| `onPlaceClick` | `(place: Place) => void \| undefined` | — | Optional; attached to each marker's `click` event |
| `height` | `string` | `'480px'` | CSS height of the map container |
| `style` | `CSSProperties` | `{}` | Additional styles for the outer wrapper |

**Leaflet initialization (`useEffect` with empty deps):**
- Runs once after mount. Guards against double-init with `if (mapRef.current) return`.
- Calls `fixLeafletIcons()` to patch Vite's asset handling (Leaflet's `_getIconUrl` is deleted and replaced with CDN URLs for `marker-icon.png`, `marker-icon-2x.png`, `marker-shadow.png`).
- Creates the map on `containerRef.current`, adds the OSM tile layer with attribution, and stores the instance in `mapRef.current`.
- Returns a cleanup function that calls `map.remove()` and nulls `mapRef.current`.

**Center change (`useEffect` on `[center?.lat, center?.lon, zoom]`):**
- Calls `mapRef.current.flyTo([lat, lon], zoom, { animate: true, duration: 1 })`.

**Place markers (`useEffect` on `[places, onPlaceClick]`):**
- Removes all markers in `markersRef.current`, then creates one `L.marker` per place with a `createCategoryIcon()` `divIcon` (coloured teardrop shape with category emoji).
- Each marker gets a popup with name, address, and distance (HTML built via string concatenation; HTML-escaped via `escapeHtml()`).
- If `onPlaceClick` is provided, the `click` event calls it with the `place` object.

**User marker (`useEffect` on `[userLocation?.lat, userLocation?.lon]`):**
- Removes any previous user marker, then places a blue circle `divIcon` at the given coordinates.

**Implementation Note (Requirement 15 C5):** The outer wrapper `<div>` and inner `containerRef` `<div>` have no `role` or `aria-label`. Screen readers cannot identify this region as a geographic map. A `role="application"` or `role="region"` with `aria-label="Interactive map"` should be added to the outer div.

---

### 7. PlaceCard (`src/components/PlaceCard.jsx`)

A card component representing a single place. Rendered inside `CategoryGrid`.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `place` | `Place` | The place object to display |
| `category` | `Category` | The category for colour and emoji |
| `style` | `CSSProperties` | Optional additional wrapper styles |

**Click / keyboard navigation:**
- The `<article>` element has `tabIndex={0}` and an `onKeyDown` handler: `e.key === 'Enter' && handleClick()`.
- `handleClick` writes `JSON.stringify({ place, category })` to `sessionStorage` under key `place-${place.osmType}-${place.osmId}`, then calls `navigate('/place/${place.osmType}/${place.osmId}')`.

**Directions button:**
- A `<button>` inside the card footer with `aria-label={`Directions to ${place.name}`}`.
- `onClick` calls `e.stopPropagation()` to prevent the card's click handler from firing, then opens `https://www.openstreetmap.org/directions?to=${lat},${lon}` via `window.open(..., '_blank', 'noopener,noreferrer')`.

**Display logic:**
- The cuisine tag is rendered only when `place.cuisine` is truthy.
- The address paragraph is rendered only when `place.address` is truthy.
- The distance span is rendered only when `place.distanceKm != null`; formatted via `formatDistance()`.
- A 3 px top accent bar uses `category?.color` with 70% opacity.

---

### 8. CategoryGrid (`src/components/CategoryGrid.jsx`)

Renders a labelled section with a grid of `PlaceCard` components (or states) for one category.

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `categoryId` | `string` | — | Used to look up the `Category` via `getCategoryById` |
| `places` | `Place[] \| undefined` | — | `undefined` while loading; empty array when loaded with no results |
| `loading` | `boolean` | — | Controls skeleton vs. real card rendering |
| `emptyMessage` | `string \| undefined` | — | Override for the empty-state text |
| `maxVisible` | `number` | `6` | Maximum cards to show |
| `onShowMore` | `() => void \| undefined` | — | Handler for "View all N →" button |

**Three rendering states:**

1. **Loading** (`loading === true`): Renders three `SkeletonCard` components in the same grid layout as real cards.
2. **Empty** (`loading === false && visiblePlaces.length === 0`): Renders a dashed-border placeholder with the category emoji and an empty-state message.
3. **Populated** (`visiblePlaces.length > 0`): Renders up to `maxVisible` `PlaceCard` components with staggered `fadeUp` animations (`60ms` delay increment per card index).

**Section header:** Always visible. Contains the category emoji badge, the category plural label as an `<h2>`, and — when `!loading && places` — the count sub-text (e.g., "12 found nearby" or "None found nearby").

**Implementation Note (Requirement 8 C1):** The count sub-text is rendered when `!loading && places` is truthy. However, on the `Explore` page `loading` can be `false` before `places` is defined for categories that haven't been fetched yet (the loading condition is `loadingCategories[cat.id] !== false && !placesByCategory[cat.id]`). In practice the count text only appears after data arrives, which is correct — but the intent should be made explicit to avoid a flash of "None found nearby" before data loads.

**`SkeletonCard`:** Internal component that renders three `div.skeleton` shapes mimicking the card's layout (icon square, title line, subtitle line, two body lines).

**"View all" button:** Only rendered when `hasMore && onShowMore`. Currently neither the Home page nor the Explore page passes an `onShowMore` handler, so this button is never shown.

---

### 9. CategoryFilter (`src/components/CategoryFilter.jsx`)

A row of toggleable pill buttons for filtering categories on the Explore page.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `selected` | `string[]` | Array of active category IDs (empty = all) |
| `onChange` | `(ids: string[]) => void` | Called with the updated selection |

**Toggle logic:**
- The "All" button calls `onChange([])`, which the Explore page treats as "all categories active".
- Each category button calls `toggle(id)`. If the ID is already in `selected`, it is removed. If the resulting array is empty after removal, `onChange([])` is called (effectively re-selecting all). If the ID is not in `selected`, it is appended.
- Buttons use `aria-pressed` to communicate state to screen readers.

**Visual state:** Active buttons use `background: cat.color` with white text. Inactive buttons use `var(--parchment)` with a hover effect that sets `borderColor` and `color` to `cat.color` via inline `onMouseEnter`/`onMouseLeave`.

**Outer wrapper:** `<div role="group" aria-label="Filter by category">`.

---

### 10. SearchBar (`src/components/SearchBar.jsx`)

An autocomplete search input used on the Explore page.

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `onLocationSelected` | `(result: GeocodeResult) => void` | — | Called when user selects a dropdown item |
| `placeholder` | `string` | `'Search any place…'` | Input placeholder text |
| `autoFocus` | `boolean` | `false` | Focuses the input on mount |

**Key state:**

| State | Type | Purpose |
|---|---|---|
| `query` | `string` | Current input value |
| `loading` | `boolean` | True while `geocode()` is in-flight |
| `error` | `string \| null` | Error message from failed geocode |
| `results` | `GeocodeResult[]` | Dropdown items (up to 6) |
| `showDropdown` | `boolean` | Controls dropdown visibility |

**Debounce:** A `debounceRef` (`useRef`) holds a `setTimeout` ID. On every `onChange`, the timer is cleared and restarted with a 500 ms delay before calling `doSearch`. The search fires immediately on form submit.

**Dropdown:** Visible when `showDropdown && results.length > 0`. Each item is a `<button role="option">` inside the `role="listbox"` container. A `mousedown` listener on `document` (via `useEffect`) dismisses the dropdown when the user clicks outside.

**Quick suggestions:** Eight hardcoded city/place names shown as pill buttons when `query` is empty. Clicking one sets the query and calls `doSearch` immediately.

**Accessibility:** Input has `aria-label="Search for a place"`, `aria-expanded={showDropdown}`, `aria-autocomplete="list"`. The form wrapper has `role="search"`. The dropdown has `role="listbox"`. Dropdown items have `role="option"`. Errors are rendered as visible text in a styled `<p>` element.

---

---

## Services

### Location Service (`src/services/location.js`)

Wraps the browser `navigator.geolocation` API with promise and callback interfaces.

**`GEO_OPTIONS`:**

```js
{
  enableHighAccuracy: true,
  timeout: 10_000,      // 10 seconds
  maximumAge: 60_000,   // Cache position for 1 minute
}
```

**`getCurrentLocation() → Promise<{lat, lon, accuracy}>`**

Returns a promise that resolves with `{lat, lon, accuracy}` from `GeolocationPosition.coords`. Rejects with a human-readable `Error` for the three Geolocation error codes:

| Code | Message |
|---|---|
| 1 (PERMISSION_DENIED) | "Location access was denied. Please allow location in your browser settings." |
| 2 (POSITION_UNAVAILABLE) | "Location unavailable. Check your device settings." |
| 3 (TIMEOUT) | "Location request timed out. Please try again." |

If `navigator.geolocation` is absent, rejects immediately with "Geolocation is not supported by your browser."

**`watchLocation(onUpdate, onError) → () => void`**

Calls `navigator.geolocation.watchPosition` with the same `GEO_OPTIONS` but with `maximumAge: 5_000` (5 seconds — more aggressive freshness for live tracking). Calls `onUpdate({lat, lon, accuracy})` on each new position. Calls `onError(Error)` on failures. Returns a cleanup function that calls `navigator.geolocation.clearWatch(id)`.

---

### Nominatim Service (`src/services/nominatim.js`)

Geocoding via the public Nominatim instance at `https://nominatim.openstreetmap.org`.

**Required headers (Nominatim usage policy):**

```js
{
  'Accept-Language': 'en',
  'User-Agent': 'LocalLens/1.0 (https://github.com/locallens)',
}
```

**`geocode(query: string) → Promise<GeocodeResult[]>`**

Calls `/search?q={query}&format=json&limit=8&addressdetails=1`. Throws on HTTP errors or empty results. Maps each Nominatim item to:

```js
{
  lat: number,          // parseFloat(item.lat)
  lon: number,          // parseFloat(item.lon)
  displayName: string,  // item.display_name (full address string)
  shortName: string,    // city / town / village / county / name fallback chain
  type: string,         // item.type
  boundingbox: number[],
  importance: number,
}
```

**`reverseGeocode(lat, lon) → Promise<{displayName, city, state, country}>`**

Calls `/reverse?lat={lat}&lon={lon}&format=json&addressdetails=1`. Returns a simplified object. The `city` field falls back through `city → town → village → suburb → county → 'Your Area'`.

---

### Overpass Service (`src/services/overpass.js`)

Queries OSM data via Overpass QL. All functions are exported; the cache and helpers are module-private.

#### Mirror Fallback Sequence

```
1. https://overpass-api.de/api/interpreter         (primary)
2. https://overpass.kumi.systems/api/interpreter   (mirror 2)
3. https://maps.mail.ru/osm/tools/overpass/api/interpreter  (mirror 3)
```

`fetchWithFallback(query)` iterates through all three. Each request is a `POST` with `Content-Type: application/x-www-form-urlencoded` and `body: "data=" + encodeURIComponent(query)`, timeout-bounded by `AbortSignal.timeout(20_000)`. The first successful (HTTP 2xx + valid JSON) response is returned; subsequent mirrors are skipped. If all fail, the last error is re-thrown.

#### Cache Design

```
Module-private Map: _cache  (key → { data: Place[], ts: number })
TTL: 5 minutes (300,000 ms)
Max entries: 200
```

**Key format:** `"{roundedLat}:{roundedLon}:{radius}:{categoryId}"`  
- `roundedLat = Math.round(lat * 100) / 100` (2 decimal places ≈ 1.1 km grid)  
- `roundedLon = Math.round(lon * 100) / 100`

`fromCache(key)` returns `null` for missing or expired entries (expired entries are deleted on access). `toCache(key, data)` inserts the entry; when `_cache.size > 200`, the oldest entry (first key from `_cache.keys()`) is evicted.

#### Overpass QL Query Structure

```overpassql
[out:json][timeout:25];
(
  node["<nodeType>"<op>"<osmValue>"](around:<radiusMeters>,<lat>,<lon>);
  way["<nodeType>"<op>"<osmValue>"](around:<radiusMeters>,<lat>,<lon>);
);
out body center 40;
```

When `osmValue` contains `|` (regex alternatives), the operator is `~` (regex match). Otherwise `=` (exact match). Results are capped at 40 elements at the Overpass level; the service then further slices to 30 after sorting.

#### `normaliseElement(el, lat, lon, category) → Place`

Extracts `elLat`/`elLon` from either `el.lat`/`el.lon` (nodes) or `el.center.lat`/`el.center.lon` (ways). Computes `distanceKm` using the Haversine formula. Builds the `address` string by joining `addr:housenumber`, `addr:street`, and `addr:city` with `, `. Falls back name resolution through `tags.name → tags['name:en'] → tags.brand → tags.operator → 'Unnamed Place'`.

#### `fetchNearbyCategory(lat, lon, category, radiusMeters=3000) → Promise<Place[]>`

1. Check cache — return cached data if hit.
2. Build Overpass QL query.
3. Call `fetchWithFallback`.
4. Filter elements missing coordinates, normalise, sort by `distanceKm` asc, slice to 30.
5. Store in cache and return.

#### `fetchAllCategories(lat, lon, categories, radiusMeters=3000) → Promise<Record<string, Place[]>>`

Implements a concurrency-limited worker pool. Creates `min(3, categories.length)` concurrent worker tasks. Each worker pops from a shared `queue` array and calls `fetchNearbyCategory`. Errors are caught per-category; failed categories resolve to `[]`. Returns a results object keyed by `categoryId`.

---

---

## Data Models

### Place Object

```js
{
  id: string,              // "{osmType}-{osmId}" — unique composite key
  osmId: number,           // OSM element ID
  osmType: "node"|"way",   // OSM element type
  lat: number,             // WGS-84 latitude
  lon: number,             // WGS-84 longitude
  name: string,            // Display name (never empty; falls back to 'Unnamed Place')
  categoryId: string,      // One of the seven category IDs from CATEGORIES
  distanceKm: number|null, // Haversine distance from the query point; null if coords missing
  address: string,         // "housenumber street, city" — empty string if no addr tags
  phone: string|null,      // tags.phone or tags['contact:phone']
  website: string|null,    // tags.website or tags['contact:website']
  openingHours: string|null, // tags.opening_hours
  cuisine: string|null,    // tags.cuisine with underscores replaced by spaces
  tags: Record<string, string> // all raw OSM tags
}
```

### Category Object

```js
{
  id: string,         // e.g., "restaurants"
  emoji: string,      // e.g., "🍽"
  label: string,      // singular, e.g., "Restaurant"
  plural: string,     // plural, e.g., "Restaurants"
  color: string,      // hex accent colour from the design system
  paleBg: string,     // light background colour for badges
  nodeType: string,   // Overpass tag key, e.g., "amenity", "tourism", "leisure", "shop"
  osmValue: string,   // Overpass tag value or regex, e.g., "restaurant|food_court|fast_food"
}
```

The seven defined categories (in render order): `restaurants`, `hotels`, `cafes`, `theaters`, `attractions`, `parks`, `shopping`.

### Geocode Result

```js
{
  lat: number,
  lon: number,
  displayName: string,  // Full formatted address from Nominatim
  shortName: string,    // Short city/place name for UI labels
  type: string,         // Nominatim result type (e.g., "city", "attraction")
  boundingbox: number[], // [south, north, west, east] as floats
  importance: number,   // Nominatim relevance score (0–1)
}
```

---

## Key Flows

### Flow 1: Home Page GPS Flow

1. User navigates to `/`. `Home` renders with `location = null` → `LocationGate` is shown.
2. User clicks "Allow Location Access". `requesting = true`; button shows "Getting location…" and is disabled.
3. `getCurrentLocation()` calls `navigator.geolocation.getCurrentPosition` with `GEO_OPTIONS`.
4. **Success path:** Browser returns coordinates → `onAllow({lat, lon, accuracy})` is called → `setLocation(loc)`.
5. `LocationGate` unmounts; dashboard renders.
6. `handleLocationGranted` calls `reverseGeocode(lat, lon)` → sets `locationName` to `"{city}, {state}"` (or "Your Location" on failure).
7. All 7 categories are set to `loading = true`. `fetchNearbyCategory` is called concurrently for each via `Promise.all`.
8. As each category resolves, `setPlacesByCategory` and `setLoadingCategories` are updated immediately — `CategoryGrid` switches from skeleton to real cards per-category.
9. `MapView` re-renders as `allPlaces` grows (updated after each category completes).
10. `StatsBar` appears once the total count is > 0 (current implementation; see Implementation Note).
11. **[NOT YET IMPLEMENTED]** After dashboard renders, `watchLocation(handleLocationGranted, ...)` should be called to continuously track position. When the watched position changes, places are re-fetched. On unmount, the cleanup function calls `clearWatch`.

### Flow 2: Explore Search Flow

1. User navigates to `/explore`. `Explore` renders with no `searchedPlace` → the map, controls bar, and results are hidden; the empty-state illustration is shown.
2. User types in `SearchBar`. After a 500 ms debounce (or on form submit), `geocode(query)` is called.
3. Nominatim returns up to 8 candidates. The dropdown (`role="listbox"`) appears with up to 6 results.
4. User selects a result. `handleSelect(result)` sets the query text to `result.shortName`, hides the dropdown, and calls `onLocationSelected(result)`.
5. `handleLocationSelected` sets `selectedLocation`, `searchedPlace`, clears `placesByCategory` and `allPlaces`, then calls `loadPlaces`.
6. `loadPlaces` calls `abortRef.current?.abort()` (aborting any prior in-flight requests), creates a fresh `AbortController`, marks all active categories as loading, then fires `fetchNearbyCategory` concurrently via `Promise.all`.
7. `MapView` renders immediately at `selectedLocation` coordinates (flyTo animation).
8. As each category resolves, `setPlacesByCategory` and `setLoadingCategories` update progressively; `CategoryGrid` cards appear per-category.
9. User may change radius (re-triggers `loadPlaces`) or toggle category filters (also re-triggers `loadPlaces` with the new category list).

### Flow 3: Place Details Flow

1. User clicks a `PlaceCard`. `handleClick` serialises `{ place, category }` to JSON and stores it in `sessionStorage` at key `place-${osmType}-${osmId}`.
2. `navigate('/place/${osmType}/${osmId}')` is called. React Router renders `PlaceDetails`.
3. `PlaceDetails` reads `useParams()` → `{ osmType, osmId }`. In `useEffect`, `sessionStorage.getItem('place-${osmType}-${osmId}')` is called.
4. **Found:** JSON is parsed → `setPlace(p)` and `setCategory(getCategoryById(c.id) || c)`.
5. **Not found / malformed:** `setNotFound(true)` → the "Place not found" UI renders.
6. With a valid place, the two-column layout renders: left column has detail rows + directions button; right column has a `MapView` centred at `{lat, lon}` at zoom 16 with a single marker.
7. The "Get Directions" link opens OSM directions in a new tab (`target="_blank" rel="noopener noreferrer"`).

---

---

## Distance Calculation

The Haversine formula is used to compute the great-circle distance between two points on Earth. The implementation lives in two places: `src/utils/categories.js` (exported `haversineKm`) and inline within `overpass.js`'s `normaliseElement` function (both are identical in logic).

```
R = 6371 km  (Earth mean radius)

dLat = (lat2 - lat1) × π/180
dLon = (lon2 - lon1) × π/180

a = sin²(dLat/2) + cos(lat1 × π/180) × cos(lat2 × π/180) × sin²(dLon/2)

distance = R × 2 × atan2(√a, √(1−a))   (in km)
```

**Formatting (`formatDistance(km)` in `src/utils/categories.js`):**

| Condition | Format | Example |
|---|---|---|
| `km < 1` | `Math.round(km * 1000) + " m"` | "350 m", "1000 m" |
| `km >= 1` | `km.toFixed(1) + " km"` | "1.1 km", "2.4 km" |

Note: the boundary is a strict `< 1` check, so exactly 1 km (1000 m) is displayed as "1000 m", and 1.001 km is displayed as "1.0 km". This matches Requirement 12 C2.

---

## Caching Strategy

The `overpass.js` module maintains a single module-level `Map` (`_cache`) that persists for the lifetime of the browser tab session.

**Cache key:** `"{roundedLat}:{roundedLon}:{radius}:{categoryId}"`

Coordinates are rounded to 2 decimal places before use in the key. This creates an approximate 1.1 km grid, so nearby searches within ~1 km of a previously searched point will reuse the same cached result rather than making a new request. This is intentional — it trades exact result freshness for significantly reduced API call volume.

**TTL:** 5 minutes (300,000 ms). Checked on `fromCache` — stale entries are evicted at read time.

**Cap:** 200 entries. When inserting a 201st entry, the oldest key (first entry from `_cache.keys()`, which reflects insertion order in ES2015+ `Map`) is deleted. This is an approximate LRU-style eviction; it evicts by insertion order rather than access recency, but is sufficient for the app's usage patterns.

**Scope:** The cache is not persisted to `localStorage` or `sessionStorage`. It resets on page reload. This is appropriate for a discovery app where stale OSM data is not a concern within a single browsing session.

---

## Error Handling

| Scenario | Handling |
|---|---|
| GPS permission denied (code 1) | `LocationGate` displays: "Location access was denied. Please allow location in your browser settings." as visible red text. |
| GPS unavailable (code 2) | `LocationGate` displays: "Location unavailable. Check your device settings." |
| GPS timeout (code 3) | `LocationGate` displays: "Location request timed out. Please try again." |
| Geolocation API absent | `getCurrentLocation` / `watchLocation` reject/call onError with "Geolocation is not supported by your browser." |
| Nominatim network failure | `SearchBar` catches the error and displays the error message in a visible `<p>` styled with `var(--terracotta)`. |
| Nominatim zero results | `geocode()` throws with the message `No results found for "{query}". Try a different name or be more specific.` The `SearchBar` renders this as visible text. |
| Overpass primary mirror failure | `fetchWithFallback` silently moves to the next mirror in sequence. |
| All three Overpass mirrors fail | `fetchWithFallback` re-throws the last error. The calling `loadPlaces`/`handleLocationGranted` `catch` block sets that category's result to `[]` — the `CategoryGrid` shows the empty state rather than an error. |
| `sessionStorage` key missing | `PlaceDetails` sets `notFound = true` → "Place not found" UI with "← Go Back" button. |
| Malformed `sessionStorage` JSON | `JSON.parse` throws inside the `try/catch` → `setNotFound(true)` → same "Place not found" UI. |

All user-facing errors are rendered as visible text. No error is conveyed solely through colour changes (satisfying accessibility requirements for error presentation).

---

## Responsive Design

The app uses a max-width `page-container` utility class (`max-width: 1280px; margin: 0 auto`) for all page content. Breakpoints are minimal — the design relies primarily on flexible grid and flexbox layouts.

**Breakpoints defined in `src/index.css`:**

| Breakpoint | Rule | Effect |
|---|---|---|
| `≤ 768px` | `.page-container` | Padding reduces from `var(--space-6)` (1.5 rem) to `var(--space-4)` (1 rem) |

**Card grid (`CategoryGrid`):**

```css
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
```

This is a standard CSS grid auto-fill pattern: as many 280 px-minimum columns fit into the available width. On a 320 px screen (mobile), one column. On a 640 px screen, two columns. On 960 px+, three or more.

**PlaceDetails two-column layout:**

```css
display: grid;
gridTemplateColumns: 'minmax(0,1fr) 340px';
```

The right column (map) is sticky at `top: 80px`.

**Implementation Note (Requirement 14 C3):** This layout has no mobile fallback. On viewports narrower than ~620 px, the grid will compress both columns below readable width. A media query that switches to `grid-template-columns: 1fr` on narrow screens is required.

**Navbar:** Uses `flexbox` with `justify-content: space-between`. On narrow screens both the logo and links bar remain in the same row. At very narrow widths (< 360 px) the links may overflow. No hamburger/drawer menu is implemented.

---

---

## Accessibility

The following accessibility attributes and patterns are implemented in the current codebase:

| Feature | Implementation | Location |
|---|---|---|
| Keyboard navigation on cards | `tabIndex={0}` + `onKeyDown` (Enter → click) on `<article>` | `PlaceCard.jsx` |
| Directions button label | `aria-label="Directions to {place.name}"` | `PlaceCard.jsx` |
| Navigation landmark | `<nav aria-label="Main navigation">` on the links container | `Navbar.jsx` |
| Category filter group | `<div role="group" aria-label="Filter by category">` | `CategoryFilter.jsx` |
| Category filter toggle state | `aria-pressed={active}` on each category button | `CategoryFilter.jsx` |
| Search input label | `aria-label="Search for a place"` | `SearchBar.jsx` |
| Search input expanded state | `aria-expanded={showDropdown}` | `SearchBar.jsx` |
| Search input autocomplete hint | `aria-autocomplete="list"` | `SearchBar.jsx` |
| Search form role | `role="search"` on `<form>` | `SearchBar.jsx` |
| Search dropdown role | `role="listbox"` on the results container | `SearchBar.jsx` |
| Search result role | `role="option"` on each result button | `SearchBar.jsx` |
| Error messages | Rendered as visible `<p>` or `<div>` text (not colour-only) | `SearchBar.jsx`, `LocationGate` |
| Focus ring | `:focus-visible { outline: 2px solid var(--gold); }` | `index.css` |
| Visually hidden utility | `.visually-hidden` class for screen-reader-only text | `index.css` |

**Implementation Note (Requirement 15 C5):** `MapView` renders two nested `<div>` elements (outer wrapper + inner Leaflet container). Neither has a `role` or `aria-label`. Screen readers will not announce this region as a map. The outer wrapper div should receive `role="region"` and `aria-label="Interactive map"` (or `role="application"` if interactive map controls need to be exposed).

---

## External Attribution

### OpenStreetMap Tiles

The `MapView` tile layer includes the OSM attribution string as required by the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/):

```js
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
})
```

Leaflet renders this in a `leaflet-control-attribution` element at the bottom-right of the map. The `.leaflet-control-attribution` CSS in `index.css` styles it with a semi-transparent ivory background and monospace font.

### Nominatim User-Agent

All requests from `nominatim.js` include the header:

```
User-Agent: LocalLens/1.0 (https://github.com/locallens)
```

This is required by the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/) to identify the application making requests.

### External Links Safety

All external links (`target="_blank"`) include `rel="noopener noreferrer"` to prevent reverse tab-napping and to avoid passing the `Referer` header:

- Directions link in `PlaceCard` — `window.open(..., '_blank', 'noopener,noreferrer')`
- Directions button in `PlaceDetails` — `<a target="_blank" rel="noopener noreferrer">`
- "View on OpenStreetMap" link in `PlaceDetails` — `<a target="_blank" rel="noopener noreferrer">`
- Website link in `PlaceDetails` (`DetailRow` component) — `<a target="_blank" rel="noopener noreferrer">`
