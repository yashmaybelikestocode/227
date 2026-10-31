import type { Analysis, Statement } from '../types';

export function generateMadrMarkdown(analysis: Analysis): string {
  const decided = analysis.decisions.filter((d) => d.status === 'accepted');
  const rejected = analysis.decisions.filter((d) => d.status === 'rejected');
  const postponed = analysis.decisions.filter((d) => d.status === 'deferred');
  const open = analysis.decisions.filter((d) => d.status === 'unresolved');

  const contextText = analysis.short_answer.map((c) => c.text).join(' ');

  const getExactQuotesForDecision = (stmtIds: string[]): string[] => {
    return stmtIds
      .map((id) => analysis.statements.find((s) => s.id === id))
      .filter((s): s is Statement => Boolean(s))
      .map((s) => `> "${s.quote}"`);
  };

  let md = `# Decision Record: ${analysis.question || 'Architecture and Code Decisions'}\n\n`;
  md += `* **Status**: Decided\n`;
  md += `* **Project**: ${analysis.repo}\n`;
  md += `* **Date**: ${new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}\n\n`;

  md += `## Context and problem\n\n`;
  md += `${contextText}\n\n`;
  md += `${analysis.based_on}\n\n`;

  md += `## Considered options\n\n`;
  for (const d of analysis.decisions) {
    let statusLabel = 'Still open';
    if (d.status === 'accepted') statusLabel = 'Decided';
    else if (d.status === 'rejected') statusLabel = 'Decided against';
    else if (d.status === 'deferred') statusLabel = 'Postponed';

    md += `* **${d.title}** (${statusLabel}): ${d.reason.text}\n`;
  }
  md += `\n`;

  md += `## Decision outcome\n\n`;
  if (decided.length > 0) {
    for (const d of decided) {
      md += `* Chosen: **${d.title}**. Reason: ${d.reason.text}\n`;
      const quotes = getExactQuotesForDecision(d.statement_ids);
      if (quotes.length > 0) {
        md += `  Exact quotes:\n`;
        quotes.forEach((q) => {
          md += `  ${q}\n`;
        });
      }
    }
  } else {
    md += `No decisions currently accepted.\n`;
  }
  md += `\n`;

  md += `## Rejected options and why\n\n`;
  if (rejected.length > 0) {
    for (const d of rejected) {
      md += `* Rejected: **${d.title}**. Reason: ${d.reason.text}\n`;
      const quotes = getExactQuotesForDecision(d.statement_ids);
      if (quotes.length > 0) {
        md += `  Exact quotes:\n`;
        quotes.forEach((q) => {
          md += `  ${q}\n`;
        });
      }
    }
  } else {
    md += `None.\n`;
  }
  md += `\n`;

  if (postponed.length > 0 || open.length > 0) {
    md += `## Postponed and open questions\n\n`;
    for (const d of postponed) {
      md += `* Postponed: **${d.title}**. Reason: ${d.reason.text}\n`;
    }
    for (const d of open) {
      md += `* Still open: **${d.title}**. Reason: ${d.reason.text}\n`;
    }
    md += `\n`;
  }

  md += `## Sources\n\n`;
  const usedCommentIds = new Set(analysis.statements.map((s) => s.comment_id));
  const usedComments = analysis.comments.filter((c) => usedCommentIds.has(c.id));

  for (const c of usedComments) {
    const person = analysis.people.find((p) => p.id === c.person_id);
    const authorName = person ? person.display_name : 'Contributor';
    md += `* ${authorName} on ${c.date} (${c.where}): [Original comment](${c.url})\n`;
    const stmts = analysis.statements.filter((s) => s.comment_id === c.id);
    stmts.forEach((s) => {
      md += `  > "${s.quote}"\n`;
    });
  }

  return md;
}

export function downloadDecisionRecord(analysis: Analysis): void {
  const content = generateMadrMarkdown(analysis);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const slug = (analysis.question || 'decisions')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  a.download = `decision-record-${slug}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
