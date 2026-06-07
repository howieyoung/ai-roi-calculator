"use strict";

(function initializeI18n(global) {
  const STORAGE_KEY = "ai-efficiency-calculator-locale";
  const localePacks = global.AILocalePacks || {};
  const availableLocales = localePacks.availableLocales || [
    { code: "en", label: "English" },
    { code: "zh-TW", label: "繁體中文" },
  ];
  const supportedLocales = new Set(availableLocales.map((item) => item.code));

  const staticTranslations = {
    "AI ROI CALCULATOR": "AI ROI Calculator",
    "Can My Company Afford AI?": "我的公司是否準備好全面導入企業 AI？",
    "Export PDF": "匯出 PDF",
    "Language": "語言",
    "About this research project": "關於本研究專案",
    "Close research project introduction": "關閉研究專案介紹",
    "Project and service disclosure": "專案與服務揭露",
    "Open-source research calculator.": "開源研究試算器。",
    "Source code:": "原始碼：",
    "Created by": "製作：",
    "The hosted site uses Cloudflare Pages for delivery, Protico services for product guidance and user support, and Google Analytics to understand whether the site meets visitor needs. Calculator inputs and equations still run in the browser, and input values are not sent as analytics events.": "線上版本使用 Cloudflare Pages 進行網站遞送，使用 Protico 服務提供產品引導與用戶支援，並使用 Google Analytics 了解網站是否符合訪客需求。試算輸入與方程式仍在瀏覽器中執行，輸入值不會作為 analytics 事件傳送。",
    "AI affordability signal": "AI 負擔能力判斷",
    "RESEARCH PROJECT": "研究專案",
    "Exploring AI ROI, enterprise economics, and organization design": "探索 AI ROI、企業經濟與組織設計",
    "This project is an exploratory model that brings financial structure, task design, adoption behavior, quality risk, and workforce capacity into one transparent scenario framework. It does not assume that AI necessarily improves productivity. It asks when the same technical capability can produce opposite economic outcomes across different revenue, margin, labor-cost, and demand conditions.": "本專案是一套探索性模型，將財務結構、任務設計、採用行為、品質風險與組織產能納入透明的情境框架。模型不預設 AI 必然提升生產力，而是研究同一項技術能力在不同營收、毛利、人力成本與需求條件下，為何可能產生相反的經濟結果。",
    "Public-company examples provide scale, industry, and gross-margin reference points. Revenue, operating profit, and employee counts come from public filings where available. Internal task exposure, AI costs, adoption, review burden, and revenue conversion are generally not public and remain editable research assumptions.": "公開企業案例提供規模、產業與毛利率參考。營收、營業利益與員工人數在可取得時採用公開申報資料；內部任務曝險、AI 成本、採用率、審核負擔與營收轉換通常並未公開，因此皆保留為可調整的研究假設。",
    "Outputs are for hypothesis generation and sensitivity analysis, not forecasts or management advice. Calculator inputs are processed locally by the model and are not intentionally uploaded by the calculator. The hosted site is delivered through Cloudflare and includes the Protico support frame and Google Analytics described in the footer and repository docs.": "輸出結果用於建立假設與敏感度分析，不是預測或管理建議。試算輸入由模型在本機處理，試算器不會主動上傳企業輸入。線上網站透過 Cloudflare 遞送，並包含 footer 與 repository 文件中說明的 Protico 支援 frame 與 Google Analytics。",
    "SCENARIO BASELINE": "情境基準",
    "Choose a company example": "選擇企業案例",
    "Company scenario": "企業情境",
    "Custom company · Unclassified": "自訂企業 · 未分類",
    "SMB synthetic scenarios": "SMB 合成研究情境",
    "Retail e-commerce · 75 employees": "零售電商 · 75 人",
    "Independent restaurant · 14 employees": "獨立餐廳 · 14 人",
    "Taiwan hardware manufacturer · 750 employees": "台灣硬體製造商 · 750 人",
    "Advertising and digital platforms": "廣告與數位平台",
    "Meta · Advertising and social platform": "Meta · 廣告與社群平台",
    "Google / Alphabet · Ads and cloud platform": "Google / Alphabet · 廣告與雲端平台",
    "SaaS and cloud": "SaaS 與雲端",
    "Salesforce · Enterprise SaaS": "Salesforce · 企業 SaaS",
    "Cloudflare · SaaS / cloud infrastructure": "Cloudflare · SaaS／雲端基礎設施",
    "AI-native startup · Synthetic SaaS": "AI-native 新創 · 合成 SaaS 情境",
    "Hardware, semiconductors, and manufacturing": "硬體、半導體與製造",
    "TSMC · Semiconductor manufacturing": "台積電 · 半導體製造",
    "NVIDIA · AI infrastructure": "NVIDIA · AI 基礎設施",
    "Apple · Consumer hardware and services": "Apple · 消費硬體與服務",
    "Tesla · Automotive and energy": "Tesla · 汽車與能源",
    "Marketplaces and multi-business platforms": "Marketplace 與多事業平台",
    "Amazon · Commerce, AWS, and logistics": "Amazon · 電商、AWS 與物流",
    "Airbnb · Travel marketplace": "Airbnb · 旅遊 Marketplace",
    "Uber · Mobility and delivery marketplace": "Uber · 移動與外送 Marketplace",
    "Subscription media": "訂閱媒體",
    "Netflix · Subscription video": "Netflix · 訂閱影音",
    "Spotify · Subscription audio": "Spotify · 訂閱音訊",
    "A public company's gross margin can be a research starting point, not an industry standard. Delivery costs, channel fees, hardware, cloud infrastructure, and accounting classifications differ materially.": "公開企業的毛利率可作為研究起點，但不是產業標準。交付成本、通路費、硬體、雲端基礎設施與會計分類可能有顯著差異。",
    "Company": "企業",
    "Strategy": "策略",
    "Company baseline": "企業基準",
    "Annual": "年度",
    "Primary labor market": "主要人力市場",
    "Taiwan": "台灣",
    "United States": "美國",
    "Japan": "日本",
    "Singapore": "新加坡",
    "United Kingdom": "英國",
    "Germany": "德國",
    "India": "印度",
    "Employees": "員工人數",
    "Annual revenue": "年度營收",
    "Operating profit": "營業利益",
    "Gross margin": "毛利率",
    "Baseline revenue growth": "基準營收成長率",
    "Average fully loaded labor cost": "平均完整人力成本",
    "/ FTE-year": "／FTE 年",
    "AI operating assumptions": "AI 營運假設",
    "Editable": "可編輯",
    "Task exposure to AI": "AI 可影響工作比例",
    "Gross speed uplift on exposed tasks": "受影響任務的總效率提升",
    "Effective task adoption": "實際任務採用率",
    "Output value retention": "產出價值保留率",
    "Human review overhead": "人工審核負擔",
    "Correction and retry overhead": "修正重做時間",
    "AI administration overhead": "AI 管理時間",
    "Annual internal AI cost per employee": "每位員工年度內部 AI 成本",
    "Recurring fixed AI platform cost": "持續性固定 AI 平台成本",
    "One-time transformation cost": "一次性轉型成本",
    "Transformation amortization period": "轉型成本攤提期間",
    "years": "年",
    "Product inference cost as % of AI-attributed revenue": "產品推論成本占 AI 歸因營收比例",
    "Value realization strategy": "價值實現策略",
    "Scenario": "情境",
    "Released capacity allocated to growth": "釋放產能投入成長的比例",
    "Capacity-to-revenue conversion": "產能轉換營收效率",
    "Workforce risk buffer": "組織人力風險緩衝",
    "Share of released time that is structurally automatable": "釋放工時中可結構性自動化的比例",
    "Year-one value realization": "第一年價值實現比例",
    "Target operating margin": "目標營業利益率",
    "Revenue-loss elasticity per 1% workforce change": "每 1% 人力變動的營收損失彈性",
    "Average one-time workforce transition cost": "平均一次性組織人力轉型成本",
    "months of labor cost / FTE": "個月人力成本／FTE",
    "Validated AI demand ceiling": "已驗證 AI 需求上限",
    "% of current revenue": "占目前營收 %",
    "Analysis horizon": "分析期間",
    "Discount rate": "折現率",
    "MODEL OUTPUT": "模型輸出",
    "Current RPE": "目前 RPE",
    "Revenue per Employee": "每位員工營收",
    "AI-adjusted RPE": "AI 調整後 RPE",
    "Steady-state AI ROI": "穩態 AI ROI",
    "Net productivity change": "淨生產力變化",
    "Break-even gross speed uplift": "損益兩平所需總效率提升",
    "Positive economics size threshold": "正向經濟效益規模門檻",
    "Additional revenue required": "仍需增加的營收",
    "MULTI-YEAR CASH ECONOMICS": "多年度現金經濟",
    "First-year reality and long-run value": "第一年現實與長期價值",
    "Year-one incremental cash flow": "第一年增量現金流",
    "Includes the full one-time transformation cash cost": "包含完整的一次性轉型現金支出",
    "Scenario NPV": "情境淨現值",
    "Payback": "回收期間",
    "Based on cumulative undiscounted cash flow": "依未折現累積現金流計算",
    "BASELINE ATTRIBUTION": "基準歸因",
    "Separate existing financial pressure from AI impact": "區分既有財務壓力與 AI 影響",
    "Theoretical released time": "理論可釋放工時",
    "Bounded by current FTE": "不超過目前 FTE",
    "Capacity available for further review": "可進一步評估的人力空間",
    "Released time left after growth use, non-automatable work, and a safety buffer": "釋放工時扣除成長用途、無法自動化工作與安全緩衝後的剩餘空間",
    "No-AI baseline adjustment": "未導入 AI 的基準人力調整",
    "Pressure already present without the AI program": "未導入 AI 前已存在的壓力",
    "AI-attributed change": "AI 歸因變化",
    "Why baseline attribution matters": "為何基準歸因很重要",
    "The model solves the target-margin equation twice: first without AI, then with AI. The difference is the portion that can be associated with the AI scenario rather than pre-existing economics.": "模型會求解兩次目標利潤率方程：第一次不納入 AI，第二次納入 AI。兩者差額才是可歸因於 AI 情境的部分，而非企業原本就存在的經濟問題。",
    "This is a financial stress test, not a workforce recommendation. A valid organization decision requires role-level task evidence, minimum operating capacity, legal review, and observed performance over time.": "這是一項財務壓力測試，不是組織人力建議。有效的組織決策仍需職務層級的任務證據、最低營運能力、法律審查與長期實測績效。",
    "EXECUTIVE INTERPRETATION": "管理層解讀",
    "Research interpretation": "研究性解讀",
    "Generated from inputs": "依輸入產生",
    "UNCERTAINTY RANGE": "不確定性範圍",
    "Conservative, base, and upside assumptions": "保守、基準與正向假設",
    "These are deterministic sensitivity cases, not statistical confidence intervals. They vary adoption, speed, review burden, demand conversion, and cost assumptions together to show how fragile a single-point answer may be.": "這些是確定性的敏感度情境，不是統計信賴區間。模型同步調整採用率、效率、審核負擔、需求轉換與成本假設，以呈現單點答案可能有多脆弱。",
    "PATHS TO POSITIVE ECONOMICS": "通往正向經濟效益的路徑",
    "What could improve this scenario?": "哪些調整可能改善目前結果？",
    "The calculator tests individual and combined changes to identify which measurable assumptions could move the current result toward positive economics. Each path is a sensitivity test, not a promised outcome.": "試算器會測試單一與組合調整，找出哪些可量測假設可能讓目前結果轉向正向經濟效益。每一條路徑都是敏感度測試，不是成果承諾。",
    "SCALE × PERFORMANCE": "規模 × 效能",
    "Positive AI economics zone": "AI 正向經濟效益區",
    "Negative": "負向",
    "Near break-even": "接近損益兩平",
    "Positive": "正向",
    "How to read this chart": "如何閱讀此圖",
    "Each cell estimates annual AI economic value at a given company size and gross task speed uplift while holding the remaining assumptions constant. Green is positive, red is negative, and yellow is near break-even. The black point marks the current scenario.": "每個格子在其他假設不變下，估算特定公司規模與任務總效率提升所對應的年度 AI 經濟價值。綠色為正向、紅色為負向、黃色為接近損益兩平，黑點代表目前情境。",
    "This is a sensitivity map, not a forecast. It assumes RPE and cost structure remain constant as the company is scaled and is intended to identify ranges that require deeper validation.": "這是敏感度地圖，不是預測。它假設企業規模改變時 RPE 與成本結構維持不變，目的是找出需要進一步驗證的區間。",
    "TARGET MARGIN": "目標利潤率",
    "Revenue Growth / FTE Trade-off": "營收成長／FTE 權衡",
    "What the line represents": "曲線代表什麼",
    "The X-axis is revenue growth beyond the baseline and modeled AI-attributed revenue. The Y-axis is the minimum modeled workforce adjustment needed to reach the target operating margin.": "X 軸是超出基準與模型 AI 歸因營收後的額外營收成長，Y 軸是達到目標營業利益率所需的最低模型人力調整。",
    "The workforce percentage is a financial pressure value, not an executable recommendation. Compare it with the capacity available for further review and the no-AI baseline before drawing any organizational conclusion.": "人力百分比代表財務壓力，不是可直接執行的建議。形成任何組織結論前，必須先與可進一步評估的人力空間及未導入 AI 的基準比較。",
    "AI-NATIVE BENCHMARK": "AI-NATIVE 基準",
    "Avoid scaling first and redesigning later": "避免先堆疊規模、再回頭重設",
    "Legacy scaling headcount": "傳統擴張所需人數",
    "AI-native modeled headcount": "AI-native 模型所需人數",
    "Potential hires avoided": "可能避免新增的人力",
    "Modeled AI-native RPE": "模型 AI-native RPE",
    "How this benchmark is calculated": "此基準如何計算",
    "Legacy scaling assumes the company maintains current RPE to support modeled future revenue. The AI-native case applies the modeled net productivity change. The difference represents potential future hiring avoided, not a recommendation to change current staffing.": "傳統擴張假設企業維持目前 RPE 來支撐模型未來營收；AI-native 情境則套用模型淨生產力變化。兩者差額代表未來可能避免新增的人力，不是調整目前組織人數的建議。",
    "This comparison isolates the structural advantage of designing workflows around AI from the beginning. It still assumes sufficient demand, stable quality, and a meaningful current RPE baseline.": "此比較用於隔離從一開始便以 AI 設計流程的結構性優勢，但仍假設需求充足、品質穩定，且目前 RPE 基準具有意義。",
    "LABOR-COST PAYBACK": "人力成本回收",
    "AI labor-value payback by market": "不同市場的 AI 人力價值回收",
    "How much local labor-cost value corresponds to each US$1 of AI cost?": "每 US$1 AI 成本可對應多少當地人力成本價值？",
    "The same AI usage and fixed-cost allocation is applied to editable fully loaded labor-cost benchmarks. US$1.00 means the financially realizable labor value equals AI spend. This compares cost structures, not worker capability.": "模型將相同 AI 用量與固定成本分攤套用到可編輯的完整人力成本基準。US$1.00 表示可財務實現的人力價值等於 AI 支出；比較的是成本結構，不是工作者能力。",
    "Edit fully loaded labor-cost benchmarks": "編輯完整人力成本基準",
    "Benchmarks may include salary, bonus, employer taxes, benefits, and equity. Override them for the relevant role mix and company level.": "基準可包含薪資、獎金、雇主稅負、福利與股權。請依相關職務組合與企業層級覆寫。",
    "Model equations and limitations": "模型方程式與限制",
    "Gross task time saved = speed uplift ÷ (1 + speed uplift)": "總任務節省時間 = 效率提升 ÷（1 + 效率提升）",
    "Net task time saved = gross time saved − review − correction time − AI administration overhead": "淨任務節省時間 = 總節省時間 − 審核 − 修正重做 − AI 管理時間",
    "Organization time release = exposure × adoption × net task time saved": "組織釋放時間 = 曝險比例 × 採用率 × 淨任務節省時間",
    "AI revenue = min(capacity-based revenue, validated demand ceiling)": "AI 營收 = min（產能推估營收，已驗證需求上限）",
    "Annual AI cost = seat/API cost + fixed platform cost + transformation amortization + product inference cost": "年度 AI 成本 = 帳號／API 成本 + 固定平台成本 + 轉型攤提 + 產品推論成本",
    "Capacity available for further review = released FTE × automatable share × non-growth share × (1 − risk buffer)": "可進一步評估的人力空間 = 釋放 FTE × 可自動化比例 × 非成長用途比例 ×（1 − 風險緩衝）",
    "Collapse": "收合",
    "This is a research model, not financial, legal, HR, or workforce advice. Public filings cannot identify the causal effect of AI. Internal task, quality, demand, and cost evidence must replace the default assumptions.": "這是研究模型，不構成財務、法律、人資或組織人力建議。公開申報資料無法識別 AI 的因果效果；預設假設必須由內部任務、品質、需求與成本證據取代。",
    "PARAMETER GUIDE": "參數指南",
    "Meaning": "定義",
    "How it changes the model": "如何影響模型",
    "Input example": "輸入範例",
    "AI ECONOMICS RESEARCH REPORT": "AI 經濟研究報告",
    "This report is a deterministic sensitivity analysis, not a forecast or financial, legal, HR, or workforce recommendation. Replace default assumptions with measured internal task, quality, demand, and cost evidence.": "本報告為確定性的敏感度分析，不是預測，也不構成財務、法律、人資或組織人力建議。請以企業內部實測的任務、品質、需求與成本證據取代預設假設。",
    "Open-source calculator by": "開源試算工具製作者：",
  };

  const messages = {
    en: {
      "language.label": "Language",
      "reset": "Reset current scenario",
      "preset.collapse": "Collapse",
      "preset.expand": "Expand",
      "help.about": "About {title}",
      "mobile.workspace": "Calculator workspace",
      "mobile.view.inputs": "Inputs",
      "mobile.view.analysis": "Analysis",
      "mobile.view.analysisWithVerdict": "Analysis: {verdict}",
      "mobile.expand": "Expand {title}",
      "mobile.collapse": "Collapse {title}",
      "mobile.inputs.company": "Company baseline",
      "mobile.inputs.ai": "AI operating assumptions",
      "mobile.inputs.strategy": "Value realization strategy",
      "mobile.inputs.paths": "Paths to positive economics",
      "mobile.results.attribution": "Baseline attribution",
      "mobile.results.interpretation": "Research interpretation",
      "mobile.results.cash": "Multi-year cash economics",
      "mobile.results.uncertainty": "Uncertainty analysis",
      "mobile.results.performance": "Scale and performance",
      "mobile.results.tradeoff": "Revenue and workforce trade-off",
      "mobile.results.native": "AI-native benchmark",
      "mobile.results.labor": "Labor-cost payback by market",
      "mobile.summary.company": "{employees} FTE · {revenue} revenue",
      "mobile.summary.ai": "{exposure} exposure · {adoption} adoption · {speed} speed",
      "mobile.summary.strategy": "{margin} target margin · {demand} demand ceiling",
      "mobile.summary.paths": "{count} tested paths reach positive economics",
      "mobile.summary.pathsPositive": "Current assumptions already reach positive economics",
      "mobile.summary.attribution": "AI-attributed change {value}",
      "mobile.summary.cash": "Scenario NPV {value}",
      "mobile.summary.uncertainty": "Base-case NPV {value}",
      "mobile.summary.breakEven": "Break-even speed {value}",
      "mobile.summary.adjustment": "Modeled adjustment {value}",
      "mobile.summary.avoided": "{value} potential future hires avoided",
      "mobile.summary.labor": "{country}: US${value} labor value per US$1 AI",
      "source.synthetic": "Synthetic model scenario. Country labor-cost values are editable assumptions, not official statistics. Model version: 2026-06-07.",
      "source.public": "Public sources: {links}. Non-public AI, demand, and workforce parameters are editable assumptions. Model version: 2026-06-07.",
      "preset.customMargin": "Choose a comparable business model and replace the gross-margin assumption with internal data.",
      "preset.loadedMargin": "Loaded gross margin: {margin}%. Use it only as a research starting point for a similar business model.",
      "salary.reference": "{country} reference: {amount}. Replace it with the company's fully loaded cost.",
      "result.vsCurrent": "{value} vs. current",
      "result.annualProfitDelta": "{value} annual profit delta",
      "result.additionalWork": "{value} FTE of additional work",
      "result.outputFte": "{value} output-equivalent FTE",
      "result.noRevenueBreakEven": "No revenue-only break-even",
      "result.noPositiveRange": "No positive range",
      "result.noFeasible": "No feasible solution",
      "result.notAttributable": "Not attributable",
      "result.capacityNote": "Gross time saved {saved} minus {overhead} review, correction, and AI administration time",
      "result.disclosedReference": "; disclosed restructuring reference {count} roles",
      "result.deltaIncreases": "AI assumptions increase modeled pressure by {count} FTE{reference}",
      "result.deltaReduces": "AI assumptions reduce modeled pressure by {count} FTE{reference}",
      "result.deltaZero": "AI does not change the modeled workforce pressure{reference}",
      "result.deltaUnavailable": "The target is infeasible in at least one baseline, so an AI-attributed delta cannot be isolated.",
      "result.nativeAdvantage": "{value} versus current RPE. This models potential future hiring avoided, not a current workforce recommendation.",
      "horizon.npvNote": "{years}-year NPV at a {rate}% discount rate",
      "horizon.year": "Year {year}",
      "horizon.beyond": "Beyond {years} years",
      "horizon.realized": "Year {year} · {value} value realized",
      "horizon.cumulative": "Cumulative {value}",
      "uncertainty.conservative": "Conservative",
      "uncertainty.base": "Base",
      "uncertainty.upside": "Upside",
      "uncertainty.npv": "{value} NPV",
      "uncertainty.roi": "Steady-state ROI {roi} · Year-one cash {cash}",
      "uncertainty.required": "Additional revenue required {value}",
      "scenario.highCount": "{count} high-sensitivity signals",
      "scenario.watchCount": "{count} signals need validation",
      "scenario.none": "No high-sensitivity signal",
      "scenario.mechanism": "Possible mechanism",
      "scenario.direction": "Research direction",
      "scenario.currentPositive": "Current assumptions already reach positive economics",
      "scenario.pathsFound": "{count} tested paths reach positive economics",
      "scenario.noPath": "No tested path reaches positive economics",
      "scenario.apply": "Apply this test",
      "scenario.reachesPositive": "Reaches positive",
      "scenario.closest": "Improves result",
      "scenario.roiChange": "AI ROI {before} → {after}",
      "scenario.npvChange": "NPV {before} → {after}",
      "scenario.requiredChange": "Revenue gap {before} → {after}",
      "chart.companyScale": "Company scale (FTE)",
      "chart.speed": "Gross task speed uplift",
      "chart.revenueGrowth": "Additional revenue growth",
      "chart.workforce": "Modeled workforce adjustment",
      "chart.aiScenario": "AI scenario: {value}",
      "chart.noSolution": "No feasible solution",
      "country.trackTitle": "Labor-cost value per US$1 of AI cost",
      "country.row": "Per 100 FTE: {labor} realizable labor value ÷ {ai} annual AI cost",
      "country.breakEven": "At the current usage and fixed-cost allocation, fully loaded annual labor cost must be approximately <b>{breakEven}</b> per FTE for realizable labor value to equal AI spending. The editable {country} reference is {salary}.",
      "country.noBreakEven": "There is no financially realizable released time, so a labor-only break-even cost cannot be calculated.",
      "country.inputLabel": "{country} fully loaded annual labor-cost reference in US dollars",
      "export.industry": "industry",
      "export.generatedAt": "Generated {date}",
      "export.openPrint": "Choose “Save as PDF” in the browser print dialog.",
      "scenario.positiveEvidence": "Current AI ROI is {roi} and {years}-year NPV is {npv}. Confirm that the result survives conservative assumptions and measured evidence.",
      "breakdown.noSolution": "No solution within 70%",
      "breakdown.noAiMargin": "No-AI operating margin",
      "breakdown.baselinePressure": "Baseline pressure: {value}",
      "breakdown.aiMargin": "AI scenario operating margin",
      "breakdown.aiPressure": "AI scenario pressure: {value}",
      "breakdown.delta": "AI-attributed difference",
      "breakdown.deltaNote": "Positive means AI increases pressure; negative means AI reduces it",
      "breakdown.target": "User target",
      "breakdown.safe": "Capacity available for further review: {value} FTE",
      "verdict.label": "AI affordability signal",
      "verdict.pilot": "Requires tightly controlled pilot-scale validation",
      "verdict.positive": "Positive economics are plausible",
      "verdict.negative": "Current assumptions do not hold",
      "verdict.note.positive": "The current assumptions suggest AI may be economically affordable, pending measured evidence and conservative stress tests.",
      "verdict.note.caution": "The model does not yet support broad rollout. Keep the pilot small, instrumented, and gated by adoption, quality, demand, and cost evidence.",
      "verdict.note.negative": "The current assumptions suggest AI is not economically affordable. Revisit scope, demand, costs, or target margin before expansion.",
      "warning.laborCost": "Average labor cost exceeds the gross profit available in the current financial inputs. Non-payroll operating expense has been floored at zero; review the labor-cost or financial assumptions.",
      "warning.targetMargin": "Target operating margin must remain below gross margin.",
      "warning.negativeProductivity": "Review, correction, and AI administration overhead exceed gross time saved. The current AI scenario produces negative net productivity.",
      "warning.demandCap": "Capacity-based AI revenue exceeds the validated demand ceiling. Incremental revenue has been capped.",
      "warning.infeasible": "The target margin remains infeasible even after testing workforce adjustments up to 70%.",
      "warning.capacity": "Modeled workforce pressure exceeds the capacity available for further review. Address the gap through revenue, non-labor cost, AI cost, or a different target.",
      "path.set": "Set {title} to {value}",
      "path.detail": "Tests whether changing {title} to this level can materially improve the current economics while other assumptions remain unchanged.",
      "path.combined": "Combined adjustment test",
      "analysis.overall": "<strong>Overall reading:</strong> Current RPE is approximately {currentRpe} and operating margin is {margin}. After review, correction, and AI administration time, modeled net productivity changes by {productivity}. AI-adjusted RPE becomes {projectedRpe}, a {rpeChange} change from current RPE.",
      "analysis.investment": "<strong>Investment economics:</strong> {economics} {breakEven} {size} The scenario still requires {requiredGrowth} of current revenue to make the AI increment break even.",
      "analysis.aiPositive": "At steady state, AI adds approximately {profit} of annual operating profit versus the no-AI baseline, for an ROI of {roi}.",
      "analysis.aiNegative": "At steady state, AI reduces annual operating profit by approximately {profit} versus the no-AI baseline, producing an ROI of {roi}.",
      "analysis.breakEven": "Holding other inputs constant, gross task speed uplift must reach approximately {value} for recurring AI economics to break even.",
      "analysis.breakEvenNone": "No gross task speed uplift up to 1,000% creates a revenue-only break-even under current demand, cost, and overhead assumptions.",
      "analysis.size": "A similar organization requires approximately {value} FTE to absorb fixed platform and transformation cost.",
      "analysis.sizeNone": "Per-employee AI value is below variable AI cost, so scale alone does not make the scenario positive.",
      "analysis.attribution": "<strong>Baseline attribution:</strong> {attribution} {safety} Capacity available for further review is {safeFte} FTE after growth allocation, work requiring human ownership, and the risk buffer.",
      "analysis.attributionNone": "The target is infeasible in at least one baseline, so the model cannot isolate an AI-attributed workforce difference.",
      "analysis.attributionIncrease": "The no-AI baseline already requires {baseline} FTE of modeled adjustment. AI increases that financial pressure by {delta} FTE.",
      "analysis.attributionReduce": "The no-AI baseline requires {baseline} FTE of modeled adjustment. AI reduces that pressure by {delta} FTE.",
      "analysis.attributionZero": "The AI scenario does not change modeled workforce pressure relative to the no-AI baseline.",
      "analysis.safetyWithin": "Modeled AI scenario pressure is within the capacity available for further review, but still requires role-level validation.",
      "analysis.safetyAbove": "Modeled pressure is above the capacity available for further review and must not be interpreted as AI-replaceable staffing.",
      "analysis.cash": "<strong>Cash timing and labor market:</strong> Year-one incremental cash flow is {cash}, while {years}-year NPV is {npv}. At the {country} labor-cost benchmark, each US$1 of AI cost corresponds to approximately US${coverage} of financially realizable labor value. Replace defaults with measured task duration, quality, demand, and billing evidence before any operating decision.",
    },
    "zh-TW": {
      "language.label": "語言",
      "reset": "重設目前情境",
      "preset.collapse": "收合",
      "preset.expand": "展開",
      "help.about": "關於「{title}」",
      "mobile.workspace": "試算器工作區",
      "mobile.view.inputs": "設定",
      "mobile.view.analysis": "分析",
      "mobile.view.analysisWithVerdict": "分析：{verdict}",
      "mobile.expand": "展開「{title}」",
      "mobile.collapse": "收合「{title}」",
      "mobile.inputs.company": "企業基準",
      "mobile.inputs.ai": "AI 營運假設",
      "mobile.inputs.strategy": "價值實現策略",
      "mobile.inputs.paths": "通往正向經濟效益的路徑",
      "mobile.results.attribution": "基準歸因",
      "mobile.results.interpretation": "研究性解讀",
      "mobile.results.cash": "多年度現金經濟",
      "mobile.results.uncertainty": "不確定性分析",
      "mobile.results.performance": "規模與效能",
      "mobile.results.tradeoff": "營收與人力權衡",
      "mobile.results.native": "AI-native 基準",
      "mobile.results.labor": "不同市場人力成本回收",
      "mobile.summary.company": "{employees} FTE · 營收 {revenue}",
      "mobile.summary.ai": "曝險 {exposure} · 採用 {adoption} · 效率 {speed}",
      "mobile.summary.strategy": "目標利益率 {margin} · 需求上限 {demand}",
      "mobile.summary.paths": "{count} 條測試路徑可達正向",
      "mobile.summary.pathsPositive": "目前假設已達正向經濟效益",
      "mobile.summary.attribution": "AI 歸因變化 {value}",
      "mobile.summary.cash": "情境 NPV {value}",
      "mobile.summary.uncertainty": "基準情境 NPV {value}",
      "mobile.summary.breakEven": "損益兩平效率 {value}",
      "mobile.summary.adjustment": "模型人力調整 {value}",
      "mobile.summary.avoided": "可能避免新增 {value} 人",
      "mobile.summary.labor": "{country}：每 US$1 AI 對應 US${value} 人力價值",
      "source.synthetic": "合成模型情境。各國人力成本為可編輯假設，不是官方統計。模型版本：2026-06-07。",
      "source.public": "公開來源：{links}。未公開的 AI、需求與組織人力參數皆為可編輯假設。模型版本：2026-06-07。",
      "preset.customMargin": "請選擇可比較的商業模式，並以內部資料取代毛利率假設。",
      "preset.loadedMargin": "已載入毛利率：{margin}%。僅應作為相似商業模式的研究起點。",
      "salary.reference": "{country}參考值：{amount}。請以企業實際完整人力成本取代。",
      "result.vsCurrent": "相較目前 {value}",
      "result.annualProfitDelta": "年度利益差額 {value}",
      "result.additionalWork": "增加 {value} FTE 的工作負擔",
      "result.outputFte": "相當於 {value} FTE 的產出",
      "result.noRevenueBreakEven": "無法僅靠營收達成損益兩平",
      "result.noPositiveRange": "沒有正向區間",
      "result.noFeasible": "沒有可行解",
      "result.notAttributable": "無法歸因",
      "result.capacityNote": "總節省時間 {saved}，扣除 {overhead} 的審核、修正重做與 AI 管理時間",
      "result.disclosedReference": "；公開組織重整參考為 {count} 個職位",
      "result.deltaIncreases": "AI 假設使模型壓力增加 {count} FTE{reference}",
      "result.deltaReduces": "AI 假設使模型壓力降低 {count} FTE{reference}",
      "result.deltaZero": "AI 未改變模型中的組織人力壓力{reference}",
      "result.deltaUnavailable": "至少一個基準下無法達成目標，因此不能隔離 AI 歸因差額。",
      "result.nativeAdvantage": "相較目前 RPE 為 {value}。此數值描述未來可能避免新增的人力，不是目前組織人力調整建議。",
      "horizon.npvNote": "以 {rate}% 折現率計算 {years} 年 NPV",
      "horizon.year": "第 {year} 年",
      "horizon.beyond": "超過 {years} 年",
      "horizon.realized": "第 {year} 年 · 實現 {value} 價值",
      "horizon.cumulative": "累積 {value}",
      "uncertainty.conservative": "保守",
      "uncertainty.base": "基準",
      "uncertainty.upside": "正向",
      "uncertainty.npv": "{value} NPV",
      "uncertainty.roi": "穩態 ROI {roi} · 第一年現金流 {cash}",
      "uncertainty.required": "仍需增加營收 {value}",
      "scenario.highCount": "{count} 項高敏感度訊號",
      "scenario.watchCount": "{count} 項訊號需要驗證",
      "scenario.none": "沒有高敏感度訊號",
      "scenario.mechanism": "可能機制",
      "scenario.direction": "研究方向",
      "scenario.currentPositive": "目前假設已達到可能具備正向經濟效益",
      "scenario.pathsFound": "找到 {count} 條測試路徑可達正向經濟效益",
      "scenario.noPath": "目前測試範圍內沒有可達正向經濟效益的路徑",
      "scenario.apply": "套用此測試",
      "scenario.reachesPositive": "可達正向",
      "scenario.closest": "可改善結果",
      "scenario.roiChange": "AI ROI {before} → {after}",
      "scenario.npvChange": "NPV {before} → {after}",
      "scenario.requiredChange": "營收缺口 {before} → {after}",
      "chart.companyScale": "公司規模（FTE）",
      "chart.speed": "任務總效率提升",
      "chart.revenueGrowth": "額外營收成長",
      "chart.workforce": "模型組織人力調整",
      "chart.aiScenario": "AI 情境：{value}",
      "chart.noSolution": "沒有可行解",
      "country.trackTitle": "每 US$1 AI 成本對應的人力成本價值",
      "country.row": "每 100 FTE：可實現人力價值 {labor} ÷ 年度 AI 成本 {ai}",
      "country.breakEven": "依目前用量與固定成本分攤，完整年度人力成本約需達到每 FTE <b>{breakEven}</b>，可實現人力價值才會等於 AI 支出。可編輯的{country}參考值為 {salary}。",
      "country.noBreakEven": "目前沒有可財務實現的釋放工時，因此無法計算僅依人力價值的損益兩平成本。",
      "country.inputLabel": "{country}完整年度人力成本參考值（美元）",
      "export.industry": "產業",
      "export.generatedAt": "產生時間：{date}",
      "export.openPrint": "請在瀏覽器列印視窗中選擇「儲存為 PDF」。",
      "scenario.positiveEvidence": "目前 AI ROI 為 {roi}，{years} 年 NPV 為 {npv}。請以保守情境與實測資料確認結果是否穩定。",
      "breakdown.noSolution": "70% 範圍內無解",
      "breakdown.noAiMargin": "未導入 AI 的營業利益率",
      "breakdown.baselinePressure": "基準壓力：{value}",
      "breakdown.aiMargin": "AI 情境營業利益率",
      "breakdown.aiPressure": "AI 情境壓力：{value}",
      "breakdown.delta": "AI 歸因差額",
      "breakdown.deltaNote": "正數表示 AI 增加壓力；負數表示 AI 降低壓力",
      "breakdown.target": "使用者目標",
      "breakdown.safe": "可進一步評估的人力空間為 {value} FTE",
      "verdict.label": "AI 負擔能力判斷",
      "verdict.pilot": "需高度控制試點規模進行驗證",
      "verdict.positive": "可能具備正向經濟效益",
      "verdict.negative": "目前假設無法成立",
      "verdict.note.positive": "目前假設顯示企業可能具備 AI 經濟負擔能力，但仍需以實測證據與保守壓力測試確認。",
      "verdict.note.caution": "模型尚不支持大規模導入。企業必須縮小試點範圍，並以採用率、品質、需求與成本證據作為擴大門檻。",
      "verdict.note.negative": "目前假設顯示企業尚不具備 AI 經濟負擔能力。擴大前應重新檢視範圍、需求、成本或目標利益率。",
      "warning.laborCost": "平均人力成本高於目前財務輸入可提供的毛利。模型已將非薪資營業費用下限設為零，請檢查人力成本或財務假設。",
      "warning.targetMargin": "目標營業利益率必須低於毛利率。",
      "warning.negativeProductivity": "人工審核、修正重做與 AI 管理時間高於總節省時間，目前 AI 情境產生負向淨生產力。",
      "warning.demandCap": "依產能推估的 AI 營收超過已驗證需求上限，模型已限制增量營收。",
      "warning.infeasible": "即使測試最高 70% 的組織人力調整，目標利潤率仍不可行。",
      "warning.capacity": "模型組織人力壓力高於可進一步評估的人力空間。此缺口必須透過營收、非人力成本、AI 成本或不同目標處理。",
      "path.set": "將「{title}」調整為 {value}",
      "path.detail": "測試在其他假設不變時，將「{title}」調整到此程度是否能實質改善目前經濟結果。",
      "path.combined": "組合調整測試",
      "analysis.overall": "<strong>整體判讀：</strong>目前 RPE 約為 {currentRpe}，營業利益率為 {margin}。扣除審核、修正重做與 AI 管理時間後，模型淨生產力變化為 {productivity}。AI 調整後 RPE 為 {projectedRpe}，相較目前變化 {rpeChange}。",
      "analysis.investment": "<strong>投資經濟：</strong>{economics} {breakEven} {size} 此情境仍需增加相當於目前營收 {requiredGrowth} 的收入，AI 增量才能損益兩平。",
      "analysis.aiPositive": "穩態下，AI 相較未導入基準每年增加約 {profit} 的營業利益，ROI 為 {roi}。",
      "analysis.aiNegative": "穩態下，AI 相較未導入基準每年降低約 {profit} 的營業利益，ROI 為 {roi}。",
      "analysis.breakEven": "其他輸入不變時，任務總效率提升需達約 {value}，持續性 AI 經濟效益才能損益兩平。",
      "analysis.breakEvenNone": "在目前需求、成本與負擔假設下，即使任務總效率提升至 1,000%，仍無法僅靠營收達成損益兩平。",
      "analysis.size": "相似組織約需 {value} FTE，才能吸收固定平台與轉型成本。",
      "analysis.sizeNone": "每位員工的 AI 價值低於變動 AI 成本，因此單靠擴大規模無法讓情境轉正。",
      "analysis.attribution": "<strong>基準歸因：</strong>{attribution} {safety} 套用成長配置、仍需人類負責的工作與風險緩衝後，可進一步評估的人力空間為 {safeFte} FTE。",
      "analysis.attributionNone": "至少一個基準下無法達成目標，因此模型不能隔離 AI 歸因的組織人力差額。",
      "analysis.attributionIncrease": "未導入 AI 的基準原已需要 {baseline} FTE 的模型調整，AI 又使財務壓力增加 {delta} FTE。",
      "analysis.attributionReduce": "未導入 AI 的基準需要 {baseline} FTE 的模型調整，AI 使此壓力降低 {delta} FTE。",
      "analysis.attributionZero": "AI 情境相對未導入 AI 的基準，沒有改變模型組織人力壓力。",
      "analysis.safetyWithin": "模型 AI 情境壓力位於可進一步評估的人力空間內，但仍需職務層級驗證。",
      "analysis.safetyAbove": "模型壓力高於可進一步評估的人力空間，不可解讀為可由 AI 取代的組織人力。",
      "analysis.cash": "<strong>現金時點與人力市場：</strong>第一年增量現金流為 {cash}，{years} 年 NPV 為 {npv}。依{country}人力成本基準，每 US$1 AI 成本約對應 US${coverage} 的可財務實現人力價值。在任何營運決策前，都應以實測任務時間、品質、需求與計費證據取代預設值。",
    },
  };

  Object.entries(localePacks.messages || {}).forEach(([code, pack]) => {
    messages[code] = { ...messages.en, ...pack };
  });

  const staticTranslationsByLocale = {
    "zh-TW": staticTranslations,
    ...(localePacks.static || {}),
  };
  const reverseStaticTranslations = {};
  Object.values(staticTranslationsByLocale).forEach((pack) => {
    Object.entries(pack).forEach(([english, translated]) => {
      reverseStaticTranslations[translated] = english;
    });
  });

  let locale = supportedLocales.has(localStorage.getItem(STORAGE_KEY))
    ? localStorage.getItem(STORAGE_KEY)
    : "en";

  function interpolate(template, variables = {}) {
    return String(template).replace(/\{(\w+)\}/g, (_, key) =>
      Object.prototype.hasOwnProperty.call(variables, key) ? variables[key] : `{${key}}`
    );
  }

  function t(key, variables) {
    const template = messages[locale]?.[key] ?? messages.en[key] ?? key;
    return interpolate(template, variables);
  }

  function translateTerm(english) {
    if (locale === "en") return english;
    return staticTranslationsByLocale[locale]?.[english] || english;
  }

  function translateTextNode(node) {
    const value = node.nodeValue;
    const trimmed = value.trim().replace(/\s+/g, " ");
    if (!trimmed) return;
    const english = reverseStaticTranslations[trimmed] || trimmed;
    const translated =
      locale === "en"
        ? english
        : staticTranslationsByLocale[locale]?.[english] || english;
    if (!translated || translated === trimmed) return;
    const leading = value.match(/^\s*/)?.[0] || "";
    const trailing = value.match(/\s*$/)?.[0] || "";
    node.nodeValue = `${leading}${translated}${trailing}`;
  }

  function translateStatic(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (!["SCRIPT", "STYLE"].includes(node.parentElement?.tagName)) {
        translateTextNode(node);
      }
      node = walker.nextNode();
    }

    root.querySelectorAll("[title], [aria-label]").forEach((item) => {
      ["title", "aria-label"].forEach((attribute) => {
        const value = item.getAttribute(attribute);
        if (!value) return;
        const english = reverseStaticTranslations[value] || value;
        const translated =
          locale === "en"
            ? english
            : staticTranslationsByLocale[locale]?.[english] || english;
        if (translated) item.setAttribute(attribute, translated);
      });
    });

    document.documentElement.lang = locale;
    const metaContent = localePacks.meta?.[locale] || localePacks.meta?.en;
    document.title =
      metaContent?.title || "AI ROI Calculator - Can My Company Afford AI?";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content =
        metaContent?.description ||
        "A local-first, open-source AI ROI calculator for exploring whether an organization can economically afford AI.";
    }
    const languageSelect = document.querySelector("#language-select");
    if (languageSelect) languageSelect.value = locale;
  }

  function setLocale(nextLocale, { notify = true } = {}) {
    if (!supportedLocales.has(nextLocale)) return;
    locale = nextLocale;
    localStorage.setItem(STORAGE_KEY, locale);
    translateStatic();
    if (notify) {
      window.dispatchEvent(
        new CustomEvent("ai-calculator-locale-change", { detail: { locale } })
      );
    }
  }

  global.AII18n = {
    get locale() {
      return locale;
    },
    isChinese: () => locale === "zh-TW",
    getPresetCopy: (presetKey) => {
      const entry = localePacks.presetCopy?.[locale]?.[presetKey];
      return entry
        ? { name: entry[0], industry: entry[1], note: entry[2] }
        : null;
    },
    getLocalizedHelp: (key) => {
      const title = localePacks.helpTitles?.[locale]?.[key];
      if (!title) return null;
      const generic = localePacks.genericHelp?.[locale];
      return {
        title,
        meaning: localePacks.helpMeaning?.[locale]?.[key] || title,
        impact: generic.impact,
        example: generic.example,
        guidance: generic.guidance,
      };
    },
    availableLocales,
    setLocale,
    staticTranslations,
    staticTranslationsByLocale,
    t,
    translateTerm,
    translateStatic,
  };

  translateStatic();
})(window);
