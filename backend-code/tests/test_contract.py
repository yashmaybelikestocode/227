from cypher.contract import check, ts_fields

TS = """
export interface Claim { text: string; statement_ids: string[] }
export type Decision = {
  id: string; title: string;
  status: "accepted" | "rejected";
  reason: Claim; later_changes?: LaterChange[];
  extra_field_from_frontend: number;
}
"""


def test_ts_fields_reads_interfaces_and_types():
    assert ts_fields(TS, "Claim") == {"text", "statement_ids"}
    assert ts_fields(TS, "Decision") == {"id", "title", "status", "reason", "later_changes", "extra_field_from_frontend"}
    assert ts_fields(TS, "Missing") is None


def test_check_reports_fields_the_backend_does_not_send(tmp_path):
    f = tmp_path / "types.ts"
    f.write_text(TS)
    problems = check(f)
    assert any(p.startswith("Decision") and "extra_field_from_frontend" in p for p in problems)
    assert not any(p.startswith("Claim") for p in problems)
