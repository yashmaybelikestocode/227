import { Answer } from "../types";

export function generateDecisionRecordMarkdown(answer: Answer): string {
  const dateStr = new Date().toISOString().split("T")[0];
  const decided = answer.decisions.filter((d) => d.status === "accepted");
  const rejected = answer.decisions.filter((d) => d.status === "rejected");
  const otherOptions = answer.decisions.filter(
    (d) => d.status === "deferred" || d.status === "unresolved"
  );

  let md = `# Decision Record: ${answer.question}\n\n`;
  md += `* Status: Decided\n`;
  md += `* Date: ${dateStr}\n`;
  md += `* Repository: ${answer.repo}\n\n`;

  md += `## Context and problem\n`;
  md += `${answer.short_answer.map((c) => c.text).join(" ")}\n\n`;

  md += `## Considered options\n`;
  for (const d of answer.decisions) {
    md += `* **${d.approach}** (${d.status}): ${d.why.text}\n`;
  }
  md += `\n`;

  md += `## Decision outcome\n`;
  if (decided.length > 0) {
    for (const d of decided) {
      md += `* **Chosen option**: "${d.approach}" because ${d.why.text}.\n`;
    }
  } else {
    md += `No options were marked as decided.\n`;
  }
  md += `\n`;

  md += `## Rejected options and why\n`;
  if (rejected.length > 0) {
    for (const d of rejected) {
      md += `* **${d.approach}**: Rejected because ${d.why.text}.\n`;
    }
  } else {
    md += `No options were rejected.\n`;
  }
  md += `\n`;

  if (otherOptions.length > 0) {
    md += `## Postponed or open options\n`;
    for (const d of otherOptions) {
      md += `* **${d.approach}** (${d.status === "deferred" ? "Postponed" : "Still open"}): ${d.why.text}\n`;
    }
    md += `\n`;
  }

  md += `## Sources\n`;
  for (const post of answer.posts) {
    md += `* [${post.author} on ${post.timestamp}](${post.url})\n`;
  }
  md += `\n`;

  return md;
}

export function downloadDecisionRecord(answer: Answer): void {
  const content = generateDecisionRecordMarkdown(answer);
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeFilename = answer.question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  a.download = `decision-record-${safeFilename || answer.id}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
