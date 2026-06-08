const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const vm = require("node:vm");

function loadI18n(storedLocale = null) {
  const storage = new Map();
  if (storedLocale) {
    storage.set("ai-efficiency-calculator-locale", storedLocale);
  }
  const body = { querySelectorAll: () => [] };
  const context = {
    window: { dispatchEvent: () => {} },
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
    },
    document: {
      body,
      documentElement: { lang: "en" },
      title: "",
      createTreeWalker: () => ({ nextNode: () => null }),
      querySelectorAll: () => [],
      querySelector: () => null,
    },
    NodeFilter: { SHOW_TEXT: 4 },
    CustomEvent: class CustomEvent {
      constructor(type, options) {
        this.type = type;
        this.detail = options?.detail;
      }
    },
  };
  vm.runInNewContext(fs.readFileSync("./locale-packs.js", "utf8"), context);
  vm.runInNewContext(fs.readFileSync("./i18n.js", "utf8"), context);
  return {
    i18n: context.window.AII18n,
    localePacks: context.window.AILocalePacks,
    storage,
  };
}

test("language module switches across all supported locales", () => {
  const { i18n, storage } = loadI18n();
  assert.equal(i18n.locale, "en");
  assert.equal(i18n.t("scenario.none"), "No high-sensitivity signal");

  i18n.setLocale("zh-TW");
  assert.equal(i18n.locale, "zh-TW");
  assert.equal(i18n.t("scenario.none"), "沒有高敏感度訊號");
  assert.equal(storage.get("ai-efficiency-calculator-locale"), "zh-TW");

  i18n.setLocale("en");
  assert.equal(i18n.t("scenario.none"), "No high-sensitivity signal");

  i18n.setLocale("ja");
  assert.equal(i18n.t("reset"), "現在のシナリオをリセット");
  i18n.setLocale("fr");
  assert.equal(i18n.t("reset"), "Réinitialiser le scénario");
  i18n.setLocale("es");
  assert.equal(i18n.t("reset"), "Restablecer el escenario");
});

test("stored Traditional Chinese preference is restored locally", () => {
  const { i18n } = loadI18n("zh-TW");
  assert.equal(i18n.locale, "zh-TW");
  assert.equal(i18n.t("reset"), "重設目前情境");
});

test("Traditional Chinese title targets enterprise AI readiness", () => {
  const { localePacks } = loadI18n();
  const html = fs.readFileSync("./i18n.js", "utf8");
  assert.match(html, /我的公司是否準備好全面導入企業 AI？/);
  assert.match(html, /Is My Company Ready for Enterprise AI\?/);
  assert.match(localePacks.meta["zh-TW"].title, /全面導入企業 AI/);
  assert.match(localePacks.meta["zh-TW"].description, /企業 AI/);
});

test("supported locale titles target enterprise AI readiness", () => {
  const { localePacks } = loadI18n();
  assert.match(localePacks.meta.en.title, /Enterprise AI/);
  assert.match(localePacks.meta.ja.title, /エンタープライズAI/);
  assert.match(localePacks.meta.fr.title, /IA d’entreprise/);
  assert.match(localePacks.meta.es.title, /IA empresarial/);
  assert.equal(
    localePacks.static.ja["Is My Company Ready for Enterprise AI?"],
    "自社はエンタープライズAIの本格導入に向けて準備できているか？"
  );
  assert.equal(
    localePacks.static.fr["Is My Company Ready for Enterprise AI?"],
    "Mon entreprise est-elle prête pour l’IA d’entreprise ?"
  );
  assert.equal(
    localePacks.static.es["Is My Company Ready for Enterprise AI?"],
    "¿Está mi empresa preparada para adoptar IA empresarial?"
  );
});

test("HTML loads i18n before application rendering and exposes scalable language selection", () => {
  const html = fs.readFileSync("./index.html", "utf8");
  assert.match(html, /id="language-select"/);
  assert.doesNotMatch(html, /class="language-button"/);
  assert.ok(html.indexOf("./locale-packs.js") < html.indexOf("./i18n.js"));
  assert.ok(html.indexOf("./i18n.js") < html.indexOf("./app.js"));
  assert.match(html, /\.\/app\.js\?v=20260608-seo-security/);
  assert.match(html, /\.\/i18n\.js\?v=20260608-seo-security/);
});

test("locale registry is the source for future language options", () => {
  const { i18n } = loadI18n();
  assert.deepEqual(
    JSON.parse(JSON.stringify(i18n.availableLocales)),
    [
      { code: "en", label: "English" },
      { code: "zh-TW", label: "繁體中文" },
      { code: "ja", label: "日本語" },
      { code: "fr", label: "Français" },
      { code: "es", label: "Español" },
    ]
  );
});

test("new locale packs cover every preset and parameter guide entry", () => {
  const { localePacks } = loadI18n();
  const presetKeys = [
    "custom",
    "smbEcommerce",
    "smallRestaurant",
    "twHardwareSmb",
    "meta",
    "google",
    "amazon",
    "apple",
    "tsmc",
    "nvidia",
    "airbnb",
    "uber",
    "netflix",
    "spotify",
    "salesforce",
    "tesla",
    "cloudflare",
    "aiNative",
  ];
  const helpKeys = Object.keys(localePacks.helpTitles.ja);
  const requiredMessages = [
    "verdict.label",
    "verdict.positive",
    "verdict.pilot",
    "verdict.negative",
    "verdict.note.positive",
    "verdict.note.caution",
    "verdict.note.negative",
    "warning.negativeProductivity",
    "path.combined",
    "analysis.overall",
    "analysis.investment",
    "analysis.attribution",
    "analysis.cash",
    "mobile.workspace",
    "mobile.view.inputs",
    "mobile.view.analysis",
    "mobile.inputs.company",
    "mobile.results.attribution",
    "mobile.results.labor",
    "mobile.summary.company",
    "mobile.summary.labor",
  ];

  ["ja", "fr", "es"].forEach((locale) => {
    assert.deepEqual(Object.keys(localePacks.presetCopy[locale]), presetKeys);
    assert.deepEqual(Object.keys(localePacks.helpTitles[locale]), helpKeys);
    assert.deepEqual(Object.keys(localePacks.helpMeaning[locale]), helpKeys);
    presetKeys.forEach((key) => {
      assert.equal(localePacks.presetCopy[locale][key].length, 3);
      localePacks.presetCopy[locale][key].forEach((value) => {
        assert.ok(value.trim().length > 0);
      });
    });
    helpKeys.forEach((key) => {
      assert.ok(localePacks.helpTitles[locale][key].trim().length > 0);
      assert.ok(localePacks.helpMeaning[locale][key].trim().length > 0);
    });
    requiredMessages.forEach((key) => {
      assert.ok(localePacks.messages[locale][key].trim().length > 0);
    });
    assert.ok(localePacks.meta[locale].title.trim().length > 0);
    assert.ok(localePacks.meta[locale].description.trim().length > 0);
  });
});

test("PDF export uses the browser print workflow and print-only report layout", () => {
  const html = fs.readFileSync("./index.html", "utf8");
  const app = fs.readFileSync("./app.js", "utf8");
  const css = fs.readFileSync("./styles.css", "utf8");
  assert.match(html, /id="print-report-header"/);
  assert.match(html, />\s*Export PDF\s*</);
  assert.match(app, /function exportScenarioPdf/);
  assert.match(app, /window\.print\(\)/);
  assert.match(css, /@media print/);
  assert.match(css, /\.is-exporting-pdf \.print-report-header/);
  assert.match(css, /\.input-panel > \.scenario-section-input/);
  assert.match(css, /iframe\[src\*="protico\.io"\]/);
  assert.match(css, /\[class\*="protico" i\]/);
});

test("the public title, source link, and hosted-service disclosure are present", () => {
  const html = fs.readFileSync("./index.html", "utf8");
  assert.match(html, /<title>AI ROI Calculator - Is My Company Ready for Enterprise AI\?<\/title>/);
  assert.match(html, /Is My Company Ready for Enterprise AI\?/);
  assert.match(html, /rel="icon" type="image\/svg\+xml" href="\.\/favicon\.svg\?v=20260608-seo-security"/);
  assert.doesNotMatch(html, /href="data:,"/);
  assert.match(html, /AI ROI CALCULATOR/);
  assert.doesNotMatch(html, /AI ORGANIZATION ECONOMICS/);
  assert.match(html, /https:\/\/protico\.io/);
  assert.match(html, /https:\/\/github\.com\/howieyoung\/ai-efficiency-calculator/);
  assert.match(html, /Open-source research calculator/);
  assert.match(html, /Cloudflare Pages/);
  assert.match(html, /Google Analytics to understand whether the site/);
  assert.match(html, /input values are not sent as analytics events/);
  assert.doesNotMatch(html, /googletagmanager\.com\/gtag\/js/);
  assert.doesNotMatch(html, /gtag\(/);
  assert.doesNotMatch(html, /protico-frame\.js/);
});

test("hosted build output injects SEO metadata, analytics, and security headers", () => {
  execFileSync(process.execPath, ["scripts/build-site.mjs"], { stdio: "pipe" });

  const html = fs.readFileSync("./dist/index.html", "utf8");
  const analytics = fs.readFileSync("./dist/analytics.js", "utf8");
  const headers = fs.readFileSync("./dist/_headers", "utf8");
  const robots = fs.readFileSync("./dist/robots.txt", "utf8");
  const sitemap = fs.readFileSync("./dist/sitemap.xml", "utf8");
  const ogImage = fs.readFileSync("./dist/og-image.svg", "utf8");
  const versionedOgImage = fs.readFileSync("./dist/og-image-ai-roi.svg", "utf8");
  const favicon = fs.readFileSync("./dist/favicon.svg", "utf8");

  assert.match(html, /<title>AI ROI Calculator - Is My Company Ready for Enterprise AI\?<\/title>/);
  assert.match(html, /href="\.\/favicon\.svg\?v=20260608-seo-security"/);
  assert.doesNotMatch(html, /AI Organization Economics Calculator/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.all4\.ai\/" \/>/);
  assert.match(html, /property="og:title" content="AI ROI Calculator - Is My Company Ready for Enterprise AI\?"/);
  assert.match(html, /name="application-name" content="AI ROI Calculator"/);
  assert.match(html, /"name":"AI ROI Calculator - Is My Company Ready for Enterprise AI\?"/);
  assert.match(html, /AI ROI calculator preview/);
  assert.match(html, /AI ROI calculator/);
  assert.match(html, /企業 AI/);
  assert.match(html, /企業AI/);
  assert.match(html, /property="og:image" content="https:\/\/www\.all4\.ai\/og-image-ai-roi\.svg"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /type="application\/ld\+json"/);
  assert.match(html, /"@type":"WebApplication"/);
  assert.match(html, /googletagmanager\.com\/gtag\/js\?id=G-H7E29MBGZ6/);
  assert.match(html, /\.\/analytics\.js\?v=20260608-seo-security/);
  assert.match(html, /https:\/\/main\.protico\.io\/api\/v1\/all4\.ai\/protico-frame\.js/);

  assert.match(analytics, /G-H7E29MBGZ6/);
  assert.doesNotMatch(analytics, /data-input|employees|operatingProfit|scenario outputs/i);

  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /script-src 'self' 'sha256-/);
  assert.match(headers, /https:\/\/www\.googletagmanager\.com/);
  assert.match(headers, /https:\/\/\*\.protico\.io/);
  assert.match(headers, /Strict-Transport-Security: max-age=31536000/);
  assert.match(headers, /X-Frame-Options: DENY/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /Referrer-Policy: strict-origin-when-cross-origin/);
  assert.match(headers, /Permissions-Policy: camera=\(\), microphone=\(\), geolocation=\(\), payment=\(\), usb=\(\), bluetooth=\(\)/);
  assert.match(headers, /X-XSS-Protection: 0/);
  assert.match(headers, /\/og-image-ai-roi\.svg/);

  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Sitemap: https:\/\/www\.all4\.ai\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/www\.all4\.ai\/<\/loc>/);
  assert.match(ogImage, /AI ROI Calculator - Is My Company Ready for Enterprise AI\?/);
  assert.match(ogImage, /AI ROI CALCULATOR/);
  assert.match(versionedOgImage, /AI ROI Calculator - Is My Company Ready for Enterprise AI\?/);
  assert.match(versionedOgImage, /AI ROI CALCULATOR/);
  assert.match(favicon, /AI ROI Calculator favicon/);
  assert.match(favicon, /#1f6f50/);
});

test("controlled-pilot verdict is stronger across supported locales", () => {
  const { i18n } = loadI18n();
  assert.equal(i18n.t("verdict.label"), "AI affordability signal");
  assert.equal(i18n.t("verdict.pilot"), "Requires tightly controlled pilot-scale validation");
  assert.match(i18n.t("verdict.note.caution"), /does not yet support broad rollout/);
  i18n.setLocale("zh-TW");
  assert.equal(i18n.t("verdict.label"), "AI 負擔能力判斷");
  assert.equal(i18n.t("verdict.pilot"), "需高度控制試點規模進行驗證");
  assert.match(i18n.t("verdict.note.caution"), /必須縮小試點範圍/);
  i18n.setLocale("ja");
  assert.match(i18n.t("verdict.pilot"), /規模を厳格に管理/);
  i18n.setLocale("fr");
  assert.match(i18n.t("verdict.pilot"), /strictement limité/);
  i18n.setLocale("es");
  assert.match(i18n.t("verdict.pilot"), /estrictamente controlado/);
});

test("research introduction is a modal opened from the title", () => {
  const html = fs.readFileSync("./index.html", "utf8");
  const app = fs.readFileSync("./app.js", "utf8");
  assert.match(html, /id="research-info-button"/);
  assert.match(html, /<dialog class="research-dialog" id="research-dialog"/);
  assert.doesNotMatch(html, /<section class="intro-band"/);
  assert.match(app, /ai-efficiency-calculator-intro-viewed-v1/);
  assert.match(app, /requestAnimationFrame\(openDialog\)/);
});

test("export action appears before the language picker", () => {
  const html = fs.readFileSync("./index.html", "utf8");
  assert.ok(
    html.indexOf('id="export-button"') < html.indexOf('id="language-select"')
  );
});

test("desktop workspace uses independently scrollable input and result panels", () => {
  const css = fs.readFileSync("./styles.css", "utf8");
  assert.match(css, /\.workspace\s*\{[\s\S]*?height:\s*calc\(100dvh/);
  assert.match(css, /\.input-panel\s*\{[\s\S]*?overflow-y:\s*auto/);
  assert.match(css, /\.results-panel\s*\{[\s\S]*?overflow-y:\s*auto/);
});

test("mobile workspace uses persistent tabs, single-open accordions, and fixed-height panels", () => {
  const html = fs.readFileSync("./index.html", "utf8");
  const app = fs.readFileSync("./app.js", "utf8");
  const css = fs.readFileSync("./styles.css", "utf8");

  assert.match(html, /id="mobile-workspace-nav"/);
  assert.match(html, /data-mobile-view="inputs"/);
  assert.match(html, /data-mobile-view="results"/);
  assert.match(html, /data-mobile-input-section="company"/);
  assert.match(html, /data-mobile-analysis-section="attribution"/);
  assert.match(html, /data-mobile-analysis-section="cash"/);
  assert.match(app, /ai-efficiency-calculator-mobile-ui-v1/);
  assert.match(app, /openInputSection:\s*"company"/);
  assert.match(app, /openAnalysisSection:\s*"cash"/);
  assert.match(app, /mobileScrollPositions/);
  assert.match(app, /setMobileAccordion/);
  assert.match(app, /redrawVisibleCharts/);
  assert.match(css, /--mobile-nav-height:[^;]*safe-area-inset-bottom/);
  assert.match(
    css,
    /@media \(max-width: 820px\)[\s\S]*?body\s*\{[\s\S]*?overflow:\s*hidden/
  );
  assert.match(
    css,
    /\.workspace\s*\{[\s\S]*?100dvh - var\(--app-chrome-height\) - var\(--mobile-nav-height\)/
  );
  assert.match(css, /\.mobile-panel-hidden\s*\{[\s\S]*?display:\s*none !important/);
  assert.match(css, /\.is-mobile-open > \.mobile-accordion-content/);
});

test("primary output signals and simpler terminology are used across the UI", () => {
  const html = fs.readFileSync("./index.html", "utf8");
  const app = fs.readFileSync("./app.js", "utf8");
  const i18n = fs.readFileSync("./i18n.js", "utf8");
  const locales = fs.readFileSync("./locale-packs.js", "utf8");
  const uiSource = [html, app, i18n, locales].join("\n");

  assert.match(html, /class="hero-signal-grid"/);
  assert.ok(html.indexOf('id="capacity-fte"') < html.indexOf('id="verdict-card"'));
  assert.match(uiSource, /AI ROI after rollout/);
  assert.match(uiSource, /AI 導入成熟後 ROI/);
  assert.match(uiSource, /Theoretical released productivity/);
  assert.match(uiSource, /理論可釋放生產力/);
  assert.match(
    i18n,
    /AI 可能創造的產能高於已確認的市場需求，因此模型只把可驗證需求內的部分算成新增營收。/
  );

  assert.doesNotMatch(uiSource, /穩態/);
  assert.doesNotMatch(uiSource, /Steady-state AI ROI/);
  assert.doesNotMatch(uiSource, /Theoretical released time/);
  assert.doesNotMatch(uiSource, /理論可釋放工時/);
  assert.doesNotMatch(uiSource, /依產能推估/);
});

test("print layout expands mobile sections and ignores the active mobile panel", () => {
  const css = fs.readFileSync("./styles.css", "utf8");
  assert.match(
    css,
    /@media print[\s\S]*?\.mobile-panel-hidden\s*\{[\s\S]*?display:\s*block !important/
  );
  assert.match(
    css,
    /@media print[\s\S]*?\.mobile-accordion-content[\s\S]*?display:\s*contents !important/
  );
});

test("company scenario bar is collapsible and auto-collapses after panel scrolling", () => {
  const html = fs.readFileSync("./index.html", "utf8");
  const app = fs.readFileSync("./app.js", "utf8");
  const css = fs.readFileSync("./styles.css", "utf8");
  assert.match(html, /id="preset-toggle"/);
  assert.match(html, /id="preset-content"/);
  assert.match(html, /id="preset-collapsed-name"/);
  assert.match(html, /id="preset-collapsed-industry"/);
  assert.match(app, /setPresetCollapsed\(true\)/);
  assert.match(app, /preset-collapsed-context/);
  assert.match(app, /preset-collapsed-name/);
  assert.match(app, /results-panel/);
  assert.match(css, /grid-template-rows:\s*0fr/);
  assert.match(css, /grid-template-rows\s+320ms/);
  assert.doesNotMatch(
    css,
    /\.preset-band\.is-collapsed \.preset-content\s*\{[^}]*display:\s*none/
  );
});

test("company scenario selector includes localized SMB synthetic cases", () => {
  const html = fs.readFileSync("./index.html", "utf8");
  const i18n = fs.readFileSync("./i18n.js", "utf8");
  const app = fs.readFileSync("./app.js", "utf8");

  ["smbEcommerce", "smallRestaurant", "twHardwareSmb"].forEach((key) => {
    assert.match(html, new RegExp(`value="${key}"`));
    assert.match(app, new RegExp(`${key}:`));
  });
  assert.match(i18n, /SMB synthetic scenarios/);
  assert.match(i18n, /SMB 合成研究情境/);
});

test("positive-economics paths render in the input panel and can be applied", () => {
  const html = fs.readFileSync("./index.html", "utf8");
  const app = fs.readFileSync("./app.js", "utf8");
  const scenarioIndex = html.indexOf('id="scenario-grid"');
  const asideCloseIndex = html.indexOf("</aside>");
  assert.ok(scenarioIndex > 0 && scenarioIndex < asideCloseIndex);
  assert.match(app, /buildPositivePaths/);
  assert.match(app, /data-path-index/);
  assert.match(app, /verdictClass === "positive"/);
});

test("model equations are included in the research modal only", () => {
  const html = fs.readFileSync("./index.html", "utf8");
  assert.match(html, /research-dialog[\s\S]*research-formulas/);
  assert.doesNotMatch(html, /class="formula-details"/);
});

test("Traditional Chinese interface avoids non-preferred terminology", () => {
  const sources = ["app.js", "index.html", "i18n.js", "README.zh-TW.md"]
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  ["返" + "工", "維" + "運", "證據調整後" + "產能上限"].forEach(
    (term) => assert.equal(sources.includes(term), false)
  );
  assert.equal(sources.includes("以受控" + "試點進行驗證"), false);
  assert.match(sources, /修正重做時間/);
  assert.match(sources, /可進一步評估的人力空間/);
  assert.match(sources, /需高度控制試點規模進行驗證/);
});
