import { describe, it, expect } from 'vitest';
import { generateDecisionRecordMarkdown } from '../utils/downloadDecisionRecord';
import { mainAnswer } from '../mock/answers';

describe('(6) Decision record markdown export', () => {
  it('contains the decided and rejected items with their reasons', () => {
    const md = generateDecisionRecordMarkdown(mainAnswer);

    // Title and structure
    expect(md).toContain(`# ${mainAnswer.question}`);
    expect(md).toContain('## Decision outcome');
    expect(md).toContain('## Rejected options and why');

    // Decided item
    expect(md).toContain('Chosen: Wait longer after each failed try');
    expect(md).toContain('Exponential backoff spreads out requests and avoids hammering servers after an outage');

    // Rejected item
    expect(md).toContain('Decided against: Use an outside retry library');
    expect(md).toContain('Adds an outside dependency for what is only about twenty lines of code');

    // Sources section
    expect(md).toContain('## Sources');
  });
});
