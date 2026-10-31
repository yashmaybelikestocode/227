import { describe, it, expect } from "vitest";
import { generateDecisionRecordMarkdown } from "../utils/downloadDecisionRecord";
import { MOCK_ANSWER_HTTPCACHE_RETRY } from "../mock/data";

describe("Decision record generation", () => {
  it("the decision record download contains the decided and rejected items with their reasons", () => {
    const md = generateDecisionRecordMarkdown(MOCK_ANSWER_HTTPCACHE_RETRY);

    // Header and structure
    expect(md).toContain("# Decision Record: Why do we retry failed requests?");
    expect(md).toContain("## Decision outcome");
    expect(md).toContain("## Rejected options and why");

    // Decided item with reason
    expect(md).toContain("Wait longer after each failed try");
    expect(md).toContain("starts at half a second and doubles, spreads load after an outage");

    // Rejected item with reason
    expect(md).toContain("Use an outside retry library");
    expect(md).toContain("adds a dependency for about 20 lines of code");

    // Sources
    expect(md).toContain("## Sources");
    expect(md).toContain("Priya N.");
  });
});
