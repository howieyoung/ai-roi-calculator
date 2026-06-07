# Model Specification

## 1. Purpose

The calculator is a deterministic enterprise scenario model. It compares a no-AI baseline with an AI-enabled operating scenario while making uncertain assumptions explicit.

The model is designed to answer research questions such as:

- Can measured AI value cover recurring and transformation cost?
- Does the result remain positive after review, rework, and AI operations?
- Is AI-attributed revenue limited by capacity or by demand?
- How much target-margin pressure existed before AI?
- Does an organization scenario exceed evidence-supported automatable capacity?
- How different are first-year cash economics and steady-state ROI?

It does not estimate causal impact from public-company data.

## 2. Units and notation

Financial statement inputs are in millions of US dollars unless stated otherwise. Per-employee labor and AI cost are in US dollars per FTE-year. Percentages are entered as human-readable percentages and normalized to decimals internally.

| Symbol | Parameter |
| --- | --- |
| `E` | Employees / FTE |
| `R` | Current annual revenue |
| `P` | Current operating profit |
| `m` | Gross margin |
| `g` | Baseline annual revenue growth |
| `w` | Fully loaded annual labor cost per FTE |
| `x` | Task exposure to AI |
| `s` | Gross speed uplift on exposed tasks |
| `a` | Effective task adoption |
| `q` | Output value retention |
| `h_r` | Human review overhead |
| `h_w` | Rework overhead |
| `h_o` | AI operations overhead |
| `r` | Released capacity allocated to growth |
| `c` | Capacity-to-revenue conversion relative to RPE |
| `d` | Validated AI demand ceiling as a share of current revenue |
| `z` | Structurally automatable share |
| `b` | Workforce risk buffer |
| `e` | Revenue-loss elasticity from workforce adjustment |

## 3. Productivity model

Gross speed uplift is converted into time saved:

```text
gross_task_time_saved = s / (1 + s)
```

This avoids treating a 100% output-rate improvement as 100% of original time saved. A 100% speed uplift means the same work takes half the original time.

Net task time saved:

```text
net_task_time_saved =
  gross_task_time_saved
  - h_r
  - h_w
  - h_o
```

Organization-level time-release rate:

```text
time_release_rate = x × a × net_task_time_saved
```

The value may be negative. If overhead exceeds gross time saved, AI adds work.

Organization productivity before value retention:

```text
gross_productivity_change =
  1 / (1 - time_release_rate) - 1
```

Positive productivity is discounted by output value retention:

```text
net_productivity_change =
  gross_productivity_change × q    when gross_productivity_change > 0
  gross_productivity_change        otherwise
```

Capacity measures:

```text
growth_equivalent_FTE = E × max(0, net_productivity_change)
released_FTE          = E × max(0, time_release_rate)
added_work_FTE        = E × max(0, -time_release_rate)
```

`growth_equivalent_FTE` can exceed released FTE because output-rate improvement and time release are different concepts. `released_FTE` cannot exceed current FTE.

## 4. Revenue model

Current Revenue per Employee:

```text
RPE = R / E
```

Capacity-based AI revenue:

```text
capacity_AI_revenue =
  growth_equivalent_FTE
  × RPE
  × r
  × c
```

Demand limit:

```text
demand_limit = R × d
```

AI-attributed revenue:

```text
AI_revenue = max(0, min(capacity_AI_revenue, demand_limit))
```

This prevents capacity from being treated as demand. The demand ceiling should be tied to backlog, qualified pipeline, pricing evidence, conversion tests, or delivery constraints.

Baseline future revenue:

```text
baseline_future_revenue = R × (1 + g)
```

AI scenario revenue:

```text
AI_scenario_revenue = baseline_future_revenue + AI_revenue
```

## 5. Cost model

Current payroll:

```text
payroll = E × w
```

The model infers non-payroll operating expense:

```text
non_payroll_opex =
  max(0, R × m - P - payroll)
```

If the result would be negative, the application raises a warning because the financial inputs and average labor-cost assumption do not reconcile.

Recurring internal AI cost:

```text
internal_AI_cost =
  E × AI_cost_per_employee
  + fixed_AI_platform_cost
```

Steady-state transformation amortization:

```text
transformation_amortization =
  transformation_cost / amortization_years
```

Product inference cost:

```text
product_inference_cost =
  AI_revenue × product_inference_cost_rate
```

Negative-productivity cost:

```text
productivity_drag_cost =
  added_work_FTE × w
```

Annual AI cost used in steady-state ROI:

```text
annual_AI_cost =
  internal_AI_cost
  + transformation_amortization
  + product_inference_cost
```

## 6. No-AI and AI profit baselines

No-AI future profit:

```text
baseline_profit =
  baseline_future_revenue × m
  - payroll
  - non_payroll_opex
```

AI future profit with unchanged headcount:

```text
AI_profit =
  AI_scenario_revenue × m
  - payroll
  - non_payroll_opex
  - annual_AI_cost
  - productivity_drag_cost
```

AI-attributed annual profit:

```text
AI_profit_delta = AI_profit - baseline_profit
```

Steady-state AI ROI:

```text
AI_ROI = AI_profit_delta / annual_AI_cost
```

This ROI keeps current headcount unchanged. Workforce scenarios are analyzed separately.

## 7. Workforce pressure attribution

For a modeled workforce adjustment of `k` FTE:

```text
adjustment_rate = k / E

revenue_retention =
  max(0, 1 - adjustment_rate × e)
```

The model recalculates revenue, payroll, variable AI cost, and operating margin. It finds the smallest `k` that reaches the target operating margin, up to a maximum test range of 70% of current FTE.

The solver is run twice:

```text
baseline_required_adjustment =
  solve_target_margin(include_AI = false)

AI_required_adjustment =
  solve_target_margin(include_AI = true)

AI_attributed_adjustment_delta =
  AI_required_adjustment
  - baseline_required_adjustment
```

Interpretation:

- Positive delta: AI assumptions increase modeled financial pressure.
- Negative delta: AI assumptions reduce modeled financial pressure.
- Zero: AI does not change the target-margin pressure.
- No attribution: at least one scenario has no feasible solution in the tested range.

This is a financial stress test, not a recommendation.

Evidence-adjusted automatable capacity:

```text
capacity_limit =
  released_FTE
  × z
  × (1 - r)
  × (1 - b)
```

The capacity limit should be treated as a ceiling for further role-level research.

## 8. Multi-year cash model

The model uses an editable analysis horizon, discount rate, and year-one realization rate. Value realization increases linearly from the year-one rate to 100% in the final analysis year.

For year `t`:

```text
baseline_revenue_t = R × (1 + g)^t
AI_revenue_t       = steady_state_AI_revenue × realization_t
```

Recurring seat and fixed platform costs are charged in every year. Product inference and productivity drag scale with realized AI value. The full transformation cash cost is charged in year one.

```text
cash_flow_delta_t =
  AI_profit_t
  - baseline_profit_t
  - transformation_cash_cost_t
```

Net present value:

```text
NPV = Σ cash_flow_delta_t / (1 + discount_rate)^t
```

Payback is the first year in which cumulative undiscounted incremental cash flow is non-negative.

## 9. Sensitivity cases

The calculator produces deterministic conservative, base, and upside cases. These are not confidence intervals.

Conservative changes include:

- 25% lower gross speed uplift
- 20% lower adoption
- 5 percentage points lower value retention
- Higher review, rework, and AI operations overhead
- 40% lower revenue conversion and demand ceiling
- Higher employee, fixed, transformation, and inference cost
- Lower year-one realization

Upside changes reverse these directions within input bounds.

The transformations are implemented in `scenarioInput()` in `calculator.js` and are intentionally open to review.

## 10. Country labor-value comparison

For 100 FTE, the model compares financially realizable labor value with AI cost:

```text
labor_value =
  100
  × max(0, time_release_rate)
  × structurally_automatable_share
  × non_growth_share
  × (1 - risk_buffer)
  × market_labor_cost
```

This compares cost structures, not worker capability. Nominal labor cost is appropriate when paying globally priced model and cloud bills. Purchasing-power comparisons may be useful for other questions but are not used in this calculation.

## 11. Known limitations

- A company-wide average cannot represent role-level task heterogeneity.
- RPE does not identify individual worker productivity.
- Revenue conversion and demand ceilings require internal evidence.
- The model holds several operating costs constant as revenue changes.
- Workforce revenue-loss elasticity is highly uncertain.
- The model does not include minimum role coverage, span of control, tax, financing, working capital, or country-specific employment law.
- Public-company cases combine disclosed financial data with synthetic AI assumptions.
- Synthetic SMB cases are illustrative operating profiles, not industry statistics or recommended benchmarks.
- Results should not be used as the sole basis for investment or organization decisions.

## 12. Model-change requirements

A pull request changing the equations must include:

1. The current and proposed equation.
2. Economic, accounting, or empirical rationale.
3. Unit and boundary analysis.
4. At least one normal case and one edge-case test.
5. Updated documentation and UI help text.
