"use strict";

const {
  COUNTRIES,
  MODEL_DEFAULTS,
  PRESETS,
  calculate,
  countryComparison,
  diagnoseScenarios,
  findRequiredCuts,
  positiveZoneValue,
} = window.AICalculator;

const i18n = window.AII18n;
const t = (key, variables) => i18n.t(key, variables);
const INTRO_VIEWED_KEY = "ai-efficiency-calculator-intro-viewed-v1";
const MOBILE_UI_STORAGE_KEY = "ai-efficiency-calculator-mobile-ui-v1";
const MOBILE_LAYOUT_QUERY = window.matchMedia("(max-width: 820px)");
const MOBILE_UI_DEFAULTS = {
  activeView: "inputs",
  openInputSection: "company",
  openAnalysisSection: "attribution",
};

const inputIds = [
  "country",
  "employees",
  "revenue",
  "operatingProfit",
  "grossMargin",
  "historicalGrowth",
  "salary",
  "exposure",
  "efficiency",
  "adoption",
  "quality",
  "reviewOverhead",
  "reworkOverhead",
  "aiOpsOverhead",
  "aiCostPerEmployee",
  "fixedAiCost",
  "transitionCost",
  "amortizationYears",
  "productInferenceCostRate",
  "redeployShare",
  "revenueConversion",
  "automationShare",
  "year1Realization",
  "riskBuffer",
  "targetMargin",
  "revenueLossPerCut",
  "severanceMonths",
  "demandCeiling",
  "analysisYears",
  "discountRate",
];

const sliderIds = [
  "exposure",
  "efficiency",
  "adoption",
  "quality",
  "reviewOverhead",
  "reworkOverhead",
  "aiOpsOverhead",
  "redeployShare",
  "revenueConversion",
  "automationShare",
  "year1Realization",
  "riskBuffer",
];

const PRESET_COPY_EN = {
  custom: {
    name: "Custom company",
    industry: "Custom / unclassified",
    note: "Start with editable demonstration values. All financial amounts are in US dollars.",
  },
  smbEcommerce: {
    name: "Retail e-commerce SMB · Synthetic",
    industry: "Retail e-commerce / 75 employees",
    note: "A synthetic 75-person retailer for studying AI in customer service, merchandising, content, marketing, and back-office operations.",
  },
  smallRestaurant: {
    name: "Independent restaurant · Synthetic",
    industry: "Food service / 14 employees",
    note: "A synthetic 14-person restaurant where AI exposure is concentrated in reservations, marketing, purchasing, scheduling, and administration rather than food preparation or service.",
  },
  twHardwareSmb: {
    name: "Taiwan hardware manufacturer · Synthetic",
    industry: "Hardware manufacturing / 750 employees",
    note: "A synthetic Taiwan-based hardware manufacturer for studying lower-margin production, quality-sensitive workflows, and locally priced labor.",
  },
  meta: {
    name: "Meta · FY2025",
    industry: "Advertising and social platform",
    note: "Public FY2025 financial and employee data with editable AI operating assumptions.",
  },
  google: {
    name: "Google / Alphabet · FY2025",
    industry: "Advertising, cloud, and digital platforms",
    note: "Alphabet consolidated public financial data with editable AI operating assumptions.",
  },
  amazon: {
    name: "Amazon · FY2025",
    industry: "Commerce, cloud, and logistics",
    note: "Amazon consolidated data. AWS has segment financials but no independently disclosed employee count.",
  },
  apple: {
    name: "Apple · FY2025",
    industry: "Consumer hardware and digital services",
    note: "Public FY2025 financial and employee data with editable AI operating assumptions.",
  },
  tsmc: {
    name: "TSMC · FY2025",
    industry: "Semiconductor manufacturing / hardware",
    note: "Public FY2025 financial, margin, and employee data with editable AI assumptions.",
  },
  nvidia: {
    name: "NVIDIA · FY2026",
    industry: "Semiconductors and AI infrastructure / hardware",
    note: "Public FY2026 financial and employee data. Internal AI productivity assumptions are not company disclosures.",
  },
  airbnb: {
    name: "Airbnb · FY2025",
    industry: "Travel marketplace",
    note: "Public FY2025 financial and employee data with editable AI operating assumptions.",
  },
  uber: {
    name: "Uber · FY2025",
    industry: "Mobility and delivery marketplace",
    note: "Public FY2025 financial and employee data with editable AI operating assumptions.",
  },
  netflix: {
    name: "Netflix · FY2025",
    industry: "Subscription video / digital media",
    note: "Public FY2025 financial and employee data with editable AI operating assumptions.",
  },
  spotify: {
    name: "Spotify · FY2025",
    industry: "Subscription audio / digital media",
    note: "Public FY2025 euro-denominated data converted to US dollars using the documented model exchange-rate assumption.",
  },
  salesforce: {
    name: "Salesforce · FY2026",
    industry: "Enterprise SaaS",
    note: "Public FY2026 financial and employee data with editable AI operating assumptions.",
  },
  tesla: {
    name: "Tesla · FY2025",
    industry: "Automotive, energy, and hardware manufacturing",
    note: "Public FY2025 financial and employee data with editable AI operating assumptions.",
  },
  cloudflare: {
    name: "Cloudflare · FY2025",
    industry: "SaaS / cloud infrastructure",
    note: "Public FY2025 financial and employee data with editable AI operating assumptions.",
  },
  aiNative: {
    name: "AI-native startup · Synthetic",
    industry: "AI-native SaaS / synthetic",
    note: "A synthetic scenario for studying small teams, high adoption, and future hiring avoided.",
  },
};

const HELP_CONTENT_ZH = {
  "preset-select": {
    title: "企業情境",
    meaning: "載入一組公開企業財務基準或合成研究案例。案例涵蓋 SMB 零售電商、餐飲、台灣硬體製造，以及大型廣告平台、企業 SaaS、雲端、半導體、Marketplace 與訂閱內容等產業。",
    impact: "切換案例會覆寫左側輸入，讓不同產業的 RPE、毛利率、規模與人力成本進入相同模型，觀察同一 AI 假設為何可能產生不同結果。",
    example: "可比較 14 人餐廳、75 人零售電商與 750 人台灣硬體製造商，觀察可受 AI 影響的工作比例、毛利與固定成本如何改變結果。",
    guidance: "公開企業財報與 SMB 合成數值都只是研究起點，不是產業標準。AI 效率、成本、採用與營收轉換均需由企業內部資料取代。",
  },
  country: {
    title: "所在市場",
    meaning: "企業主要雇用人才及承擔人力成本的市場。它會決定預設 fully-loaded 薪資，也用於下方國家成本比較。",
    impact: "當地人力成本越低，同一筆全球定價的模型/API 費用越難只靠省工時回收；此時通常更需要營收成長或全球市場收入。",
    example: "台灣公司服務美國客戶時，所在市場可選台灣，但年度營收仍填全球營收，藉此測試『台灣成本、全球收入』模式。",
    guidance: "市場不是公司註冊地，而是本次分析的人力成本所在地。跨國團隊第一版可使用加權平均值。",
  },
  employees: {
    title: "員工人數",
    meaning: "目前納入分析的全職等效人數 FTE。若只分析單一部門，請填該部門人數並同步填該部門營收或可歸屬價值。",
    impact: "人數會影響總 AI 帳號/API 成本、可釋放 FTE、固定成本攤提與公司規模門檻。",
    example: "公司有 80 名正職與 20 名半職，可先填 90 FTE，而不是直接填 100 人。",
    guidance: "承包商若已計入其他營運成本，不要重複算進 FTE；若承包商會被 AI 替代，可換算成 FTE 納入。",
  },
  revenue: {
    title: "年度營收",
    meaning: "最近完整年度或未來十二個月的營收，單位為百萬美元。它與員工人數共同形成目前 Revenue per Employee。",
    impact: "營收越高，RPE 與每單位釋放產能可支持的新增收入通常越高，全面導入 AI 的固定成本也較容易被吸收。",
    example: "年度營收 US$12,500,000 請填 12.5；不是填 12,500,000。",
    guidance: "使用同一會計期間的營收、利益與員工人數。高成長新創可改用 ARR，但所有比較案例都必須一致。",
  },
  operatingProfit: {
    title: "營業利益",
    meaning: "營收扣除營業成本與營業費用後的利益，尚未計入利息與稅。虧損公司可輸入負數。",
    impact: "模型用它反推目前非人力營運費用，並衡量 AI 導入後是否達到目標營業利益率。",
    example: "營收 US$20M、營業虧損 US$2M，請填 -2。",
    guidance: "建議採 GAAP/IFRS 營業利益，避免與調整後 EBITDA 混用；若改用非 GAAP，其他輸入也要採相同口徑。",
  },
  grossMargin: {
    title: "毛利率",
    meaning: "每一美元營收扣除直接交付成本後，能用於支付薪資、AI、行銷、研發及管理費用的比例。",
    impact: "新增營收只有乘上毛利率後才會變成可用利益。毛利率低的公司需要更高營收成長才能回收同一筆 AI 支出。",
    example: "營收 US$10M、銷貨成本 US$3M，毛利率為 70%。",
    guidance: "AI 推論若是產品交付的一部分，相關成本通常屬於 COGS，應反映在毛利率，而不是只放在內部 AI 成本。",
  },
  historicalGrowth: {
    title: "歷史營收成長率",
    meaning: "在沒有本次 AI 計畫時，公司原本可合理預期的年度營收成長基準。",
    impact: "模型先計入自然成長，再估算 AI 額外帶來的營收，因此不會把所有未來成長都誤歸因於 AI。",
    example: "過去三年成長率為 8%、12%、10%，可先填約 10%，再做保守與樂觀情境。",
    guidance: "成熟企業宜使用 3 年平均或管理層 guidance；高波動新創應至少建立低、中、高三組情境。",
  },
  salary: {
    title: "平均 fully-loaded 人力成本",
    meaning: "每位 FTE 一年的完整雇主成本，不只是底薪，通常包含獎金、雇主稅負、保險、福利、設備、辦公空間及股權薪酬。",
    impact: "此數字越高，AI 釋放一小時人力的財務價值越高；低薪市場則需要更高效率或更多營收價值才能回本。",
    example: "年薪 US$60k、福利與稅負 US$15k、股權 US$10k、設備及空間 US$5k，fully-loaded cost 約 US$90k。",
    guidance: "若職務差異很大，先用薪資支出總額除以平均 FTE；未來版本可再拆工程、銷售、客服等職類。",
  },
  exposure: {
    title: "AI 可影響工作比例",
    meaning: "全部工作時間中，有多少比例的任務可由 AI 加速、輔助或自動化。這是任務曝險，不代表可直接刪除同等比例職位。",
    impact: "它與效率提升、採用率、品質保留率相乘，形成有效產能提升。任何一項偏低都會壓低最終效果。",
    example: "工程師有 50% 時間寫程式與文件、20% 溝通、30% 決策；若 AI 主要影響前 50%，可先填 50%。",
    guidance: "建議用一至兩週工時抽樣或流程盤點估算，避免直接引用『某職業有 X% 可被 AI 取代』的外部數字。",
  },
  efficiency: {
    title: "受影響工作的效率提升",
    meaning: "只針對可被 AI 影響的任務，完成同等品質成果所增加的產能。100% 代表該部分產能加倍，不代表全公司效率加倍。",
    impact: "效率越高，可釋放 FTE、AI-native RPE 與新增營收潛力越高，也更容易跨過 AI 損益兩平效率。",
    example: "原本任務需要 10 小時，使用 AI 後 7 小時完成，效率提升約 43%，因為 10 ÷ 7 - 1 ≈ 43%。",
    guidance: "應以相同品質與完整流程計時，包含提示、審核、修正、部署及溝通，不要只量模型產生答案的時間。",
  },
  adoption: {
    title: "實際採用率",
    meaning: "可使用 AI 的工作中，員工實際、持續且正確使用 AI 的比例。",
    impact: "工具即使很強，若只有少數人使用或使用頻率低，組織層級的有效產能提升仍會有限。",
    example: "70% 員工每天使用，但只有一半相關任務真正套用，較合理的採用率可能是 35%，不是 70%。",
    guidance: "可用週活躍使用者、AI 任務數占比與流程稽核共同估算，避免只看帳號開通率。",
  },
  quality: {
    title: "品質保留率",
    meaning: "AI 輔助後的成果，有多少能在納入錯誤、修正重做、人工審核與風險後維持原本品質。",
    impact: "品質保留率會折減表面效率。若 AI 速度快但需要大量修正，最終有效產能可能遠低於工具展示。",
    example: "AI 讓初稿快 50%，但 15% 產出需重做，可先以 85% 品質保留率進行情境測試。",
    guidance: "法務、醫療、安全與核心架構等高風險工作應採更嚴格數值，並將必要人工覆核時間算進效率測試。",
  },
  reviewOverhead: {
    title: "人工審核負擔",
    meaning: "因使用 AI 而增加的人工審核時間，以原始任務時間的比例表示。",
    impact: "審核時間會從總節省時間中扣除；即使生成很快，也可能使淨生產力轉為負值。",
    example: "原本十小時的任務若新增一小時審核，請填 10%。",
    guidance: "請量測完整核准流程，包括法遵、資安與資深人員審核。",
  },
  reworkOverhead: {
    title: "修正重做時間",
    meaning: "修正、重新生成或修復 AI 輔助產出的時間，以原始任務時間的比例表示。",
    impact: "修正重做時間越高，淨釋放時間與可歸因於 AI 的經濟價值越低。",
    example: "十小時基準任務若需兩小時修正，請填 20%。",
    guidance: "請使用觀察到的缺陷與修訂資料，而非自行回報的節省時間。",
  },
  aiOpsOverhead: {
    title: "AI 管理時間",
    meaning: "持續用於提示維護、脈絡準備、評測、監控與事故處理的時間。",
    impact: "這項持續性組織負擔會在生產力轉換為產能前扣除。",
    example: "每十小時受影響工作需一小時 AI 管理，請填 10%。",
    guidance: "若工程人力成本已包含在固定 AI 平台成本，請勿在此重複計入。",
  },
  aiCostPerEmployee: {
    title: "每位員工年度 AI 成本",
    meaning: "隨使用者或使用量增加的年度成本，例如 ChatGPT/Claude/Gemini 帳號、API tokens、agent 執行、向量資料庫及按量工具費。",
    impact: "人數越多，這項成本線性增加。高薪市場較容易回收；低薪市場可能需要限制高階模型用量或改用較便宜模型。",
    example: "每人每月工具 US$100，加上平均 API US$200，年度成本為 (100 + 200) × 12 = US$3,600。",
    guidance: "建議用實際帳單除以活躍使用者，並另做尖峰用量情境；產品對外推論成本應放入毛利率。",
  },
  fixedAiCost: {
    title: "固定 AI 成本",
    meaning: "不會隨員工人數或單次使用量等比例變動、且每年持續發生的 AI 基礎成本。",
    impact: "固定成本讓小公司需要達到最低規模才能攤平；規模越大，每人分攤越低。它直接提高 AI 損益兩平效率與規模門檻。",
    example: "可能包括：企業級 AI 平台最低年約、私有模型/GPU 保留容量、資料管線與向量庫基礎設施、AI 安全監控、模型評測系統，以及固定 AI 平台團隊。例如兩名平台工程師 US$300k，加上基礎雲端 US$100k，可填 US$0.4M。",
    guidance: "顧問若只在導入期發生，應放在一次性轉型成本；持續性的代管服務或平台管理合約才放這裡。",
  },
  transitionCost: {
    title: "一次性轉型成本",
    meaning: "為了從現行流程轉成 AI-enabled operating model，在導入期發生、之後不會每年等額重複的支出。",
    impact: "模型會依攤提年限換算成年成本。轉型成本高會延長回收期，並使大型 legacy 組織比 AI-native 公司更難快速獲利。",
    example: "可能包括：顧問與流程重設、資料清理與系統整合、員工訓練、權限與資安改造、法遵審查、舊系統遷移、重複運行期間成本。若顧問 US$200k、整合 US$500k、訓練 US$100k，共 US$0.8M。",
    guidance: "硬體若預計多年使用，可放在轉型成本並依使用年限攤提；每年續約、雲端保留容量或維護費應放固定 AI 成本。",
  },
  amortizationYears: {
    title: "轉型成本攤提期間",
    meaning: "將一次性轉型支出分攤到多少年，以估計穩態年度負擔。",
    impact: "年限越長，年度 AI 成本與短期營收門檻越低，但不會改變實際現金已支出的總額。",
    example: "US$3M 轉型成本攤提 3 年，模型每年計入 US$1M。",
    guidance: "軟體與流程改造常用 2–3 年；硬體可依預期使用年限。另行評估第一年現金流，不要只看攤提後 ROI。",
  },
  productInferenceCostRate: {
    title: "產品推論成本率",
    meaning: "隨 AI 歸因產品營收增加的 AI 交付成本，以該營收比例表示。",
    impact: "它會降低 AI 營收的貢獻毛利，避免把產品推論視為免費。",
    example: "每 US$100 相關營收需 US$5 AI 交付成本，請填 5%。",
    guidance: "請使用產品遙測與雲端帳單。內部員工工具應放在每人或固定 AI 成本。",
  },
  redeployShare: {
    title: "釋放產能投入營收成長",
    meaning: "AI 釋放的等效工時中，有多少保留給產品、銷售、服務量擴張與新市場，而不是用於減少人力。",
    impact: "比例越高，模型推估的新增營收越高、可安全調整的人力越少；這是 growth path 與 efficiency path 的主要選擇。",
    example: "AI 釋放 20 FTE，若其中 12 FTE 投入新產品與獲客，請填 60%。",
    guidance: "高成長或需求未滿足的公司通常應偏高；需求有限、重複性後台流程較多的公司才可能偏低。",
  },
  revenueConversion: {
    title: "產能轉換營收效率",
    meaning: "投入成長的等效 FTE，能以目前 Revenue per Employee 的多少比例轉成新增營收。",
    impact: "它用來避免假設每一小時省下來都能立即創造完整 RPE。市場需求、產品成熟度與銷售週期都會降低轉換率。",
    example: "10 個等效 FTE、目前 RPE US$200k、轉換率 50%，模型估算新增營收為 US$1M。",
    guidance: "沒有可證明需求時可先用 20–40%；已有 backlog、候補客戶或明確產品 roadmap 時可使用較高數值。",
  },
  automationShare: {
    title: "可結構性自動化比例",
    meaning: "釋放時間中可從必要營運產能移除的比例，而非僅改善品質或便利性。",
    impact: "只有這部分會進入「可進一步評估的人力空間」。",
    example: "若一半釋放時間仍必須保留人類責任歸屬，請填 50% 或更低。",
    guidance: "請在職務與流程層級估算。任務曝險不等於可移除的職位產能。",
  },
  year1Realization: {
    title: "第一年價值實現比例",
    meaning: "預期在第一年實現的穩態 AI 價值比例。",
    impact: "它會改變第一年現金流、多年度 NPV 與回收期，但不會降低初始轉型現金支出。",
    example: "若採用與流程重設預計第一年只能實現不到一半穩態價值，可填 40%。",
    guidance: "當導入、資料存取、訓練或採購尚未完成時，請採保守數值。",
  },
  riskBuffer: {
    title: "人力調整風險緩衝",
    meaning: "從理論可釋放 FTE 中保留的安全比例，用於處理需求波動、AI 失效、管理工作、知識傳承與關鍵人備援。",
    impact: "緩衝越高，風險調整後可減少人力上限越低，但組織韌性較高。",
    example: "理論上可釋放 20 FTE，風險緩衝 30%，且其中一半投入營收，安全上限約為 7 FTE。",
    guidance: "第一年導入或高監管產業建議提高；只有在 AI 流程經過多季穩定驗證後才逐步降低。",
  },
  targetMargin: {
    title: "目標營業利益率",
    meaning: "導入 AI、自然營收成長與可能的人力調整後，希望達到的穩態營業利益占營收比例。",
    impact: "目標越高，模型要求的營收成長或人力調整越大。若高於毛利率，數學上不可行。",
    example: "營收 US$100M、目標營業利益 US$15M，請填 15%。",
    guidance: "可用同業中位數、董事會目標或現金跑道要求設定；不要只為得到特定人力調整數字而任意提高。",
  },
  revenueLossPerCut: {
    title: "每調整 1% 人力的營收損失",
    meaning: "當人力減少 1% 時，因交付、產品速度、銷售、客服、士氣與知識流失造成的預期營收下降百分比。",
    impact: "數值越高，組織人力調整的成本節省越容易被營收損失抵銷，甚至可能不存在可達成目標利益率的可行解。",
    example: "填 0.30% 表示人力每減少 10%，模型估算營收約減少 3%。",
    guidance: "這是高度敏感參數。收入直接依賴人力的顧問、服務與銷售組織應較高；自動化程度高的軟體產品可較低。",
  },
  severanceMonths: {
    title: "平均一次性人力調整成本",
    meaning: "每位被調整員工的一次性現金成本，以平均幾個月 fully-loaded 薪資表示。",
    impact: "它不改變穩態所需人數，但會增加第一年現金支出並延長實際回收期。",
    example: "離職補償、通知期、未休假、法律與安置費合計約半年人力成本，可填 6 個月。",
    guidance: "需依國家勞動法、合約、年資與股權條件估算。本工具不是法律或人資建議。",
  },
  demandCeiling: {
    title: "已驗證 AI 需求上限",
    meaning: "目前市場證據可支持 AI 產能創造的最高年度營收，以目前營收比例表示。",
    impact: "AI 歸因營收會限制在產能潛力與此需求上限兩者較低者。",
    example: "目前營收 US$20M，已驗證商機為 US$2M，可先填 10%。",
    guidance: "請將此輸入連結到待辦訂單、合格商機、轉換測試、定價證據或交付限制。",
  },
  analysisYears: {
    title: "分析期間",
    meaning: "用於現金流與 NPV 分析的年數。",
    impact: "較長期間可讓延後發生的生產力效益抵銷初始轉型成本，但也會增加預測不確定性。",
    example: "一般軟體與流程轉型可先使用三年。",
    guidance: "不要只為了讓 NPV 轉正而延長期間。",
  },
  discountRate: {
    title: "折現率",
    meaning: "將未來增量現金流換算為現值的年度比率。",
    impact: "折現率越高，延後發生的 AI 效益現值越低。",
    example: "年度折現率為 10% 時請填 10%。",
    guidance: "若企業已有核准的投資門檻報酬率，應優先使用。",
  },
  salaryBenchmark: {
    title: "國家 fully-loaded 薪資基準",
    meaning: "用來比較同一 AI 支出在不同勞動市場能換回多少人力價值的年度成本基準。",
    impact: "提高某國薪資會提高該市場每 US$1 AI 成本所對應的人力成本價值；它只改變市場比較，不會自動覆寫上方公司的實際人力成本。",
    example: "若分析美國頂尖科技公司，可把美國基準調到 US$300k–500k；若分析一般中小企業則應使用較低值。",
    guidance: "請保持職務、資歷與成本口徑一致。不能拿美國頂尖 SWE 總包與台灣全產業平均底薪直接比較。",
  },
  outputCurrentRpe: {
    title: "目前 RPE",
    meaning: "目前 Revenue per Employee，公式為「年度營收 ÷ 員工人數」。它衡量公司目前每位 FTE 平均支撐多少營收，不等於每位員工個人的業績。",
    impact: "年度營收提高或員工人數降低，RPE 會上升。RPE 越高，模型會認為投入成長的 AI 產能可以支撐較多新增營收。",
    example: "年度營收 US$12M、100 FTE，RPE = US$120,000。",
    guidance: "要改變此數字，調整「年度營收」或「員工人數」。比較公司時應控制產業、毛利率與外包程度，不能只看 RPE 高低。",
  },
  outputProjectedRpe: {
    title: "AI 後 RPE",
    meaning: "模型估計自然營收成長與 AI 增量營收發生、但尚未調整現有人數時的 Revenue per Employee。",
    impact: "它會隨歷史營收成長、工作曝險、AI 效率、採用率、品質、投入營收成長比例及營收轉換效率提高而上升。",
    example: "未來營收估計 US$14M、仍維持 100 FTE，AI 後 RPE = US$140,000。",
    guidance: "主要調整「歷史營收成長率」、「效率提升」、「釋放產能投入營收成長」與「產能轉換營收效率」。這是情境值，不是營收預測保證。",
  },
  outputAiRoi: {
    title: "AI 年度 ROI",
    meaning: "公式為「AI 帶來的穩態年度增量營業利益 ÷ AI 年度成本」。增量利益是 AI 情境與未導入 AI 基準之差。",
    impact: "AI 增量營收與毛利率提高會改善 ROI；每人 AI 成本、固定成本、轉型攤提、產品推論與負生產力成本會降低 ROI。",
    example: "AI 年度成本 US$1M，AI 情境比未導入基準多 US$0.4M 營業利益，ROI = 40%。負數表示目前假設下 AI 使年度利益下降。",
    guidance: "可調整 AI 成本、效率、採用率、品質、毛利率與營收轉換效率。此處是年度穩態 ROI，不等於第一年現金回收率。",
  },
  outputProductivity: {
    title: "淨生產力變化",
    meaning: "模型先把總效率提升換算為節省時間，再扣除人工審核、修正重做與 AI 管理時間，最後套用工作曝險、採用率與產出價值保留率。",
    impact: "此數值可以為負。生成速度很快，若審核與修復時間更高，整體生產力仍會下降。",
    example: "任務節省 30% 時間，但新增審核、修正重做與 AI 管理共 35%，淨生產力可能為負。",
    guidance: "請使用相同品質下的端到端流程資料，不要只量模型生成答案的速度。",
  },
  outputBreakEvenEfficiency: {
    title: "AI 損益兩平效率",
    meaning: "在其他輸入不變時，受 AI 影響的工作至少需要提高多少效率，AI 所創造的增量毛利才能抵銷年度 AI 成本。",
    impact: "AI 成本越高、工作曝險或營收轉換越低，門檻越高；RPE、毛利率、採用率與品質越高，門檻越低。",
    example: "顯示 80% 代表受影響任務需至少提高 80% 產出，才可依目前營收轉換假設回收 AI 支出。",
    guidance: "可降低 AI 成本，或提高採用率、品質、投入成長比例與營收轉換效率。門檻高於實測效率時，應先縮小導入範圍。",
  },
  outputBreakEvenSize: {
    title: "正向導入規模門檻",
    meaning: "假設 RPE、薪資與 AI 使用方式不變，至少需要多少相似 FTE，才能讓每人創造的 AI 價值攤平固定 AI 成本與轉型成本。",
    impact: "固定成本與轉型成本越高，門檻越高；每人 AI 價值、薪資或效率越高，門檻越低。",
    example: "顯示 200 人以上，表示在目前單位經濟下，小於約 200 FTE 時固定成本尚未被充分攤平。",
    guidance: "可調整固定 AI 成本、轉型成本、攤提年限、AI 效率與每人 AI 成本。它是假設性規模敏感度，不表示應為了導入 AI 而增聘到該人數。",
  },
  outputRequiredGrowth: {
    title: "尚需營收成長",
    meaning: "在模型已計入 AI 增量營收後，若仍要讓 AI 年度成本本身損益兩平，還缺少多少相對於目前年度營收的額外成長。",
    impact: "AI 成本提高會增加缺口；效率、營收再投入、營收轉換與毛利率提高會縮小缺口。",
    example: "顯示 5% 且目前營收 US$20M，代表約還需 US$1M 額外營收，才能依目前毛利率補足 AI 投資缺口。",
    guidance: "可調整 AI 成本、毛利率、效率、投入營收比例與轉換效率。0% 表示目前 AI 增量營收已足以覆蓋年度 AI 成本，不代表整體一定達到目標利益率。",
  },
  outputReleasableFte: {
    title: "理論可釋放工時",
    meaning: "把效率提升換算為原本可節省的工作時間，扣除審核、修正重做與 AI 管理，再乘上工作曝險、採用率及員工人數。它受現有人數限制。",
    impact: "效率、工作曝險或採用率提高會增加可釋放工時；各項負擔提高則會降低。效率提升 100% 等於節省該任務 50% 原工時。",
    example: "任務由 10 小時縮短到 5 小時，效率提升 100%，但只釋放原任務 50% 的工時，而不是 100%。",
    guidance: "調整工作曝險、效率、採用率與品質。這仍只是工時容量，不代表所有零碎工時都能整併成可減少的完整職位。",
  },
  outputSafeFte: {
    title: "可進一步評估的人力空間",
    meaning: "這是 AI 釋放工時中，扣除要拿去支援成長、仍需由人負責的工作，以及安全緩衝後，剩下可進一步做職務盤點的部分。",
    impact: "可自動化工作越多，這個空間越大；投入成長的比例越高，或保留的安全緩衝越高，這個空間就越小。",
    example: "可釋放 10 FTE、50% 可自動化、60% 投入成長、風險緩衝 25%，上限為 1.5 FTE。",
    guidance: "這不是建議調整的人數。它只表示有多少完整工時值得進一步檢查，仍需用職務、流程、服務水準與關鍵知識盤點驗證。",
  },
  outputRequiredCuts: {
    title: "財務缺口反推：最低人力調整",
    meaning: "這不是 AI 直接建議的人力調整數。模型先計算自然成長與 AI 後、維持目前人數的利益率，再從 0 人開始逐人減少，直到「調整後營業利益 ÷ 調整後營收」首次達到目標營業利益率。",
    impact: "每減少 1 人會降低薪資成本，但也會依「每調整 1% 人力的營收損失」降低營收。目標利益率、薪資、AI 成本與營收損失假設都會大幅改變答案。",
    example: "若顯示 12 人，意思是模型在減少 0–11 人時都未達目標；減少至 12 人後才首次達標。若安全上限只有 3 FTE，代表另外 9 人沒有 AI 釋放工時支持。",
    guidance: "先調整「目標營業利益率」與「每調整 1% 人力的營收損失」，再測試額外營收情境。數字採穩態計算，一次性人力調整成本只列第一年現金支出，不能直接作為組織決策。",
  },
  outputLegacyHeadcount: {
    title: "傳統擴編所需人數",
    meaning: "假設公司未利用 AI 提高每人產出、維持目前 RPE，要支撐模型中未來營收所需要的理論人數。",
    impact: "未來營收越高或目前 RPE 越低，傳統擴編人數越高。",
    example: "未來營收 US$15M、目前 RPE US$150k，傳統擴編約需 100 FTE。",
    guidance: "主要受目前 RPE、歷史成長與 AI 增量營收情境影響。它是比較基準，不是招聘計畫。",
  },
  outputNativeHeadcount: {
    title: "AI-native 所需人數",
    meaning: "把傳統擴編所需人數除以「1 + 新增產出能力」，估算若公司從一開始按 AI-enabled 流程設計，支撐相同營收所需的理論人數。",
    impact: "新增產出能力越高，AI-native 理論人數越低。",
    example: "傳統需要 100 人、新增產出能力 25%，AI-native 理論人數約為 100 ÷ 1.25 = 80 人。",
    guidance: "調整效率、曝險、採用率與品質會改變此值。它沒有完整計入管理跨度、法遵與最低職能配置。",
  },
  outputAvoidedHires: {
    title: "可避免新增人力",
    meaning: "傳統擴編所需人數減去 AI-native 所需人數，表示從一開始採 AI-native 流程可能避免新增的職缺。",
    impact: "未來營收與新增產出能力提高，避免新增的人數通常增加。",
    example: "傳統需要 100 人、AI-native 需要 80 人，可避免新增 20 人。",
    guidance: "這是未來招募需求差額，不是現有公司的即時人力調整建議。",
  },
  outputNativeRpe: {
    title: "AI-native 理論 RPE",
    meaning: "公式為「模型中的未來營收 ÷ AI-native 理論人數」，用來展示從組織建立初期就採 AI 流程時可能達到的營收密度。",
    impact: "新增產出能力與未來營收提高會推升此值；必要人數提高則會降低。",
    example: "未來營收 US$20M、AI-native 理論人數 40 人，理論 RPE = US$500k。",
    guidance: "此值沒有直接證明 AI 因果，也未扣除所有外包與 compute 成本，應與毛利及每人營業利益一起看。",
  },
};

function help(title, meaning, impact, example, guidance) {
  return { title, meaning, impact, example, guidance };
}

const HELP_CONTENT_EN = {};

Object.assign(HELP_CONTENT_EN, {
  "preset-select": help(
    "Company scenario",
    "Loads public financial reference data or a synthetic research case.",
    "Changing the scenario replaces company scale, margin, growth, labor cost, and editable AI assumptions.",
    "Compare a SaaS case with a semiconductor or marketplace case to see how the same AI capability produces different economics.",
    "Public financial data is a reference point. Non-public AI assumptions are not claims about the selected company."
  ),
  country: help(
    "Primary labor market",
    "The main market used for workforce cost and labor-value comparison.",
    "Lower labor cost makes globally priced models harder to repay through labor value alone.",
    "A Taiwan-based team selling globally can select Taiwan while entering worldwide revenue.",
    "Use a weighted average or run separate analyses for multinational teams."
  ),
  employees: help(
    "Employees",
    "Full-time-equivalent employees included in the analysis.",
    "Employee count affects AI seat cost, available task capacity, and fixed-cost allocation.",
    "Eighty full-time and twenty half-time workers equal 90 FTE.",
    "If analyzing one business unit, use that unit's attributable financial and task data."
  ),
  revenue: help(
    "Annual revenue",
    "Revenue for the selected annual period, in millions of US dollars.",
    "Revenue and employee count form current RPE and affect the modeled value of growth capacity.",
    "Enter 12.5 for US$12.5 million.",
    "Keep revenue, profit, and employee periods consistent."
  ),
  operatingProfit: help(
    "Operating profit",
    "Revenue after direct cost and operating expense, before interest and tax.",
    "The model uses it to infer current non-payroll operating expense and baseline margin pressure.",
    "Enter -2 for a US$2 million operating loss.",
    "Use a consistent GAAP, IFRS, or internally adjusted basis."
  ),
  grossMargin: help(
    "Gross margin",
    "Revenue remaining after direct delivery cost.",
    "Only contribution after direct cost can absorb AI and operating expense.",
    "US$10M revenue and US$3M cost of revenue equals 70%.",
    "Product inference that scales with delivery should be reflected separately or in cost of revenue."
  ),
  historicalGrowth: help(
    "Baseline revenue growth",
    "Expected annual growth without the AI program.",
    "It prevents normal company growth from being attributed to AI.",
    "Use a multi-year average or management baseline such as 10%.",
    "Use conservative, base, and upside assumptions for volatile companies."
  ),
  salary: help(
    "Average fully loaded labor cost",
    "Annual employer cost per FTE, including compensation, benefits, taxes, equipment, and relevant equity cost.",
    "Higher labor cost increases the potential financial value of released time.",
    "US$60k salary plus US$30k of benefits and overhead equals US$90k.",
    "Use total workforce cost divided by average FTE where role-level data is unavailable."
  ),
  exposure: help(
    "Task exposure to AI",
    "Share of total work time that AI can plausibly affect.",
    "Exposure scales both potential upside and the impact of review, rework, and operating overhead.",
    "If AI affects five of ten weekly work hours, enter 50%.",
    "Estimate from task inventories or time sampling, not occupation-level headlines."
  ),
  efficiency: help(
    "Gross speed uplift",
    "Output-rate improvement on exposed tasks before review, rework, and AI operations overhead.",
    "The model converts this into gross time saved, then subtracts overhead to obtain net productivity.",
    "A task falling from 10 hours to 7 hours has about 43% gross speed uplift.",
    "Measure end-to-end work at equal quality."
  ),
  adoption: help(
    "Effective task adoption",
    "Share of eligible tasks where AI is used consistently and correctly.",
    "Low adoption prevents strong tool-level performance from becoming organization-level capacity.",
    "If 70% of workers use AI on half of eligible tasks, effective adoption may be 35%.",
    "Use task telemetry rather than account activation."
  ),
  quality: help(
    "Output value retention",
    "Share of gross AI-assisted output value retained after quality and risk considerations.",
    "It discounts positive output capacity but does not erase measured review and rework time.",
    "If only 90% of output has equivalent business value, enter 90%.",
    "Use stricter values for regulated, safety-critical, or high-trust workflows."
  ),
  reviewOverhead: help(
    "Human review overhead",
    "Human review time added by AI use, measured as a share of original task duration.",
    "Review is subtracted from gross time saved and can make net productivity negative.",
    "One added review hour on a ten-hour baseline task equals 10%.",
    "Measure compliance, security, approval, and senior-review time."
  ),
  reworkOverhead: help(
    "Correction and retry overhead",
    "Time spent correcting, regenerating, or repairing AI-assisted output.",
    "Higher rework directly reduces net released time and economic value.",
    "Two correction hours on a ten-hour baseline task equals 20%.",
    "Use observed defect and revision data."
  ),
  aiOpsOverhead: help(
    "AI administration overhead",
    "Ongoing time for prompt maintenance, context preparation, evaluation, monitoring, and incidents.",
    "This recurring burden is deducted before productivity becomes capacity.",
    "One AI administration hour per ten affected work hours equals 10%.",
    "Do not duplicate engineering payroll already included in fixed platform cost."
  ),
  aiCostPerEmployee: help(
    "Annual internal AI cost per employee",
    "Recurring seat, API, agent, and internal usage cost that scales with employees.",
    "It raises recurring AI cost and may decline after a workforce change.",
    "US$300 per month equals US$3,600 per FTE-year.",
    "Use actual bills per active user where available."
  ),
  fixedAiCost: help(
    "Recurring fixed AI platform cost",
    "Annual AI cost that does not scale directly with seats or product usage.",
    "Fixed cost creates a minimum scale threshold for positive economics.",
    "Examples include platform engineering, evaluation infrastructure, governance, and reserved capacity.",
    "Place one-time consulting and migration work in transformation cost."
  ),
  transitionCost: help(
    "One-time transformation cost",
    "Initial cash spending for workflow redesign, data preparation, integration, training, and migration.",
    "The full amount affects year-one cash flow while an amortized portion affects steady-state ROI.",
    "US$200k consulting plus US$500k integration equals US$0.7M.",
    "Separate recurring support from one-time implementation."
  ),
  amortizationYears: help(
    "Transformation amortization period",
    "Years over which one-time transformation cost is allocated for steady-state analysis.",
    "Longer amortization lowers annual accounting burden but does not reduce first-year cash spending.",
    "US$3M over three years contributes US$1M per year to steady-state cost.",
    "Use an economically defensible useful life."
  ),
  productInferenceCostRate: help(
    "Product inference cost rate",
    "AI delivery cost that scales with AI-attributed product revenue.",
    "It reduces contribution margin and prevents product inference from being treated as free.",
    "US$5 of serving cost per US$100 of related revenue equals 5%.",
    "Use product telemetry and cloud bills."
  ),
  redeployShare: help(
    "Released capacity allocated to growth",
    "Share of released time assigned to product, sales, service volume, or market expansion.",
    "More growth allocation increases revenue potential and leaves less capacity for workforce scenarios.",
    "Twelve of twenty released FTE allocated to growth equals 60%.",
    "Use higher values only when demand and delivery opportunities are observable."
  ),
  revenueConversion: help(
    "Capacity-to-revenue conversion",
    "Revenue generated per growth-equivalent FTE relative to current company RPE.",
    "It prevents every released hour from automatically receiving full company-average revenue value.",
    "Ten FTE at US$200k RPE and 50% conversion produces US$1M before the demand cap.",
    "Tie this assumption to pipeline, pricing, backlog, or delivery evidence."
  ),
  automationShare: help(
    "Structurally automatable share",
    "Released time that can be removed from required operating capacity rather than only improving convenience.",
    "Only this share enters the evidence-adjusted workforce capacity limit.",
    "If half of released time must retain human ownership, enter 50% or less.",
    "Estimate at the role and workflow level."
  ),
  year1Realization: help(
    "Year-one value realization",
    "Share of steady-state AI value expected during the first year.",
    "It changes first-year cash flow, NPV, and payback without reducing initial cash cost.",
    "Enter 40% when year one delivers less than half of steady-state value.",
    "Use a conservative value during incomplete implementation."
  ),
  riskBuffer: help(
    "Workforce risk buffer",
    "Capacity retained for AI failure, demand volatility, management work, knowledge continuity, and resilience.",
    "A higher buffer lowers the evidence-adjusted capacity available for organization scenarios.",
    "A 30% buffer retains six of twenty otherwise available FTE.",
    "Use a larger buffer during early deployment and in regulated workflows."
  ),
  targetMargin: help(
    "Target operating margin",
    "Operating margin used in the financial pressure test.",
    "An aggressive target can create a large workforce adjustment result even when AI contributes little.",
    "US$15M operating profit on US$100M revenue equals 15%.",
    "Compare the no-AI baseline before attributing target pressure to AI."
  ),
  revenueLossPerCut: help(
    "Revenue-loss elasticity",
    "Modeled percentage revenue loss for each 1% workforce reduction.",
    "Higher elasticity makes workforce reduction less effective or infeasible as a path to the target margin.",
    "Enter 0.30 when a 10% workforce reduction is expected to reduce revenue by about 3%.",
    "This is highly uncertain and should be stress-tested."
  ),
  severanceMonths: help(
    "One-time workforce transition cost",
    "Average cash cost per adjusted FTE, measured in months of fully loaded labor cost.",
    "It affects first-year cash economics but not the steady-state target-margin solver.",
    "Enter 6 for an average cost equal to six months of labor cost.",
    "Use country-specific legal and contractual estimates. This tool is not legal advice."
  ),
  demandCeiling: help(
    "Validated AI demand ceiling",
    "Maximum annual revenue supported by current market evidence for AI-enabled capacity.",
    "AI-attributed revenue is capped at the lower of capacity potential and this ceiling.",
    "US$2M validated pipeline against US$20M current revenue supports 10%.",
    "Tie this to backlog, pipeline, pricing, conversion, or delivery evidence."
  ),
  analysisYears: help(
    "Analysis horizon",
    "Number of years used for cash-flow and NPV analysis.",
    "A longer horizon includes delayed benefits but increases forecast uncertainty.",
    "Use three years for a typical workflow transformation review.",
    "Do not extend the horizon merely to force positive NPV."
  ),
  discountRate: help(
    "Discount rate",
    "Annual rate used to convert future incremental cash flow into present value.",
    "A higher rate lowers the value of delayed AI benefits.",
    "Enter 10% for a 10% annual discount rate.",
    "Use the company's approved investment hurdle rate where available."
  ),
  salaryBenchmark: help(
    "Labor-cost benchmark",
    "Editable market reference used only for cross-country labor-value comparison.",
    "A higher benchmark increases realizable labor value for the same released time.",
    "Use US$300k–500k for a relevant top-tier US technology role only if comparing equivalent roles.",
    "Keep role, seniority, and cost definitions comparable."
  ),
  outputCurrentRpe: help(
    "Current RPE",
    "Annual revenue divided by current employees.",
    "It is a company-density measure, not individual performance.",
    "US$12M divided by 100 FTE equals US$120k.",
    "Compare RPE only within similar business and outsourcing models."
  ),
  outputProjectedRpe: help(
    "AI-adjusted RPE",
    "Modeled future revenue divided by unchanged current headcount.",
    "It includes baseline growth and demand-capped AI revenue.",
    "US$14M divided by 100 FTE equals US$140k.",
    "This is a scenario, not a revenue forecast."
  ),
  outputAiRoi: help(
    "Steady-state AI ROI",
    "AI-attributed annual profit delta divided by annual AI cost.",
    "It compares the AI scenario with a no-AI baseline while headcount remains unchanged.",
    "US$0.4M profit delta on US$1M AI cost equals 40%.",
    "Review first-year cash flow and NPV as well as steady-state ROI."
  ),
  outputProductivity: help(
    "Net productivity change",
    "Organization-level productivity after gross speed, adoption, quality, review, rework, and AI operations overhead.",
    "The value can be negative.",
    "Fast generation can still produce negative productivity if review and repair exceed time saved.",
    "Use measured end-to-end workflow data."
  ),
  outputBreakEvenEfficiency: help(
    "Break-even gross speed uplift",
    "Minimum gross task speed uplift needed for recurring AI economics to break even under current assumptions.",
    "Higher cost, overhead, or weaker demand raises the threshold.",
    "A result of 80% means exposed tasks need about 80% gross speed uplift before overhead.",
    "The solver searches up to 1,000%; no result means the current model has no revenue-only break-even."
  ),
  outputBreakEvenSize: help(
    "Positive economics size threshold",
    "Minimum similar FTE scale needed to absorb fixed AI and amortized transformation cost.",
    "High fixed cost raises the threshold.",
    "A result of 200 means a similar 200-FTE organization is needed under constant unit economics.",
    "Do not interpret this as a hiring target."
  ),
  outputRequiredGrowth: help(
    "Additional revenue required",
    "Revenue beyond modeled AI-attributed revenue needed to eliminate the AI profit deficit.",
    "It rises with cost and falls with contribution margin and validated AI value.",
    "5% on US$20M means an additional US$1M of annual revenue.",
    "Zero means the AI increment breaks even, not that the company reaches its target margin."
  ),
  outputReleasableFte: help(
    "Theoretical released time",
    "Positive net time saved expressed as FTE.",
    "It is bounded by current employee time and excludes negative productivity.",
    "A 10% organization time-release rate at 100 FTE equals 10 FTE.",
    "Released time is not automatically removable staffing."
  ),
  outputSafeFte: help(
    "Capacity available for further review",
    "Released time left after growth use, work that still requires human ownership, and a safety buffer.",
    "It indicates how much capacity is worth reviewing at role level, not how many positions should change.",
    "Ten released FTE × 40% automatable × 50% non-growth × 70% retained confidence equals 1.4 FTE.",
    "Validate it with workflow, service-level, and critical-knowledge evidence."
  ),
  outputRequiredCuts: help(
    "Baseline-attributed workforce pressure",
    "The model solves the target-margin equation with and without AI and reports the difference.",
    "This prevents pre-existing low margin or an aggressive target from being attributed to AI.",
    "If no-AI requires 100 FTE and AI requires 110 FTE, the AI-attributed change is +10 FTE.",
    "This remains a financial stress test, not workforce advice."
  ),
  outputLegacyHeadcount: help(
    "Legacy scaling headcount",
    "Headcount needed to support modeled future revenue at current RPE.",
    "It provides a no-productivity-change scaling reference.",
    "US$20M future revenue at US$200k RPE requires 100 FTE.",
    "Outsourcing and business-model differences can distort RPE."
  ),
  outputNativeHeadcount: help(
    "AI-native modeled headcount",
    "Legacy scaling headcount adjusted by modeled net productivity.",
    "Positive productivity reduces modeled future hiring need.",
    "A 25% uplift reduces a 100-FTE legacy requirement to 80 FTE.",
    "This is most relevant to future organization design, not existing staff changes."
  ),
  outputAvoidedHires: help(
    "Potential hires avoided",
    "Difference between legacy scaling and AI-native modeled future headcount.",
    "It estimates future hiring avoided under realized demand.",
    "100 legacy FTE minus 80 AI-native FTE equals 20 potential hires avoided.",
    "Track against approved requisitions and observed demand."
  ),
  outputNativeRpe: help(
    "Modeled AI-native RPE",
    "Modeled future revenue divided by AI-native headcount.",
    "It illustrates revenue density under AI-native workflow assumptions.",
    "US$20M divided by 40 FTE equals US$500k.",
    "Review gross margin and compute cost alongside RPE."
  ),
});

let salaryBenchmarks = Object.fromEntries(
  Object.entries(COUNTRIES).map(([code, country]) => [code, country.salary])
);
let activePreset = "custom";
let resizeFrame = null;
let mobileUiState = { ...MOBILE_UI_DEFAULTS };
const mobileScrollPositions = { inputs: 0, results: 0 };
const mobileAccordionSections = {
  inputs: new Map(),
  results: new Map(),
};

function element(id) {
  return document.getElementById(id);
}

const COUNTRY_NAMES_ZH = {
  TW: "台灣",
  US: "美國",
  JP: "日本",
  SG: "新加坡",
  GB: "英國",
  DE: "德國",
  IN: "印度",
};

const WARNING_TRANSLATIONS_ZH = {
  "Average labor cost exceeds the gross profit available in the current financial inputs. Non-payroll operating expense has been floored at zero; review the labor-cost or financial assumptions.":
    "平均人力成本高於目前財務輸入可提供的毛利。模型已將非薪資營業費用下限設為零，請檢查人力成本或財務假設。",
  "Target operating margin must remain below gross margin.":
    "目標營業利益率必須低於毛利率。",
  "Review, rework, and AI operations overhead exceed gross time saved. The current AI scenario produces negative net productivity.":
    "人工審核、修正重做與 AI 管理時間高於總節省時間，目前 AI 情境產生負向淨生產力。",
  "Capacity-based AI revenue exceeds the validated demand ceiling. Incremental revenue has been capped.":
    "依產能推估的 AI 營收超過已驗證需求上限，模型已限制增量營收。",
  "The target margin remains infeasible even after testing workforce reductions up to 70%.":
    "即使測試最高 70% 的組織人力調整，目標利潤率仍不可行。",
  "Modeled workforce pressure exceeds the capacity available for further review. The gap must be addressed through revenue, non-labor cost, AI cost, or a different target.":
    "模型組織人力壓力高於可進一步評估的人力空間。此缺口必須透過營收、非人力成本、AI 成本或不同目標處理。",
};

const VERDICT_TRANSLATIONS_ZH = {
  "Validate with a controlled pilot": "需高度控制試點規模進行驗證",
  "Positive economics are plausible": "可能具備正向經濟效益",
  "Current assumptions do not hold": "目前假設無法成立",
};

function localizedCountryName(code) {
  if (i18n.isChinese()) {
    return COUNTRY_NAMES_ZH[code] || COUNTRIES[code]?.name || code;
  }
  return i18n.translateTerm(COUNTRIES[code]?.name || code);
}

function localizedWarning(message) {
  const key = {
    "Average labor cost exceeds the gross profit available in the current financial inputs. Non-payroll operating expense has been floored at zero; review the labor-cost or financial assumptions.": "warning.laborCost",
    "Target operating margin must remain below gross margin.": "warning.targetMargin",
    "Review, rework, and AI operations overhead exceed gross time saved. The current AI scenario produces negative net productivity.": "warning.negativeProductivity",
    "Capacity-based AI revenue exceeds the validated demand ceiling. Incremental revenue has been capped.": "warning.demandCap",
    "The target margin remains infeasible even after testing workforce reductions up to 70%.": "warning.infeasible",
    "Modeled workforce pressure exceeds the capacity available for further review. The gap must be addressed through revenue, non-labor cost, AI cost, or a different target.": "warning.capacity",
  }[message];
  if (key) return t(key);
  return i18n.isChinese() ? WARNING_TRANSLATIONS_ZH[message] || message : message;
}

function localizedVerdict(message) {
  const key = {
    "Validate with a controlled pilot": "verdict.pilot",
    "Positive economics are plausible": "verdict.positive",
    "Current assumptions do not hold": "verdict.negative",
  }[message];
  if (key) return t(key);
  return i18n.isChinese() ? VERDICT_TRANSLATIONS_ZH[message] || message : message;
}

function getHelpContent(key) {
  const localized = i18n.getLocalizedHelp(key);
  if (localized) return localized;
  return (i18n.isChinese() ? HELP_CONTENT_ZH : HELP_CONTENT_EN)[key];
}

function getPresetCopy(presetKey) {
  const localized = i18n.getPresetCopy(presetKey);
  if (localized) return localized;
  if (!i18n.isChinese()) {
    return PRESET_COPY_EN[presetKey] || PRESET_COPY_EN.custom;
  }
  const preset = PRESETS[presetKey] || PRESETS.custom;
  return {
    name: preset.name,
    industry: preset.industry,
    note: preset.note,
  };
}

function openHelp(key) {
  const content = getHelpContent(key);
  if (!content) return;
  element("help-title").textContent = content.title;
  element("help-meaning").textContent = content.meaning;
  element("help-impact").textContent = content.impact;
  element("help-example").textContent = content.example;
  element("help-guidance").textContent = content.guidance;
  element("help-dialog").showModal();
}

function setupHelpSystem() {
  Object.keys(HELP_CONTENT_EN).forEach((key) => {
    if (key === "salaryBenchmark") return;
    const control = element(key);
    if (!control) return;
    const content = getHelpContent(key);
    control.setAttribute("aria-label", content.title);
    const label = control.closest("label");
    if (!label) return;
    const labelText =
      control.type === "range"
        ? label.querySelector("b")
        : label.querySelector(":scope > span");
    if (!labelText) return;
    let button = labelText.querySelector(".help-trigger");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "help-trigger";
      button.dataset.helpKey = key;
      button.textContent = "i";
      labelText.appendChild(button);
    }
    button.setAttribute("aria-label", t("help.about", { title: content.title }));
    button.title = t("help.about", { title: content.title });
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-help-key]");
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    openHelp(trigger.dataset.helpKey);
  });

  element("help-close").addEventListener("click", () => {
    element("help-dialog").close();
  });

  element("help-dialog").addEventListener("click", (event) => {
    const dialog = element("help-dialog");
    if (event.target === dialog) dialog.close();
  });
}

function refreshHelpLabels() {
  document.querySelectorAll("[data-help-key]").forEach((button) => {
    const content = getHelpContent(button.dataset.helpKey);
    if (!content) return;
    button.setAttribute("aria-label", t("help.about", { title: content.title }));
    button.title = t("help.about", { title: content.title });
  });
  inputIds.forEach((key) => {
    const control = element(key);
    const content = getHelpContent(key);
    if (control && content) control.setAttribute("aria-label", content.title);
  });
}

function setupLanguageSelector() {
  const select = element("language-select");
  select.innerHTML = i18n.availableLocales
    .map(
      (locale) =>
        `<option value="${locale.code}">${locale.label}</option>`
    )
    .join("");
  select.value = i18n.locale;
  select.addEventListener("change", (event) => {
    i18n.setLocale(event.target.value);
  });
}

function setupResearchDialog() {
  const dialog = element("research-dialog");
  const openButton = element("research-info-button");
  const closeButton = element("research-dialog-close");

  const openDialog = () => {
    if (!dialog.open) dialog.showModal();
  };

  openButton.addEventListener("click", openDialog);
  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    localStorage.setItem(INTRO_VIEWED_KEY, "true");
  });

  if (localStorage.getItem(INTRO_VIEWED_KEY) !== "true") {
    requestAnimationFrame(openDialog);
  }
}

let presetCollapsed = false;

function updateChromeMetrics() {
  const topbarHeight = element("research-info-button")
    .closest(".topbar")
    .getBoundingClientRect().height;
  const presetHeight = element("preset-band").getBoundingClientRect().height;
  document.documentElement.style.setProperty(
    "--topbar-height",
    `${topbarHeight}px`
  );
  document.documentElement.style.setProperty(
    "--app-chrome-height",
    `${topbarHeight + presetHeight}px`
  );
}

function updatePresetToggleLabel() {
  element("preset-toggle-state").textContent = presetCollapsed
    ? t("preset.expand")
    : t("preset.collapse");
}

function setPresetCollapsed(collapsed) {
  presetCollapsed = collapsed;
  element("preset-band").classList.toggle("is-collapsed", collapsed);
  element("preset-toggle").setAttribute("aria-expanded", String(!collapsed));
  element("preset-collapsed-context").setAttribute(
    "aria-hidden",
    String(!collapsed)
  );
  updatePresetToggleLabel();
  requestAnimationFrame(updateChromeMetrics);
}

function setupPresetBand() {
  element("preset-toggle").addEventListener("click", () => {
    setPresetCollapsed(!presetCollapsed);
  });

  const collapseAfterScroll = (event) => {
    const scrollTop =
      event.currentTarget === window
        ? window.scrollY
        : event.currentTarget.scrollTop;
    if (scrollTop > 24 && !presetCollapsed) setPresetCollapsed(true);
  };

  element("company-inputs")
    .closest(".input-panel")
    .addEventListener("scroll", collapseAfterScroll, { passive: true });
  document
    .querySelector(".results-panel")
    .addEventListener("scroll", collapseAfterScroll, { passive: true });
  window.addEventListener("scroll", collapseAfterScroll, { passive: true });
  window.addEventListener("resize", updateChromeMetrics);

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(updateChromeMetrics);
    observer.observe(document.querySelector(".topbar"));
    observer.observe(element("preset-band"));
  }

  updatePresetToggleLabel();
  requestAnimationFrame(updateChromeMetrics);
}

function loadMobileUiState() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(MOBILE_UI_STORAGE_KEY) || "null"
    );
    if (!stored) return { ...MOBILE_UI_DEFAULTS };
    const activeView = ["inputs", "results"].includes(stored.activeView)
      ? stored.activeView
      : MOBILE_UI_DEFAULTS.activeView;
    const openInputSection = ["company", "ai", "strategy", "paths", null].includes(
      stored.openInputSection
    )
      ? stored.openInputSection
      : MOBILE_UI_DEFAULTS.openInputSection;
    const openAnalysisSection = [
      "attribution",
      "interpretation",
      "cash",
      "uncertainty",
      "performance",
      "tradeoff",
      "native",
      "labor",
      null,
    ].includes(stored.openAnalysisSection)
      ? stored.openAnalysisSection
      : MOBILE_UI_DEFAULTS.openAnalysisSection;
    return { activeView, openInputSection, openAnalysisSection };
  } catch (error) {
    return { ...MOBILE_UI_DEFAULTS };
  }
}

function saveMobileUiState() {
  try {
    localStorage.setItem(MOBILE_UI_STORAGE_KEY, JSON.stringify(mobileUiState));
  } catch (error) {
    console.warn("Unable to save mobile interface state", error);
  }
}

function mobileSectionTitle(type, key) {
  return t(`mobile.${type}.${key}`);
}

function enhanceMobileAccordionSection(section, type, key) {
  const originalHeading = section.querySelector(".section-heading, .chart-heading");
  if (originalHeading) originalHeading.classList.add("mobile-original-heading");

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "mobile-accordion-toggle";
  toggle.id = `mobile-${type}-${key}-toggle`;
  toggle.setAttribute("aria-expanded", "false");

  const label = document.createElement("span");
  label.className = "mobile-accordion-label";
  const title = document.createElement("strong");
  title.className = "mobile-accordion-title";
  const summary = document.createElement("small");
  summary.className = "mobile-accordion-summary";
  label.append(title, summary);

  const chevron = document.createElement("span");
  chevron.className = "mobile-accordion-chevron";
  chevron.setAttribute("aria-hidden", "true");
  chevron.textContent = "⌄";
  toggle.append(label, chevron);

  const content = document.createElement("div");
  content.className = "mobile-accordion-content";
  content.id = `mobile-${type}-${key}-content`;
  content.setAttribute("role", "region");
  content.setAttribute("aria-labelledby", toggle.id);
  toggle.setAttribute("aria-controls", content.id);

  const clip = document.createElement("div");
  clip.className = "mobile-accordion-clip";
  while (section.firstChild) clip.appendChild(section.firstChild);
  content.appendChild(clip);
  section.append(toggle, content);
  section.classList.add("mobile-accordion-section");

  const entry = { section, toggle, content, clip, title, summary };
  mobileAccordionSections[type].set(key, entry);
  toggle.addEventListener("click", () => {
    const stateKey =
      type === "inputs" ? "openInputSection" : "openAnalysisSection";
    const nextKey = mobileUiState[stateKey] === key ? null : key;
    setMobileAccordion(type, nextKey, { scroll: true });
  });
}

function refreshMobileInterfaceText() {
  element("mobile-workspace-nav").setAttribute(
    "aria-label",
    t("mobile.workspace")
  );
  const inputTab = element("mobile-inputs-tab");
  const resultTab = element("mobile-results-tab");
  inputTab.querySelector(".mobile-workspace-tab-label").textContent =
    t("mobile.view.inputs");
  resultTab.querySelector(".mobile-workspace-tab-label").textContent =
    t("mobile.view.analysis");
  inputTab.setAttribute("aria-label", t("mobile.view.inputs"));

  Object.entries(mobileAccordionSections).forEach(([type, sections]) => {
    sections.forEach((entry, key) => {
      const title = mobileSectionTitle(type, key);
      entry.title.textContent = title;
      entry.toggle.setAttribute(
        "aria-label",
        t(
          entry.toggle.getAttribute("aria-expanded") === "true"
            ? "mobile.collapse"
            : "mobile.expand",
          { title }
        )
      );
    });
  });
}

function setMobileAccordion(type, key, options = {}) {
  const stateKey =
    type === "inputs" ? "openInputSection" : "openAnalysisSection";
  mobileUiState[stateKey] = key;
  const isMobile = MOBILE_LAYOUT_QUERY.matches;
  mobileAccordionSections[type].forEach((entry, sectionKey) => {
    const open = !isMobile || sectionKey === key;
    entry.section.classList.toggle("is-mobile-open", open);
    entry.toggle.setAttribute("aria-expanded", String(open));
    entry.content.setAttribute("aria-hidden", String(!open));
    entry.clip.inert = !open;
    const title = mobileSectionTitle(type, sectionKey);
    entry.toggle.setAttribute(
      "aria-label",
      t(open ? "mobile.collapse" : "mobile.expand", { title })
    );
  });
  saveMobileUiState();

  if (isMobile && key && options.scroll) {
    const entry = mobileAccordionSections[type].get(key);
    const panel =
      type === "inputs"
        ? element("mobile-inputs-panel")
        : element("mobile-results-panel");
    const scrollDelay = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : 280;
    window.setTimeout(() => {
      panel.scrollTo({
        top: Math.max(0, entry.section.offsetTop),
        behavior: "smooth",
      });
      if (type === "results" && ["performance", "tradeoff"].includes(key)) {
        requestAnimationFrame(redrawVisibleCharts);
      }
    }, scrollDelay);
  }
}

function redrawVisibleCharts() {
  const values = getInputValues();
  const result = calculate(values);
  if (
    !MOBILE_LAYOUT_QUERY.matches ||
    mobileUiState.openAnalysisSection === "performance"
  ) {
    drawPositiveZone(values);
  }
  if (
    !MOBILE_LAYOUT_QUERY.matches ||
    mobileUiState.openAnalysisSection === "tradeoff"
  ) {
    drawTradeoff(values, result);
  }
}

function switchMobileView(view, options = {}) {
  if (!["inputs", "results"].includes(view)) return;
  const currentView = mobileUiState.activeView;
  if (MOBILE_LAYOUT_QUERY.matches && currentView) {
    const currentPanel =
      currentView === "inputs"
        ? element("mobile-inputs-panel")
        : element("mobile-results-panel");
    mobileScrollPositions[currentView] = currentPanel.scrollTop;
  }

  mobileUiState.activeView = view;
  document.body.dataset.mobileView = view;
  ["inputs", "results"].forEach((panelKey) => {
    const selected = panelKey === view;
    const panel =
      panelKey === "inputs"
        ? element("mobile-inputs-panel")
        : element("mobile-results-panel");
    const tab =
      panelKey === "inputs"
        ? element("mobile-inputs-tab")
        : element("mobile-results-tab");
    panel.classList.toggle("mobile-panel-hidden", !selected);
    panel.setAttribute("aria-hidden", String(!selected));
    panel.inert = !selected;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  saveMobileUiState();

  if (MOBILE_LAYOUT_QUERY.matches && options.restore !== false) {
    const activePanel =
      view === "inputs"
        ? element("mobile-inputs-panel")
        : element("mobile-results-panel");
    requestAnimationFrame(() => {
      activePanel.scrollTop = mobileScrollPositions[view];
      if (view === "results") requestAnimationFrame(redrawVisibleCharts);
    });
  }
}

let mobileLayoutActive = false;

function applyMobileLayout() {
  const isMobile = MOBILE_LAYOUT_QUERY.matches;
  document.body.classList.toggle("mobile-ui-active", isMobile);

  if (isMobile) {
    element("mobile-inputs-panel").setAttribute("role", "tabpanel");
    element("mobile-inputs-panel").setAttribute(
      "aria-labelledby",
      "mobile-inputs-tab"
    );
    element("mobile-results-panel").setAttribute("role", "tabpanel");
    element("mobile-results-panel").setAttribute(
      "aria-labelledby",
      "mobile-results-tab"
    );
    if (!mobileLayoutActive) {
      setPresetCollapsed(true);
      mobileScrollPositions.inputs = 0;
      mobileScrollPositions.results = 0;
    }
    setMobileAccordion("inputs", mobileUiState.openInputSection);
    setMobileAccordion("results", mobileUiState.openAnalysisSection);
    switchMobileView(mobileUiState.activeView, { restore: mobileLayoutActive });
  } else {
    delete document.body.dataset.mobileView;
    ["inputs", "results"].forEach((panelKey) => {
      const panel =
        panelKey === "inputs"
          ? element("mobile-inputs-panel")
          : element("mobile-results-panel");
      panel.classList.remove("mobile-panel-hidden");
      panel.removeAttribute("aria-hidden");
      panel.removeAttribute("role");
      panel.removeAttribute("aria-labelledby");
      panel.inert = false;
    });
    setMobileAccordion("inputs", mobileUiState.openInputSection);
    setMobileAccordion("results", mobileUiState.openAnalysisSection);
    requestAnimationFrame(redrawVisibleCharts);
  }
  mobileLayoutActive = isMobile;
  requestAnimationFrame(updateChromeMetrics);
}

function setupMobileWorkspace() {
  mobileUiState = loadMobileUiState();
  document
    .querySelectorAll("[data-mobile-input-section]")
    .forEach((section) => {
      enhanceMobileAccordionSection(
        section,
        "inputs",
        section.dataset.mobileInputSection
      );
    });
  document
    .querySelectorAll("[data-mobile-analysis-section]")
    .forEach((section) => {
      enhanceMobileAccordionSection(
        section,
        "results",
        section.dataset.mobileAnalysisSection
      );
    });

  document.querySelectorAll("[data-mobile-view]").forEach((button) => {
    button.addEventListener("click", () => {
      switchMobileView(button.dataset.mobileView);
    });
  });
  element("mobile-workspace-nav").addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const nextView =
      event.key === "ArrowLeft" || event.key === "Home" ? "inputs" : "results";
    switchMobileView(nextView);
    const nextTab =
      nextView === "inputs"
        ? element("mobile-inputs-tab")
        : element("mobile-results-tab");
    nextTab.focus();
  });
  MOBILE_LAYOUT_QUERY.addEventListener("change", applyMobileLayout);
  refreshMobileInterfaceText();
  applyMobileLayout();
}

function getInputValues() {
  const result = {};
  inputIds.forEach((id) => {
    const field = element(id);
    result[id] = field.tagName === "SELECT" ? field.value : Number(field.value);
  });
  return result;
}

function setInputValues(values) {
  const completeValues = { ...MODEL_DEFAULTS, ...values };
  inputIds.forEach((id) => {
    if (Object.prototype.hasOwnProperty.call(completeValues, id)) {
      element(id).value = completeValues[id];
    }
  });
  updateSliderOutputs();
}

function formatMoneyMillions(value, digits = 1) {
  if (!Number.isFinite(value)) return "—";
  const absolute = Math.abs(value);
  if (absolute >= 1000) {
    return `${value < 0 ? "-" : ""}US$${(absolute / 1000).toFixed(digits)}B`;
  }
  return `${value < 0 ? "-" : ""}US$${absolute.toFixed(digits)}M`;
}

function formatMoney(value) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(i18n.locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000000 ? 1 : 0,
    notation: value >= 1000000 ? "compact" : "standard",
  }).format(value);
}

function formatPercent(value, digits = 1) {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

function formatInteger(value) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(i18n.locale, { maximumFractionDigits: 0 }).format(
    Math.max(0, Math.round(value))
  );
}

function formatFte(value) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(i18n.locale, {
    minimumFractionDigits: value < 10 && Math.abs(value - Math.round(value)) > 0.05 ? 1 : 0,
    maximumFractionDigits: value < 10 ? 1 : 0,
  }).format(Math.max(0, value));
}

function formatSignedInteger(value) {
  if (!Number.isFinite(value)) return "—";
  const formatted = new Intl.NumberFormat(i18n.locale, {
    maximumFractionDigits: 0,
  }).format(Math.abs(Math.round(value)));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return "0";
}

function updateSliderOutputs() {
  sliderIds.forEach((id) => {
    element(`${id}-output`).textContent = `${Number(element(id).value).toFixed(0)}%`;
  });
}

function applyPreset(presetKey) {
  const preset = PRESETS[presetKey] || PRESETS.custom;
  const copy = getPresetCopy(presetKey);
  activePreset = presetKey;
  setInputValues({ ...MODEL_DEFAULTS, ...preset.values });
  element("preset-select").value = presetKey;
  element("preset-note").textContent = copy.note;
  element("scenario-title").textContent = copy.name;
  renderPresetContext(preset);
  renderSourceFooter(preset);
  updateSalaryNote();
  saveState();
  render();
}

function renderPresetContext(preset) {
  const copy = getPresetCopy(activePreset);
  element("preset-industry").textContent = copy.industry;
  element("result-industry").textContent = copy.industry;
  element("preset-collapsed-name").textContent = copy.name;
  element("preset-collapsed-industry").textContent = copy.industry;
  element("preset-margin-reference").textContent =
    activePreset === "custom"
      ? t("preset.customMargin")
      : t("preset.loadedMargin", {
          margin: Number(preset.values.grossMargin).toFixed(1),
        });
}

function updateSalaryNote() {
  const country = COUNTRIES[element("country").value];
  const benchmark = salaryBenchmarks[element("country").value] || country.salary;
  element("salary-market-note").textContent =
    t("salary.reference", {
      country: localizedCountryName(element("country").value),
      amount: formatMoney(benchmark),
    });
}

function renderSourceFooter(preset) {
  const footer = element("source-footer");
  if (!preset.sources.length) {
    footer.textContent = t("source.synthetic");
    return;
  }
  const links = preset.sources
    .map(
      (source) =>
        `<a href="${source.url}" target="_blank" rel="noreferrer">${source.label}</a>`
    )
    .join(" · ");
  footer.innerHTML =
    t("source.public", { links });
}

function setMobileSectionSummary(type, key, text) {
  const entry = mobileAccordionSections[type].get(key);
  if (entry) entry.summary.textContent = text;
}

function updateMobileSummaries(values, result) {
  const positivePathCount = activePositivePaths.filter(
    (path) => path.reachesPositive
  ).length;
  const baseUncertainty =
    result.uncertainty.find((scenario) => scenario.mode === "base") ||
    result.uncertainty[0];
  const benchmark = countryComparison(values, salaryBenchmarks).find(
    (item) => item.code === values.country
  );

  setMobileSectionSummary(
    "inputs",
    "company",
    t("mobile.summary.company", {
      employees: formatInteger(values.employees),
      revenue: formatMoneyMillions(values.revenue),
    })
  );
  setMobileSectionSummary(
    "inputs",
    "ai",
    t("mobile.summary.ai", {
      exposure: `${Number(values.exposure).toFixed(0)}%`,
      adoption: `${Number(values.adoption).toFixed(0)}%`,
      speed: `${Number(values.efficiency).toFixed(0)}%`,
    })
  );
  setMobileSectionSummary(
    "inputs",
    "strategy",
    t("mobile.summary.strategy", {
      margin: `${Number(values.targetMargin).toFixed(1)}%`,
      demand: `${Number(values.demandCeiling).toFixed(0)}%`,
    })
  );
  setMobileSectionSummary(
    "inputs",
    "paths",
    t(
      result.verdictClass === "positive"
        ? "mobile.summary.pathsPositive"
        : "mobile.summary.paths",
      { count: positivePathCount }
    )
  );

  const attributedChange =
    result.aiAttributedAdjustmentDelta === null
      ? t("result.notAttributable")
      : `${formatSignedInteger(result.aiAttributedAdjustmentDelta)} FTE`;
  setMobileSectionSummary(
    "results",
    "attribution",
    t("mobile.summary.attribution", { value: attributedChange })
  );
  setMobileSectionSummary(
    "results",
    "interpretation",
    localizedVerdict(result.verdict)
  );
  setMobileSectionSummary(
    "results",
    "cash",
    t("mobile.summary.cash", { value: formatMoneyMillions(result.npv) })
  );
  setMobileSectionSummary(
    "results",
    "uncertainty",
    t("mobile.summary.uncertainty", {
      value: formatMoneyMillions(baseUncertainty?.npv ?? result.npv),
    })
  );
  setMobileSectionSummary(
    "results",
    "performance",
    Number.isFinite(result.breakEvenEfficiency)
      ? t("mobile.summary.breakEven", {
          value: formatPercent(result.breakEvenEfficiency),
        })
      : t("result.noRevenueBreakEven")
  );
  setMobileSectionSummary(
    "results",
    "tradeoff",
    result.required.feasible
      ? t("mobile.summary.adjustment", {
          value: formatPercent(result.required.cutRate, 0),
        })
      : t("result.noFeasible")
  );
  setMobileSectionSummary(
    "results",
    "native",
    t("mobile.summary.avoided", {
      value: formatInteger(result.avoidedHires),
    })
  );
  setMobileSectionSummary(
    "results",
    "labor",
    t("mobile.summary.labor", {
      country: localizedCountryName(values.country),
      value: Number.isFinite(benchmark?.coverage)
        ? benchmark.coverage.toFixed(2)
        : "∞",
    })
  );

  const resultTab = element("mobile-results-tab");
  resultTab.classList.remove(
    "mobile-verdict-positive",
    "mobile-verdict-caution",
    "mobile-verdict-negative"
  );
  resultTab.classList.add(`mobile-verdict-${result.verdictClass}`);
  resultTab.setAttribute(
    "aria-label",
    t("mobile.view.analysisWithVerdict", {
      verdict: localizedVerdict(result.verdict),
    })
  );
}

function render() {
  const values = getInputValues();
  const result = calculate(values);
  const preset = PRESETS[activePreset] || PRESETS.custom;

  element("current-rpe").textContent = formatMoney(result.currentRpe * 1000000);
  element("projected-rpe").textContent = formatMoney(result.projectedRpe * 1000000);
  element("rpe-change").textContent =
    t("result.vsCurrent", {
      value: formatPercent(
        result.projectedRpe / Math.max(result.currentRpe, 0.000001) - 1
      ),
    });
  element("ai-roi").textContent = Number.isFinite(result.aiRoi)
    ? formatPercent(result.aiRoi)
    : "∞";
  element("profit-delta").textContent =
    t("result.annualProfitDelta", {
      value: formatMoneyMillions(result.aiProfitDelta),
    });
  element("effective-gain").textContent = formatPercent(result.effectiveGain);
  element("equivalent-fte").textContent =
    result.addedWorkFte > 0
      ? t("result.additionalWork", { value: formatFte(result.addedWorkFte) })
      : t("result.outputFte", { value: formatFte(result.growthEquivalentFte) });

  element("break-even-efficiency").textContent = Number.isFinite(
    result.breakEvenEfficiency
  )
    ? formatPercent(result.breakEvenEfficiency)
    : t("result.noRevenueBreakEven");
  element("break-even-size").textContent = Number.isFinite(result.breakEvenSize)
    ? `${formatInteger(result.breakEvenSize)}+ FTE`
    : t("result.noPositiveRange");
  element("required-growth").textContent = formatPercent(result.requiredGrowth);

  element("capacity-fte").textContent = `${formatFte(result.releasableFte)} FTE`;
  element("capacity-note").textContent =
    t("result.capacityNote", {
      saved: formatPercent(result.grossTaskTimeSaved),
      overhead: formatPercent(result.totalOverhead),
    });
  element("safe-fte").textContent = `${formatFte(result.safeFte)} FTE`;
  element("baseline-required-adjustment").textContent =
    result.baselineRequired.feasible
      ? `${formatInteger(result.baselineRequired.cutCount)} FTE`
      : t("result.noFeasible");
  element("ai-attributed-adjustment").textContent =
    result.aiAttributedAdjustmentDelta === null
      ? t("result.notAttributable")
      : `${formatSignedInteger(result.aiAttributedAdjustmentDelta)} FTE`;

  const comparisonText = result.required.feasible
      ? preset.comparisonCut
      ? t("result.disclosedReference", {
          count: formatInteger(preset.comparisonCut),
        })
      : ""
    : "";
  element("required-cut-note").textContent =
    result.aiAttributedAdjustmentDelta === null
      ? t("result.deltaUnavailable")
      : result.aiAttributedAdjustmentDelta > 0
        ? t("result.deltaIncreases", {
            count: formatInteger(result.aiAttributedAdjustmentDelta),
            reference: comparisonText,
          })
        : result.aiAttributedAdjustmentDelta < 0
          ? t("result.deltaReduces", {
              count: formatInteger(Math.abs(result.aiAttributedAdjustmentDelta)),
              reference: comparisonText,
            })
          : t("result.deltaZero", { reference: comparisonText });
  renderRequiredCutBreakdown(values, result);
  renderHorizon(values, result);
  renderUncertainty(result);

  const verdict = element("verdict");
  verdict.textContent = localizedVerdict(result.verdict);
  verdict.className = `verdict verdict-${result.verdictClass}`;
  const verdictCard = element("verdict-card");
  verdictCard.className = `verdict-card verdict-card-${result.verdictClass}`;
  element("verdict-note").textContent = t(`verdict.note.${result.verdictClass}`);

  const warning = element("model-warning");
  if (result.warnings.length) {
    warning.hidden = false;
    warning.textContent = result.warnings.map(localizedWarning).join(" ");
  } else {
    warning.hidden = true;
    warning.textContent = "";
  }

  element("legacy-headcount").textContent =
    `${formatInteger(result.noAiHeadcountForProjectedRevenue)} FTE`;
  element("native-headcount").textContent =
    `${formatInteger(result.aiNativeHeadcount)} FTE`;
  element("avoided-hires").textContent =
    `${formatInteger(result.avoidedHires)} FTE`;
  element("native-rpe").textContent = formatMoney(result.aiNativeRpe * 1000000);
  element("native-advantage").textContent =
    t("result.nativeAdvantage", {
      value: formatPercent(
        result.aiNativeRpe / Math.max(result.currentRpe, 0.000001) - 1
      ),
    });

  renderAnalysis(values, result);
  renderScenarioDiagnostics(values, result);
  renderCountryBars(values);
  drawPositiveZone(values);
  drawTradeoff(values, result);
  updateMobileSummaries(values, result);
  saveState();
}

function renderHorizon(values, result) {
  element("first-year-cash-flow").textContent =
    formatMoneyMillions(result.firstYearCashFlow);
  element("scenario-npv").textContent = formatMoneyMillions(result.npv);
  element("scenario-npv-note").textContent =
    t("horizon.npvNote", {
      years: formatInteger(values.analysisYears),
      rate: Number(values.discountRate).toFixed(1),
    });
  element("payback-year").textContent = result.paybackYear
    ? t("horizon.year", { year: result.paybackYear })
    : t("horizon.beyond", { years: formatInteger(values.analysisYears) });
  element("timeline-grid").innerHTML = result.timeline
    .map(
      (year) => `
        <div>
          <span>${t("horizon.realized", {
            year: year.year,
            value: formatPercent(year.realization, 0),
          })}</span>
          <strong>${formatMoneyMillions(year.cashFlowDelta)}</strong>
          <small>${t("horizon.cumulative", {
            value: formatMoneyMillions(year.cumulativeCashFlow),
          })}</small>
        </div>
      `
    )
    .join("");
}

function renderUncertainty(result) {
  const labels = {
    conservative: t("uncertainty.conservative"),
    base: t("uncertainty.base"),
    upside: t("uncertainty.upside"),
  };
  element("uncertainty-grid").innerHTML = result.uncertainty
    .map(
      (scenario) => `
        <article class="uncertainty-card uncertainty-card-${scenario.mode}">
          <span>${labels[scenario.mode]}</span>
          <strong>${t("uncertainty.npv", {
            value: formatMoneyMillions(scenario.npv),
          })}</strong>
          <small>${t("uncertainty.roi", {
            roi: formatPercent(scenario.aiRoi),
            cash: formatMoneyMillions(scenario.firstYearCashFlow),
          })}</small>
          <small>${t("uncertainty.required", {
            value: formatPercent(scenario.requiredGrowth),
          })}</small>
        </article>
      `
    )
    .join("");
}

function localizeScenario(scenario, values, result) {
  if (!i18n.isChinese()) return scenario;
  const percent = (value) => formatPercent(value);
  const statuses = {
    high: "高敏感度",
    medium: "需要驗證",
    low: "相對穩定",
  };
  const base = {
    ...scenario,
    status:
      scenario.code === "ai-native-option"
        ? scenario.tone === "opportunity"
          ? "結構性機會"
          : "機會有限"
        : statuses[scenario.level],
  };
  const fixedAnnualCost =
    values.fixedAiCost + values.transitionCost / values.amortizationYears;
  const fixedCostShare =
    result.annualAiCost > 0 ? fixedAnnualCost / result.annualAiCost : 0;
  const laborValue =
    result.releasableFte *
    (values.automationShare / 100) *
    (1 - values.redeployShare / 100) *
    (1 - values.riskBuffer / 100) *
    values.salary /
    1000000;
  const laborCoverage =
    result.annualAiCost > 0 ? laborValue / result.annualAiCost : Infinity;
  const avoidedHireRate =
    result.noAiHeadcountForProjectedRevenue > 0
      ? result.avoidedHires / result.noAiHeadcountForProjectedRevenue
      : 0;

  const translations = {
    "cost-overhang": {
      title: "AI 成本早於已驗證價值發生",
      evidence: `穩態 AI ROI 為 ${
        Number.isFinite(result.aiRoi) ? percent(result.aiRoi) : "無限"
      }，情境仍需增加相當於目前營收 ${percent(result.requiredGrowth)} 的收入才能損益兩平。`,
      mechanism: "帳號、API、平台與轉型支出會立即進入成本，但節省時間不會自動轉換成營收或可移除的營運產能。",
      adjustment: "先聚焦可量測流程。擴大導入前，追蹤實際 AI 帳單、端到端任務時間、錯誤率與增量毛利。",
    },
    "adoption-gap": {
      title: "工具能力尚未轉化成全組織採用",
      evidence: `任務總效率提升為 ${percent(values.efficiency / 100)}，實際任務採用率為 ${percent(values.adoption / 100)}。`,
      mechanism: "少數熟練使用者的結果可能高估全組織產能；資料存取、權限、流程設計與信任都可能限制採用。",
      adjustment: "以實際完成任務衡量採用，而非帳號開通。先建立職務基準並排除流程限制，再購買更多容量。",
    },
    "quality-debt": {
      title: "表面速度被品質與修正重做抵銷",
      evidence: `產出價值保留率為 ${percent(values.quality / 100)}，模型淨生產力變化為 ${percent(result.productivityUplift)}。`,
      mechanism: "生成速度可能掩蓋審核、修正重做、下游缺陷、法遵風險與客戶信任成本。",
      adjustment: "量測完整交付週期、人工審核時間、缺陷率與事故成本，不要只以初稿生成時間衡量生產力。",
    },
    "demand-conversion": {
      title: "釋放產能高於已驗證市場需求",
      evidence: `${percent(values.redeployShare / 100)} 的釋放產能投入成長，RPE 轉換效率為 ${percent(values.revenueConversion / 100)}，需求上限為 ${percent(values.demandCeiling / 100)}。`,
      mechanism: "產能不等於需求。若缺乏待辦訂單、定價能力、通路或付費意願，更快的產品、銷售與服務工作不會產生經濟價值。",
      adjustment: "將轉換假設連結到合格商機、轉換率、定價測試、待辦訂單或交付限制。",
    },
    "margin-trap": {
      title: "低毛利削弱 AI 營收回收能力",
      evidence: `毛利率為 ${percent(values.grossMargin / 100)}。每 US$1 營收在 AI 交付與營業費用前約留下 US$${(values.grossMargin / 100).toFixed(2)}。`,
      mechanism: "硬體、製造、物流與授權內容企業即使創造大量營收，增量貢獻仍可能有限。",
      adjustment: "研究良率、定價、採購、庫存、服務附加與高毛利收入，而不只追求交易量。",
    },
    "labor-cost-mismatch": {
      title: "當地人力成本價值不足以單獨回收 AI 支出",
      evidence: `每 US$1 年度 AI 成本約對應 US$${
        Number.isFinite(laborCoverage) ? laborCoverage.toFixed(2) : "∞"
      } 的可財務實現人力價值。`,
      mechanism: "全球定價的模型與運算成本，相對低人力成本市場可能偏高，尤其當營收也採當地價格時。",
      adjustment: "採用模型路由、快取、批次與用量限制，並同時評估全球營收、品質、週期時間與未來避免新增的人力。",
    },
    "adjustment-overreach": {
      title: "財務目標可能被誤讀為 AI 可替代產能",
      evidence: `未導入 AI 的基準需要 ${
        result.baselineRequired.feasible
          ? `${formatInteger(result.baselineRequired.cutCount)} FTE`
          : "在 70% 範圍內沒有可行解"
      }；AI 情境需要 ${
        result.required.feasible
          ? `${formatInteger(result.required.cutCount)} FTE`
          : "在 70% 範圍內沒有可行解"
      }；可進一步評估的人力空間為 ${formatFte(result.safeFte)} FTE。`,
      mechanism: "利潤壓力可能來自過高目標、低毛利、固定成本或需求不足。把全部缺口歸因於人數，會將既有經濟問題錯誤歸因於 AI。",
      adjustment: "先比較未導入 AI 與 AI 情境，再測試營收、非人力成本、AI 成本與目標假設，最後才進行職務層級研究。",
    },
    "scale-mismatch": {
      title: "固定平台與轉型成本不符合企業規模",
      evidence: `固定成本與轉型攤提占年度 AI 成本 ${percent(fixedCostShare)}；${
        Number.isFinite(result.breakEvenSize)
          ? `模型正向經濟門檻約為 ${formatInteger(result.breakEvenSize)} FTE`
          : "目前假設下沒有正向規模區間"
      }。`,
      mechanism: "小型企業照搬大型企業平台架構可能破壞價值；大型企業則可能累積遷移與整合複雜度。",
      adjustment: "小型組織優先採標準化、按用量計價工具；大型企業應區分必要治理與選配客製，並依流程分階段遷移。",
    },
    "ai-native-option": {
      title: "以 AI-native 設計避免未來擴張負債",
      evidence: `模型估計可能避免新增 ${formatInteger(result.avoidedHires)} FTE，相當於傳統擴張需求的 ${percent(avoidedHireRate)}。`,
      mechanism: "AI-native 的主要優勢可能是在組織層級增加前，就以較低協調負擔設計流程、資料與責任歸屬。",
      adjustment: "優先觀察延後新增人力、提高 RPE 與縮短產品週期，並以已核准職缺與實際需求追蹤成效。",
    },
  };

  return { ...base, ...translations[scenario.code] };
}

let activePositivePaths = [];

function positiveResultScore(result, values) {
  const modeledPressure = result.required.feasible
    ? Math.max(0, result.required.cutCount - result.safeFte)
    : values.employees * 0.7;
  return (
    result.aiProfitDelta -
    result.requiredGrowth * values.revenue -
    modeledPressure * values.salary / 1000000
  );
}

function formatPathValue(key, value) {
  if (
    [
      "efficiency",
      "adoption",
      "quality",
      "reviewOverhead",
      "reworkOverhead",
      "aiOpsOverhead",
      "revenueConversion",
      "demandCeiling",
      "productInferenceCostRate",
      "targetMargin",
    ].includes(key)
  ) {
    return `${Number(value).toFixed(value < 10 ? 1 : 0)}%`;
  }
  if (key === "aiCostPerEmployee") return formatMoney(value);
  return formatMoneyMillions(value);
}

function pathLabel(config, value) {
  const formatted = formatPathValue(config.key, value);
  if (i18n.isChinese()) {
    return `${config.zh} ${formatted}`;
  }
  if (i18n.locale !== "en") {
    return t("path.set", {
      title: getHelpContent(config.key)?.title || config.en,
      value: formatted,
    });
  }
  return `${config.en} ${formatted}`;
}

function pathExplanation(config) {
  if (i18n.isChinese()) return config.zhDetail;
  if (i18n.locale === "en") return config.enDetail;
  return t("path.detail", {
    title: getHelpContent(config.key)?.title || config.en,
  });
}

function findSinglePositivePath(values, baseResult, config) {
  const current = Number(values[config.key]);
  const boundary = Number(config.boundary(values));
  if (
    !Number.isFinite(current) ||
    !Number.isFinite(boundary) ||
    current === boundary
  ) {
    return null;
  }

  const boundaryValues = { ...values, [config.key]: boundary };
  const boundaryResult = calculate(boundaryValues);
  if (boundaryResult.verdictClass !== "positive") return null;

  let positiveEdge = boundary;
  let negativeEdge = current;
  for (let index = 0; index < 22; index += 1) {
    const middle = (positiveEdge + negativeEdge) / 2;
    const middleResult = calculate({ ...values, [config.key]: middle });
    if (middleResult.verdictClass === "positive") {
      positiveEdge = middle;
    } else {
      negativeEdge = middle;
    }
  }

  const target =
    config.direction === "increase"
      ? Math.ceil(positiveEdge * 10) / 10
      : Math.floor(positiveEdge * 10) / 10;
  const pathValues = { ...values, [config.key]: target };
  const result = calculate(pathValues);
  return {
    code: config.key,
    values: pathValues,
    result,
    reachesPositive: result.verdictClass === "positive",
    title: pathLabel(config, target),
    explanation: pathExplanation(config),
    movement: Math.abs(target - current) / Math.max(1, Math.abs(boundary - current)),
  };
}

function buildCombinedPositivePath(values, baseResult, configs) {
  let workingValues = { ...values };
  configs.forEach((config) => {
    workingValues[config.key] = config.boundary(values);
  });
  let workingResult = calculate(workingValues);

  if (workingResult.verdictClass !== "positive") {
    return null;
  }

  const selected = [...configs];
  [...selected].reverse().forEach((config) => {
    const candidateValues = {
      ...workingValues,
      [config.key]: values[config.key],
    };
    const candidateResult = calculate(candidateValues);
    if (candidateResult.verdictClass === "positive") {
      workingValues = candidateValues;
      workingResult = candidateResult;
      selected.splice(selected.indexOf(config), 1);
    }
  });

  const changes = selected.map((config) =>
    pathLabel(config, workingValues[config.key])
  );
  return {
    code: "combined",
    values: workingValues,
    result: workingResult,
    reachesPositive: workingResult.verdictClass === "positive",
    title: t("path.combined"),
    explanation: i18n.isChinese()
      ? changes.join("、")
      : changes.join("; "),
    movement: selected.length,
  };
}

function buildPositivePaths(values, result) {
  if (result.verdictClass === "positive") return [];

  const configs = [
    {
      key: "efficiency",
      direction: "increase",
      boundary: () => 200,
      en: "Increase gross task speed uplift to",
      zh: "將任務總效率提升提高到",
      enDetail: "Tests whether stronger measured task-level speed is sufficient while other assumptions remain unchanged.",
      zhDetail: "測試在其他假設不變時，更高且可實測的任務效率是否足以讓結果轉正。",
    },
    {
      key: "adoption",
      direction: "increase",
      boundary: () => 100,
      en: "Increase effective task adoption to",
      zh: "將實際任務採用率提高到",
      enDetail: "Tests whether more eligible work consistently using AI can absorb current program cost.",
      zhDetail: "測試讓更多適用任務穩定使用 AI，是否足以吸收目前導入成本。",
    },
    {
      key: "quality",
      direction: "increase",
      boundary: () => 100,
      en: "Increase output value retention to",
      zh: "將產出價值保留率提高到",
      enDetail: "Tests the value of reducing defects and preserving business-quality output.",
      zhDetail: "測試降低錯誤並維持商用品質後，可保留多少 AI 產出價值。",
    },
    {
      key: "reviewOverhead",
      direction: "decrease",
      boundary: () => 0,
      en: "Reduce human review time to",
      zh: "將人工審核時間降低到",
      enDetail: "Tests a narrower workflow with clearer approval rules and less duplicate review.",
      zhDetail: "測試縮小流程範圍、建立清楚核准規則並減少重複審核的效果。",
    },
    {
      key: "reworkOverhead",
      direction: "decrease",
      boundary: () => 0,
      en: "Reduce correction and retry time to",
      zh: "將修正重做時間降低到",
      enDetail: "Tests the value of better context, evaluation, and first-pass output quality.",
      zhDetail: "測試改善脈絡、評測與首次產出品質後，降低修正重做時間的效果。",
    },
    {
      key: "aiOpsOverhead",
      direction: "decrease",
      boundary: () => 0,
      en: "Reduce AI administration time to",
      zh: "將 AI 管理時間降低到",
      enDetail: "Tests whether standardized prompts, access, evaluation, and monitoring reduce recurring coordination work.",
      zhDetail: "測試標準化提示、權限、評測與監控後，是否能降低持續管理工作。",
    },
    {
      key: "revenueConversion",
      direction: "increase",
      boundary: () => 150,
      en: "Increase capacity-to-revenue conversion to",
      zh: "將產能轉換營收效率提高到",
      enDetail: "Tests stronger pricing, sales conversion, or delivery of revenue-producing work.",
      zhDetail: "測試更好的定價、銷售轉換或營收型工作交付能力。",
    },
    {
      key: "demandCeiling",
      direction: "increase",
      boundary: () => 100,
      en: "Validate demand up to",
      zh: "將已驗證需求上限提高到",
      enDetail: "Requires qualified pipeline, backlog, pricing evidence, or customer demand rather than unused capacity.",
      zhDetail: "必須以合格商機、待辦訂單、定價證據或客戶需求支持，而不是只增加閒置產能。",
    },
    {
      key: "aiCostPerEmployee",
      direction: "decrease",
      boundary: () => values.aiCostPerEmployee * 0.25,
      en: "Reduce annual AI cost per employee to",
      zh: "將每位員工年度 AI 成本降低到",
      enDetail: "Tests model routing, usage controls, license consolidation, and lower-cost tools.",
      zhDetail: "測試模型分流、用量控制、授權整併與較低成本工具的效果。",
    },
    {
      key: "fixedAiCost",
      direction: "decrease",
      boundary: () => values.fixedAiCost * 0.25,
      en: "Reduce recurring fixed platform cost to",
      zh: "將持續性固定平台成本降低到",
      enDetail: "Tests a smaller platform footprint and less custom infrastructure.",
      zhDetail: "測試縮小平台範圍並減少客製基礎設施的效果。",
    },
    {
      key: "transitionCost",
      direction: "decrease",
      boundary: () => values.transitionCost * 0.25,
      en: "Reduce one-time transformation cost to",
      zh: "將一次性轉型成本降低到",
      enDetail: "Tests staged implementation instead of a large organization-wide launch.",
      zhDetail: "測試分階段導入，而非一次推動全組織轉型的效果。",
    },
    {
      key: "productInferenceCostRate",
      direction: "decrease",
      boundary: () => 0,
      en: "Reduce product inference cost to",
      zh: "將產品推論成本率降低到",
      enDetail: "Tests model routing, caching, batching, and pricing that preserve contribution margin on AI-enabled revenue.",
      zhDetail: "測試模型分流、快取、批次處理與定價，是否能保留 AI 產品營收的貢獻毛利。",
    },
    {
      key: "targetMargin",
      direction: "decrease",
      boundary: () => 0,
      en: "Reassess the target operating margin at",
      zh: "重新檢視目標營業利益率至",
      enDetail: "Separates an aggressive financial target from the economics actually attributable to AI.",
      zhDetail: "用來區分過高的財務目標與真正可歸因於 AI 的經濟效果，不應只為取得理想答案而調低。",
    },
  ];

  const singlePaths = configs
    .map((config) => findSinglePositivePath(values, result, config))
    .filter(Boolean)
    .sort((a, b) => a.movement - b.movement)
    .slice(0, 4);

  const combined = buildCombinedPositivePath(values, result, configs);
  if (singlePaths.length) {
    if (combined?.reachesPositive) singlePaths.push(combined);
    return singlePaths.slice(0, 5);
  }

  const individualImprovements = configs
    .map((config) => {
      const pathValues = {
        ...values,
        [config.key]: config.boundary(values),
      };
      return {
        code: config.key,
        values: pathValues,
        result: calculate(pathValues),
        reachesPositive: false,
        title: pathLabel(config, pathValues[config.key]),
        explanation: pathExplanation(config),
      };
    })
    .sort(
      (a, b) =>
        positiveResultScore(b.result, b.values) -
        positiveResultScore(a.result, a.values)
    )
    .slice(0, 3);

  if (combined) return [combined, ...individualImprovements];
  return individualImprovements;
}

function renderScenarioDiagnostics(values, result) {
  activePositivePaths = buildPositivePaths(values, result);

  if (result.verdictClass === "positive") {
    element("scenario-risk-summary").textContent = t(
      "scenario.currentPositive"
    );
    element("scenario-grid").innerHTML = `
      <article class="scenario-card scenario-card-opportunity">
        <div class="scenario-card-header">
          <h3>${localizedVerdict(result.verdict)}</h3>
          <span class="scenario-status">${t("scenario.reachesPositive")}</span>
        </div>
        <p class="scenario-evidence">${
          t("scenario.positiveEvidence", {
            roi: formatPercent(result.aiRoi),
            years: formatInteger(values.analysisYears),
            npv: formatMoneyMillions(result.npv),
          })
        }</p>
      </article>
    `;
    return;
  }

  const positiveCount = activePositivePaths.filter(
    (path) => path.reachesPositive
  ).length;
  element("scenario-risk-summary").textContent = positiveCount
    ? t("scenario.pathsFound", { count: positiveCount })
    : t("scenario.noPath");

  element("scenario-grid").innerHTML = activePositivePaths
    .map(
      (path, index) => `
        <article class="scenario-card ${
          path.reachesPositive
            ? "scenario-card-opportunity"
            : "scenario-card-watch"
        }">
          <div class="scenario-card-header">
            <h3>${path.title}</h3>
            <span class="scenario-status">${
              path.reachesPositive
                ? t("scenario.reachesPositive")
                : t("scenario.closest")
            }</span>
          </div>
          <p class="scenario-evidence">${path.explanation}</p>
          <div class="scenario-path-metrics">
            <span>${t("scenario.roiChange", {
              before: formatPercent(result.aiRoi),
              after: formatPercent(path.result.aiRoi),
            })}</span>
            <span>${t("scenario.npvChange", {
              before: formatMoneyMillions(result.npv),
              after: formatMoneyMillions(path.result.npv),
            })}</span>
            <span>${t("scenario.requiredChange", {
              before: formatPercent(result.requiredGrowth),
              after: formatPercent(path.result.requiredGrowth),
            })}</span>
          </div>
          <button class="scenario-apply-button" type="button" data-path-index="${index}">
            ${t("scenario.apply")}
          </button>
        </article>
      `
    )
    .join("");
}

function renderRequiredCutBreakdown(values, result) {
  const aiNoAdjustmentMargin =
    result.projectedRevenue > 0
      ? result.projectedProfitNoCuts / result.projectedRevenue
      : -Infinity;
  const baselineRevenue =
    values.revenue * (1 + values.historicalGrowth / 100);
  const baselineNoAdjustmentMargin =
    baselineRevenue > 0
      ? result.baselineFutureProfit / baselineRevenue
      : -Infinity;
  const targetMargin = values.targetMargin / 100;
  const baselineLabel = result.baselineRequired.feasible
    ? `${formatInteger(result.baselineRequired.cutCount)} FTE`
    : t("breakdown.noSolution");
  const aiLabel = result.required.feasible
    ? `${formatInteger(result.required.cutCount)} FTE`
    : t("breakdown.noSolution");
  const deltaLabel =
    result.aiAttributedAdjustmentDelta === null
      ? t("result.notAttributable")
      : `${formatSignedInteger(result.aiAttributedAdjustmentDelta)} FTE`;

  element("required-cut-breakdown").innerHTML = `
    <div>
      <span>${t("breakdown.noAiMargin")}</span>
      <strong>${formatPercent(baselineNoAdjustmentMargin)}</strong>
      <small>${t("breakdown.baselinePressure", { value: baselineLabel })}</small>
    </div>
    <div>
      <span>${t("breakdown.aiMargin")}</span>
      <strong>${formatPercent(aiNoAdjustmentMargin)}</strong>
      <small>${t("breakdown.aiPressure", { value: aiLabel })}</small>
    </div>
    <div>
      <span>${t("breakdown.delta")}</span>
      <strong>${deltaLabel}</strong>
      <small>${t("breakdown.deltaNote")}</small>
    </div>
    <div>
      <span>${t("breakdown.target")}</span>
      <strong>${formatPercent(targetMargin)}</strong>
      <small>${t("breakdown.safe", { value: formatFte(result.safeFte) })}</small>
    </div>
  `;
}

function renderAnalysis(values, result) {
  const currentMargin =
    values.revenue > 0 ? values.operatingProfit / values.revenue : 0;
  const rpeChange =
    result.projectedRpe / Math.max(result.currentRpe, 0.000001) - 1;
  const benchmark = countryComparison(values, salaryBenchmarks).find(
    (item) => item.code === values.country
  );
  const attribution =
    result.aiAttributedAdjustmentDelta === null
      ? t("analysis.attributionNone")
      : result.aiAttributedAdjustmentDelta > 0
        ? t("analysis.attributionIncrease", {
            baseline: formatInteger(result.baselineRequired.cutCount),
            delta: formatInteger(result.aiAttributedAdjustmentDelta),
          })
        : result.aiAttributedAdjustmentDelta < 0
          ? t("analysis.attributionReduce", {
              baseline: formatInteger(result.baselineRequired.cutCount),
              delta: formatInteger(Math.abs(result.aiAttributedAdjustmentDelta)),
            })
          : t("analysis.attributionZero");
  const safety =
    result.required.feasible && result.required.cutCount <= result.safeFte + 0.5
      ? t("analysis.safetyWithin")
      : t("analysis.safetyAbove");
  const economics =
    result.aiProfitDelta >= 0
      ? t("analysis.aiPositive", {
          profit: formatMoneyMillions(result.aiProfitDelta),
          roi: Number.isFinite(result.aiRoi)
            ? formatPercent(result.aiRoi)
            : "∞",
        })
      : t("analysis.aiNegative", {
          profit: formatMoneyMillions(Math.abs(result.aiProfitDelta)),
          roi: formatPercent(result.aiRoi),
        });
  const breakEven = Number.isFinite(result.breakEvenEfficiency)
    ? t("analysis.breakEven", {
        value: formatPercent(result.breakEvenEfficiency),
      })
    : t("analysis.breakEvenNone");
  const size = Number.isFinite(result.breakEvenSize)
    ? t("analysis.size", { value: formatInteger(result.breakEvenSize) })
    : t("analysis.sizeNone");

  element("analysis-copy").innerHTML = `
    <p class="analysis-summary">${t("analysis.overall", {
      currentRpe: formatMoney(result.currentRpe * 1000000),
      margin: formatPercent(currentMargin),
      productivity: formatPercent(result.productivityUplift),
      projectedRpe: formatMoney(result.projectedRpe * 1000000),
      rpeChange: formatPercent(rpeChange),
    })}</p>
    <p>${t("analysis.investment", {
      economics,
      breakEven,
      size,
      requiredGrowth: formatPercent(result.requiredGrowth),
    })}</p>
    <p>${t("analysis.attribution", {
      attribution,
      safety,
      safeFte: formatFte(result.safeFte),
    })}</p>
    <p>${t("analysis.cash", {
      cash: formatMoneyMillions(result.firstYearCashFlow),
      years: formatInteger(values.analysisYears),
      npv: formatMoneyMillions(result.npv),
      country: localizedCountryName(values.country),
      coverage: benchmark.coverage.toFixed(2),
    })}</p>
  `;
}

function renderCountryBars(values) {
  const comparisons = countryComparison(values, salaryBenchmarks);
  const finiteCoverage = comparisons
    .map((item) => item.coverage)
    .filter(Number.isFinite);
  const maxCoverage = Math.max(1, ...finiteCoverage);
  element("country-bars").innerHTML = comparisons
    .map((item) => {
      const width = Number.isFinite(item.coverage)
        ? Math.max(1, item.coverage / maxCoverage * 100)
        : 100;
      const coverageText = Number.isFinite(item.coverage)
        ? `US$${item.coverage.toFixed(2)}`
        : "∞";
      return `
        <div class="country-row ${item.code === values.country ? "selected" : ""}">
          <span>${localizedCountryName(item.code)}</span>
          <div class="country-bar-track" title="${t("country.trackTitle")}">
            <div class="country-bar-fill" style="width:${width}%"></div>
          </div>
          <strong>${coverageText}</strong>
          <small>${t("country.row", {
            labor: formatMoneyMillions(item.laborValue / 1000000),
            ai: formatMoneyMillions(item.aiCost / 1000000),
          })}</small>
        </div>
      `;
    })
    .join("");

  const selected = comparisons.find((item) => item.code === values.country);
  element("country-break-even").innerHTML = Number.isFinite(
    selected.breakEvenSalary
  )
    ? t("country.breakEven", {
        breakEven: formatMoney(selected.breakEvenSalary),
        country: localizedCountryName(selected.code),
        salary: formatMoney(selected.salary),
      })
    : t("country.noBreakEven");
}

function renderSalaryEditor() {
  element("salary-editor-grid").innerHTML = Object.entries(COUNTRIES)
    .map(([code, country]) => `
      <label class="salary-benchmark-field">
        <span>
          ${localizedCountryName(code)}
          <button
            class="help-trigger"
            data-help-key="salaryBenchmark"
            type="button"
            aria-label="${t("help.about", { title: getHelpContent("salaryBenchmark").title })}"
            title="${t("help.about", { title: getHelpContent("salaryBenchmark").title })}"
          >i</button>
        </span>
        <input
          type="number"
          min="0"
          step="1000"
          value="${salaryBenchmarks[code]}"
          data-salary-code="${code}"
          aria-label="${t("country.inputLabel", {
            country: localizedCountryName(code),
          })}"
        />
      </label>
    `)
    .join("");

  document.querySelectorAll("[data-salary-code]").forEach((input) => {
    input.addEventListener("input", () => {
      salaryBenchmarks[input.dataset.salaryCode] = Math.max(
        0,
        Number(input.value) || 0
      );
      updateSalaryNote();
      renderCountryBars(getInputValues());
      renderAnalysis(getInputValues(), calculate(getInputValues()));
      saveState();
    });
  });
}

function prepareCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width));
  const height = Math.max(220, Math.floor(rect.height));
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { context, width, height };
}

function mixColor(negative, neutral, positive, normalized) {
  const parse = (hex) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const from = parse(normalized < 0 ? negative : neutral);
  const to = parse(normalized < 0 ? neutral : positive);
  const t = Math.min(1, Math.abs(normalized));
  const rgb = from.map((channel, index) =>
    Math.round(channel + (to[index] - channel) * t)
  );
  return `rgb(${rgb.join(",")})`;
}

function drawPositiveZone(values) {
  const canvas = element("positive-zone-chart");
  const { context: ctx, width, height } = prepareCanvas(canvas);
  const sizes = [5, 10, 25, 50, 100, 250, 500, 1000, 5000, 10000];
  const efficiencies = [100, 80, 60, 50, 40, 30, 20, 10];
  const margin = { top: 14, right: 18, bottom: 42, left: 48 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const cellWidth = chartWidth / sizes.length;
  const cellHeight = chartHeight / efficiencies.length;
  const valuesGrid = [];

  efficiencies.forEach((efficiency) => {
    sizes.forEach((size) => {
      valuesGrid.push(positiveZoneValue(values, size, efficiency));
    });
  });
  const maxAbs = Math.max(0.01, ...valuesGrid.map((value) => Math.abs(value)));

  ctx.clearRect(0, 0, width, height);
  ctx.font = "11px system-ui, sans-serif";
  ctx.textBaseline = "middle";

  efficiencies.forEach((efficiency, row) => {
    ctx.fillStyle = "#656b68";
    ctx.textAlign = "right";
    ctx.fillText(`${efficiency}%`, margin.left - 8, margin.top + (row + 0.5) * cellHeight);

    sizes.forEach((size, column) => {
      const value = positiveZoneValue(values, size, efficiency);
      const normalized = Math.max(-1, Math.min(1, value / maxAbs * 3));
      ctx.fillStyle = mixColor("#c76058", "#f1e2b8", "#2d9a70", normalized);
      ctx.fillRect(
        margin.left + column * cellWidth + 1,
        margin.top + row * cellHeight + 1,
        Math.max(1, cellWidth - 2),
        Math.max(1, cellHeight - 2)
      );
    });
  });

  sizes.forEach((size, column) => {
    ctx.save();
    ctx.translate(margin.left + (column + 0.5) * cellWidth, height - margin.bottom + 12);
    ctx.rotate(-Math.PI / 5);
    ctx.fillStyle = "#656b68";
    ctx.textAlign = "right";
    ctx.fillText(size >= 1000 ? `${size / 1000}k` : String(size), 0, 0);
    ctx.restore();
  });

  const closestSizeIndex = sizes.reduce(
    (best, size, index) =>
      Math.abs(size - values.employees) < Math.abs(sizes[best] - values.employees)
        ? index
        : best,
    0
  );
  const closestEfficiencyIndex = efficiencies.reduce(
    (best, efficiency, index) =>
      Math.abs(efficiency - values.efficiency) <
      Math.abs(efficiencies[best] - values.efficiency)
        ? index
        : best,
    0
  );
  const pointX = margin.left + (closestSizeIndex + 0.5) * cellWidth;
  const pointY = margin.top + (closestEfficiencyIndex + 0.5) * cellHeight;
  ctx.beginPath();
  ctx.arc(pointX, pointY, Math.min(8, cellHeight * 0.25), 0, Math.PI * 2);
  ctx.fillStyle = "#181b1a";
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#414744";
  ctx.textAlign = "center";
  ctx.fillText(t("chart.companyScale"), margin.left + chartWidth / 2, height - 8);
  ctx.save();
  ctx.translate(12, margin.top + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(t("chart.speed"), 0, 0);
  ctx.restore();
}

function drawTradeoff(values, result) {
  const canvas = element("tradeoff-chart");
  const { context: ctx, width, height } = prepareCanvas(canvas);
  const margin = { top: 16, right: 22, bottom: 42, left: 48 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const maxExtraGrowth = Math.max(0.3, result.requiredGrowth * 1.4);
  const points = [];
  const steps = 12;

  for (let index = 0; index <= steps; index += 1) {
    const growth = maxExtraGrowth * index / steps;
    const cut = findRequiredCuts(values, growth);
    points.push({ growth, cutRate: cut.feasible ? cut.cutRate : 0.7, feasible: cut.feasible });
  }

  ctx.clearRect(0, 0, width, height);
  ctx.font = "11px system-ui, sans-serif";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#d8ddda";
  ctx.fillStyle = "#656b68";

  for (let tick = 0; tick <= 4; tick += 1) {
    const y = margin.top + chartHeight * tick / 4;
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(width - margin.right, y);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.round((0.7 - 0.7 * tick / 4) * 100)}%`, margin.left - 8, y);
  }

  for (let tick = 0; tick <= 4; tick += 1) {
    const x = margin.left + chartWidth * tick / 4;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      `${Math.round(maxExtraGrowth * tick / 4 * 100)}%`,
      x,
      height - margin.bottom + 10
    );
  }

  ctx.beginPath();
  points.forEach((point, index) => {
    const x = margin.left + point.growth / maxExtraGrowth * chartWidth;
    const y = margin.top + (1 - point.cutRate / 0.7) * chartHeight;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#087f5b";
  ctx.lineWidth = 3;
  ctx.stroke();

  points.forEach((point) => {
    const x = margin.left + point.growth / maxExtraGrowth * chartWidth;
    const y = margin.top + (1 - point.cutRate / 0.7) * chartHeight;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = point.feasible ? "#087f5b" : "#b43b36";
    ctx.fill();
  });

  ctx.fillStyle = "#414744";
  ctx.textAlign = "center";
  ctx.fillText(t("chart.revenueGrowth"), margin.left + chartWidth / 2, height - 8);
  ctx.save();
  ctx.translate(12, margin.top + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(t("chart.workforce"), 0, 0);
  ctx.restore();

  element("tradeoff-callout").textContent = result.required.feasible
    ? t("chart.aiScenario", {
        value: formatPercent(result.required.cutRate, 0),
      })
    : t("chart.noSolution");
}

function saveState() {
  try {
    localStorage.setItem(
      "ai-efficiency-calculator-state",
      JSON.stringify({
        activePreset,
        values: getInputValues(),
        salaryBenchmarks,
      })
    );
  } catch (error) {
    console.warn("Unable to save calculator state", error);
  }
}

function loadState() {
  try {
    const stored = JSON.parse(
      localStorage.getItem("ai-efficiency-calculator-state") || "null"
    );
    if (!stored || !stored.values) return false;
    activePreset = stored.activePreset in PRESETS ? stored.activePreset : "custom";
    if (stored.salaryBenchmarks) {
      salaryBenchmarks = {
        ...salaryBenchmarks,
        ...stored.salaryBenchmarks,
      };
      renderSalaryEditor();
    }
    element("preset-select").value = activePreset;
    setInputValues(stored.values);
    const preset = PRESETS[activePreset];
    const copy = getPresetCopy(activePreset);
    element("preset-note").textContent = copy.note;
    element("scenario-title").textContent = copy.name;
    renderPresetContext(preset);
    renderSourceFooter(preset);
    updateSalaryNote();
    render();
    return true;
  } catch (error) {
    return false;
  }
}

let printTitleBeforeExport = "";

function finishPdfExport() {
  document.body.classList.remove("is-exporting-pdf");
  element("print-report-header").setAttribute("aria-hidden", "true");
  if (printTitleBeforeExport) document.title = printTitleBeforeExport;
  printTitleBeforeExport = "";
}

function exportScenarioPdf() {
  const copy = getPresetCopy(activePreset);
  const generatedAt = new Intl.DateTimeFormat(i18n.locale, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
  element("print-scenario-name").textContent = copy.name;
  element("print-scenario-industry").textContent = copy.industry;
  element("print-generated-at").textContent = t("export.generatedAt", {
    date: generatedAt,
  });
  element("print-report-header").setAttribute("aria-hidden", "false");
  document.body.classList.add("is-exporting-pdf");
  printTitleBeforeExport = document.title;
  document.title = `ai-economics-${activePreset}`;
  requestAnimationFrame(() => window.print());
}

document.querySelectorAll("[data-input]").forEach((field) => {
  field.addEventListener("input", () => {
    if (field.id === "country") updateSalaryNote();
    updateSliderOutputs();
    render();
  });
});

element("preset-select").addEventListener("change", (event) => {
  applyPreset(event.target.value);
});

element("country").addEventListener("change", (event) => {
  element("salary").value =
    salaryBenchmarks[event.target.value] || COUNTRIES[event.target.value].salary;
  updateSalaryNote();
  render();
});

element("reset-button").addEventListener("click", () => applyPreset(activePreset));
element("export-button").addEventListener("click", exportScenarioPdf);
window.addEventListener("afterprint", finishPdfExport);
element("scenario-grid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-path-index]");
  if (!button) return;
  const path = activePositivePaths[Number(button.dataset.pathIndex)];
  if (!path) return;
  setInputValues(path.values);
  updateSalaryNote();
  render();
});

window.addEventListener("ai-calculator-locale-change", () => {
  const preset = PRESETS[activePreset] || PRESETS.custom;
  const copy = getPresetCopy(activePreset);
  element("preset-note").textContent = copy.note;
  element("scenario-title").textContent = copy.name;
  element("reset-button").title = t("reset");
  element("reset-button").setAttribute("aria-label", t("reset"));
  element("language-select").value = i18n.locale;
  updatePresetToggleLabel();
  renderPresetContext(preset);
  renderSourceFooter(preset);
  renderSalaryEditor();
  refreshHelpLabels();
  refreshMobileInterfaceText();
  updateSalaryNote();
  render();
});

document.querySelectorAll(".section-nav-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".section-nav-button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    element(button.dataset.scrollTarget).scrollIntoView({ behavior: "smooth" });
  });
});

window.addEventListener("resize", () => {
  if (resizeFrame) cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    const values = getInputValues();
    const result = calculate(values);
    drawPositiveZone(values);
    drawTradeoff(values, result);
  });
});

setupHelpSystem();
setupLanguageSelector();
setupResearchDialog();
setupPresetBand();
setupMobileWorkspace();
renderSalaryEditor();
refreshHelpLabels();
element("reset-button").title = t("reset");
element("reset-button").setAttribute("aria-label", t("reset"));

if (!loadState()) {
  applyPreset("custom");
}
