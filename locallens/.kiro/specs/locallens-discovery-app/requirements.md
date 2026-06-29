# Requirements Document

## Introduction

LocalLens is a frontend-only, location-aware discovery web application that helps users explore places around any location on Earth. The app answers two core questions: "What's around me right now?" (GPS-based home dashboard) and "What's around this place?" (search-driven exploration). It requires no user accounts, no backend, no database, and no AI. All data comes from free, open services: OpenStreetMap tiles via Leaflet.js, location search via Nominatim, and nearby-place queries via the Overpass API. The app consists of three pages — Home, Explore, and Place Details — served as a static React + Vite SPA with React Router.

---

## Glossary

- **App**: The LocalLens frontend-only web application.
- **Home_Page**: The page rendered at route `/` that shows a GPS-based nearby-places dashboard.
- **Explore_Page**: The page rendered at route `/explore` that allows searching any location by name.
- **PlaceDetails_Page**: The page rendered at route `/place/:osmType/:osmId` that shows full details for a single place.
- **Navbar**: The persistent top navigation bar present on all pages.
- **LocationGate**: The full-screen prompt on the Home_Page that requests GPS permission before showing the dashboard.
- **MapView**: The interactive Leaflet.js map component embedded on the Home_Page, Explore_Page, and PlaceDetails_Page.
- **CategoryGrid**: The component that renders a labeled section header and a responsive grid of PlaceCards for one category.
- **PlaceCard**: The card component that represents a single place, showing its name, category, address, distance, and a directions button.
- **SearchBar**: The autocomplete input component on the Explore_Page that accepts a location query and returns Nominatim results.
- **CategoryFilter**: The row of toggleable category buttons on the Explore_Page used to filter which categories of places are displayed.
- **StatsBar**: The summary bar on the Home_Page that counts discovered places per category.
- **Overpass_Service**: The `src/services/overpass.js` module that queries the Overpass API for nearby OSM places.
- **Nominatim_Service**: The `src/services/nominatim.js` module that geocodes location names and reverse-geocodes coordinates.
- **Location_Service**: The `src/services/location.js` module that wraps the browser Geolocation API.
- **Category**: One of the seven place types defined in `src/utils/categories.js`: restaurants, hotels, cafes, theaters, attractions, parks, shopping.
- **Place**: A single OSM element (node or way) returned by the Overpass_Service, normalised to a flat object with fields: `id`, `osmId`, `osmType`, `lat`, `lon`, `name`, `categoryId`, `distanceKm`, `address`, `phone`, `website`, `openingHours`, `cuisine`, `tags`.
- **Search_Radius**: The distance (in metres) used as the bounding radius for Overpass queries. Options: 1000, 3000, 5000, 10000.
- **SessionStorage**: The browser `sessionStorage` API used to pass Place data from a PlaceCard click to the PlaceDetails_Page without a backend.
- **Overpass_Mirror**: One of three fallback Overpass API endpoints tried in sequence: `overpass-api.de`, `overpass.kumi.systems`, `maps.mail.ru`.
- **OSM**: OpenStreetMap, the open geographic database used as the data source for all place and map data.

---

## Requirements

### Requirement 1: Persistent Navigation

**User Story:** As a user, I want a navigation bar on every page, so that I can move between the Home and Explore pages without getting lost.

#### Acceptance Criteria

1. THE Navbar SHALL be rendered at the top of every page in the App.
2. THE Navbar SHALL display a "LocalLens" logo that links to the Home_Page (`/`).
3. THE Navbar SHALL display a "Home" link that navigates to the Home_Page (`/`).
4. THE Navbar SHALL display an "Explore →" button that navigates to the Explore_Page (`/explore`).
5. WHEN the user scrolls down more than 8 pixels, THE Navbar SHALL display a drop shadow beneath it.
6. WHEN the current route matches a navigation link's target path, THE Navbar SHALL render that link in an active visual state (bold weight, parchment background).

---

### Requirement 2: GPS Location Permission Gate

**User Story:** As a user visiting the Home_Page for the first time, I want to be prompted for GPS permission in a clear, reassuring way, so that I understand why the App needs my location before I grant access.

#### Acceptance Criteria

1. WHEN the Home_Page is loaded and no GPS location has been granted in the current session, THE LocationGate SHALL be displayed instead of the dashboard.
2. THE LocationGate SHALL display an "Allow Location Access" button that triggers the browser Geolocation API via the Location_Service.
3. WHEN the user clicks "Allow Location Access" and the browser permission prompt is pending, THE LocationGate SHALL display a loading state ("Getting location…") and disable the button.
4. WHEN the browser Geolocation API returns a successful position, THE LocationGate SHALL dismiss and THE Home_Page SHALL render the dashboard with the obtained coordinates.
5. IF the browser Geolocation API returns an error (denied, unavailable, or timed out), THEN THE LocationGate SHALL display a human-readable error message describing the specific cause.
6. THE LocationGate SHALL display a fallback link to the Explore_Page so users who decline GPS can still use the App.
7. THE Location_Service SHALL request position with `enableHighAccuracy: true`, a timeout of 10,000 ms, and a `maximumAge` of 60,000 ms.

---

### Requirement 3: Home Page GPS Dashboard

**User Story:** As a user who has granted GPS access, I want to see my current area's name and a categorised list of nearby places, so that I can immediately discover what is around me.

#### Acceptance Criteria

1. WHEN GPS coordinates are obtained, THE Nominatim_Service SHALL reverse-geocode the coordinates to produce a human-readable city and state name.
2. WHEN the reverse geocode succeeds, THE Home_Page SHALL display the city name (and state if available) as the dashboard heading.
3. IF the reverse geocode fails, THEN THE Home_Page SHALL display "Your Location" as the heading fallback.
4. THE Home_Page SHALL display the GPS accuracy in metres beneath the heading (e.g., "Accurate to ~42 m" or "Approximate location" when accuracy is ≥ 100 m).
5. WHEN GPS coordinates are obtained, THE Overpass_Service SHALL be called concurrently for all seven Categories using a default Search_Radius of 3000 m.
6. WHILE an Overpass_Service request for a Category is pending, THE CategoryGrid for that Category SHALL display three skeleton loading cards.
7. WHEN an Overpass_Service request for a Category completes, THE CategoryGrid for that Category SHALL update immediately with the returned places without waiting for other categories.
8. IF an Overpass_Service request for a Category fails, THEN THE CategoryGrid for that Category SHALL display an empty state message rather than an error state, so the dashboard remains functional.
9. THE Home_Page SHALL render one CategoryGrid per Category in the order defined in `CATEGORIES` from `src/utils/categories.js`.
10. THE Home_Page SHALL display a StatsBar showing the count of found places per Category once all Overpass_Service requests have completed, including when all requests fail (showing zero counts).
11. WHEN GPS coordinates are obtained, THE MapView SHALL be displayed centered on the user's coordinates at zoom level 14, with a distinct user-location marker and place markers for all loaded places.

---

### Requirement 4: Location Watch and Dashboard Auto-Update

**User Story:** As a mobile user walking to a new area, I want the Home_Page dashboard to automatically refresh when my location changes significantly, so that I always see places relevant to where I am now.

#### Acceptance Criteria

1. WHEN the Home_Page dashboard is active, THE Location_Service SHALL watch the user's position using `watchPosition` with a `maximumAge` of 5,000 ms.
2. WHEN the watched position changes, THE Home_Page SHALL re-fetch nearby places for all seven Categories using the new coordinates.
3. WHEN the Home_Page is unmounted or the component is cleaned up, THE Location_Service SHALL stop watching the position by calling `clearWatch`.

---

### Requirement 5: Explore Page — Location Search

**User Story:** As a user, I want to type any city, landmark, or neighborhood into a search bar and have the map and results update to that location, so that I can discover places anywhere in the world.

#### Acceptance Criteria

1. THE Explore_Page SHALL display a SearchBar that accepts free-text input representing a place name or address.
2. WHEN the user submits a search query, THE Nominatim_Service SHALL geocode the query and return up to 8 candidate results.
3. WHEN geocoding returns results, THE SearchBar SHALL display the candidates as a dropdown list, each showing a human-readable display name. WHEN geocoding returns zero candidates, THE SearchBar SHALL display an empty dropdown.
4. WHEN the user selects a candidate from the dropdown, THE Explore_Page SHALL set the selected location as the active search point.
5. WHEN a location is selected, THE MapView on the Explore_Page SHALL animate (fly) to that location's coordinates at zoom level 14.
6. WHEN a location is selected, THE Overpass_Service SHALL be called for all active Categories using the selected coordinates and current Search_Radius.
7. IF the geocoding query returns zero results, THEN THE SearchBar SHALL display the message: "No results found for '[query]'. Try a different name or be more specific."
8. IF the geocoding request fails due to a network error, THEN THE SearchBar SHALL display a human-readable error message.
9. THE Nominatim_Service's `geocode` function SHALL include the `User-Agent` header `LocalLens/1.0` on all requests to comply with Nominatim's usage policy.

---

### Requirement 6: Explore Page — Radius and Category Filtering

**User Story:** As a user exploring a location, I want to adjust the search radius and filter by category, so that I can control how many and what types of places are shown.

#### Acceptance Criteria

1. THE Explore_Page SHALL display four Search_Radius options: 1 km (1000 m), 3 km (3000 m), 5 km (5000 m), and 10 km (10000 m), with 3 km selected by default.
2. WHEN the user selects a Search_Radius option, THE Explore_Page SHALL re-fetch places for all active Categories using the new radius.
3. THE Explore_Page SHALL display a CategoryFilter row showing all seven Categories as toggleable buttons.
4. WHEN no Category is selected in the CategoryFilter, THE Explore_Page SHALL fetch and display places for all seven Categories.
5. WHEN one or more Categories are selected in the CategoryFilter, THE Explore_Page SHALL fetch and display places only for the selected Categories.
6. WHEN the active Categories change while a location is selected, THE Explore_Page SHALL re-fetch places for the newly active Categories immediately.
7. WHEN a new search location is selected, THE Explore_Page SHALL abort any in-progress Overpass_Service request before starting the new one, regardless of whether a new request will be started immediately.

---

### Requirement 7: Place Card Display

**User Story:** As a user browsing nearby places, I want each place shown as a card with its name, category, address, and distance, so that I can quickly compare options.

#### Acceptance Criteria

1. THE PlaceCard SHALL display the Category emoji and the place's name.
2. THE PlaceCard SHALL display the place's address when the `address` field is non-empty.
3. WHEN the place has a `cuisine` tag, THE PlaceCard SHALL display the cuisine type beneath the place name.
4. WHEN the place has a `distanceKm` value, THE PlaceCard SHALL display the formatted distance (metres when < 1 km, kilometres with one decimal place otherwise).
5. THE PlaceCard SHALL display a "Directions ↗" button that opens `https://www.openstreetmap.org/directions?to={lat},{lon}` in a new browser tab.
6. WHEN the user clicks anywhere on a PlaceCard (excluding the Directions button), THE PlaceCard SHALL store the place's data in SessionStorage under the key `place-{osmType}-{osmId}` and navigate to the PlaceDetails_Page route `/place/{osmType}/{osmId}`.
7. WHEN the PlaceCard has keyboard focus and the user presses Enter, THE PlaceCard SHALL navigate to the PlaceDetails_Page, ensuring keyboard accessibility.

---

### Requirement 8: Category Grid Layout and Loading States

**User Story:** As a user, I want categories to appear with clear headers and responsive card grids, and to see loading skeletons while data is fetching, so that the interface feels polished and informative.

#### Acceptance Criteria

1. THE CategoryGrid SHALL display a section heading with the Category emoji, plural label, and a count of found places (e.g., "12 found nearby").
2. WHILE places for a Category are loading, THE CategoryGrid SHALL display exactly three skeleton loading cards in the grid layout.
3. WHEN a Category returns zero places, THE CategoryGrid SHALL display an empty state message: "No [category plural] found in this area. OpenStreetMap data may be sparse here."
4. THE CategoryGrid SHALL display at most 6 PlaceCards by default (controlled by `maxVisible`).
5. WHEN a category has more places than `maxVisible` and an `onShowMore` handler is provided, THE CategoryGrid SHALL display a "View all [count] →" button, where count is the total number of places returned for that category.
6. THE CategoryGrid SHALL arrange PlaceCards in a responsive CSS grid that uses the maximum number of columns that can fit, with a minimum card width of 280 px.

---

### Requirement 9: Interactive Map

**User Story:** As a user, I want an interactive map showing place markers and my location, so that I can understand the spatial layout of nearby places.

#### Acceptance Criteria

1. THE MapView SHALL render an OpenStreetMap tile layer using Leaflet.js attributed to "© OpenStreetMap contributors".
2. THE MapView SHALL display a category-coloured, emoji-labelled pin marker for each Place that has valid `lat` and `lon` values.
3. WHEN the user clicks a place marker on the map, THE MapView SHALL display a popup showing the place's name, address (if available), and distance (if available).
4. WHEN the `userLocation` prop is provided, THE MapView SHALL render a distinct blue circular marker at the user's GPS coordinates.
5. WHEN the `center` prop changes, THE MapView SHALL animate the map view to the new centre coordinates using a fly animation.
6. WHEN the `places` prop changes, THE MapView SHALL remove all previous place markers and render new markers for the updated places list.
7. THE MapView SHALL be initialised with a fallback centre of [20.5937, 78.9629] (geographic centre of India) when no `center` prop is provided.

---

### Requirement 10: Place Details Page

**User Story:** As a user who clicked on a place, I want to see a full detail view with all available information and a focused map, so that I can learn more before deciding to visit.

#### Acceptance Criteria

1. WHEN the PlaceDetails_Page is loaded, THE PlaceDetails_Page SHALL read the place data from SessionStorage using the key `place-{osmType}-{osmId}`.
2. WHEN SessionStorage contains valid place data, THE PlaceDetails_Page SHALL display the place name, category emoji, category label, and cuisine (if available).
3. WHEN the place has a `distanceKm` value, THE PlaceDetails_Page SHALL display the formatted distance labelled "from search point".
4. THE PlaceDetails_Page SHALL display a detail row for each of the following fields when present: address, opening hours, phone number (as a `tel:` link), website (as an external link), and cuisine.
5. THE PlaceDetails_Page SHALL display a "View on OpenStreetMap" link to `https://www.openstreetmap.org/{osmType}/{osmId}`.
6. WHEN the place has valid `lat` and `lon` values, THE PlaceDetails_Page SHALL display a "Get Directions via OpenStreetMap" button that opens `https://www.openstreetmap.org/directions?to={lat},{lon}` in a new tab.
7. WHEN the place has valid `lat` and `lon` values, THE PlaceDetails_Page SHALL display a MapView centred on the place at zoom level 16 showing a single marker for that place.
8. THE PlaceDetails_Page SHALL display a collapsible "All OSM tags" section showing all raw key-value tags from the place's `tags` object.
9. WHEN SessionStorage does not contain data for the requested key, THE PlaceDetails_Page SHALL display a "Place not found" error state with a "Go Back" button that navigates to the previous route.
10. THE PlaceDetails_Page SHALL display a breadcrumb with links to Home and a "Back" button to the previous page.

---

### Requirement 11: Overpass Service — Data Fetching and Caching

**User Story:** As a developer, I want the Overpass_Service to cache results, use fallback mirrors, and gracefully handle API failures, so that the App is fast and resilient.

#### Acceptance Criteria

1. THE Overpass_Service SHALL maintain an in-memory cache of query results keyed by a combination of rounded latitude (2 decimal places), rounded longitude (2 decimal places), radius, and category ID.
2. WHEN a cached result exists and is less than 5 minutes old, THE Overpass_Service SHALL return the cached result without making a network request.
3. WHEN a cached result is 5 minutes old or older, THE Overpass_Service SHALL evict the entry and make a new network request.
4. THE Overpass_Service SHALL cap the in-memory cache at 200 entries, evicting the oldest entry when the limit is reached.
5. WHEN an Overpass API request fails on the primary endpoint, THE Overpass_Service SHALL retry the same query on each remaining Overpass_Mirror in sequence.
6. IF all three Overpass_Mirrors fail for a single query, THEN THE Overpass_Service SHALL throw an error that the calling component handles as an empty result.
7. THE Overpass_Service SHALL limit each Overpass network request to a timeout of 20,000 ms using `AbortSignal.timeout`.
8. THE Overpass_Service SHALL normalise each returned OSM element into a Place object including: `id`, `osmId`, `osmType`, `lat`, `lon`, `name`, `categoryId`, `distanceKm`, `address`, `phone`, `website`, `openingHours`, `cuisine`, `tags`.
9. THE Overpass_Service SHALL sort returned places by `distanceKm` ascending and cap results at 30 places per category.
10. WHEN fetching all Categories concurrently via `fetchAllCategories`, THE Overpass_Service SHALL limit concurrent requests to a maximum of 3 to avoid rate-limiting.

---

### Requirement 12: Distance Calculation and Formatting

**User Story:** As a user, I want distances shown in a human-readable format, so that I can intuitively understand how far away each place is.

#### Acceptance Criteria

1. THE App SHALL calculate distance between two coordinate pairs using the Haversine formula with the Earth radius set to 6371 km.
2. WHEN a distance is less than 1 km (including exactly 1000 m), THE App SHALL display it as whole metres (e.g., "350 m away", "1000 m away"). WHEN the distance is 0 m, THE App SHALL display "0 m away".
3. WHEN a distance is greater than 1 km, THE App SHALL display it with one decimal place in kilometres (e.g., "2.4 km away").

---

### Requirement 13: Routing and Navigation

**User Story:** As a user, I want the URL to reflect the current page and allow me to bookmark or share links, so that the App behaves like a standard multi-page web application.

#### Acceptance Criteria

1. THE App SHALL use React Router with the following routes: `/` → Home_Page, `/explore` → Explore_Page, `/place/:osmType/:osmId` → PlaceDetails_Page.
2. WHEN the user navigates directly to `/place/:osmType/:osmId` by URL without having visited a PlaceCard, THE PlaceDetails_Page SHALL display the "Place not found" state.
3. WHEN the user navigates to any route not defined in the App, THE App SHALL redirect to the Home_Page or display a fallback 404 state.

---

### Requirement 14: Responsive Layout

**User Story:** As a user on a mobile or tablet device, I want all pages to be readable and usable, so that I can discover places on any screen size.

#### Acceptance Criteria

1. THE App SHALL render all pages with a maximum content width of 1280 px centred horizontally.
2. THE CategoryGrid SHALL use a CSS grid that uses the maximum number of columns that can fit based on available width, with a minimum card width of 280 px.
3. THE PlaceDetails_Page SHALL use a two-column layout (details left, map right) on wide screens and collapse to a single column on narrow screens.
4. THE Navbar links and controls SHALL remain accessible and usable at viewport widths of 320 px and above.

---

### Requirement 15: Accessibility

**User Story:** As a user who relies on keyboard navigation or assistive technology, I want interactive elements to be keyboard-accessible and properly labelled, so that I can use the App without a pointer device.

#### Acceptance Criteria

1. THE PlaceCard SHALL be focusable via the Tab key using `tabIndex={0}`.
2. WHEN the PlaceCard has keyboard focus and the user presses Enter, THE PlaceCard SHALL trigger the same navigation action as a mouse click.
3. THE "Directions ↗" button on each PlaceCard SHALL have an `aria-label` of "Directions to [place name]".
4. THE Navbar SHALL contain a `<nav>` element with `aria-label="Main navigation"`.
5. THE MapView container SHALL be wrapped in a `<div>` with accessible role attributes so screen readers can identify it as a geographic map.
6. WHEN an error occurs in any form or interactive flow, THE App SHALL display the error as visible text (not only as a colour change).

---

### Requirement 16: External Links and Attribution

**User Story:** As a user and as a requirement of OSM's usage policy, I want all external links to open safely and the map to display proper attribution, so that the App complies with open data license terms.

#### Acceptance Criteria

1. THE MapView SHALL display the OpenStreetMap attribution text "© OpenStreetMap contributors" linking to `https://www.openstreetmap.org/copyright`.
2. ALL external links (directions, website, OpenStreetMap page) SHALL open in a new browser tab using `target="_blank"` and include `rel="noopener noreferrer"` to prevent reverse tabu-napping.
3. THE Nominatim_Service SHALL include the `User-Agent` request header identifying the App as required by the Nominatim usage policy.
