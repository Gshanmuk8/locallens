# LocalLens 🔍

A location-aware place discovery app built with React, Leaflet, and OpenStreetMap APIs.

## Stack

| Concern | Tool |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Maps | Leaflet.js + OpenStreetMap tiles |
| Geocoding | Nominatim |
| Places data | Overpass API |
| Deployment | Vercel / Netlify |

## Setup

```bash
npm install
npm run dev
```

## Known limitation: Overpass API coverage

Overpass is a volunteer OpenStreetMap service with excellent coverage in Western Europe but **sparse data in Tier-2 Indian cities and small towns**. If you see empty categories for Indian locations, this is an OSM data gap, not a code bug.

**For production Indian deployments, switch to:**
- Google Places API (best coverage, paid)
- HERE Places API (free tier)
- Foursquare Places API (free tier)

The `src/services/overpass.js` is cleanly isolated so you can swap it with minimal changes to the rest of the codebase.

## Project structure

```
src/
  pages/
    Home.jsx         - GPS-based dashboard
    Explore.jsx      - Search + map + filtered results
    PlaceDetails.jsx - Single place view
  components/
    Navbar.jsx
    SearchBar.jsx    - Nominatim autocomplete
    MapView.jsx      - Leaflet wrapper
    CategoryGrid.jsx - Card grid per category
    PlaceCard.jsx    - Single place card
    CategoryFilter.jsx - Filter pills
  services/
    location.js      - Geolocation API wrapper
    nominatim.js     - Geocoding service
    overpass.js      - POI fetch service (with cache)
  utils/
    categories.js    - Category config + helpers
```

## Deploy to Vercel

```bash
npm run build
vercel --prod
```
