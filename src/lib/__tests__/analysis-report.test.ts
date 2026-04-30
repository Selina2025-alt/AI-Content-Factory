import { describe, expect, it } from "vitest";

import {
  mapPersistedAnalysisSnapshotToReport,
  mergePersistedReportsIntoReports
} from "@/lib/analysis-report";
import type { PersistedAnalysisSnapshotDetail } from "@/lib/db/monitoring-repository";
import type { ReplicaDailyReport } from "@/lib/replica-workbench-data";

function buildSnapshotDetail(
  input: Partial<PersistedAnalysisSnapshotDetail>
): PersistedAnalysisSnapshotDetail {
  return {
    snapshot: {
      id: input.snapshot?.id ?? "snapshot-1",
      searchQueryId: input.snapshot?.searchQueryId ?? "query-1",
      categoryId: input.snapshot?.categoryId ?? "agent",
      keyword: input.snapshot?.keyword ?? "ai agent",
      generatedAt: input.snapshot?.generatedAt ?? "2026-04-29T09:00:00.000Z",
      hotSummary: input.snapshot?.hotSummary ?? "hot",
      focusSummary: input.snapshot?.focusSummary ?? "focus",
      patternSummary: input.snapshot?.patternSummary ?? "pattern",
      insightSummary: input.snapshot?.insightSummary ?? "insight"
    },
    topics: input.topics ?? []
  };
}

function buildReport(input: Partial<ReplicaDailyReport>): ReplicaDailyReport {
  return {
    id: input.id ?? "report-1",
    date: input.date ?? "2026-04-29",
    label: input.label ?? (input.date ?? "2026-04-29"),
    hotSummary: input.hotSummary ?? "hot",
    focusSummary: input.focusSummary ?? "focus",
    patternSummary: input.patternSummary ?? "pattern",
    insightSummary: input.insightSummary ?? "insight",
    suggestions: input.suggestions ?? []
  };
}

describe("analysis-report", () => {
  it("keeps the latest persisted report when multiple snapshots share the same date", () => {
    const latest = buildReport({
      id: "snapshot-new",
      date: "2026-04-29",
      suggestions: [
        {
          id: "s-new",
          title: "new",
          intro: "new",
          whyNow: "new",
          hook: "new",
          growth: "new",
          supportContentIds: []
        }
      ]
    });
    const older = buildReport({
      id: "snapshot-old",
      date: "2026-04-29",
      suggestions: []
    });

    const merged = mergePersistedReportsIntoReports([], [latest, older]);

    expect(merged[0]?.id).toBe("snapshot-new");
    expect(merged[0]?.suggestions).toHaveLength(1);
  });

  it("backfills persisted snapshots to at least eight suggestions", () => {
    const report = mapPersistedAnalysisSnapshotToReport(buildSnapshotDetail({ topics: [] }));

    expect(report.suggestions.length).toBeGreaterThanOrEqual(8);
  });
});
