export type Label = "DANGER" | "WARNING" | "GOOD" | "AMAZING";

export const LABEL_STYLES: Record<Label, { badge: string; bg: string }> = {
  DANGER: { badge: "#DC2626", bg: "#FEF2F2" },
  WARNING: { badge: "#F59E0B", bg: "#FFFBEB" },
  GOOD: { badge: "#2563EB", bg: "#EFF6FF" },
  AMAZING: { badge: "#16A34A", bg: "#F0FDF4" },
};

export function labelFromScore(score: number): Label {
  if (score <= 39) return "DANGER";
  if (score <= 64) return "WARNING";
  if (score <= 79) return "GOOD";
  return "AMAZING";
}

export type HtmlAnalysis = {
  titleLength: number;
  metaDescriptionLength: number;
  h1Count: number;
  canonical: boolean;
  viewport: boolean;
  ogTitle: boolean;
  ogDescription: boolean;
  robotsNoindex: boolean;
  wordCount: number;
  textRatio: number;
  imageCount: number;
  imageAltCoverage: number;
  scriptCount: number;
  blockingScriptCount: number;
  cssCount: number;
  linkCount: number;
  formCount: number;
  buttonCount: number;
  ctaKeywordCount: number;
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function countMatches(html: string, regex: RegExp): number {
  const matches = html.match(regex);
  return matches ? matches.length : 0;
}

function wordCount(text: string): number {
  const words = text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  return words.filter(Boolean).length;
}

function stripTags(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ");
}

function extractTagText(html: string, tag: string): string | null {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].replace(/\s+/g, " ").trim() : null;
}

function getMetaContent(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["'][^>]*>`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

function getMetaProperty(html: string, property: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["'][^>]*>`,
      "i"
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

export function scoreHtml(html: string, htmlBytes: number) {
  const lower = html.toLowerCase();
  const titleText = extractTagText(html, "title");
  const titleLength = titleText ? titleText.length : 0;
  const metaDescriptionText = getMetaContent(html, "description");
  const metaDescriptionLength = metaDescriptionText ? metaDescriptionText.length : 0;
  const h1Count = countMatches(html, /<h1\b[^>]*>/gi);
  const canonical = /<link[^>]+rel=["']canonical["']/i.test(html);
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const ogTitle = Boolean(getMetaProperty(html, "og:title"));
  const ogDescription = Boolean(getMetaProperty(html, "og:description"));
  const robotsContent = getMetaContent(html, "robots") || "";
  const robotsNoindex = /noindex/i.test(robotsContent);

  const images = countMatches(html, /<img\b[^>]*>/gi);
  const imagesWithAlt = countMatches(html, /<img\b[^>]*alt=["'][^"']+["'][^>]*>/gi);
  const imageAltCoverage = images === 0 ? 1 : imagesWithAlt / images;
  const missingAltRatio = images === 0 ? 0 : 1 - imageAltCoverage;

  const scripts = countMatches(html, /<script\b[^>]*>/gi);
  const blockingScripts = countMatches(
    html,
    /<script\b(?=[^>]*\bsrc=)(?![^>]*\basync\b)(?![^>]*\bdefer\b)[^>]*>/gi
  );
  const cssCount = countMatches(html, /<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi);
  const linkCount = countMatches(html, /<a\b[^>]*>/gi);
  const formCount = countMatches(html, /<form\b[^>]*>/gi);
  const buttonCount = countMatches(html, /<button\b[^>]*>/gi);
  const ctaKeywordCount = countMatches(
    lower,
    /(book|schedule|contact|pricing|plans|get started|demo|trial|subscribe|buy|talk to sales)/gi
  );

  let seoScore = 0;
  seoScore += titleText ? 20 : 0;
  seoScore += metaDescriptionText ? 20 : 0;
  seoScore += h1Count > 0 ? 15 : 0;
  seoScore += canonical ? 10 : 0;
  seoScore += viewport ? 5 : 0;
  seoScore += ogTitle ? 10 : 0;
  seoScore += ogDescription ? 10 : 0;
  seoScore += robotsNoindex ? -20 : 0;
  seoScore += missingAltRatio > 0.4 ? -10 : 10;
  if (titleLength > 0 && (titleLength < 30 || titleLength > 60)) seoScore -= 5;
  if (metaDescriptionLength > 0 && (metaDescriptionLength < 120 || metaDescriptionLength > 160)) {
    seoScore -= 5;
  }

  const hasForm = formCount > 0;
  const ctaKeywords = ctaKeywordCount > 0;
  const hasButtons = buttonCount > 0 || /class=["'][^"']*btn/i.test(html);

  let funnelScore = 25;
  funnelScore += ctaKeywords ? 25 : 0;
  funnelScore += hasForm ? 20 : 0;
  funnelScore += hasButtons ? 15 : 0;
  funnelScore += linkCount > 8 ? 10 : 0;
  funnelScore -= ctaKeywords ? 0 : 10;

  const text = stripTags(html);
  const words = wordCount(text);
  const textRatio = html.length ? text.length / html.length : 0;
  let copyScore = 20;
  if (words > 1000) copyScore += 40;
  else if (words > 600) copyScore += 30;
  else if (words > 300) copyScore += 20;
  else if (words > 150) copyScore += 10;
  else copyScore += 5;
  copyScore += textRatio > 0.1 ? 10 : 0;

  const benefitKeywords = /(results|growth|revenue|conversion|improve|optimize|accelerate|scale)/i.test(
    lower
  );
  copyScore += benefitKeywords ? 20 : 0;

  const htmlKb = htmlBytes / 1024;
  let speedScore = 100 - htmlKb * 2 - scripts * 3 - blockingScripts * 8 - cssCount * 2;

  const miniScores = {
    seo: clampScore(seoScore),
    funnel: clampScore(funnelScore),
    copy: clampScore(copyScore),
    speed: clampScore(speedScore),
  };

  const overall = clampScore(
    miniScores.seo * 0.2 +
      miniScores.funnel * 0.25 +
      miniScores.copy * 0.25 +
      miniScores.speed * 0.3
  );

  const criticalIssues: string[] = [];
  if (!titleText) criticalIssues.push("Missing <title> tag for SEO visibility.");
  if (titleLength > 0 && (titleLength < 30 || titleLength > 60)) {
    criticalIssues.push(`Title length is ${titleLength} chars (recommended 30–60).`);
  }
  if (!metaDescriptionText) {
    criticalIssues.push("Meta description is missing for search snippets.");
  } else if (metaDescriptionLength < 120 || metaDescriptionLength > 160) {
    criticalIssues.push(
      `Meta description is ${metaDescriptionLength} chars (recommended 120–160).`
    );
  }
  if (h1Count === 0) criticalIssues.push("Missing primary H1 headline on the page.");
  if (h1Count > 1) criticalIssues.push(`Multiple H1 headings detected (${h1Count}).`);
  if (missingAltRatio > 0.4) {
    criticalIssues.push(
      `Only ${Math.round(imageAltCoverage * 100)}% of images include alt text.`
    );
  }
  if (blockingScripts >= 3) {
    criticalIssues.push(
      `${blockingScripts} render-blocking scripts detected (consider defer/async).`
    );
  }
  if (htmlKb > 500) criticalIssues.push(`Large HTML payload (${Math.round(htmlKb)} KB).`);
  if (words < 180) criticalIssues.push(`Low text volume (${words} words).`);
  if (!ctaKeywords) criticalIssues.push("No clear CTA keywords detected on the page.");

  const quickWins: string[] = [];
  if (!canonical) quickWins.push("Add a canonical tag to avoid duplicate indexing.");
  if (!viewport) quickWins.push("Add a responsive viewport meta tag.");
  if (!ogTitle || !ogDescription) quickWins.push("Add Open Graph title/description for sharing.");
  if (!hasForm) quickWins.push("Add a short lead form or booking widget.");
  if (!hasButtons) quickWins.push("Add a primary CTA button above the fold.");
  if (htmlKb > 350) quickWins.push("Trim HTML payload size for faster rendering.");
  if (images && missingAltRatio > 0.2) {
    quickWins.push("Improve image alt text for SEO and accessibility.");
  }

  const fallbackIssues = [
    "Manual review: confirm the hero headline matches the primary offer.",
    "Manual review: ensure trust signals appear near the primary CTA.",
    "Manual review: validate above-the-fold copy for clarity and intent.",
  ];

  const fallbackWins = [
    "Manual review: add a single conversion goal above the fold.",
    "Manual review: add a short FAQ block to reduce objections.",
    "Manual review: add proof (logos/testimonials) near the CTA.",
  ];

  for (const issue of fallbackIssues) {
    if (criticalIssues.length >= 3) break;
    if (!criticalIssues.includes(issue)) criticalIssues.push(issue);
  }

  for (const win of fallbackWins) {
    if (quickWins.length >= 3) break;
    if (!quickWins.includes(win)) quickWins.push(win);
  }

  return {
    miniScores,
    overall,
    label: labelFromScore(overall),
    criticalIssues: criticalIssues.slice(0, 3),
    quickWins: quickWins.slice(0, 3),
    analysis: {
      titleLength,
      metaDescriptionLength,
      h1Count,
      canonical,
      viewport,
      ogTitle,
      ogDescription,
      robotsNoindex,
      wordCount: words,
      textRatio: Math.round(textRatio * 1000) / 1000,
      imageCount: images,
      imageAltCoverage: Math.round(imageAltCoverage * 100) / 100,
      scriptCount: scripts,
      blockingScriptCount: blockingScripts,
      cssCount,
      linkCount,
      formCount,
      buttonCount,
      ctaKeywordCount,
    } as HtmlAnalysis,
  };
}
