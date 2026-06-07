# Contributing

Thank you for helping improve AI ROI Calculator - Is My Company Ready for Enterprise AI?

## Principles

- Make assumptions explicit.
- Separate measured data from synthetic assumptions.
- Prefer task-level evidence over occupation-level claims.
- Preserve the no-AI baseline before attributing effects to AI.
- Do not present workforce stress-test outputs as recommendations.
- Keep the application local-first and dependency-light.

## Local setup

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000`.

Run tests:

```bash
npm test
npm run check
```

## Ways to contribute

- Report a calculation or unit error
- Propose an equation change
- Add an industry-specific extension
- Update a public-company source
- Improve accessibility or responsive layout
- Add a translation
- Add tests for a boundary condition
- Improve research documentation

## Model change proposal

Before implementing a material equation change, open an issue containing:

1. Problem statement
2. Current equation
3. Proposed equation
4. Economic or accounting rationale
5. Required new inputs
6. Expected effect on existing outputs
7. Evidence or primary sources
8. Failure modes and edge cases

## Pull request requirements

A model-changing pull request must:

- Update `docs/MODEL.md`
- Update relevant parameter help text
- Add or update unit tests
- Explain backward compatibility
- Distinguish public data from assumptions
- Avoid adding network transmission of user inputs
- Avoid adding a runtime dependency without a clear need

For public-company data:

- Prefer annual reports, regulatory filings, and company investor-relations material.
- Include the fiscal period and currency.
- Document any currency conversion.
- Do not infer undisclosed internal AI performance.

## Code style

- Use plain browser JavaScript, HTML, and CSS unless a framework migration is separately approved.
- Keep model logic in `calculator.js`.
- Keep presentation logic in `app.js`.
- Keep functions deterministic where possible.
- Add comments only where the economic or mathematical reasoning is not obvious.

## Testing expectations

At minimum, test:

- Zero AI cost
- Zero adoption or exposure
- Negative net productivity
- Demand-cap binding
- Low and zero gross margin
- No-AI versus AI baseline attribution
- Large employee counts
- Infeasible target margins
- Conservative/base/upside ordering where applicable

## Language

English is the primary project language. The application currently ships with
English, Traditional Chinese, Japanese, French, and Spanish. Traditional
Chinese documentation is maintained as a secondary reference.

To add an interface language:

1. Register its locale code and native label in `locale-packs.js`.
2. Add static text, dynamic messages, preset copy, parameter help, title, and
   metadata to the locale pack.
3. Keep reusable rendering templates in `app.js`; do not add another
   locale-specific conditional branch.
4. Add locale coverage to `i18n.test.js`.
5. Verify the introduction modal, dynamic analysis, PDF report, charts, long
   output labels, and mobile layout.

The language menu is generated from the locale registry, so new languages should
not require changes to the topbar markup.

## Conduct

Discuss equations and evidence directly. Assume good faith, explain tradeoffs, and avoid presenting uncertain estimates as facts.
