(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.AICalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const COUNTRIES = {
    TW: { name: "Taiwan", salary: 45000 },
    US: { name: "United States", salary: 180000 },
    JP: { name: "Japan", salary: 90000 },
    SG: { name: "Singapore", salary: 120000 },
    GB: { name: "United Kingdom", salary: 110000 },
    DE: { name: "Germany", salary: 120000 },
    IN: { name: "India", salary: 35000 },
  };

  const MODEL_DEFAULTS = {
    reviewOverhead: 5,
    reworkOverhead: 4,
    aiOpsOverhead: 3,
    automationShare: 35,
    demandCeiling: 10,
    productInferenceCostRate: 5,
    year1Realization: 45,
    analysisYears: 3,
    discountRate: 10,
  };

  const PRESETS = {
    custom: {
      name: "自訂企業",
      industry: "自訂 / 待分類",
      note: "以可編輯的示範值開始。所有金額均為美元；薪資為含福利、稅負與股權的年度人力成本。",
      sourceType: "模型示範",
      sources: [],
      values: {
        country: "TW",
        employees: 100,
        revenue: 12,
        operatingProfit: 1.2,
        grossMargin: 70,
        historicalGrowth: 12,
        salary: 45000,
        exposure: 55,
        efficiency: 35,
        adoption: 70,
        quality: 88,
        aiCostPerEmployee: 6000,
        fixedAiCost: 0.15,
        transitionCost: 0.3,
        amortizationYears: 3,
        redeployShare: 55,
        revenueConversion: 65,
        riskBuffer: 25,
        targetMargin: 15,
        revenueLossPerCut: 0.25,
        severanceMonths: 3,
      },
    },
    smbEcommerce: {
      name: "零售電商 SMB · 合成情境",
      industry: "零售電商 / 75 人",
      note: "75 人規模的合成零售電商，用於研究客服、商品內容、行銷、採購與後台營運導入 AI 的經濟效果。所有財務與 AI 參數均為可編輯假設。",
      sourceType: "合成模型",
      sources: [],
      values: {
        country: "TW",
        employees: 75,
        revenue: 12,
        operatingProfit: 0.6,
        grossMargin: 35,
        historicalGrowth: 12,
        salary: 38000,
        exposure: 58,
        efficiency: 38,
        adoption: 68,
        quality: 90,
        aiCostPerEmployee: 3000,
        fixedAiCost: 0.06,
        transitionCost: 0.12,
        amortizationYears: 3,
        redeployShare: 62,
        revenueConversion: 58,
        riskBuffer: 35,
        targetMargin: 8,
        revenueLossPerCut: 0.45,
        severanceMonths: 3,
      },
    },
    smallRestaurant: {
      name: "獨立餐廳 · 合成情境",
      industry: "餐飲服務 / 14 人",
      note: "14 人規模的合成餐廳。AI 可影響工作集中於訂位、行銷、採購、排班與行政，不假設烹調及現場服務可直接自動化。",
      sourceType: "合成模型",
      sources: [],
      values: {
        country: "TW",
        employees: 14,
        revenue: 1.2,
        operatingProfit: 0.06,
        grossMargin: 65,
        historicalGrowth: 5,
        salary: 26000,
        exposure: 28,
        efficiency: 32,
        adoption: 55,
        quality: 92,
        aiCostPerEmployee: 1200,
        fixedAiCost: 0.015,
        transitionCost: 0.02,
        amortizationYears: 2,
        redeployShare: 70,
        revenueConversion: 35,
        riskBuffer: 55,
        targetMargin: 7,
        revenueLossPerCut: 1.1,
        severanceMonths: 2,
      },
    },
    twHardwareSmb: {
      name: "台灣硬體製造商 · 合成情境",
      industry: "硬體製造 / 750 人",
      note: "750 人規模的台灣硬體製造合成案例，用於研究低毛利、品質敏感、實體生產占比較高的企業。AI 假設主要涵蓋工程文件、供應鏈、品保分析、業務與行政流程。",
      sourceType: "合成模型",
      sources: [],
      values: {
        country: "TW",
        employees: 750,
        revenue: 180,
        operatingProfit: 10.8,
        grossMargin: 22,
        historicalGrowth: 8,
        salary: 55000,
        exposure: 36,
        efficiency: 34,
        adoption: 60,
        quality: 96,
        aiCostPerEmployee: 4000,
        fixedAiCost: 0.6,
        transitionCost: 1.8,
        amortizationYears: 4,
        redeployShare: 76,
        revenueConversion: 38,
        riskBuffer: 50,
        targetMargin: 8,
        revenueLossPerCut: 0.65,
        severanceMonths: 4,
      },
    },
    meta: {
      name: "Meta · FY2025",
      industry: "廣告與社群平台",
      note: "營收、營業利益與員工數採 FY2025 公開資料；薪資、AI 成效及 AI 成本為可編輯模型假設。",
      sourceType: "公開財報 + 模型假設",
      sources: [
        {
          label: "Meta FY2025 Form 10-K",
          url: "https://www.sec.gov/Archives/edgar/data/1326801/000162828026003942/meta-20251231.htm",
        },
      ],
      values: {
        country: "US",
        employees: 78865,
        revenue: 200966,
        operatingProfit: 83276,
        grossMargin: 82,
        historicalGrowth: 22,
        salary: 300000,
        exposure: 58,
        efficiency: 38,
        adoption: 78,
        quality: 92,
        aiCostPerEmployee: 24000,
        fixedAiCost: 1500,
        transitionCost: 500,
        amortizationYears: 3,
        redeployShare: 72,
        revenueConversion: 55,
        riskBuffer: 35,
        targetMargin: 42,
        revenueLossPerCut: 0.45,
        severanceMonths: 6,
      },
    },
    google: {
      name: "Google / Alphabet · FY2025",
      industry: "廣告、雲端與數位平台",
      note: "營收、營業利益與員工數採 Alphabet FY2025 合併公開資料；2025 年 Platforms & Devices 部門曾進行數百個職位的組織人力調整，但未公開精確人數。AI 成效與成本為模型假設。",
      sourceType: "公開財報 + 部門重整報導",
      comparisonNote: "2025/04 Platforms & Devices 調整數百個職位；精確人數未公開",
      sources: [
        {
          label: "Alphabet FY2025 Form 10-K",
          url: "https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm",
        },
        {
          label: "Google Platforms & Devices restructuring",
          url: "https://www.business-standard.com/technology/tech-news/google-layoffs-android-pixel-chrome-restructuring-voluntary-exit-programme-125041100374_1.html",
        },
      ],
      values: {
        country: "US",
        employees: 190820,
        revenue: 402836,
        operatingProfit: 129039,
        grossMargin: 59.65,
        historicalGrowth: 15.09,
        salary: 260000,
        exposure: 62,
        efficiency: 45,
        adoption: 82,
        quality: 92,
        aiCostPerEmployee: 22000,
        fixedAiCost: 2200,
        transitionCost: 800,
        amortizationYears: 3,
        redeployShare: 75,
        revenueConversion: 58,
        riskBuffer: 35,
        targetMargin: 34,
        revenueLossPerCut: 0.45,
        severanceMonths: 6,
      },
    },
    amazon: {
      name: "Amazon（AWS 情境）· FY2025",
      industry: "電商、雲端與物流",
      note: "Amazon FY2025 合併營收、利益與總人數作為基準；AWS FY2025 營收 US$128.7B、營業利益 US$45.6B，但未公開 AWS 獨立員工人數，因此不能建立可靠的 AWS-only RPE。",
      sourceType: "Amazon 合併財報 + AWS 分部脈絡",
      comparisonCut: 30000,
      comparisonNote: "2025/10 與 2026/01 兩波官方公告合計約 30,000 個 Amazon 職位",
      sources: [
        {
          label: "Amazon FY2025 Form 10-K",
          url: "https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm",
        },
        {
          label: "Amazon October 2025 workforce reduction",
          url: "https://www.aboutamazon.com/news/company-news/amazon-workforce-reduction",
        },
        {
          label: "Amazon January 2026 workforce reduction",
          url: "https://www.aboutamazon.com/news/company-news/amazon-layoffs-corporate-jan-2026/",
        },
      ],
      values: {
        country: "US",
        employees: 1576000,
        revenue: 716924,
        operatingProfit: 79975,
        grossMargin: 50.29,
        historicalGrowth: 12.38,
        salary: 85000,
        exposure: 42,
        efficiency: 35,
        adoption: 65,
        quality: 90,
        aiCostPerEmployee: 7000,
        fixedAiCost: 3500,
        transitionCost: 2700,
        amortizationYears: 3,
        redeployShare: 62,
        revenueConversion: 48,
        riskBuffer: 40,
        targetMargin: 13,
        revenueLossPerCut: 0.18,
        severanceMonths: 4,
      },
    },
    apple: {
      name: "Apple · FY2025",
      industry: "消費硬體與數位服務",
      note: "營收、營業利益與員工數採 Apple FY2025 公開資料；2025 年 11 月 Apple 確認銷售組織有少量職位調整，但未公開精確人數。",
      sourceType: "公開財報 + 銷售組織重整報導",
      comparisonNote: "2025/11 銷售組織少量／數十個職位；公司未公開精確數字",
      sources: [
        {
          label: "Apple FY2025 Form 10-K",
          url: "https://www.sec.gov/Archives/edgar/data/320193/000032019325000079/aapl-20250927.htm",
        },
        {
          label: "Apple sales organization changes",
          url: "https://www.investing.com/news/stock-market-news/apple-cuts-jobs-across-its-sales-organization-bloomberg-news-reports-4375829",
        },
      ],
      values: {
        country: "US",
        employees: 166000,
        revenue: 416161,
        operatingProfit: 133050,
        grossMargin: 46.91,
        historicalGrowth: 6.43,
        salary: 210000,
        exposure: 48,
        efficiency: 32,
        adoption: 72,
        quality: 94,
        aiCostPerEmployee: 14000,
        fixedAiCost: 900,
        transitionCost: 350,
        amortizationYears: 3,
        redeployShare: 78,
        revenueConversion: 52,
        riskBuffer: 40,
        targetMargin: 33,
        revenueLossPerCut: 0.55,
        severanceMonths: 6,
      },
    },
    tsmc: {
      name: "台積電 TSMC · FY2025",
      industry: "半導體製造 / 硬體",
      note: "營收、營業利益、毛利率與員工數採 TSMC FY2025 年報；AI 成效、成本與組織參數為可編輯研究假設。",
      sourceType: "公開年報 + 模型假設",
      sources: [
        {
          label: "TSMC 2025 Annual Report",
          url: "https://investor.tsmc.com/static/annualReports/2025/english/index.html",
        },
      ],
      values: {
        country: "TW",
        employees: 90557,
        revenue: 121423,
        operatingProfit: 61718,
        grossMargin: 59.9,
        historicalGrowth: 31.6,
        salary: 85000,
        exposure: 38,
        efficiency: 30,
        adoption: 65,
        quality: 96,
        aiCostPerEmployee: 7000,
        fixedAiCost: 500,
        transitionCost: 700,
        amortizationYears: 4,
        redeployShare: 82,
        revenueConversion: 40,
        riskBuffer: 48,
        targetMargin: 51,
        revenueLossPerCut: 0.55,
        severanceMonths: 6,
      },
    },
    nvidia: {
      name: "NVIDIA · FY2026",
      industry: "半導體與 AI 基礎設施 / 硬體",
      note: "營收、營業利益、毛利率與員工數採 NVIDIA FY2026 Form 10-K；AI 導入假設不代表 NVIDIA 已公開的內部成效。",
      sourceType: "公開財報 + 模型假設",
      sources: [
        {
          label: "NVIDIA FY2026 Form 10-K",
          url: "https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm",
        },
      ],
      values: {
        country: "US",
        employees: 42000,
        revenue: 215938,
        operatingProfit: 130387,
        grossMargin: 71.1,
        historicalGrowth: 65,
        salary: 400000,
        exposure: 72,
        efficiency: 52,
        adoption: 88,
        quality: 95,
        aiCostPerEmployee: 50000,
        fixedAiCost: 2500,
        transitionCost: 500,
        amortizationYears: 3,
        redeployShare: 88,
        revenueConversion: 68,
        riskBuffer: 45,
        targetMargin: 61,
        revenueLossPerCut: 0.7,
        severanceMonths: 6,
      },
    },
    airbnb: {
      name: "Airbnb · FY2025",
      industry: "旅遊交易平台 / Marketplace",
      note: "營收、營業利益、成本與員工數採 Airbnb FY2025 Form 10-K；毛利率依營收減成本後計算，AI 參數為研究假設。",
      sourceType: "公開財報 + 模型假設",
      sources: [
        {
          label: "Airbnb FY2025 Form 10-K",
          url: "https://www.sec.gov/Archives/edgar/data/1559720/000155972026000004/abnb-20251231.htm",
        },
      ],
      values: {
        country: "US",
        employees: 8200,
        revenue: 12241,
        operatingProfit: 2544,
        grossMargin: 82.96,
        historicalGrowth: 10.26,
        salary: 220000,
        exposure: 66,
        efficiency: 42,
        adoption: 76,
        quality: 92,
        aiCostPerEmployee: 16000,
        fixedAiCost: 28,
        transitionCost: 24,
        amortizationYears: 3,
        redeployShare: 76,
        revenueConversion: 62,
        riskBuffer: 38,
        targetMargin: 23,
        revenueLossPerCut: 0.55,
        severanceMonths: 6,
      },
    },
    uber: {
      name: "Uber · FY2025",
      industry: "移動與外送平台 / Marketplace",
      note: "營收、營業利益與員工數採 Uber FY2025 Form 10-K；毛利率依直接營收成本估算，未將平台服務提供者視為公司員工。",
      sourceType: "公開財報 + 模型假設",
      sources: [
        {
          label: "Uber FY2025 Form 10-K",
          url: "https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm",
        },
      ],
      values: {
        country: "US",
        employees: 34000,
        revenue: 52017,
        operatingProfit: 5565,
        grossMargin: 39.8,
        historicalGrowth: 18.3,
        salary: 180000,
        exposure: 57,
        efficiency: 36,
        adoption: 70,
        quality: 90,
        aiCostPerEmployee: 12000,
        fixedAiCost: 85,
        transitionCost: 110,
        amortizationYears: 3,
        redeployShare: 66,
        revenueConversion: 55,
        riskBuffer: 42,
        targetMargin: 12,
        revenueLossPerCut: 0.35,
        severanceMonths: 5,
      },
    },
    netflix: {
      name: "Netflix · FY2025",
      industry: "訂閱影音 / 數位內容",
      note: "營收、營業利益、內容成本與員工數採 Netflix FY2025 Form 10-K；毛利率受內容攤銷口徑影響，不宜直接類比純軟體 SaaS。",
      sourceType: "公開財報 + 模型假設",
      sources: [
        {
          label: "Netflix FY2025 Form 10-K",
          url: "https://www.sec.gov/Archives/edgar/data/1065280/000106528026000034/nflx-20251231.htm",
        },
      ],
      values: {
        country: "US",
        employees: 16000,
        revenue: 45183,
        operatingProfit: 13327,
        grossMargin: 48.49,
        historicalGrowth: 15.85,
        salary: 350000,
        exposure: 61,
        efficiency: 40,
        adoption: 80,
        quality: 95,
        aiCostPerEmployee: 26000,
        fixedAiCost: 130,
        transitionCost: 70,
        amortizationYears: 3,
        redeployShare: 82,
        revenueConversion: 62,
        riskBuffer: 46,
        targetMargin: 31,
        revenueLossPerCut: 0.75,
        severanceMonths: 6,
      },
    },
    spotify: {
      name: "Spotify · FY2025",
      industry: "訂閱音訊 / 數位內容",
      note: "原始財報以歐元呈現；本案例以 EUR 1 = USD 1.13 將 FY2025 營收與營業利益換算為研究用美元值。人數採年報地區平均數合計。",
      sourceType: "公開財報 + 匯率換算 + 模型假設",
      sources: [
        {
          label: "Spotify FY2025 Form 20-F",
          url: "https://www.sec.gov/Archives/edgar/data/1639920/000162828026006874/ck0001639920-20251231.htm",
        },
      ],
      values: {
        country: "GB",
        employees: 7287,
        revenue: 19420.18,
        operatingProfit: 2483.74,
        grossMargin: 31.98,
        historicalGrowth: 9.65,
        salary: 180000,
        exposure: 64,
        efficiency: 43,
        adoption: 81,
        quality: 93,
        aiCostPerEmployee: 19000,
        fixedAiCost: 38,
        transitionCost: 28,
        amortizationYears: 3,
        redeployShare: 80,
        revenueConversion: 59,
        riskBuffer: 42,
        targetMargin: 15,
        revenueLossPerCut: 0.65,
        severanceMonths: 6,
      },
    },
    salesforce: {
      name: "Salesforce · FY2026",
      industry: "企業 SaaS",
      note: "營收、營業利益、成本與員工數採 Salesforce FY2026 Form 10-K；Informatica 於第四季併入，跨年度比較需留意併購影響。",
      sourceType: "公開財報 + 模型假設",
      sources: [
        {
          label: "Salesforce FY2026 Form 10-K",
          url: "https://www.sec.gov/Archives/edgar/data/1108524/000110852426000060/crm-20260131.htm",
        },
      ],
      values: {
        country: "US",
        employees: 83334,
        revenue: 41525,
        operatingProfit: 8331,
        grossMargin: 77.68,
        historicalGrowth: 9.58,
        salary: 230000,
        exposure: 72,
        efficiency: 46,
        adoption: 79,
        quality: 91,
        aiCostPerEmployee: 21000,
        fixedAiCost: 260,
        transitionCost: 210,
        amortizationYears: 3,
        redeployShare: 72,
        revenueConversion: 56,
        riskBuffer: 42,
        targetMargin: 22,
        revenueLossPerCut: 0.5,
        severanceMonths: 6,
      },
    },
    tesla: {
      name: "Tesla · FY2025",
      industry: "汽車、能源與硬體製造",
      note: "營收、營業利益、毛利率與員工數採 Tesla FY2025 Form 10-K；模型僅分析企業內部 AI 生產力，不含車輛自動駕駛收入預測。",
      sourceType: "公開財報 + 模型假設",
      sources: [
        {
          label: "Tesla FY2025 Form 10-K",
          url: "https://www.sec.gov/Archives/edgar/data/1318605/000162828026003952/tsla-20251231.htm",
        },
      ],
      values: {
        country: "US",
        employees: 134785,
        revenue: 94827,
        operatingProfit: 4355,
        grossMargin: 18.03,
        historicalGrowth: -2.93,
        salary: 130000,
        exposure: 42,
        efficiency: 35,
        adoption: 66,
        quality: 94,
        aiCostPerEmployee: 10000,
        fixedAiCost: 520,
        transitionCost: 620,
        amortizationYears: 4,
        redeployShare: 72,
        revenueConversion: 36,
        riskBuffer: 52,
        targetMargin: 8,
        revenueLossPerCut: 0.45,
        severanceMonths: 5,
      },
    },
    cloudflare: {
      name: "Cloudflare · FY2025 / 2026 重整",
      industry: "SaaS / 雲端基礎設施",
      note: "FY2025 財務與員工數作為基準；US$145M 轉型成本取 2026 重整估計區間中點，不代表成本由 AI 單獨造成。",
      sourceType: "公開財報 + 重整情境",
      comparisonCut: 1100,
      sources: [
        {
          label: "Cloudflare FY2025 Form 10-K",
          url: "https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm",
        },
        {
          label: "Cloudflare FY2025 results",
          url: "https://cloudflare.net/files/doc_financials/2025/q4/Q4-25-Exhibit-99-1_FINAL.pdf",
        },
        {
          label: "Cloudflare Q1 2026 restructuring",
          url: "https://www.cloudflare.com/press/press-releases/2026/cloudflare-announces-first-quarter-2026-financial-results/",
        },
      ],
      values: {
        country: "US",
        employees: 5156,
        revenue: 2167.9,
        operatingProfit: -207.2,
        grossMargin: 74.5,
        historicalGrowth: 29.8,
        salary: 180000,
        exposure: 62,
        efficiency: 42,
        adoption: 76,
        quality: 90,
        aiCostPerEmployee: 15000,
        fixedAiCost: 25,
        transitionCost: 145,
        amortizationYears: 2,
        redeployShare: 45,
        revenueConversion: 70,
        riskBuffer: 30,
        targetMargin: 12,
        revenueLossPerCut: 0.3,
        severanceMonths: 6,
      },
    },
    aiNative: {
      name: "AI-native 新創 · 模擬",
      industry: "AI-native SaaS / 模擬",
      note: "合成案例，用於觀察小團隊、高採用率與避免新增人力的組織效果，不代表特定公司。",
      sourceType: "合成模型",
      sources: [],
      values: {
        country: "US",
        employees: 25,
        revenue: 8,
        operatingProfit: 0.8,
        grossMargin: 82,
        historicalGrowth: 80,
        salary: 150000,
        exposure: 82,
        efficiency: 70,
        adoption: 95,
        quality: 93,
        aiCostPerEmployee: 30000,
        fixedAiCost: 0.2,
        transitionCost: 0.05,
        amortizationYears: 2,
        redeployShare: 90,
        revenueConversion: 85,
        riskBuffer: 45,
        targetMargin: 20,
        revenueLossPerCut: 0.7,
        severanceMonths: 3,
      },
    },
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function finite(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function normalize(input) {
    const values = Object.assign({}, MODEL_DEFAULTS, input);
    return {
      country: values.country in COUNTRIES ? values.country : "TW",
      employees: Math.max(1, Math.round(finite(values.employees, 1))),
      revenue: Math.max(0, finite(values.revenue, 0)),
      operatingProfit: finite(values.operatingProfit, 0),
      grossMargin: clamp(finite(values.grossMargin, 0) / 100, 0, 1),
      historicalGrowth: finite(values.historicalGrowth, 0) / 100,
      salary: Math.max(0, finite(values.salary, 0)),
      exposure: clamp(finite(values.exposure, 0) / 100, 0, 1),
      efficiency: Math.max(0, finite(values.efficiency, 0) / 100),
      adoption: clamp(finite(values.adoption, 0) / 100, 0, 1),
      quality: clamp(finite(values.quality, 0) / 100, 0, 1),
      reviewOverhead: clamp(finite(values.reviewOverhead, 0) / 100, 0, 2),
      reworkOverhead: clamp(finite(values.reworkOverhead, 0) / 100, 0, 2),
      aiOpsOverhead: clamp(finite(values.aiOpsOverhead, 0) / 100, 0, 2),
      automationShare: clamp(finite(values.automationShare, 0) / 100, 0, 1),
      aiCostPerEmployee: Math.max(0, finite(values.aiCostPerEmployee, 0)),
      fixedAiCost: Math.max(0, finite(values.fixedAiCost, 0)),
      transitionCost: Math.max(0, finite(values.transitionCost, 0)),
      amortizationYears: Math.max(1, finite(values.amortizationYears, 1)),
      productInferenceCostRate: clamp(
        finite(values.productInferenceCostRate, 0) / 100,
        0,
        1
      ),
      redeployShare: clamp(finite(values.redeployShare, 0) / 100, 0, 1),
      revenueConversion: Math.max(
        0,
        finite(values.revenueConversion, 0) / 100
      ),
      demandCeiling: Math.max(0, finite(values.demandCeiling, 0) / 100),
      riskBuffer: clamp(finite(values.riskBuffer, 0) / 100, 0, 1),
      targetMargin: finite(values.targetMargin, 0) / 100,
      revenueLossElasticity: Math.max(
        0,
        finite(values.revenueLossPerCut, 0)
      ),
      severanceMonths: Math.max(0, finite(values.severanceMonths, 0)),
      year1Realization: clamp(
        finite(values.year1Realization, 0) / 100,
        0,
        1
      ),
      analysisYears: clamp(
        Math.round(finite(values.analysisYears, 3)),
        1,
        10
      ),
      discountRate: clamp(finite(values.discountRate, 0) / 100, 0, 1),
    };
  }

  function deriveAiCapacity(n) {
    const applicableShare = n.exposure * n.adoption;
    const grossTaskTimeSaved =
      n.efficiency > 0 ? n.efficiency / (1 + n.efficiency) : 0;
    const totalOverhead =
      n.reviewOverhead + n.reworkOverhead + n.aiOpsOverhead;
    const netTaskTimeSaved = grossTaskTimeSaved - totalOverhead;
    const timeReleaseRate = applicableShare * netTaskTimeSaved;
    const boundedTimeReleaseRate = clamp(timeReleaseRate, -4, 0.95);
    const grossProductivityUplift =
      1 / (1 - boundedTimeReleaseRate) - 1;
    const productivityUplift =
      grossProductivityUplift > 0
        ? grossProductivityUplift * n.quality
        : grossProductivityUplift;
    return {
      applicableShare,
      grossTaskTimeSaved,
      totalOverhead,
      netTaskTimeSaved,
      productivityUplift,
      taskTimeSaved: netTaskTimeSaved,
      timeReleaseRate,
      growthEquivalentFte:
        n.employees * Math.max(0, productivityUplift),
      releasableFte:
        n.employees * Math.max(0, timeReleaseRate),
      addedWorkFte:
        n.employees * Math.max(0, -timeReleaseRate),
    };
  }

  function projectRevenueValue(n, capacity, realization) {
    const currentRpe = n.revenue / n.employees;
    const capacityRevenue =
      capacity.growthEquivalentFte *
      currentRpe *
      n.redeployShare *
      n.revenueConversion *
      realization;
    const demandLimit = n.revenue * n.demandCeiling * realization;
    return Math.max(0, Math.min(capacityRevenue, demandLimit));
  }

  function projectedProfitAtCut(
    input,
    cutCount,
    extraRevenueGrowth,
    options
  ) {
    const n = normalize(input);
    const settings = Object.assign(
      { includeAi: true, realization: 1 },
      options
    );
    const capacity = settings.includeAi
      ? deriveAiCapacity(n)
      : {
          growthEquivalentFte: 0,
          releasableFte: 0,
          addedWorkFte: 0,
        };
    const incrementalRevenue = settings.includeAi
      ? projectRevenueValue(n, capacity, settings.realization)
      : 0;
    const baseFutureRevenue = n.revenue * (1 + n.historicalGrowth);
    const extraRevenue = n.revenue * Math.max(0, extraRevenueGrowth || 0);
    const preCutRevenue = baseFutureRevenue + incrementalRevenue + extraRevenue;
    const cutRate = clamp(cutCount / n.employees, 0, 0.95);
    const revenueRetention = Math.max(
      0,
      1 - cutRate * n.revenueLossElasticity
    );
    const revenueAfterCut = preCutRevenue * revenueRetention;
    const payroll = (n.employees - cutCount) * n.salary / 1000000;
    const currentPayroll = n.employees * n.salary / 1000000;
    const nonPayrollOpexRaw =
      n.revenue * n.grossMargin - n.operatingProfit - currentPayroll;
    const nonPayrollOpex = Math.max(0, nonPayrollOpexRaw);
    const recurringAiCost = settings.includeAi
      ? (n.employees - cutCount) * n.aiCostPerEmployee / 1000000 +
        n.fixedAiCost
      : 0;
    const transitionAmortization = settings.includeAi
      ? n.transitionCost / n.amortizationYears
      : 0;
    const productInferenceCost = settings.includeAi
      ? incrementalRevenue * n.productInferenceCostRate
      : 0;
    const remainingShare = (n.employees - cutCount) / n.employees;
    const productivityDragCost = settings.includeAi
      ? capacity.addedWorkFte *
        remainingShare *
        settings.realization *
        n.salary /
        1000000
      : 0;
    const aiCost =
      recurringAiCost +
      transitionAmortization +
      productInferenceCost;
    const profit =
      revenueAfterCut * n.grossMargin -
      payroll -
      nonPayrollOpex -
      aiCost -
      productivityDragCost;

    return {
      profit,
      revenue: revenueAfterCut,
      margin: revenueAfterCut > 0 ? profit / revenueAfterCut : -Infinity,
      incrementalRevenue,
      recurringAiCost,
      transitionAmortization,
      productInferenceCost,
      productivityDragCost,
      aiCost,
    };
  }

  function findRequiredCuts(input, extraRevenueGrowth, options) {
    const n = normalize(input);
    const maxCuts = Math.floor(n.employees * 0.7);
    const noAdjustment = projectedProfitAtCut(
      input,
      0,
      extraRevenueGrowth,
      options
    );
    if (noAdjustment.margin >= n.targetMargin) {
      return {
        feasible: true,
        cutCount: 0,
        cutRate: 0,
        scenario: noAdjustment,
      };
    }
    const positiveRevenueLimit =
      n.revenueLossElasticity > 0
        ? Math.floor(
            n.employees *
              Math.min(0.7, 0.999999 / n.revenueLossElasticity)
          )
        : maxCuts;
    const searchMax = Math.max(0, Math.min(maxCuts, positiveRevenueLimit));
    const endScenario = projectedProfitAtCut(
      input,
      searchMax,
      extraRevenueGrowth,
      options
    );
    if (endScenario.margin >= n.targetMargin) {
      let low = 1;
      let high = searchMax;
      while (low < high) {
        const middle = Math.floor((low + high) / 2);
        const scenario = projectedProfitAtCut(
          input,
          middle,
          extraRevenueGrowth,
          options
        );
        if (scenario.margin >= n.targetMargin) high = middle;
        else low = middle + 1;
      }
      const scenario = projectedProfitAtCut(
        input,
        low,
        extraRevenueGrowth,
        options
      );
      return {
        feasible: true,
        cutCount: low,
        cutRate: low / n.employees,
        scenario,
      };
    }
    return {
      feasible: false,
      cutCount: maxCuts,
      cutRate: maxCuts / n.employees,
      scenario: projectedProfitAtCut(
        input,
        maxCuts,
        extraRevenueGrowth,
        options
      ),
    };
  }

  function solveBreakEvenEfficiency(input) {
    const maxEfficiencyPercent = 1000;
    const deltaAt = (efficiency) => {
      const altered = Object.assign({}, input, { efficiency });
      const withAi = projectedProfitAtCut(altered, 0, 0, {
        includeAi: true,
      });
      const withoutAi = projectedProfitAtCut(altered, 0, 0, {
        includeAi: false,
      });
      return withAi.profit - withoutAi.profit;
    };
    if (deltaAt(0) >= 0) return 0;
    if (deltaAt(maxEfficiencyPercent) < 0) return Infinity;
    let low = 0;
    let high = maxEfficiencyPercent;
    for (let index = 0; index < 45; index += 1) {
      const middle = (low + high) / 2;
      if (deltaAt(middle) >= 0) high = middle;
      else low = middle;
    }
    return high / 100;
  }

  function projectMultiYear(input, steadyCapacity, steadyIncrementalRevenue) {
    const n = normalize(input);
    const currentPayroll = n.employees * n.salary / 1000000;
    const nonPayrollOpex = Math.max(
      0,
      n.revenue * n.grossMargin - n.operatingProfit - currentPayroll
    );
    const recurringSeatAndPlatformCost =
      n.employees * n.aiCostPerEmployee / 1000000 + n.fixedAiCost;
    const timeline = [];
    let cumulativeCashFlow = 0;
    let npv = 0;
    let paybackYear = null;

    for (let year = 1; year <= n.analysisYears; year += 1) {
      const progress =
        n.analysisYears === 1 ? 1 : (year - 1) / (n.analysisYears - 1);
      const realization =
        n.year1Realization + (1 - n.year1Realization) * progress;
      const baselineRevenue =
        n.revenue * Math.pow(1 + n.historicalGrowth, year);
      const incrementalRevenue = steadyIncrementalRevenue * realization;
      const productInferenceCost =
        incrementalRevenue * n.productInferenceCostRate;
      const productivityDragCost =
        steadyCapacity.addedWorkFte *
        realization *
        n.salary /
        1000000;
      const baselineProfit =
        baselineRevenue * n.grossMargin -
        currentPayroll -
        nonPayrollOpex;
      const aiProfit =
        (baselineRevenue + incrementalRevenue) * n.grossMargin -
        currentPayroll -
        nonPayrollOpex -
        recurringSeatAndPlatformCost -
        productInferenceCost -
        productivityDragCost;
      const transitionCashCost = year === 1 ? n.transitionCost : 0;
      const cashFlowDelta =
        aiProfit - baselineProfit - transitionCashCost;
      cumulativeCashFlow += cashFlowDelta;
      npv += cashFlowDelta / Math.pow(1 + n.discountRate, year);
      if (paybackYear === null && cumulativeCashFlow >= 0) {
        paybackYear = year;
      }
      timeline.push({
        year,
        realization,
        baselineRevenue,
        incrementalRevenue,
        baselineProfit,
        aiProfit,
        transitionCashCost,
        cashFlowDelta,
        cumulativeCashFlow,
      });
    }

    return {
      timeline,
      firstYearCashFlow: timeline[0].cashFlowDelta,
      npv,
      paybackYear,
    };
  }

  function calculateCore(input) {
    const n = normalize(input);
    const currentRpe = n.revenue / n.employees;
    const currentPayroll = n.employees * n.salary / 1000000;
    const nonPayrollOpexRaw =
      n.revenue * n.grossMargin - n.operatingProfit - currentPayroll;
    const nonPayrollOpex = Math.max(0, nonPayrollOpexRaw);
    const capacity = deriveAiCapacity(n);
    const revenueFte = capacity.growthEquivalentFte * n.redeployShare;
    const capacityBasedRevenue =
      revenueFte * currentRpe * n.revenueConversion;
    const demandLimitedRevenue = n.revenue * n.demandCeiling;
    const incrementalRevenue = projectRevenueValue(n, capacity, 1);
    const baseFutureRevenue = n.revenue * (1 + n.historicalGrowth);
    const projectedRevenue = baseFutureRevenue + incrementalRevenue;
    const recurringAiCost =
      n.employees * n.aiCostPerEmployee / 1000000 +
      n.fixedAiCost;
    const transitionAmortization =
      n.transitionCost / n.amortizationYears;
    const productInferenceCost =
      incrementalRevenue * n.productInferenceCostRate;
    const productivityDragCost =
      capacity.addedWorkFte * n.salary / 1000000;
    const annualAiCost =
      recurringAiCost +
      transitionAmortization +
      productInferenceCost;
    const noAdjustmentScenario = projectedProfitAtCut(input, 0, 0, {
      includeAi: true,
    });
    const baselineScenario = projectedProfitAtCut(input, 0, 0, {
      includeAi: false,
    });
    const projectedProfitNoCuts = noAdjustmentScenario.profit;
    const baselineFutureProfit = baselineScenario.profit;
    const aiProfitDelta = projectedProfitNoCuts - baselineFutureProfit;
    const aiRoi =
      annualAiCost > 0 ? aiProfitDelta / annualAiCost : aiProfitDelta >= 0 ? Infinity : -Infinity;
    const projectedRpe = projectedRevenue / n.employees;
    const safeFte =
      capacity.releasableFte *
      n.automationShare *
      (1 - n.redeployShare) *
      (1 - n.riskBuffer);
    const required = findRequiredCuts(input, 0, { includeAi: true });
    const baselineRequired = findRequiredCuts(input, 0, {
      includeAi: false,
    });
    const aiAttributedAdjustmentDelta =
      required.feasible && baselineRequired.feasible
        ? required.cutCount - baselineRequired.cutCount
        : null;
    const firstYearRestructuringCost =
      required.cutCount * n.salary * n.severanceMonths / 12 / 1000000;

    const incrementalContributionMargin = Math.max(
      n.grossMargin - n.productInferenceCostRate,
      0.0001
    );
    const remainingRevenueNeeded =
      Math.max(0, -aiProfitDelta) / incrementalContributionMargin;
    const requiredGrowth = n.revenue > 0 ? remainingRevenueNeeded / n.revenue : Infinity;

    const breakEvenEfficiency = solveBreakEvenEfficiency(input);

    const perEmployeeValueAtCurrentEfficiency =
      Math.max(0, capacity.productivityUplift) *
        currentRpe *
        n.redeployShare *
        n.revenueConversion *
        n.grossMargin *
        1000000 +
      capacity.timeReleaseRate *
        n.automationShare *
        (1 - n.redeployShare) *
        (1 - n.riskBuffer) *
        n.salary -
      n.aiCostPerEmployee;
    const annualFixedAiCost =
      (n.fixedAiCost + n.transitionCost / n.amortizationYears) * 1000000;
    const breakEvenSize =
      perEmployeeValueAtCurrentEfficiency > 0
        ? Math.ceil(annualFixedAiCost / perEmployeeValueAtCurrentEfficiency)
        : Infinity;

    const noAiHeadcountForProjectedRevenue =
      currentRpe > 0 ? projectedRevenue / currentRpe : n.employees;
    const aiNativeHeadcount =
      noAiHeadcountForProjectedRevenue /
      Math.max(1 + capacity.productivityUplift, 0.0001);
    const avoidedHires = Math.max(
      0,
      noAiHeadcountForProjectedRevenue - aiNativeHeadcount
    );
    const aiNativeRpe =
      aiNativeHeadcount > 0 ? projectedRevenue / aiNativeHeadcount : 0;
    const multiYear = projectMultiYear(
      input,
      capacity,
      incrementalRevenue
    );

    const warnings = [];
    if (nonPayrollOpexRaw < 0) {
      warnings.push(
        "Average labor cost exceeds the gross profit available in the current financial inputs. Non-payroll operating expense has been floored at zero; review the labor-cost or financial assumptions."
      );
    }
    if (n.targetMargin >= n.grossMargin) {
      warnings.push("Target operating margin must remain below gross margin.");
    }
    if (capacity.timeReleaseRate < 0) {
      warnings.push(
        "Review, rework, and AI operations overhead exceed gross time saved. The current AI scenario produces negative net productivity."
      );
    }
    if (capacityBasedRevenue > demandLimitedRevenue + 0.000001) {
      warnings.push(
        "Capacity-based AI revenue exceeds the validated demand ceiling. Incremental revenue has been capped."
      );
    }
    if (!required.feasible) {
      warnings.push("The target margin remains infeasible even after testing workforce reductions up to 70%.");
    } else if (required.cutCount > safeFte + 0.5) {
      warnings.push(
        "Modeled workforce pressure exceeds the capacity available for further review. The gap must be addressed through revenue, non-labor cost, AI cost, or a different target."
      );
    }

    let verdict = "Validate with a controlled pilot";
    let verdictClass = "caution";
    if (aiProfitDelta > 0 && required.cutCount <= safeFte + 0.5) {
      verdict = "Positive economics are plausible";
      verdictClass = "positive";
    } else if (aiProfitDelta < 0 && !required.feasible) {
      verdict = "Current assumptions do not hold";
      verdictClass = "negative";
    }

    return {
      normalized: n,
      currentRpe,
      projectedRpe,
      currentPayroll,
      nonPayrollOpex,
      effectiveGain: capacity.productivityUplift,
      productivityUplift: capacity.productivityUplift,
      taskTimeSaved: capacity.taskTimeSaved,
      grossTaskTimeSaved: capacity.grossTaskTimeSaved,
      totalOverhead: capacity.totalOverhead,
      timeReleaseRate: capacity.timeReleaseRate,
      growthEquivalentFte: capacity.growthEquivalentFte,
      releasableFte: capacity.releasableFte,
      addedWorkFte: capacity.addedWorkFte,
      equivalentFte: capacity.growthEquivalentFte,
      capacityBasedRevenue,
      demandLimitedRevenue,
      incrementalRevenue,
      projectedRevenue,
      recurringAiCost,
      transitionAmortization,
      productInferenceCost,
      productivityDragCost,
      annualAiCost,
      baselineFutureProfit,
      projectedProfitNoCuts,
      aiProfitDelta,
      aiRoi,
      safeFte,
      required,
      baselineRequired,
      aiAttributedAdjustmentDelta,
      firstYearRestructuringCost,
      requiredGrowth,
      breakEvenEfficiency,
      breakEvenSize,
      noAiHeadcountForProjectedRevenue,
      aiNativeHeadcount,
      avoidedHires,
      aiNativeRpe,
      firstYearCashFlow: multiYear.firstYearCashFlow,
      npv: multiYear.npv,
      paybackYear: multiYear.paybackYear,
      timeline: multiYear.timeline,
      warnings,
      verdict,
      verdictClass,
    };
  }

  function scenarioInput(input, mode) {
    const values = Object.assign({}, MODEL_DEFAULTS, input);
    if (mode === "conservative") {
      return Object.assign({}, values, {
        efficiency: finite(values.efficiency, 0) * 0.75,
        adoption: finite(values.adoption, 0) * 0.8,
        quality: Math.max(0, finite(values.quality, 0) - 5),
        reviewOverhead: finite(values.reviewOverhead, 0) * 1.25 + 2,
        reworkOverhead: finite(values.reworkOverhead, 0) * 1.3 + 2,
        aiOpsOverhead: finite(values.aiOpsOverhead, 0) * 1.2,
        revenueConversion: finite(values.revenueConversion, 0) * 0.6,
        demandCeiling: finite(values.demandCeiling, 0) * 0.6,
        aiCostPerEmployee: finite(values.aiCostPerEmployee, 0) * 1.2,
        fixedAiCost: finite(values.fixedAiCost, 0) * 1.15,
        transitionCost: finite(values.transitionCost, 0) * 1.2,
        productInferenceCostRate:
          finite(values.productInferenceCostRate, 0) * 1.2,
        year1Realization: finite(values.year1Realization, 0) * 0.75,
      });
    }
    if (mode === "upside") {
      return Object.assign({}, values, {
        efficiency: finite(values.efficiency, 0) * 1.2,
        adoption: Math.min(100, finite(values.adoption, 0) * 1.15),
        quality: Math.min(100, finite(values.quality, 0) + 3),
        reviewOverhead: finite(values.reviewOverhead, 0) * 0.8,
        reworkOverhead: finite(values.reworkOverhead, 0) * 0.75,
        aiOpsOverhead: finite(values.aiOpsOverhead, 0) * 0.8,
        revenueConversion: finite(values.revenueConversion, 0) * 1.25,
        demandCeiling: finite(values.demandCeiling, 0) * 1.25,
        aiCostPerEmployee: finite(values.aiCostPerEmployee, 0) * 0.9,
        fixedAiCost: finite(values.fixedAiCost, 0) * 0.9,
        transitionCost: finite(values.transitionCost, 0) * 0.9,
        productInferenceCostRate:
          finite(values.productInferenceCostRate, 0) * 0.9,
        year1Realization: Math.min(
          100,
          finite(values.year1Realization, 0) * 1.15
        ),
      });
    }
    return values;
  }

  function calculateUncertainty(input) {
    return ["conservative", "base", "upside"].map((mode) => {
      const result = calculateCore(scenarioInput(input, mode));
      return {
        mode,
        aiRoi: result.aiRoi,
        npv: result.npv,
        firstYearCashFlow: result.firstYearCashFlow,
        requiredGrowth: result.requiredGrowth,
        netProductivity: result.productivityUplift,
        requiredAdjustment: result.required.feasible
          ? result.required.cutCount
          : null,
        baselineAdjustment: result.baselineRequired.feasible
          ? result.baselineRequired.cutCount
          : null,
      };
    });
  }

  function calculate(input) {
    const result = calculateCore(input);
    result.uncertainty = calculateUncertainty(input);
    return result;
  }

  function diagnoseScenarios(input, precomputedResult) {
    const n = normalize(input);
    const result = precomputedResult || calculate(input);
    const percent = (value) =>
      `${Math.round(value * 1000) / 10}%`;
    const fixedAnnualCost =
      n.fixedAiCost + n.transitionCost / n.amortizationYears;
    const fixedCostShare =
      result.annualAiCost > 0 ? fixedAnnualCost / result.annualAiCost : 0;
    const laborValue =
      result.releasableFte *
      n.automationShare *
      (1 - n.redeployShare) *
      (1 - n.riskBuffer) *
      n.salary /
      1000000;
    const laborCoverage =
      result.annualAiCost > 0 ? laborValue / result.annualAiCost : Infinity;
    const avoidedHireRate =
      result.noAiHeadcountForProjectedRevenue > 0
        ? result.avoidedHires / result.noAiHeadcountForProjectedRevenue
        : 0;

    const risk = (code, title, level, evidence, mechanism, adjustment) => ({
      code,
      title,
      level,
      tone: level === "high" ? "risk" : level === "medium" ? "watch" : "stable",
      rank: level === "high" ? 3 : level === "medium" ? 2 : 1,
      status:
        level === "high"
          ? "High sensitivity"
          : level === "medium"
            ? "Needs validation"
            : "Relatively stable",
      evidence,
      mechanism,
      adjustment,
    });

    const scenarios = [];

    const costLevel =
      result.aiRoi < 0 || result.requiredGrowth > 0.1
        ? "high"
        : result.aiRoi < 0.3 || result.requiredGrowth > 0.03
          ? "medium"
          : "low";
    scenarios.push(
      risk(
        "cost-overhang",
        "AI cost arrives before validated value",
        costLevel,
        `Steady-state AI ROI is ${Number.isFinite(result.aiRoi) ? percent(result.aiRoi) : "infinite"} and the scenario still requires ${percent(result.requiredGrowth)} of current revenue to break even.`,
        "Seats, APIs, platforms, and transformation spending enter cost immediately. Time saved does not automatically become revenue or removable operating capacity.",
        "Narrow the program to measurable workflows. Track actual AI bills, end-to-end task duration, error rates, and incremental gross profit before expanding."
      )
    );

    const adoptionLevel =
      n.efficiency >= 0.4 && n.adoption < 0.55
        ? "high"
        : n.adoption < 0.75
          ? "medium"
          : "low";
    scenarios.push(
      risk(
        "adoption-gap",
        "Tool capability is not becoming organization-wide adoption",
        adoptionLevel,
        `Gross task speed uplift is ${percent(n.efficiency)}, while effective task adoption is ${percent(n.adoption)}.`,
        "Results from a small group of expert users can overstate organization-wide capacity. Data access, permissions, workflow design, and trust may limit adoption.",
        "Measure adoption by completed task, not enabled account. Establish role-level baselines and resolve workflow constraints before buying more capacity."
      )
    );

    const qualityLevel =
      n.quality < 0.82 && n.efficiency >= 0.4
        ? "high"
        : n.quality < 0.92
          ? "medium"
          : "low";
    scenarios.push(
      risk(
        "quality-debt",
        "Apparent speed is offset by quality and rework",
        qualityLevel,
        `Output value retention is ${percent(n.quality)} and modeled net productivity change is ${percent(result.productivityUplift)}.`,
        "Generation speed can hide review, correction, downstream defects, compliance exposure, and customer-trust costs.",
        "Measure the complete delivery cycle, human review time, defect rate, and incident cost. Do not use draft-generation time as the productivity metric."
      )
    );

    const demandLevel =
      n.redeployShare >= 0.65 && n.revenueConversion < 0.4
        ? "high"
        : n.revenueConversion < 0.65
          ? "medium"
          : "low";
    scenarios.push(
      risk(
        "demand-conversion",
        "Released capacity exceeds validated market demand",
        demandLevel,
        `${percent(n.redeployShare)} of released capacity is allocated to growth, with ${percent(n.revenueConversion)} RPE conversion efficiency and a ${percent(n.demandCeiling)} demand ceiling.`,
        "Capacity is not demand. Faster product, sales, or service work creates no economic value without backlog, pricing power, distribution, or customer willingness to pay.",
        "Tie conversion assumptions to qualified pipeline, conversion rates, pricing tests, backlog, or delivery constraints."
      )
    );

    const marginLevel =
      n.grossMargin < 0.3 ? "high" : n.grossMargin < 0.55 ? "medium" : "low";
    scenarios.push(
      risk(
        "margin-trap",
        "Low gross margin weakens AI revenue payback",
        marginLevel,
        `Gross margin is ${percent(n.grossMargin)}. Each US$1 of revenue leaves roughly US$${n.grossMargin.toFixed(2)} before AI delivery and operating expense.`,
        "Hardware, manufacturing, logistics, and licensed-content businesses may produce large revenue with limited incremental contribution.",
        "Study yield, pricing, procurement, inventory, service attachment, and higher-margin revenue instead of optimizing only for transaction volume."
      )
    );

    const laborLevel =
      laborCoverage < 0.75 ? "high" : laborCoverage < 1 ? "medium" : "low";
    scenarios.push(
      risk(
        "labor-cost-mismatch",
        "Local labor cost alone does not repay AI spending",
        laborLevel,
        `Each US$1 of annual AI cost corresponds to approximately US$${Number.isFinite(laborCoverage) ? laborCoverage.toFixed(2) : "∞"} of financially realizable labor value.`,
        "Globally priced models and compute can be expensive relative to labor in lower-cost markets, particularly when revenue is also locally priced.",
        "Use model routing, caching, batching, and usage limits. Evaluate global revenue, quality, cycle time, and future hiring avoided."
      )
    );

    const adjustmentLevel =
      !result.required.feasible ||
      result.required.cutCount > result.safeFte + 0.5
        ? "high"
        : result.required.cutCount > 0 &&
            result.required.cutCount > result.safeFte * 0.75
          ? "medium"
          : "low";
    scenarios.push(
      risk(
        "adjustment-overreach",
        "Financial targets may be misread as AI-replaceable capacity",
        adjustmentLevel,
        `The no-AI baseline requires ${
          result.baselineRequired.feasible
            ? `${result.baselineRequired.cutCount} FTE`
            : "no feasible solution within 70%"
        }; the AI scenario requires ${
          result.required.feasible
            ? `${result.required.cutCount} FTE`
            : "no feasible solution within 70%"
        }; capacity available for further review is ${result.safeFte.toFixed(1)} FTE.`,
        "Margin pressure may come from an aggressive target, low gross margin, fixed cost, or weak demand. Assigning the full gap to headcount misattributes pre-existing economics to AI.",
        "Compare the no-AI and AI baselines first. Test revenue, non-labor cost, AI cost, and target assumptions before conducting role-level organization research."
      )
    );

    const scaleLevel =
      (Number.isFinite(result.breakEvenSize) &&
        result.breakEvenSize > n.employees * 1.5) ||
      fixedCostShare > 0.6
        ? "high"
        : (Number.isFinite(result.breakEvenSize) &&
              result.breakEvenSize > n.employees) ||
            fixedCostShare > 0.35
          ? "medium"
          : "low";
    scenarios.push(
      risk(
        "scale-mismatch",
        "Fixed platform and transformation cost do not fit company scale",
        scaleLevel,
        `Fixed and amortized transformation costs are ${percent(fixedCostShare)} of annual AI cost; ${
          Number.isFinite(result.breakEvenSize)
            ? `the modeled positive-economics threshold is approximately ${result.breakEvenSize} FTE`
            : "there is no positive scale range under current assumptions"
        }.`,
        "Small firms can destroy value by copying large-enterprise platform architecture. Large firms may accumulate migration and integration complexity.",
        "Use standardized, usage-based tools for small organizations. Separate mandatory governance from optional customization and stage large-enterprise migration by workflow."
      )
    );

    scenarios.push({
      code: "ai-native-option",
      title: "Use AI-native design to avoid future scaling debt",
      level: avoidedHireRate >= 0.1 ? "high" : avoidedHireRate >= 0.04 ? "medium" : "low",
      tone: avoidedHireRate >= 0.1 ? "opportunity" : "stable",
      rank: avoidedHireRate >= 0.1 ? 1.5 : 0.5,
      status: avoidedHireRate >= 0.1 ? "Structural opportunity" : "Limited opportunity",
      evidence: `The model estimates ${Math.round(result.avoidedHires)} potential hires avoided, or ${percent(avoidedHireRate)} of legacy scaling demand.`,
      mechanism: "The main AI-native advantage may be designing workflows, data, and ownership around lower coordination overhead before organizational layers accumulate.",
      adjustment: "Prioritize delayed hiring, higher RPE, and shorter product cycles. Track avoided future requisitions against observed demand."
    });

    return scenarios.sort((a, b) => b.rank - a.rank);
  }

  function positiveZoneValue(input, employeeCount, efficiencyPercent) {
    const altered = Object.assign({}, input, {
      employees: employeeCount,
      revenue:
        (finite(input.revenue, 0) / Math.max(1, finite(input.employees, 1))) *
        employeeCount,
      efficiency: efficiencyPercent,
    });
    const n = normalize(altered);
    const capacity = deriveAiCapacity(n);
    const incrementalRevenue = projectRevenueValue(n, capacity, 1);
    const revenueValue =
      incrementalRevenue *
      Math.max(0, n.grossMargin - n.productInferenceCostRate);
    const laborValue =
      capacity.releasableFte *
      n.automationShare *
      (1 - n.redeployShare) *
      (1 - n.riskBuffer) *
      n.salary /
      1000000;
    const productivityDragCost =
      capacity.addedWorkFte * n.salary / 1000000;
    const aiCost =
      n.employees * n.aiCostPerEmployee / 1000000 +
      n.fixedAiCost +
      n.transitionCost / n.amortizationYears;
    return revenueValue + laborValue - productivityDragCost - aiCost;
  }

  function countryComparison(input, salaryBenchmarks) {
    const n = normalize(input);
    const capacity = deriveAiCapacity(n);
    const fixedPer100 =
      ((n.fixedAiCost + n.transitionCost / n.amortizationYears) * 1000000 /
        n.employees) *
      100;
    const aiCostPer100 = n.aiCostPerEmployee * 100 + fixedPer100;
    return Object.entries(COUNTRIES).map(([code, country]) => {
      const benchmarkSalary = Math.max(
        0,
        finite(salaryBenchmarks && salaryBenchmarks[code], country.salary)
      );
      const laborValue =
        100 *
        Math.max(0, capacity.timeReleaseRate) *
        n.automationShare *
        (1 - n.redeployShare) *
        (1 - n.riskBuffer) *
        benchmarkSalary;
      return {
        code,
        name: country.name,
        salary: benchmarkSalary,
        laborValue,
        aiCost: aiCostPer100,
        breakEvenSalary:
          capacity.timeReleaseRate > 0 &&
          n.automationShare > 0 &&
          n.redeployShare < 1 &&
          n.riskBuffer < 1
            ? aiCostPer100 /
              (100 *
                capacity.timeReleaseRate *
                n.automationShare *
                (1 - n.redeployShare) *
                (1 - n.riskBuffer))
            : Infinity,
        coverage: aiCostPer100 > 0 ? laborValue / aiCostPer100 : Infinity,
      };
    });
  }

  return {
    COUNTRIES,
    MODEL_DEFAULTS,
    PRESETS,
    calculate,
    calculateUncertainty,
    countryComparison,
    diagnoseScenarios,
    findRequiredCuts,
    positiveZoneValue,
    projectedProfitAtCut,
    findRequiredWorkforceAdjustment: findRequiredCuts,
  };
});
