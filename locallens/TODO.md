# TODO — Mobile Map Layout Fix

- [x] Refactor `Directions.jsx` so the map is full-bleed on screens <768px:
  - [x] Map becomes primary layer (width: 100vw; responsive height under header)
  - [x] Remove fixed map heights and constrained grid layout
  - [x] Cards/panels become absolute/fixed overlays
  - [ ] Keep overlays inside safe viewport boundaries
  - [x] Trigger Leaflet `invalidateSize()` after layout changes

- [ ] Update `locallens/src/index.css` with mobile-only classes/rules for the new overlay layout
  - [ ] Ensure overflow-x is hidden for the directions page
  - [ ] Remove any conflicting fixed-height directions rules
- [ ] Smoke test:
  - [ ] Open Directions page on mobile viewport and verify:
    - [ ] Full-width map (no clipped left/right)
    - [ ] No horizontal scrolling
    - [ ] Floating cards overlay map
    - [ ] Zoom/pan tiles render and pan smoothly

