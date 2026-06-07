const test = require("node:test");
const assert = require("node:assert/strict");
const {
  PRESETS,
  calculate,
  countryComparison,
  diagnoseScenarios,
  findRequiredCuts,
  positiveZoneValue,
  projectedProfitAtCut,
} = require("./calculator.js");

test("net productivity converts speed into time saved and subtracts overhead", () => {
  const input = {
    ...PRESETS.custom.values,
    exposure: 50,
    efficiency: 40,
    adoption: 80,
    quality: 90,
    reviewOverhead: 0,
    reworkOverhead: 0,
    aiOpsOverhead: 0,
  };
  const result = calculate(input);
  const aggregateTimeSaved = 0.5 * 0.8 * (0.4 / 1.4);
  const expected =
    (1 / (1 - aggregateTimeSaved) - 1) * 0.9;
  assert.ok(Math.abs(result.effectiveGain - expected) < 0.000001);
  assert.ok(Math.abs(result.equivalentFte - expected * 100) < 0.000001);
  assert.ok(result.releasableFte < result.equivalentFte);
});

test("releasable FTE never exceeds current employees at 200% efficiency", () => {
  const input = {
    ...PRESETS.custom.values,
    employees: 4,
    exposure: 100,
    efficiency: 200,
    adoption: 100,
    quality: 100,
    reviewOverhead: 0,
    reworkOverhead: 0,
    aiOpsOverhead: 0,
  };
  const result = calculate(input);
  assert.ok(Math.abs(result.growthEquivalentFte - 8) < 0.000001);
  assert.ok(Math.abs(result.releasableFte - 8 / 3) < 0.000001);
  assert.ok(result.releasableFte <= input.employees);
});

test("review and rework can create negative net productivity", () => {
  const input = {
    ...PRESETS.custom.values,
    exposure: 100,
    efficiency: 20,
    adoption: 100,
    quality: 100,
    reviewOverhead: 10,
    reworkOverhead: 10,
    aiOpsOverhead: 5,
  };
  const result = calculate(input);
  assert.ok(result.timeReleaseRate < 0);
  assert.ok(result.productivityUplift < 0);
  assert.equal(result.releasableFte, 0);
  assert.ok(result.addedWorkFte > 0);
});

test("zero AI cost has no remaining revenue requirement", () => {
  const input = {
    ...PRESETS.custom.values,
    aiCostPerEmployee: 0,
    fixedAiCost: 0,
    transitionCost: 0,
  };
  const result = calculate(input);
  assert.equal(result.requiredGrowth, 0);
});

test("higher AI efficiency improves positive-zone value", () => {
  const input = PRESETS.custom.values;
  const low = positiveZoneValue(input, 100, 10);
  const high = positiveZoneValue(input, 100, 80);
  assert.ok(high > low);
});

test("additional revenue growth cannot increase required cuts", () => {
  const input = PRESETS.cloudflare.values;
  const current = findRequiredCuts(input, 0);
  const withGrowth = findRequiredCuts(input, 0.2);
  assert.ok(withGrowth.cutCount <= current.cutCount);
});

test("required cuts is the first headcount reduction that reaches target margin", () => {
  const input = PRESETS.custom.values;
  const required = findRequiredCuts(input, 0);
  assert.equal(required.feasible, true);
  assert.ok(required.scenario.margin >= input.targetMargin / 100);
  if (required.cutCount > 0) {
    const previous = projectedProfitAtCut(input, required.cutCount - 1, 0);
    assert.ok(previous.margin < input.targetMargin / 100);
  }
});

test("AI-native benchmark needs fewer people at positive effective gain", () => {
  const result = calculate(PRESETS.aiNative.values);
  assert.ok(result.effectiveGain > 0);
  assert.ok(result.aiNativeHeadcount < result.noAiHeadcountForProjectedRevenue);
  assert.ok(result.aiNativeRpe > result.currentRpe);
});

test("country comparison accepts editable salary benchmarks", () => {
  const base = countryComparison(PRESETS.custom.values);
  const adjusted = countryComparison(PRESETS.custom.values, { TW: 90000 });
  const baseTaiwan = base.find((item) => item.code === "TW");
  const adjustedTaiwan = adjusted.find((item) => item.code === "TW");
  assert.ok(Math.abs(adjustedTaiwan.coverage - baseTaiwan.coverage * 2) < 0.000001);
});

test("requested public-company presets include industries and financial inputs", () => {
  const requested = [
    "tsmc",
    "nvidia",
    "airbnb",
    "uber",
    "netflix",
    "spotify",
    "salesforce",
    "tesla",
  ];
  requested.forEach((key) => {
    assert.ok(PRESETS[key]);
    assert.ok(PRESETS[key].industry);
    assert.ok(PRESETS[key].values.revenue > 0);
    assert.ok(PRESETS[key].values.employees > 0);
    assert.ok(PRESETS[key].sources.length > 0);
  });
});

test("SMB synthetic presets cover the requested company-size ranges", () => {
  const ecommerce = PRESETS.smbEcommerce;
  const restaurant = PRESETS.smallRestaurant;
  const hardware = PRESETS.twHardwareSmb;

  assert.ok(ecommerce.values.employees >= 50 && ecommerce.values.employees <= 100);
  assert.ok(restaurant.values.employees < 20);
  assert.ok(hardware.values.employees >= 500 && hardware.values.employees <= 1000);
  assert.equal(hardware.values.country, "TW");

  [ecommerce, restaurant, hardware].forEach((preset) => {
    assert.equal(preset.sourceType, "合成模型");
    assert.equal(preset.sources.length, 0);
    assert.ok(preset.values.revenue > 0);
    assert.ok(preset.values.grossMargin > 0);
  });
});

test("scenario diagnosis reacts to adoption changes", () => {
  const lowAdoption = {
    ...PRESETS.custom.values,
    efficiency: 80,
    adoption: 30,
  };
  const highAdoption = {
    ...lowAdoption,
    adoption: 90,
  };
  const lowSignal = diagnoseScenarios(lowAdoption).find(
    (scenario) => scenario.code === "adoption-gap"
  );
  const highSignal = diagnoseScenarios(highAdoption).find(
    (scenario) => scenario.code === "adoption-gap"
  );
  assert.equal(lowSignal.level, "high");
  assert.equal(highSignal.level, "low");
});

test("scenario diagnosis flags organization adjustment beyond AI capacity", () => {
  const input = {
    ...PRESETS.custom.values,
    targetMargin: 30,
    riskBuffer: 60,
    redeployShare: 80,
  };
  const signal = diagnoseScenarios(input).find(
    (scenario) => scenario.code === "adjustment-overreach"
  );
  assert.equal(signal.level, "high");
});

test("workforce pressure is attributed against a no-AI baseline", () => {
  const result = calculate(PRESETS.tesla.values);
  assert.ok(result.baselineRequired.cutCount > 0);
  assert.equal(
    result.aiAttributedAdjustmentDelta,
    result.required.cutCount - result.baselineRequired.cutCount
  );
});

test("AI-attributed revenue cannot exceed the validated demand ceiling", () => {
  const input = {
    ...PRESETS.aiNative.values,
    demandCeiling: 2,
    efficiency: 200,
    adoption: 100,
  };
  const result = calculate(input);
  assert.ok(
    result.incrementalRevenue <= input.revenue * input.demandCeiling / 100 + 1e-9
  );
});

test("product inference cost reduces AI profit delta", () => {
  const lowCost = calculate({
    ...PRESETS.aiNative.values,
    productInferenceCostRate: 0,
  });
  const highCost = calculate({
    ...PRESETS.aiNative.values,
    productInferenceCostRate: 30,
  });
  assert.ok(highCost.aiProfitDelta < lowCost.aiProfitDelta);
});

test("year-one cash flow includes the full transformation cost", () => {
  const result = calculate({
    ...PRESETS.custom.values,
    transitionCost: 3,
    amortizationYears: 3,
  });
  assert.ok(
    result.firstYearCashFlow <
      result.aiProfitDelta - 1.5
  );
  assert.equal(result.timeline.length, 3);
});

test("uncertainty range returns conservative, base, and upside cases", () => {
  const result = calculate(PRESETS.custom.values);
  assert.deepEqual(
    result.uncertainty.map((item) => item.mode),
    ["conservative", "base", "upside"]
  );
  assert.ok(result.uncertainty[0].npv <= result.uncertainty[2].npv);
});
