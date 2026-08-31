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
  - **Per-locality summary written by a language model** and stored in the GeoJSON, not generated
    live. The national headline is different: it is computed from the national totals every time
    the year changes. Two different origins, said out loud, because they used to be shown in the
    same panel with the same label.
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
- Classifier categories are percentile rules over demographic share and growth, computed **outside
  this repository** in an ETL that is not published here. That is worth stating plainly: the exact
  cut-offs the tooltips describe cannot be checked against any code in this repo. No language model
  produces the tags.
- A minimum population threshold (400) marks a locality as too small to read as a demographic
  profile. Below it the classifier returns the neutral label, the panel says the analysis is not
  available, the map paints it grey and the metrics show `N/A`. Zero counts as below.
- The map can be switched between:
  - Total Population
  - Dependency Ratio

## Responsible AI and defensive prompting

The live assistant is grounded by a prompt that lives on the server, in the Netlify function that
holds the API key.

That sentence used to read: *these run client-side, so they are a usability guardrail rather than a
security boundary — server-side hardening is the next step*. It was accurate and it understated the
problem. The browser built the whole prompt — role, rules, data, question — and the function
forwarded whatever arrived. So the rules were not weak: an attacker did not have to break them, only
to not send them, and anyone with the URL had a free language model billed to me.

The endpoint now owns the task. It takes a locality, its figures and a question, refuses a
ready-made prompt by name, caps every field, checks the request came from this site, and decides the
low-population cut-off itself rather than believing a flag from the caller.

What it still does not do, said plainly: someone can post invented figures and get two or three
sentences about a population table. That is not prevented. The point is that it stops being worth
doing.

The rules themselves:

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

## Data file

`lebanon_data_tagged.geojson` is the OCHA/HDX administrative layer for Lebanon with the demographic
columns joined onto it. Two notes on what has been done to it:

- **Coordinates are rounded to six decimals** (about 11 cm). They arrived with fourteen, which is
  nanometre precision on an administrative border, and cost 8 MB for nothing. The file went from
  21.0 MB to 12.8 MB; the properties are byte-for-byte unchanged.
- **The ETL that produced the demographic columns and the trend tags is not in this repository.**
  That means the percentile cut-offs the tooltips describe cannot be verified against any code here.

## Tests

```bash
node tests/run.js     # or: npm test
```

26 checks, no dependencies. Half of them run against the shipped GeoJSON rather than invented rows:
a predicate that passes on three hand-made objects and fails on the file it ships with has not been
tested. CI runs them plus a syntax check on the three JavaScript files.

## Two deployments, on purpose

This repository is deployed twice, to two Netlify projects on two accounts:

| URL | Role |
|---|---|
| `onulibanodashboard.netlify.app` | **the published one** — this is the link in the CV, on LinkedIn and at the top of this README |
| `spiffy-cat-99fb35.netlify.app` | the spare |

**Why.** Netlify's free build credits run out. When they did, the second project was created so the
dashboard would not simply go dark. If the published one runs out, the link moves to the spare.

🔴 **The rule that makes this safe, and the one we learned the hard way:**

> **An environment variable set in one project does NOT exist in the other.**

Both projects deploy the same commit, so they serve byte-identical HTML with the same etag. They look
like one site from outside. But `GEMINI_API_KEY` lives per project, so a key renewed in one leaves
the other answering *"An error occurred"* — and nothing goes red, because the pages are identical.

That is exactly what happened on 2026-08-31: the key was renewed on the spare, the published one kept
failing, and the two looked the same from every angle except the one that mattered.

**So: any environment variable goes into BOTH projects.** The way to tell them apart from outside is
the `Netlify-Hosting` response header, which carries a different project id for each.

**How to check the published one is alive**, in a browser console on the site:

```js
const r = await fetch('/.netlify/functions/ask-gemini', {
  method: 'POST', headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ locality: 'Total Lebanon', population: 5685372,
    dataTable: 'test', growth: 'test', question: 'Is the population ageing?' })
});
console.log(r.status, await r.json());   // 200 y una respuesta = vivo
```
