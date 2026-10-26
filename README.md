# TripSplit

TripSplit is a responsive, scrapbook-style travel planner for groups. It helps friends and families organise a trip in one place: plan each day, log shared expenses, track a budget, build a packing list, discover cafes, and calculate who should pay whom at the end.

## Key features

### Trip management

- Create trips with a name, destination, travel dates, budget, and travellers.
- View recent trips as journal cards with destination imagery, trip status, spending, confirmed activities, and date countdowns.
- Delete trips when they are no longer needed.

### Expenses and budget

- Add an expense with description, amount, category, payer, and selected people to split it with.
- Track spending across Food, Stay, Transport, Activities, and Miscellaneous categories.
- See total spent, per-person spending, receipt count, category totals, and a Chart.js doughnut chart.
- Set an optional budget and monitor progress; the indicator highlights when spending exceeds it.
- Mark expenses settled or remove incorrect entries.

### Settle up

- Calculates every traveller's balance from all unsettled expenses.
- Minimises the number of payments needed to clear group debts.
- Provides a printable settlement summary using the browser print dialog.

### Itinerary and voting

- Add days to a trip and create activity suggestions for each day.
- Upvote or downvote activities; the highest-rated suggestion is automatically marked as confirmed.
- Remove individual activities or an entire day when plans change.

### Cafes and packing

- Search for cafes by city using the Foursquare Places API.
- Add a selected cafe directly to an itinerary day.
- If cafe search is unavailable, the app shows sample cafe suggestions so the screen remains useful.
- Add, tick off, and remove packing-list items; progress is shown as packed items out of total items.

## Getting started

TripSplit has no build process or package installation. It is a static front-end project whose page sections are loaded as HTML feature partials.

1. Download or clone this project.
2. Run the folder through a local static server such as VS Code Live Server. The feature partials are loaded with `fetch`, so direct `file://` opening is not supported for the reorganised app shell.
3. Select **New Trip**, enter your trip details, and add at least one traveller.
4. Use the tabs in the trip screen to manage expenses, itinerary, cafes, packing, and settlements.

For best results, run it through a local static server such as VS Code Live Server. Opening `index.html` directly still supports the primary app features.

## Project structure

```text
travel/
|-- index.html   # App shell and shared document metadata
|-- app-shell.js # Loads the HTML feature partials before app.js
|-- html/        # Auth, header, dashboard, trip, modal, and navigation markup
|-- styles/      # Feature-specific CSS entry files
|-- styles.css   # Shared design system and legacy component styles
|-- app.js       # App state, rendering, calculations, and event handlers
|-- server/      # Express backend with auth, trips, and expenses API
|   |-- server.js
|   |-- models/
|   |-- routes/
|   |-- middleware/
|   |-- .env.example
|   `-- package.json
`-- README.md    # Project documentation
```

## Technologies used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure and accessible form controls |
| CSS3 | Responsive layout, mobile navigation, journal-card visual style, and print view |
| Vanilla JavaScript | UI rendering, local state, trip planning, and expense calculations |
| Chart.js | Spending-category doughnut chart |
| Google Fonts and Material Symbols | Typography and interface icons |
| Foursquare Places API | Cafe search results by city |
| Unsplash Source Images | Destination images on trip cards |

## How data is stored

The Express backend stores users and complete trip documents in the local MongoDB database named `tripsplit`. A trip document includes its metadata, travelers, expenses, itinerary, cafes, packing list, polls, and settlement data.

The browser stores only the current user summary and JWT session token in `localStorage`. Existing `ts_trips` data is migrated to MongoDB when the authenticated app loads.

## Cafe search configuration

Cafe search still calls the Foursquare Places API from `app.js`. Before publishing the app, move that request to the Express backend so the API key is not exposed to browsers.

If the API request fails, TripSplit automatically displays sample cafes instead of showing an error.

## Current limitations

- Currency is currently fixed to USD (`$`).
- Data is local to one browser; there is no login, cloud sync, or real-time collaboration.
- The app does not include editing for existing trip details or expense records; they can be removed and added again.
- Itinerary votes are shared only within the saved browser data, not across separate users.

## Future improvements

- User accounts and cloud-synchronised trips
- Multi-currency support and custom currency selection
- Edit forms for trips, activities, and expenses
- Receipt uploads and exportable trip reports
- Shared live collaboration and notifications
