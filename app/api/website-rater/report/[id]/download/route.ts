import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/mongodb";
import { AuditModel } from "../../../../../../lib/models/Audit";

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  const audit = await AuditModel.findById(params.id).exec();
  if (!audit) {
    return NextResponse.json({ ok: false, error: "Audit not found" }, { status: 404 });
  }

  if (!audit.isUnlocked || !audit.fullReport) {
    return NextResponse.json(
      { ok: false, error: "Report not unlocked" },
      { status: 403 }
    );
  }

  const summary = audit.fullReport.summary || {};
  const sections = audit.fullReport.sections || [];
  const issues = audit.fullReport.criticalIssues || audit.preview?.criticalIssues || [];
  const wins = audit.fullReport.quickWins || audit.preview?.quickWins || [];

  const lines: string[] = [];
  lines.push(`# Website Rater Report`);
  lines.push("");
  lines.push(`URL: ${summary.analyzedUrl || audit.urlNormalized}`);
  lines.push(`Score: ${summary.scoreOverall ?? audit.scoreOverall ?? "N/A"}`);
  lines.push(`Label: ${summary.label || audit.label || "N/A"}`);
  if (summary.htmlKb != null) {
    lines.push(`HTML size: ${summary.htmlKb} KB`);
  }
  lines.push("");

  if (issues.length) {
    lines.push("## Top Issues");
    for (const issue of issues) {
      lines.push(`- ${issue}`);
    }
    lines.push("");
  }

  if (wins.length) {
    lines.push("## Quick Wins");
    for (const win of wins) {
      lines.push(`- ${win}`);
    }
    lines.push("");
  }

  if (sections.length) {
    lines.push("## Detailed Sections");
    for (const section of sections) {
      lines.push(`### ${section.title} (Score ${section.score})`);
      if (section.findings?.length) {
        lines.push("Findings:");
        for (const finding of section.findings) {
          lines.push(`- ${finding}`);
        }
      }
      if (section.recommendations?.length) {
        lines.push("Recommendations:");
        for (const rec of section.recommendations) {
          lines.push(`- ${rec}`);
        }
      }
      lines.push("");
    }
  }

  if (audit.fullReport.nextSteps?.length) {
    lines.push("## Next Steps");
    for (const step of audit.fullReport.nextSteps) {
      lines.push(`- ${step}`);
    }
    lines.push("");
  }

  const content = lines.join("\n");
  const host = audit.host || audit.urlNormalized || "website";
  const filename = `${sanitizeFilename(host)}-report.md`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
    },
  });
}
