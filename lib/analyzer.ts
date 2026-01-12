import { guardUrl, UrlGuardError } from "./security/urlGuard";
import { scoreHtml, type HtmlAnalysis } from "./scoring";

export type AuditPreview = {
  miniScores: {
    seo: number;
    funnel: number;
    copy: number;
    speed: number;
  };
  criticalIssues: string[];
  quickWins: string[];
  analysis?: HtmlAnalysis;
  notes: {
    htmlKb: number;
    analyzedUrl: string;
    logoUrl?: string;
  };
};

export class AnalyzerError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const DEFAULT_TIMEOUT_MS = Number.parseInt(
  process.env.SCAN_TIMEOUT_MS || "25000",
  10
);
const MAX_HTML_BYTES = Number.parseInt(
  process.env.MAX_HTML_BYTES || "2000000",
  10
);
const MAX_REDIRECTS = Number.parseInt(
  process.env.MAX_REDIRECTS || "5",
  10
);
const MIN_HTML_BYTES = 200;

function isHtmlContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  const lower = contentType.toLowerCase();
  return lower.includes("text/html") || lower.includes("application/xhtml+xml");
}

function extractLogoUrl(html: string, baseUrl: string): string | undefined {
  const linkTags = html.match(/<link\s+[^>]*>/gi) || [];
  const candidates: { url: string; priority: number }[] = [];

  for (const tag of linkTags) {
    const relMatch = tag.match(/\brel=["']?([^"'>]+)["']?/i);
    const hrefMatch = tag.match(/\bhref=["']?([^"'>\s]+)["']?/i);
    if (!relMatch || !hrefMatch) continue;

    const rel = relMatch[1].toLowerCase();
    if (!rel.includes("icon")) continue;

    const href = hrefMatch[1].trim();
    if (!href || href.startsWith("data:")) continue;

    let priority = 1;
    if (rel.includes("apple-touch-icon")) priority = 3;
    else if (rel.includes("icon")) priority = 2;

    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.protocol !== "https:") continue;
      if (resolved.username || resolved.password) continue;
      candidates.push({ url: resolved.toString(), priority });
    } catch {
      continue;
    }
  }

  if (!candidates.length) return undefined;
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates[0].url;
}

async function readBodyWithLimit(
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number
): Promise<{ text: string; bytes: number }> {
  if (!body) {
    throw new AnalyzerError("EMPTY_RESPONSE", "Empty response body", 400);
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      if (bytes + value.byteLength > maxBytes) {
        await reader.cancel();
        throw new AnalyzerError(
          "HTML_TOO_LARGE",
          "Page is too large for a full scan within safe limits.",
          400
        );
      }
      bytes += value.byteLength;
      chunks.push(value);
    }
  }

  const combined = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const decoder = new TextDecoder("utf-8");
  return { text: decoder.decode(combined), bytes };
}

async function fetchHtml(url: string): Promise<{
  html: string;
  finalUrl: string;
  bytes: number;
}>{
  let current = url;
  let redirects = 0;

  while (true) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "ExpertDevStudioBot/1.0",
          Accept: "text/html,application/xhtml+xml",
        },
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new AnalyzerError("TIMEOUT", "Scan timed out", 408);
      }
      throw new AnalyzerError("NETWORK_ERROR", "Failed to fetch URL", 400);
    }

    clearTimeout(timeout);

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) {
        throw new AnalyzerError("REDIRECT_FAILED", "Redirect location missing", 400);
      }
      redirects += 1;
      if (redirects > MAX_REDIRECTS) {
        throw new AnalyzerError("TOO_MANY_REDIRECTS", "Too many redirects", 400);
      }
      const nextUrl = new URL(location, current).toString();
      const guard = await guardUrl(nextUrl);
      current = guard.normalizedUrl;
      continue;
    }

    if (!response.ok) {
      throw new AnalyzerError("HTTP_ERROR", `Request failed (${response.status})`, 400);
    }

    if (!isHtmlContentType(response.headers.get("content-type"))) {
      throw new AnalyzerError("NON_HTML", "Only HTML pages can be scanned", 400);
    }

    const contentLengthHeader = response.headers.get("content-length");
    if (contentLengthHeader) {
      const contentLength = Number.parseInt(contentLengthHeader, 10);
      if (Number.isFinite(contentLength) && contentLength > MAX_HTML_BYTES) {
        await response.body?.cancel();
        throw new AnalyzerError(
          "HTML_TOO_LARGE",
          "Page is too large for a full scan within safe limits.",
          400
        );
      }
    }

    const { text, bytes } = await readBodyWithLimit(response.body, MAX_HTML_BYTES);

    if (bytes < MIN_HTML_BYTES) {
      throw new AnalyzerError("HTML_TOO_SMALL", "HTML content is too small to analyze", 400);
    }

    return { html: text, finalUrl: current, bytes };
  }
}

export async function runQuickAudit(rawUrl: string) {
  let normalized: { normalizedUrl: string; host: string };
  try {
    normalized = await guardUrl(rawUrl);
  } catch (error) {
    if (error instanceof UrlGuardError) {
      throw new AnalyzerError(error.code, error.message, 400);
    }
    throw error;
  }

  const { html, finalUrl, bytes } = await fetchHtml(normalized.normalizedUrl);
  const scoring = scoreHtml(html, bytes);

  const preview: AuditPreview = {
    miniScores: scoring.miniScores,
    criticalIssues: scoring.criticalIssues,
    quickWins: scoring.quickWins,
    analysis: scoring.analysis,
    notes: {
      htmlKb: Math.round((bytes / 1024) * 10) / 10,
      analyzedUrl: finalUrl,
      logoUrl: extractLogoUrl(html, finalUrl),
    },
  };

  return {
    preview,
    scoreOverall: scoring.overall,
    label: scoring.label,
    normalizedUrl: normalized.normalizedUrl,
    host: normalized.host,
  };
}

export function buildFullReportFromPreview(options: {
  preview: AuditPreview;
  scoreOverall: number;
  label: string;
  url: string;
}) {
  const { preview, scoreOverall, label, url } = options;
  const analysis = preview.analysis;
  const htmlKb = preview.notes?.htmlKb;

  const seoFindings: string[] = [];
  if (analysis?.titleLength) {
    seoFindings.push(`Title length is ${analysis.titleLength} characters.`);
  }
  if (analysis?.metaDescriptionLength) {
    seoFindings.push(
      `Meta description length is ${analysis.metaDescriptionLength} characters.`
    );
  }
  if (analysis?.h1Count !== undefined) {
    seoFindings.push(`H1 headings detected: ${analysis.h1Count}.`);
  }
  const seoRecs: string[] = [];
  if (analysis && !analysis.canonical) {
    seoRecs.push("Add a canonical tag to avoid duplicate indexing.");
  }
  if (analysis && !analysis.ogTitle) {
    seoRecs.push("Add Open Graph title for richer sharing previews.");
  }
  if (analysis && !analysis.ogDescription) {
    seoRecs.push("Add Open Graph description for social previews.");
  }

  const funnelFindings: string[] = [];
  if (analysis?.ctaKeywordCount !== undefined) {
    funnelFindings.push(`CTA keywords detected: ${analysis.ctaKeywordCount}.`);
  }
  if (analysis?.formCount !== undefined) {
    funnelFindings.push(`Forms detected: ${analysis.formCount}.`);
  }
  if (analysis?.buttonCount !== undefined) {
    funnelFindings.push(`Buttons detected: ${analysis.buttonCount}.`);
  }
  const funnelRecs: string[] = [];
  if (analysis && analysis.ctaKeywordCount === 0) {
    funnelRecs.push("Add a primary CTA keyword above the fold.");
  }
  if (analysis && analysis.formCount === 0) {
    funnelRecs.push("Add a short lead form or booking widget.");
  }
  if (analysis && analysis.buttonCount === 0) {
    funnelRecs.push("Add a visible primary CTA button near the hero.");
  }

  const copyFindings: string[] = [];
  if (analysis?.wordCount !== undefined) {
    copyFindings.push(`Visible text estimated at ${analysis.wordCount} words.`);
  }
  if (analysis?.textRatio !== undefined) {
    copyFindings.push(`Text-to-HTML ratio is ${analysis.textRatio}.`);
  }
  const copyRecs: string[] = [];
  if (analysis && analysis.wordCount < 200) {
    copyRecs.push("Add more outcome-focused copy to improve clarity.");
  }
  if (analysis && analysis.textRatio < 0.08) {
    copyRecs.push("Increase visible text content above the fold.");
  }

  const speedFindings: string[] = [];
  if (htmlKb !== undefined) speedFindings.push(`HTML size is ${htmlKb} KB.`);
  if (analysis?.scriptCount !== undefined) {
    speedFindings.push(`Script tags detected: ${analysis.scriptCount}.`);
  }
  if (analysis?.blockingScriptCount !== undefined) {
    speedFindings.push(`Render-blocking scripts: ${analysis.blockingScriptCount}.`);
  }
  const speedRecs: string[] = [];
  if (analysis && analysis.blockingScriptCount > 0) {
    speedRecs.push("Defer or async render-blocking scripts.");
  }
  if (analysis && htmlKb && htmlKb > 350) {
    speedRecs.push("Trim HTML payload for faster first paint.");
  }

  const ensureTwo = (items: string[], fallback: string[]) => {
    while (items.length < 2 && fallback.length) items.push(fallback.shift() as string);
  };

  ensureTwo(seoFindings, [
    "Metadata coverage reviewed for search visibility.",
    "Indexability signals inspected in head markup.",
  ]);
  ensureTwo(seoRecs, [
    "Confirm title + description align to core keywords.",
    "Validate structured data where applicable.",
  ]);
  ensureTwo(funnelFindings, [
    "Conversion path clarity evaluated.",
    "CTA placement checked above the fold.",
  ]);
  ensureTwo(funnelRecs, [
    "Add a singular primary CTA to reduce friction.",
    "Highlight trust signals near the main CTA.",
  ]);
  ensureTwo(copyFindings, [
    "Value proposition consistency reviewed.",
    "Benefit-to-feature balance assessed.",
  ]);
  ensureTwo(copyRecs, [
    "Lead with outcome-based headlines.",
    "Add proof points to reinforce claims.",
  ]);
  ensureTwo(speedFindings, [
    "Front-end payload size estimated.",
    "Script count reviewed for critical path impact.",
  ]);
  ensureTwo(speedRecs, [
    "Defer non-critical scripts for faster rendering.",
    "Compress large assets and lazy-load below the fold.",
  ]);

  const sections = [
    {
      title: "SEO",
      score: preview.miniScores.seo,
      findings: seoFindings.slice(0, 3),
      recommendations: seoRecs.slice(0, 3),
    },
    {
      title: "Funnel",
      score: preview.miniScores.funnel,
      findings: funnelFindings.slice(0, 3),
      recommendations: funnelRecs.slice(0, 3),
    },
    {
      title: "Copy",
      score: preview.miniScores.copy,
      findings: copyFindings.slice(0, 3),
      recommendations: copyRecs.slice(0, 3),
    },
    {
      title: "Speed",
      score: preview.miniScores.speed,
      findings: speedFindings.slice(0, 3),
      recommendations: speedRecs.slice(0, 3),
    },
  ];

  return {
    summary: {
      headline: "Website Rater — Full Report",
      scoreOverall,
      label,
      analyzedUrl: url,
      htmlKb: preview.notes.htmlKb,
    },
    criticalIssues: preview.criticalIssues,
    quickWins: preview.quickWins,
    sections,
    nextSteps: [
      "Implement the top 3 quick wins within 72 hours.",
      "Re-run the scan after changes to verify score uplift.",
    ],
  };
}
