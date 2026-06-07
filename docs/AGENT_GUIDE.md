# Agent Guide

This guide defines how a coding agent should inspect, run, modify, and verify
Can My Company Afford AI? without weakening the model's privacy or research
boundaries.

## Operating constraints

- Keep all company inputs and calculations local.
- Do not add analytics, telemetry, remote persistence, hosted AI calls, or a
  third-party PDF service.
- Do not describe financial stress-test outputs as workforce recommendations.
- Preserve the no-AI baseline and AI-attributed difference.
- Mark synthetic scenarios as synthetic and public-company assumptions as
  editable assumptions.
- Use primary sources for public-company financial updates.

## Start locally

```bash
npm test
npm run check
npm start
```

Open `http://127.0.0.1:8000`.

There is no build step and no runtime package dependency. `npm start` launches
Python's static HTTP server.

## File ownership

| File | Responsibility |
| --- | --- |
| `calculator.js` | Deterministic equations, presets, country defaults, scenario diagnosis |
| `calculator.test.js` | Model invariants, boundaries, preset coverage |
| `app.js` | Rendering, interaction, local state, charts, PDF print workflow |
| `index.html` | Semantic application structure and report sections |
| `styles.css` | Desktop/mobile layout and print/PDF layout |
| `locale-packs.js` | Japanese, French, Spanish, preset and help locale packs |
| `i18n.js` | Locale switching, English/Traditional Chinese messages, interpolation |
| `i18n.test.js` | Locale registry, UI contracts, PDF and terminology checks |
| `docs/MODEL.md` | Authoritative equation and limitation specification |

## Change an equation

1. Read `docs/MODEL.md` and locate the current formula.
2. State the unit, accounting treatment, and expected boundary behavior.
3. Change the deterministic implementation in `calculator.js`.
4. Add normal, negative, zero, and boundary tests.
5. Update model documentation and every affected UI explanation.
6. Run `npm test` and `npm run check`.

Do not tune a formula solely to make a named company produce a desired verdict.

## Add a scenario

Add the scenario to `PRESETS` in `calculator.js`, then add:

- An option in `index.html`
- English copy in `PRESET_COPY_EN` in `app.js`
- Japanese, French, and Spanish copy in `locale-packs.js`
- A test asserting scale, financial inputs, source type, and sources

Public-company scenarios need a fiscal period, currency treatment, primary
source links, and a clear separation between disclosed data and model
assumptions. Synthetic cases must have `sourceType: "合成模型"` and no sources.

## Add a language

Register the locale in `locale-packs.js` and provide:

- Static interface strings
- Dynamic messages
- Metadata and document title
- Preset names, industries, and notes
- Parameter-help titles and explanations
- Verdict, warning, analysis, chart, and PDF strings

Add a locale-switching test and visually inspect desktop, mobile, modal, chart,
and print-report layouts.

## Verify PDF output

The Export PDF button calls the browser's print workflow. Print CSS must:

- Hide the editable input form and navigation
- Include the complete analysis panel
- Include the paths toward positive economics
- Include scenario metadata, sources, research disclaimer, and Protico.io credit
- Avoid transmitting data or loading a remote PDF library

Use the browser's print preview and select Save as PDF for a manual artifact
check.

## Completion checklist

- `npm test`
- `npm run check`
- No browser console errors
- Desktop and mobile layouts have no incoherent overlap
- All supported locales update static and dynamic output
- PDF report contains only the intended research sections
- No confidential input is transmitted
- `docs/MODEL.md`, README, and help text match the implementation
