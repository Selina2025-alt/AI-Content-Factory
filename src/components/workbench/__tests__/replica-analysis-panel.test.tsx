import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  ReplicaAnalysisPanel,
  type ReplicaAnalysisDetail
} from "@/components/workbench/replica-analysis-panel";
import type { ReplicaDailyReport } from "@/lib/replica-workbench-data";

describe("replica analysis panel", () => {
  it("supports add-to-library operations", async () => {
    const user = userEvent.setup();
    const onRunAnalysis = vi.fn();
    const onOpenTopicLibrary = vi.fn();
    const onToggleTopicLibrary = vi.fn();

    const { container } = render(
      <ReplicaAnalysisPanel
        reports={[buildReport()]}
        selectedReportId="report-1"
        analysisMode="daily"
        reportWindow={7}
        isRunning={false}
        statusMessage=""
        detail={buildDetail()}
        selectedSupportTopicId={null}
        topicLibraryTopicIds={[]}
        upsertingTopicIds={[]}
        onSelectReport={vi.fn()}
        onSelectMode={vi.fn()}
        onSelectWindow={vi.fn()}
        onRunAnalysis={onRunAnalysis}
        onViewSupportContent={vi.fn()}
        onToggleTopicLibrary={onToggleTopicLibrary}
        onOpenTopicLibrary={onOpenTopicLibrary}
      />
    );

    expect(screen.getByText("Article evidence")).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(onToggleTopicLibrary).toHaveBeenCalledWith({
      topic: expect.objectContaining({ id: "topic-1", title: "Topic 1" }),
      reportId: "report-1",
      reportDate: "2026-04-03",
      checked: true
    });

    const runButton = container.querySelector(
      ".replica-shell__analysis-run"
    ) as HTMLButtonElement | null;
    expect(runButton).not.toBeNull();
    if (runButton) {
      await user.click(runButton);
    }
    expect(onRunAnalysis).toHaveBeenCalledTimes(1);

    const openTopicLibraryButton = container.querySelector(
      ".replica-shell__analysis-toolbar-buttons .replica-shell__action-button"
    ) as HTMLButtonElement | null;
    expect(openTopicLibraryButton).not.toBeNull();
    if (openTopicLibraryButton) {
      await user.click(openTopicLibraryButton);
    }
    expect(onOpenTopicLibrary).toHaveBeenCalledTimes(1);
  });
});

function buildReport(): ReplicaDailyReport {
  return {
    id: "report-1",
    date: "2026-04-03",
    label: "2026-04-03",
    hotSummary: "hot",
    focusSummary: "focus",
    patternSummary: "pattern",
    insightSummary: "insight",
    suggestions: [
      {
        id: "topic-1",
        title: "Topic 1",
        intro: "intro",
        whyNow: "why",
        hook: "hook",
        growth: "growth",
        supportContentIds: ["content-1"]
      }
    ]
  };
}

function buildDetail(): ReplicaAnalysisDetail {
  return {
    snapshot: {
      id: "report-1",
      searchQueryId: "analysis-run-1",
      categoryId: "claude",
      keyword: "claude code",
      generatedAt: "2026-04-03T09:00:00.000Z",
      hotSummary: "hot",
      focusSummary: "focus",
      patternSummary: "pattern",
      insightSummary: "insight"
    },
    topics: [
      {
        id: "topic-1",
        snapshotId: "report-1",
        title: "Topic 1",
        intro: "intro",
        whyNow: "why",
        hook: "hook",
        growth: "growth",
        supportContentIds: ["content-1"]
      }
    ],
    evidenceItems: [
      {
        id: "evidence-1",
        snapshotId: "report-1",
        contentId: "content-1",
        keyword: "claude code",
        platformId: "wechat",
        title: "Article evidence",
        briefSummary: "brief",
        keyFacts: ["fact"],
        keywords: ["claude code"],
        highlights: ["highlight"],
        attentionSignals: ["signal"],
        topicAngles: ["angle"],
        createdAt: "2026-04-03T09:00:00.000Z"
      }
    ]
  };
}
