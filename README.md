# Can My Company Afford AI?

> A local-first, open-source research model for exploring when enterprise AI may improve economics, when it may increase losses, and when financial pressure may be incorrectly attributed to workforce capacity.

[Live calculator](https://www.all4.ai/) · [Traditional Chinese documentation](./README.zh-TW.md) · [Model specification](./docs/MODEL.md) · [Agent guide](./docs/AGENT_GUIDE.md) · [Contributing](./CONTRIBUTING.md) · [Security and privacy](./SECURITY.md)

Created by [Protico.io](https://protico.io) and released under the MIT License.

## Why this project exists

Enterprise AI discussions often jump from tool benchmarks to company-wide productivity, revenue, or workforce conclusions. That jump hides several different questions:

- Which tasks are actually exposed to AI?
- How much gross speed remains after review, rework, and AI operations?
- Does released capacity meet real customer demand?
- Does AI revenue retain enough gross margin after inference cost?
- Is a target-margin gap caused by AI, or did it already exist?
- Do first-year cash costs differ from long-run steady-state economics?
- How do labor costs change the payback of globally priced models?

This project makes those assumptions explicit and editable. It is intended for research, internal scenario design, and public review of the equations. It is not a prediction engine and does not provide financial, legal, HR, or workforce advice.

## Privacy-first by design

The calculator is a static browser application:

- All calculations run locally in the browser.
- The interface supports English, Traditional Chinese, Japanese, French, and
  Spanish, with the preference stored only in the local browser.
- No company input is uploaded to a server.
- The project has no analytics SDK, API dependency, account system, or backend.
- Local state is stored only in browser `localStorage`.
- PDF reports are generated through the browser print workflow and include the
  analysis panel plus the tested paths toward positive economics.
- Public filing links are opened only when the user selects them.

Organizations can clone the repository, disconnect from the internet, and run the calculator on an internal machine.

## Run locally

Requirements:

- A modern browser
- Python 3 for the static server
- Node.js 18 or later for tests

```bash
git clone <repository-url>
cd ai-efficiency-calculator
python3 -m http.server 8000
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

With npm scripts:

```bash
npm start
npm run build
npm test
npm run check
```

There are no runtime package dependencies.

## Use with a coding agent

An agent can clone and operate the project without a build step:

```bash
git clone <repository-url>
cd ai-efficiency-calculator
npm test
npm start
```

The authoritative model is in `calculator.js`; interface rendering is in
`app.js`; locale registration and translations are in `locale-packs.js` and
`i18n.js`. Read [docs/AGENT_GUIDE.md](./docs/AGENT_GUIDE.md) before changing an
equation, preset, translation, or privacy boundary.

## Deploy to GitHub Pages

The included workflow deploys the static application when changes reach `main`.
Before the first deployment, set **Settings > Pages > Build and deployment >
Source** to **GitHub Actions** in the repository.

## Deploy to Cloudflare Pages

The production calculator is hosted at [www.all4.ai](https://www.all4.ai/)
with the Cloudflare Pages fallback at
[ai-efficiency-calculator.pages.dev](https://ai-efficiency-calculator.pages.dev/).
Build output contains only the browser assets required by the application:

```bash
npm run build
npx wrangler pages deploy dist \
  --project-name ai-efficiency-calculator \
  --branch main
```

Wrangler authentication and permission to deploy to the target Cloudflare
account are required. Company scenario inputs remain in the visitor's browser;
the deployed site has no application backend.

## What the calculator models

The current version includes:

- Current and AI-adjusted Revenue per Employee
- Net productivity after review, rework, and AI operations overhead
- Negative-productivity AI scenarios
- Demand-capped AI-attributed revenue
- Internal AI cost, fixed platform cost, transformation cost, and product inference cost
- No-AI versus AI target-margin baselines
- AI-attributed change in modeled workforce pressure
- Evidence-adjusted automatable capacity
- First-year incremental cash flow
- Multi-year NPV and payback period
- Conservative, base, and upside sensitivity cases
- Independently scrollable input and analysis panels on desktop
- App-style mobile input and analysis workspaces with persistent tabs and
  single-open research sections
- Dynamic adjustment paths that test how a non-positive scenario could improve
- Local PDF reports containing the analysis and tested improvement paths
- AI-native future hiring avoided
- Labor-value payback across editable country benchmarks
- Public-company examples across SaaS, platforms, marketplaces, media, semiconductors, and hardware

## Core equations

Let:

- `s` = gross speed uplift on exposed tasks
- `x` = task exposure
- `a` = effective task adoption
- `q` = output value retention
- `h_review`, `h_rework`, `h_ops` = task-time overhead
- `E` = employees
- `R` = current revenue
- `RPE = R / E`

Gross task time saved:

```text
gross_time_saved = s / (1 + s)
```

Net task time saved:

```text
net_task_time_saved =
  gross_time_saved
  - review_overhead
  - rework_overhead
  - ai_operations_overhead
```

Organization time-release rate:

```text
time_release_rate = exposure × adoption × net_task_time_saved
```

Positive productivity is discounted by output value retention. Negative productivity is retained as a loss rather than hidden by the quality factor.

AI-attributed revenue:

```text
capacity_revenue =
  growth_equivalent_FTE
  × current_RPE
  × growth_allocation
  × revenue_conversion

AI_revenue = min(capacity_revenue, validated_demand_ceiling)
```

Annual AI cost:

```text
annual_AI_cost =
  employee_AI_cost
  + fixed_platform_cost
  + transformation_cost_amortization
  + product_inference_cost
```

Evidence-adjusted workforce capacity:

```text
capacity_limit =
  released_FTE
  × structurally_automatable_share
  × non_growth_share
  × (1 - risk_buffer)
```

The target-margin solver is run twice:

```text
AI_attributed_workforce_pressure =
  required_adjustment_with_AI
  - required_adjustment_without_AI
```

This separation is critical. A low-margin company may have substantial target-margin pressure before any AI program exists.

The complete definitions, cost treatment, timeline model, and sensitivity transformations are documented in [docs/MODEL.md](./docs/MODEL.md).

## Input groups

### Company baseline

Revenue, operating profit, gross margin, baseline growth, employees, primary labor market, and fully loaded labor cost.

### AI operating assumptions

Task exposure, gross speed uplift, effective adoption, value retention, human review, rework, AI operations, internal AI cost, fixed platform cost, transformation cost, amortization, and product inference cost.

### Value realization strategy

Growth allocation, revenue conversion, validated demand ceiling, structurally automatable share, risk buffer, year-one realization, target operating margin, workforce revenue-loss elasticity, transition cost, analysis horizon, and discount rate.

Every input in the application includes a definition, an explanation of how it changes the model, and an example.

The company-scenario bar can be collapsed and automatically minimizes after the
user begins scrolling either desktop panel. The research introduction and model
equations are available from the question-mark button beside the project title.

## Scenario library

The repository includes editable examples for Meta, Alphabet, Amazon, Apple, Cloudflare, TSMC, NVIDIA, Airbnb, Uber, Netflix, Spotify, Salesforce, Tesla, and a synthetic AI-native startup. It also includes synthetic SMB research scenarios for a 75-person retail e-commerce company, a 14-person independent restaurant, and a 750-person Taiwan hardware manufacturer.

Public revenue, operating profit, margin, and employee values are used only where disclosed. Internal AI productivity, cost, adoption, demand, and organization assumptions are model inputs, not claims about those companies.

The SMB scenarios are illustrative operating profiles, not industry averages. Their financial and AI assumptions should be replaced with internal data before interpreting model outputs.

## Research basis

The model is informed by evidence showing that AI effects vary materially by task, worker experience, workflow, and measurement method:

- [Generative AI at Work, NBER Working Paper 31161](https://www.nber.org/papers/w31161)
- [Navigating the Jagged Technological Frontier, Harvard Business School](https://www.hbs.edu/faculty/Pages/item.aspx?num=64700)
- [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity, METR](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- [The Economics of Generative AI, NBER](https://www.nber.org/reporter/2024number1/economics-generative-ai)
- [Firm Data on AI, Stanford SIEPR](https://siepr.stanford.edu/publications/working-paper/firm-data-ai)

These studies provide context, not universal default effect sizes.

## Contributing

The model should improve through transparent disagreement and reproducible evidence. Contributions are welcome for:

- Equation corrections
- Better cost and accounting treatment
- Task- or industry-specific model extensions
- Additional public-company data
- Localization
- Accessibility and visualization
- Tests for edge cases and unintended conclusions

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. Model changes must include the proposed equation, economic rationale, assumptions, and tests.

## Current limitations

- Company-wide averages hide role and task heterogeneity.
- RPE is a comparison metric, not a causal estimate of individual output.
- Public filings cannot identify AI's causal effect.
- Demand, adoption, quality, and review burden usually require internal measurement.
- Conservative/base/upside outputs are deterministic scenarios, not confidence intervals.
- Workforce pressure is a financial stress-test output, not an executable organization recommendation.
- The model does not include tax, financing, working capital, country-specific employment law, or minimum role coverage.

## License

MIT License. See [LICENSE](./LICENSE).

The application footer identifies [Protico.io](https://protico.io) as the
project creator. That attribution does not change the MIT permissions granted
in the license.
