# AI ROI Calculator - 我的公司是否準備好全面導入企業 AI？

這是一個在瀏覽器本地端運作的開源 AI ROI 研究試算器，用於探索公司是否準備好全面導入企業 AI，以及導入後生產力、營收、成本、毛利與組織容量之間可能出現的不同結果。

[線上試算](https://www.all4.ai/) · [English README](./README.md) · [完整模型規格](./docs/MODEL.md) · [Agent 操作指南](./docs/AGENT_GUIDE.md) · [參與貢獻](./CONTRIBUTING.md)

本專案由 [Protico.io](https://protico.io) 製作，採 MIT License 開源。

## 專案緣起

企業常從工具測試的速度提升，直接推論公司整體效率、營收或組織人力空間。但中間仍包含工作曝險、實際採用、人工審核、修正重做、AI 管理時間、市場需求、產品推論成本與毛利率等條件。

本專案將這些假設拆開，並特別區分：

- 企業在未導入 AI 前原本就存在的財務缺口
- AI 導入後新增或減少的財務影響
- 工具表面速度與扣除審核、修正重做後的淨生產力
- 第一年現金流與長期穩態 ROI
- 產能潛力與可驗證市場需求
- 理論釋放工時與可結構化自動化的實際容量
- 桌面版參數區與分析區可各自獨立捲動
- 手機版以固定「設定／分析」工作區切換，並使用單開式章節保留閱讀位置
- 當結果尚未轉正時，提供可套用的動態調整測試路徑

所有結果均為研究假設與敏感度分析，不構成財務、人資、法律或組織調整建議。

內建案例除了公開企業基準，也包含三個可編輯的 SMB 合成研究情境：75 人零售電商、14 人獨立餐廳，以及 750 人台灣硬體製造商。這些數值不是產業統計，目的是比較企業規模、毛利結構、可受 AI 影響的工作比例與固定導入成本如何改變結果。

## 隱私

- 所有計算均在本地瀏覽器完成。
- 介面可即時切換英文、繁體中文、日文、法文與西班牙文，語言偏好只保存在本機瀏覽器。
- 試算模型沒有應用程式後端或帳號系統，也不會主動上傳企業情境輸入。
- 輸入只保存在瀏覽器 `localStorage`。
- PDF 報告透過瀏覽器原生列印流程產生，內容包含右側分析與「通往正向經濟效益的路徑」。
- 線上網站 `all4.ai` 透過 Cloudflare Pages 遞送，並載入 Protico frame
  服務，用於提供產品引導與用戶支援。
- 線上網站也使用 Google Analytics 了解網站是否符合訪客需求。應用程式
  不會將試算輸入值、情境輸出或自訂欄位層級事件傳送到 Google Analytics。
- 這些服務可能會收到一般瀏覽器 request metadata，以及使用者自行在該
  服務中提供的內容。
- 企業若有更高機密性需求，可 clone 專案、移除或阻擋 Protico 與
  Google Analytics scripts，並在離線或內部環境自行部署。

## 啟動

```bash
git clone <repository-url>
cd ai-efficiency-calculator
python3 -m http.server 8000
```

開啟 [http://127.0.0.1:8000](http://127.0.0.1:8000)。

測試：

```bash
node --test calculator.test.js
```

## Cloudflare Pages 部署

正式網站位於 [www.all4.ai](https://www.all4.ai/)，Cloudflare Pages fallback
網址為
[ai-efficiency-calculator.pages.dev](https://ai-efficiency-calculator.pages.dev/)。
部署時只會上傳試算器在瀏覽器中執行所需的正式資產：

```bash
npm run build
npx wrangler pages deploy dist \
  --project-name ai-efficiency-calculator \
  --branch main
```

部署者需要先完成 Wrangler 登入，並具備目標 Cloudflare 帳號的 Pages
權限。企業輸入資料仍只保留在使用者瀏覽器中，網站沒有應用程式後端。
正式線上部署同時使用 Cloudflare 遞送服務、Google Analytics，以及隱私
章節說明的 Protico frame 服務。

## 核心修正

淨任務節省時間：

```text
淨節省時間
= 效率提升 ÷ (1 + 效率提升)
- 人工審核
- 修正重做時間
- AI 管理時間
```

AI 增量營收：

```text
AI 增量營收
= min(
  產能等效 FTE × 現行 RPE × 成長投入比例 × 營收轉換率,
  可驗證需求上限
)
```

AI 可歸因的組織財務壓力：

```text
AI 可歸因差額
= AI 情境達標所需調整
- 無 AI 基準達標所需調整
```

因此企業原本的低毛利、成本結構或過高利益目標，不會全部被誤算成 AI 所造成。

完整參數、方程式、成本分類與多年度模型請閱讀 [docs/MODEL.md](./docs/MODEL.md)。主要技術與研究文件以英文維護，中文文件作為輔助說明。

## 參與貢獻

歡迎針對演算公式、產業模型、公開資料、測試、視覺化、無障礙與翻譯提出 issue 或 pull request。任何模型調整都應附上：

- 問題定義
- 新舊方程式
- 經濟或會計理由
- 假設與限制
- 單元測試

詳細規範請參考 [CONTRIBUTING.md](./CONTRIBUTING.md)。
