# Lebanon Geo-Dashboard (UN ESCWA)

**Repository:** [github.com/Guille1799/lebanon-geo-dashboard](https://github.com/Guille1799/lebanon-geo-dashboard)  
**Live demo:** [onulibanodashboard.netlify.app](https://onulibanodashboard.netlify.app/)

Interactive geospatial dashboard for demographic analysis in Lebanon (Admin Level 3), built for a technical assignment with **UN ESCWA**. In fragile and highly unequal contexts, **who** is affected and **where** they live are central to prioritisation—this tool supports **policy-facing exploration** with **WorldPop**-aligned population structure, **Leaflet** mapping, Chart.js, and **AI-assisted** analysis (Netlify Functions + Gemini) with **defensive prompting** so outputs stay reviewable in high-stakes settings.

## What this project does

- Visualizes population structure across Lebanon's **1,545 localities (ADM3)**, inside 26 districts
  (caza) and 8 governorates, with an interactive choropleth map. The source file carries 1,611
  records: one is a `Conflict` pseudo-record and 65 are `Litige` — disputed border stretches from the
  OCHA file, not places. Eight of those 65 carried a demographic archetype. They are excluded.
- Compares trends across selected years (2015, 2018, 2020, 2023, 2025, 2030).
- Shows population pyramid and time-series evolution by age groups.
- Computes and displays dependency ratio to support policy interpretation.
- Includes AI-assisted analysis:
  - **Pre-computed rule-based summary** per district (stored in data).
  - **Live Q&A assistant** constrained to dashboard data only.
  - **Rule-based demographic classifier** (percentile thresholds) to highlight districts with similar profiles.

## Key features

- District search with autocomplete.
- "National mode" vs "District mode" for analysis.
- Draggable, collapsible analysis panels (customizable workspace).
- Sidebar resizing for different screen workflows.
- Local persistence of user settings (selected district, year, panel order, map theme).
- Data quality guardrail, applied in one place. The population threshold lives in `reliability.js`
  and every path asks the same predicate: the narrative text, the model prompt, the map colouring,
  the trend classifier and the metrics panel.

  It used not to. The threshold gated the text and the prompt but not the tag, so **291 localities —
  44% of every substantive tag in the file** — were highlighted by the filter while their own panel
  refused to analyse them. Two of the guards also read `pop > 0 && pop < 400`, which meant a recorded
  population of **zero** escaped both: Sfenta, with 0 inhabitants, was presented as a workforce
  opportunity. Fixed, and pinned by tests that run against the shipped data file.

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
- Classifier categories are rule-based: pre-calculated percentile thresholds over demographic share and growth patterns. No model is involved.
- A minimum population threshold (400) marks a locality as too small to read as a demographic
  profile. Below it the classifier returns the neutral label, the panel says the analysis is not
  available, the map paints it grey and the metrics show `N/A`. Zero counts as below.
- The map can be switched between:
  - Total Population
  - Dependency Ratio

## Responsible AI and defensive prompting

The live assistant uses prompt-level defenses to keep answers grounded in the dashboard data. These run client-side, so they are a usability guardrail rather than a security boundary — server-side hardening is the next step:

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

## License

Code in this repository is released under the **MIT License** (see [`LICENSE`](LICENSE)).

The data is **not** covered by that licence and keeps its own terms: population estimates and
projections come from **WorldPop** (CC BY 4.0) and administrative boundaries from **HDX**. Check
each source before redistributing `lebanon_data_tagged.geojson`.

## Author

Guillermo Martin de Oliva Carranza  
LinkedIn: [guillermo-martin-de-oliva](https://www.linkedin.com/in/guillermo-martin-de-oliva/)
