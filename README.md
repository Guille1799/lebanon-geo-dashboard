# Lebanon Geo-Dashboard (UN ESCWA)

**Repository:** [github.com/Guille1799/lebanon-geo-dashboard](https://github.com/Guille1799/lebanon-geo-dashboard)  
**Live demo:** [onulibanodashboard.netlify.app](https://onulibanodashboard.netlify.app/)

Interactive geospatial dashboard for demographic analysis in Lebanon (Admin Level 3), built for a technical assignment with **UN ESCWA**. In fragile and highly unequal contexts, **who** is affected and **where** they live are central to prioritisation—this tool supports **policy-facing exploration** with **WorldPop**-aligned population structure, **Leaflet** mapping, Chart.js, and **AI-assisted** analysis (Netlify Functions + Gemini) with **defensive prompting** so outputs stay reviewable in high-stakes settings.

## What this project does

- Visualizes population structure by district with an interactive choropleth map.
- Compares trends across selected years (2015, 2018, 2020, 2023, 2025, 2030).
- Shows population pyramid and time-series evolution by age groups.
- Computes and displays dependency ratio to support policy interpretation.
- Includes AI-assisted analysis:
  - **Pre-calculated AI Policy Insight** per district (stored in data).
  - **Live Q&A assistant** constrained to dashboard data only.
  - **AI Trend Filter** to highlight districts with similar demographic profiles.

## Key features

- District search with autocomplete.
- "National mode" vs "District mode" for analysis.
- Draggable, collapsible analysis panels (customizable workspace).
- Sidebar resizing for different screen workflows.
- Local persistence of user settings (selected district, year, panel order, map theme).
- Data quality guardrail: districts below population threshold are marked as low-confidence for statistical interpretation.

## Tech stack

- Frontend: Vanilla JavaScript, HTML, CSS
- Mapping: Leaflet.js
- Charts: Chart.js
- UI drag-and-drop: SortableJS
- AI backend: Netlify Functions + Google Gemini API
- Hosting: Netlify

## Data sources

- **WorldPop**: high-resolution population estimates/projections by age and sex.
- **HDX**: Lebanon administrative boundaries (Admin Level 3).

## Methodological notes

- Dependency Ratio:
  - `(Population 0-19 + Population 65+) / Population 20-64 * 100`
- AI Trend Filter categories are based on pre-calculated thresholds over demographic share and growth patterns.
- A minimum population threshold is used to reduce noisy inference in very small districts.
- The map can be switched between:
  - Total Population
  - Dependency Ratio

## Responsible AI and defensive prompting

The live AI assistant uses server-side prompting rules designed to reduce hallucinations and prompt-injection risk:

- Restricts answers to metrics available in the dashboard data.
- Refuses requests outside the demographic scope.
- Rejects role override attempts ("ignore instructions", "change role", etc.).
- Handles unavailable years explicitly.
- Adds low-population safeguards to avoid over-interpreting weak-signal districts.

This is intended as decision support, not as an authoritative policy recommendation system.

## Project structure

```text
.
|-- app.js
|-- index.html
|-- style.css
|-- lebanon_data_tagged.geojson
|-- netlify.toml
|-- netlify/
|   `-- functions/
|       `-- ask-gemini.js
`-- package.json
```

## Run locally

### 1) Install dependencies

```bash
npm install
```

### 2) Create environment variables

Copy `.env.example` to `.env` and set:

```env
GEMINI_API_KEY=your_api_key_here
```

### 3) Start local development (with Netlify functions)

```bash
npm run dev
```

This runs a local Netlify environment so both frontend and `/.netlify/functions/*` endpoints work.

## Deployment

- Connect the repository to Netlify.
- Configure `GEMINI_API_KEY` in Netlify environment variables.
- Deploy with default settings (using `netlify.toml` in this repository).

## Limitations

- Demographic categories and thresholds are rule-based and can be refined.
- 2030 values are projections, not observed outcomes.
- Contextual indicators (economy, labor, health system capacity) are not embedded in the current dataset.
- AI output quality depends on clarity of user questions and strictness of guardrails.

## Author

Guillermo Martin de Oliva Carranza  
LinkedIn: [guillermo-martin-de-oliva-carranza](https://www.linkedin.com/in/guillermo-martin-de-oliva-carranza-58391817a/)
