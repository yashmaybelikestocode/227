import { Answer } from '../types';

export function generateDecisionRecordMarkdown(answer: Answer): string {
  const decided = answer.decisions.filter((d) => d.status === 'accepted');
  const rejected = answer.decisions.filter((d) => d.status === 'rejected');
  const other = answer.decisions.filter((d) => d.status !== 'accepted' && d.status !== 'rejected');

  const lines: string[] = [];
  lines.push(`# ${answer.question}`);
  lines.push('');
  lines.push(`- **Status**: Decided`);
  lines.push(`- **Project**: ${answer.repo}`);
  lines.push(`- **Date**: ${new Date().toISOString().split('T')[0]}`);
  lines.push('');
  lines.push('## Context and problem');
  lines.push('');
  answer.short_answer.forEach((sa) => {
    lines.push(sa.text);
  });
  lines.push('');
  lines.push('## Considered options');
  lines.push('');
  answer.decisions.forEach((d) => {
    lines.push(`* ${d.approach} (${d.status})`);
  });
  lines.push('');
  lines.push('## Decision outcome');
  lines.push('');
  decided.forEach((d) => {
    lines.push(`### Chosen: ${d.approach}`);
    lines.push(`* **Why**: ${d.why.text}`);
    lines.push(`* **Proposer**: ${d.proposer}`);
    lines.push('');
  });
  lines.push('## Rejected options and why');
  lines.push('');
  rejected.forEach((d) => {
    lines.push(`### Decided against: ${d.approach}`);
    lines.push(`* **Why**: ${d.why.text}`);
    lines.push(`* **Proposer**: ${d.proposer}`);
    lines.push('');
  });
  if (other.length > 0) {
    lines.push('## Other considered options');
    lines.push('');
    other.forEach((d) => {
      lines.push(`* **${d.approach}** (${d.status}): ${d.why.text}`);
    });
    lines.push('');
  }
  lines.push('## Sources');
  lines.push('');
  answer.posts.forEach((p) => {
    lines.push(`* [${p.author} comment](${p.url}) (${new Date(p.timestamp).toLocaleDateString()})`);
  });

  return lines.join('\n');
}

export function downloadDecisionRecord(answer: Answer): void {
  const md = generateDecisionRecordMarkdown(answer);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeTitle = answer.question.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  link.download = `ADR-${safeTitle}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
