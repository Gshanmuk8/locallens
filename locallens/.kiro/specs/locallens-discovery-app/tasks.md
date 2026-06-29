# Implementation Plan: LocalLens Discovery App

## Overview

Tasks targeting the gaps identified in `design.md` and `requirements.md` for the LocalLens frontend-only React + Vite SPA. The codebase is substantially built — these tasks fix missing functionality and broken behaviour, then run a verification pass over what already exists.

Tasks 1–6 are implementation fixes (critical gaps). Tasks 7–13 are verification passes that confirm existing code meets requirements and fix any issues found.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": [1, 2, 3, 4, 5, 6] },
    { "wave": 2, "tasks": [7, 8, 9, 10, 11, 12, 13] }
  ]
}
```

## Tasks

- [ ] 1. Wire up location watch on Home page
  - In `src/pages/Home.jsx`, add `watchLocation` to the import from `../services/location` (it is exported but not currently imported)
  - Add a `useEffect` that depends on `[location, handleLocationGranted]` — the effect body should only run when `location !== null`
  - Inside the effect, call `watchLocation(handleLocationGranted, () => {})` and capture the returned cleanup function
  - Return the cleanup function from the `useEffect` so `clearWatch` is called on unmount or when `location` changes
  - _Requirements: Req 4_

- [ ] 2. Fix StatsBar zero-count display
  - In `src/pages/Home.jsx`, remove the `if (!total) return null` early return from the `StatsBar` sub-component so it always renders when called
  - Change the per-category `if (!count) return null` guard inside the `CATEGORIES.map` to always render every category badge, showing `0` when count is zero
  - In the `Home` component, wrap the `<StatsBar>` call in a condition that checks all loading is complete: `Object.keys(loadingCategories).length === CATEGORIES.length && Object.values(loadingCategories).every(v => v === false)` — so the bar only appears after all seven fetches finish
  - _Requirements: Req 3_

- [ ] 3. Add catch-all 404 route
  - In `src/router.jsx`, create a small inline `NotFound` component above the `Router` function that renders a centred "Page not found" message and a `<Link to="/">` back to Home
  - Add `Link` to the `react-router-dom` import in `router.jsx` (not currently imported there)
  - Add `<Route path="*" element={<NotFound />} />` as the last route inside the `<Routes>` block
  - _Requirements: Req 13_

- [ ] 4. Fix PlaceDetails responsive layout
  - In `src/index.css`, add a `.details-grid` CSS class: `display: grid; grid-template-columns: minmax(0,1fr) 340px; gap: var(--space-8); align-items: start;`
  - In the same class, add `@media (max-width: 768px) { .details-grid { grid-template-columns: 1fr; } }`
  - In `src/pages/PlaceDetails.jsx`, replace the inline `style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 'var(--space-8)', alignItems: 'start' }}` on the two-column wrapper `<div>` with `className="details-grid"` and remove the inline style
  - Also add a CSS rule `.details-grid > div:last-child` with `position: sticky; top: 80px;` and a `@media (max-width: 768px)` override removing the sticky positioning, then remove the inline `position: 'sticky', top: '80px'` from the right-column `<div>` in `PlaceDetails.jsx`
  - _Requirements: Req 14_

- [ ] 5. Add accessibility role to MapView
  - In `src/components/MapView.jsx`, add `role="region"` and `aria-label="Interactive map"` to the outer wrapper `<div>` (the div holding `borderRadius`, `overflow`, `border`, `boxShadow`, `height`, and the `style` spread)
  - _Requirements: Req 15_

- [ ] 6. Fix CategoryGrid count sub-text during loading
  - In `src/components/CategoryGrid.jsx`, change the count sub-text render condition from `!loading && places` to `!loading && places !== undefined` so it is explicit that the `places` array must have arrived before the sub-text is shown
  - This prevents a premature flash of "None found nearby" on the Explore page where `loading` can become `false` for a category before its `places` array has been set in state
  - _Requirements: Req 8_

- [ ] 7. Verify Navbar active state and scroll shadow
  - Verify `isActive('/')` uses `location.pathname === path` (exact match) — confirmed in current code; no change needed
  - Verify the "Explore →" link uses only `styles.exploreBtn` and never receives `styles.linkActive` — confirmed in current code; no change needed
  - Verify the `scroll` listener threshold is `window.scrollY > 8` and that `styles.navScrolled` is spread into the `<nav>` style correctly — confirmed in current code; no change needed
  - Fix any issues found during manual testing of scroll shadow appearance and active link highlighting
  - _Requirements: Req 1_

- [ ] 8. Verify LocationGate behavior
  - Verify `disabled={requesting}` and loading label `"⏳ Getting location…"` are rendered on the button while the Geolocation API call is in-flight — confirmed in current code
  - Verify the `error` state is set from `err.message` (which carries the code-specific message from `location.js`) and is rendered in the error `<div>` — confirmed in current code
  - Verify the `<Link to="/explore">search any place manually</Link>` fallback is present at the bottom of `LocationGate` — confirmed in current code
  - Fix any issues found during manual testing
  - _Requirements: Req 2_

- [ ] 9. Verify Explore page search and filtering
  - Verify the `SearchBar` debounce fires at 500 ms via `setTimeout(() => doSearch(val), 500)` in `handleChange` — confirmed in current code
  - Verify `showDropdown` is set to `true` after results arrive and the dropdown renders `results.length > 0` items — confirmed in current code
  - Verify `abortRef.current?.abort?.()` is called at the start of every `loadPlaces` call before the new `AbortController` is created — confirmed in current code
  - Verify `controller.signal.aborted` is checked inside the `Promise.all` map to suppress stale state updates — confirmed in current code
  - Verify radius buttons call `handleRadiusChange` → `loadPlaces(selectedLocation, selectedCategories, r)` — confirmed in current code
  - Verify category toggles call `handleCategoryChange` → `loadPlaces(selectedLocation, cats, radius)` — confirmed in current code
  - Fix any issues found during manual testing
  - _Requirements: Req 5, Req 6_

- [ ] 10. Verify Place Details page
  - Verify `sessionStorage.getItem(`place-${osmType}-${osmId}`)` is called in the `useEffect` and `setNotFound(true)` fires when the key is absent or JSON is malformed — confirmed in current code
  - Verify the not-found state renders "Place not found" heading and a "← Go Back" `<button>` calling `navigate(-1)` — confirmed in current code
  - Verify `DetailRow` returns `null` when `value` is falsy so address, hours, phone, website, and cuisine rows only appear when data is present — confirmed in current code
  - Verify the directions `<a>` is built only when `place.lat && place.lon` are truthy and carries `target="_blank" rel="noopener noreferrer"` — confirmed in current code
  - Fix any issues found during manual testing (e.g., JSON parse edge cases, breadcrumb navigation)
  - _Requirements: Req 10_

- [ ] 11. Verify and fix distance formatting boundary
  - In `src/utils/categories.js`, inspect `formatDistance(km)`: the current condition `if (km < 1)` means exactly `km === 1` (1000 m) returns `"1.0 km"` instead of the required `"1000 m"`
  - Change the condition to `if (km <= 1)` so the boundary is inclusive and `formatDistance(1)` returns `"1000 m"`
  - Confirm `formatDistance(0)` returns `"0 m"` and `formatDistance(1.001)` returns `"1.0 km"` after the fix
  - _Requirements: Req 12_

- [ ] 12. Verify map markers and popups
  - Verify `createCategoryIcon(cat)` uses `category?.color` for the pin background and `category?.emoji` in the inner span — confirmed in current code
  - Verify each marker popup HTML includes the escaped place name, escaped address (when truthy), and formatted distance (when `distanceKm != null`) — confirmed in current code
  - Verify `createUserIcon()` produces a blue circle and is added when `userLocation?.lat && userLocation?.lon` — confirmed in current code
  - Verify `mapRef.current.flyTo([lat, lon], zoom, { animate: true, duration: 1 })` fires in the `center` `useEffect` — confirmed in current code
  - Verify old markers are removed via `markersRef.current.forEach((m) => m.remove())` before new markers are added — confirmed in current code
  - Fix any issues found during manual testing
  - _Requirements: Req 9_

- [ ] 13. Verify external links and attribution
  - Verify the `L.tileLayer` attribution string `'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'` is present in `MapView.jsx` and `attributionControl: true` is set — confirmed in current code
  - Verify the Directions button in `PlaceCard.jsx` uses `window.open(..., '_blank', 'noopener,noreferrer')` — confirmed in current code
  - Verify the directions `<a>` in `PlaceDetails.jsx` has `rel="noopener noreferrer"` — confirmed in current code
  - Verify the OSM link `DetailRow` and website `DetailRow` in `PlaceDetails.jsx` both render with `target="_blank" rel="noopener noreferrer"` via the `DetailRow` component's `href` branch — confirmed in current code
  - If any `target="_blank"` link is found missing `rel="noopener noreferrer"` during a code or manual audit, add the attribute to that element
  - _Requirements: Req 16_

## Notes

- Tasks 1–6 are concrete file edits with clear before/after targets.
- Tasks 7–13 are verification passes; each sub-task identifies what to look for and where. If the code already matches, no edit is needed — the task is complete once the behaviour is confirmed working in the browser.
- Task 11 is the only verification task that is certain to require a code change (the `< 1` vs `<= 1` boundary bug is confirmed in the source).
