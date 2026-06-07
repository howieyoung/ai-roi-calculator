import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(projectRoot, "dist");
const assetVersion = "20260608-seo-security";
const siteUrl = "https://www.all4.ai/";
const siteName = "all4.ai";
const siteTitle = "AI ROI Calculator - Can My Company Afford AI?";
const siteDescription =
  "Use a local-first AI ROI calculator to test whether your company can afford AI with RPE, ROI, margin, labor-cost payback, and controlled pilot assumptions.";
const ogImageFile = "og-image-ai-roi.svg";
const ogImageUrl = `${siteUrl}${ogImageFile}`;
const gaMeasurementId = "G-H7E29MBGZ6";
const copyFiles = [
  "styles.css",
  "calculator.js",
  "locale-packs.js",
  "i18n.js",
  "app.js",
];
const supportedLocales = ["en", "zh-TW", "ja", "fr", "es"];

function escapeAttribute(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeSvgText(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sha256Base64(value) {
  return createHash("sha256").update(value, "utf8").digest("base64");
}

function hostedMetaTags() {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteTitle,
    alternateName: "Can My Company Afford AI?",
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any modern browser",
    isAccessibleForFree: true,
    inLanguage: supportedLocales,
    description: siteDescription,
    creator: {
      "@type": "Organization",
      name: "Protico.io",
      url: "https://protico.io",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  });

  return {
    html: `    <meta name="description" content="${escapeAttribute(siteDescription)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="author" content="Protico.io" />
    <meta name="application-name" content="AI ROI Calculator" />
    <meta name="keywords" content="AI ROI calculator, AI ROI, AI adoption ROI, enterprise AI ROI, enterprise AI, 企業 AI, 企業AI, revenue per employee, AI productivity, labor cost payback, AI affordability calculator" />
    <meta name="theme-color" content="#f7f8f6" />
    <link rel="canonical" href="${siteUrl}" />
    <link rel="alternate" hreflang="x-default" href="${siteUrl}" />
    ${supportedLocales
      .map((locale) => `<link rel="alternate" hreflang="${locale}" href="${siteUrl}" />`)
      .join("\n    ")}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:title" content="${escapeAttribute(siteTitle)}" />
    <meta property="og:description" content="${escapeAttribute(siteDescription)}" />
    <meta property="og:url" content="${siteUrl}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:type" content="image/svg+xml" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="AI ROI calculator preview" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:locale:alternate" content="zh_TW" />
    <meta property="og:locale:alternate" content="ja_JP" />
    <meta property="og:locale:alternate" content="fr_FR" />
    <meta property="og:locale:alternate" content="es_ES" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttribute(siteTitle)}" />
    <meta name="twitter:description" content="${escapeAttribute(siteDescription)}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    <meta name="twitter:image:alt" content="AI ROI calculator preview" />
    <script type="application/ld+json">${jsonLd}</script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}"></script>
    <script src="./analytics.js?v=${assetVersion}"></script>`,
    jsonLd,
  };
}

function buildHostedIndex(sourceHtml) {
  const { html: metaHtml, jsonLd } = hostedMetaTags();
  const withTitle = sourceHtml.replace(/<title>[^<]*<\/title>/, `<title>${siteTitle}</title>`);
  const withMeta = withTitle.replace(
    /    <meta\s+name="description"[\s\S]*?\/>\n/,
    `${metaHtml}\n`
  );
  const withProtico = withMeta.replace(
    "  </body>",
    `    <script src="https://main.protico.io/api/v1/all4.ai/protico-frame.js"></script>\n  </body>`
  );

  return { html: withProtico, jsonLd };
}

function securityHeaders(jsonLd) {
  const jsonLdHash = sha256Base64(jsonLd);
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'sha256-${jsonLdHash}' https://www.googletagmanager.com https://www.google-analytics.com https://protico.io https://*.protico.io https://static.cloudflareinsights.com`,
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://protico.io https://*.protico.io https://cloudflareinsights.com",
    "frame-src https://protico.io https://*.protico.io",
    "img-src 'self' data: https://www.google-analytics.com https://stats.g.doubleclick.net https://protico.io https://*.protico.io",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  return `/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 0
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/*.js
  Cache-Control: public, max-age=0, must-revalidate

/*.css
  Cache-Control: public, max-age=0, must-revalidate

/robots.txt
  Cache-Control: public, max-age=3600

/sitemap.xml
  Cache-Control: public, max-age=3600

/og-image.svg
  Cache-Control: public, max-age=86400

/${ogImageFile}
  Cache-Control: public, max-age=86400
`;
}

function robotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}sitemap.xml
`;
}

function sitemapXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>2026-06-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
}

function analyticsJs() {
  return `window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag("js", new Date());
gtag("config", "${gaMeasurementId}", { transport_type: "beacon" });
`;
}

function ogImageSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">${escapeSvgText(siteTitle)}</title>
  <desc id="desc">${escapeSvgText(siteDescription)}</desc>
  <rect width="1200" height="630" fill="#f7f8f6"/>
  <rect x="64" y="64" width="1072" height="502" rx="28" fill="#ffffff" stroke="#cdd2cf" stroke-width="3"/>
  <rect x="64" y="64" width="18" height="502" fill="#2f8a63"/>
  <text x="118" y="148" fill="#2f8a63" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800" letter-spacing="4">AI ROI CALCULATOR</text>
  <text x="118" y="248" fill="#181b1a" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="900">Can My Company</text>
  <text x="118" y="332" fill="#181b1a" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="900">Afford AI?</text>
  <text x="118" y="415" fill="#5f6864" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="650">AI ROI · RPE · margins · labor-cost payback · controlled pilots</text>
  <text x="118" y="502" fill="#181b1a" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800">all4.ai</text>
  <circle cx="1014" cy="190" r="70" fill="#e8f4ee" stroke="#b9e0d0" stroke-width="4"/>
  <text x="1014" y="211" fill="#2f8a63" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="900">AI</text>
</svg>
`;
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await Promise.all(
  copyFiles.map((file) =>
    cp(resolve(projectRoot, file), resolve(outputDir, file))
  )
);

const sourceHtml = await readFile(resolve(projectRoot, "index.html"), "utf8");
const { html: hostedIndex, jsonLd } = buildHostedIndex(sourceHtml);

await Promise.all([
  writeFile(resolve(outputDir, "index.html"), hostedIndex, "utf8"),
  writeFile(resolve(outputDir, "analytics.js"), analyticsJs(), "utf8"),
  writeFile(resolve(outputDir, "robots.txt"), robotsTxt(), "utf8"),
  writeFile(resolve(outputDir, "sitemap.xml"), sitemapXml(), "utf8"),
  writeFile(resolve(outputDir, "og-image.svg"), ogImageSvg(), "utf8"),
  writeFile(resolve(outputDir, ogImageFile), ogImageSvg(), "utf8"),
  writeFile(resolve(outputDir, "_headers"), securityHeaders(jsonLd), "utf8"),
]);

console.log(`Built ${copyFiles.length + 7} public assets in ${outputDir}`);
