import type {
  ReplicaAnalysisMode,
  ReplicaDailyReport,
  ReplicaTopicSuggestion
} from "@/lib/replica-workbench-data";

export interface ReplicaAnalysisEvidenceItem {
  id: string;
  snapshotId: string;
  contentId: string;
  keyword: string;
  platformId: string;
  title: string;
  briefSummary: string;
  keyFacts: string[];
  keywords: string[];
  highlights: string[];
  attentionSignals: string[];
  topicAngles: string[];
  createdAt: string;
}

export interface ReplicaAnalysisDetail {
  snapshot: {
    id: string;
    searchQueryId: string;
    categoryId: string;
    keyword: string;
    generatedAt: string;
    hotSummary: string;
    focusSummary: string;
    patternSummary: string;
    insightSummary: string;
  };
  topics: Array<{
    id: string;
    snapshotId: string;
    title: string;
    intro: string;
    whyNow: string;
    hook: string;
    growth: string;
    supportContentIds: string[];
  }>;
  evidenceItems: ReplicaAnalysisEvidenceItem[];
}

interface ReplicaAnalysisPanelProps {
  reports: ReplicaDailyReport[];
  selectedReportId: string;
  analysisMode: ReplicaAnalysisMode;
  reportWindow: 7 | 14;
  isRunning: boolean;
  statusMessage: string;
  detail: ReplicaAnalysisDetail | null;
  selectedSupportTopicId: string | null;
  topicLibraryTopicIds: string[];
  upsertingTopicIds: string[];
  onSelectReport: (reportId: string) => void;
  onSelectMode: (mode: ReplicaAnalysisMode) => void;
  onSelectWindow: (window: 7 | 14) => void;
  onRunAnalysis: () => void;
  onViewSupportContent: (topicId: string) => void;
  onToggleTopicLibrary: (input: {
    topic: ReplicaTopicSuggestion;
    reportId: string;
    reportDate: string;
    checked: boolean;
  }) => void;
  onOpenTopicLibrary: () => void;
}

function getVisibleEvidenceItems(
  detail: ReplicaAnalysisDetail | null,
  selectedSupportTopicId: string | null
) {
  if (!detail) {
    return [];
  }

  if (!selectedSupportTopicId) {
    return detail.evidenceItems;
  }

  const topic = detail.topics.find((item) => item.id === selectedSupportTopicId);

  if (!topic) {
    return detail.evidenceItems;
  }

  return detail.evidenceItems.filter((item) =>
    topic.supportContentIds.includes(item.contentId)
  );
}

function renderTopicCard(input: {
  suggestion: ReplicaTopicSuggestion;
  reportId: string;
  reportDate: string;
  isInTopicLibrary: boolean;
  isMutating: boolean;
  onToggleTopicLibrary: (input: {
    topic: ReplicaTopicSuggestion;
    reportId: string;
    reportDate: string;
    checked: boolean;
  }) => void;
  onViewSupportContent: (topicId: string) => void;
}) {
  const {
    suggestion,
    reportId,
    reportDate,
    isInTopicLibrary,
    isMutating,
    onToggleTopicLibrary,
    onViewSupportContent
  } = input;

  return (
    <article key={suggestion.id} className="replica-shell__topic-card">
      <div className="replica-shell__topic-card-head">
        <h5>{suggestion.title}</h5>
        <label className="replica-shell__topic-select">
          <input
            type="checkbox"
            checked={isInTopicLibrary}
            disabled={isMutating}
            onChange={(event) =>
              onToggleTopicLibrary({
                topic: suggestion,
                reportId,
                reportDate,
                checked: event.target.checked
              })
            }
            aria-label={`加进选题库：${suggestion.title}`}
          />
          <span>{isMutating ? "处理中..." : "加进选题库"}</span>
        </label>
      </div>

      <p>{suggestion.intro}</p>

      <dl>
        <div>
          <dt>为什么现在做</dt>
          <dd>{suggestion.whyNow}</dd>
        </div>
        <div>
          <dt>爆点</dt>
          <dd>{suggestion.hook}</dd>
        </div>
        <div>
          <dt>增长空间</dt>
          <dd>{suggestion.growth}</dd>
        </div>
      </dl>

      <div className="replica-shell__topic-actions">
        <button type="button" onClick={() => onViewSupportContent(suggestion.id)}>
          查看支持内容
        </button>
      </div>
    </article>
  );
}

export function ReplicaAnalysisPanel({
  reports,
  selectedReportId,
  analysisMode,
  reportWindow,
  isRunning,
  statusMessage,
  detail,
  selectedSupportTopicId,
  topicLibraryTopicIds,
  upsertingTopicIds,
  onSelectReport,
  onSelectMode,
  onSelectWindow,
  onRunAnalysis,
  onViewSupportContent,
  onToggleTopicLibrary,
  onOpenTopicLibrary
}: ReplicaAnalysisPanelProps) {
  const visibleReports = reports.slice(0, reportWindow);
  const activeReport =
    visibleReports.find((report) => report.id === selectedReportId) ??
    visibleReports[0];
  const visibleEvidenceItems = getVisibleEvidenceItems(
    detail,
    selectedSupportTopicId
  );

  return (
    <div className="replica-shell__analysis-shell">
      <div className="replica-shell__analysis-toolbar">
        <div className="replica-shell__analysis-toolbar-head">
          <div className="replica-shell__analysis-dates">
            {visibleReports.map((report) => (
              <button
                key={report.id}
                className={`replica-shell__report-chip ${
                  report.id === activeReport?.id ? "is-active" : ""
                }`}
                type="button"
                onClick={() => onSelectReport(report.id)}
              >
                <span className="replica-shell__report-date">{report.date}</span>
              </button>
            ))}
          </div>

          <div className="replica-shell__analysis-toolbar-buttons">
            <button className="replica-shell__action-button" type="button" onClick={onOpenTopicLibrary}>
              打开选题库
            </button>
            <button
              className="replica-shell__action-button replica-shell__action-button--primary replica-shell__analysis-run"
              type="button"
              disabled={isRunning}
              onClick={onRunAnalysis}
            >
              {isRunning ? "分析中..." : "立即分析"}
            </button>
          </div>
        </div>

        <div className="replica-shell__analysis-actions">
          <div className="replica-shell__mini-switch">
            <button
              className={analysisMode === "daily" ? "is-active" : ""}
              type="button"
              onClick={() => onSelectMode("daily")}
            >
              日报
            </button>
            <button
              className={analysisMode === "summary" ? "is-active" : ""}
              type="button"
              onClick={() => onSelectMode("summary")}
            >
              汇总
            </button>
          </div>

          <div className="replica-shell__mini-switch">
            <button
              className={reportWindow === 7 ? "is-active" : ""}
              type="button"
              onClick={() => onSelectWindow(7)}
            >
              最近 7 天
            </button>
            <button
              className={reportWindow === 14 ? "is-active" : ""}
              type="button"
              onClick={() => onSelectWindow(14)}
            >
              最近 14 天
            </button>
          </div>
        </div>

        {statusMessage ? (
          <p className="replica-shell__analysis-status">{statusMessage}</p>
        ) : null}
      </div>

      {analysisMode === "daily" && activeReport ? (
        <div className="replica-shell__analysis-grid">
          <section className="replica-shell__analysis-card">
            <h4>今日热点摘要</h4>
            <p>{activeReport.hotSummary}</p>
          </section>
          <section className="replica-shell__analysis-card">
            <h4>前一日用户关注焦点</h4>
            <p>{activeReport.focusSummary}</p>
          </section>
          <section className="replica-shell__analysis-card">
            <h4>爆款内容共性拆解</h4>
            <p>{activeReport.patternSummary}</p>
          </section>
          <section className="replica-shell__analysis-card">
            <h4>洞察建议</h4>
            <p>{activeReport.insightSummary}</p>
          </section>

          <section className="replica-shell__analysis-card replica-shell__analysis-card--full">
            <h4>选题建议</h4>
            <div className="replica-shell__topic-list">
              {activeReport.suggestions.map((suggestion) =>
                renderTopicCard({
                  suggestion,
                  reportId: activeReport.id,
                  reportDate: activeReport.date,
                  isInTopicLibrary: topicLibraryTopicIds.includes(suggestion.id),
                  isMutating: upsertingTopicIds.includes(suggestion.id),
                  onToggleTopicLibrary,
                  onViewSupportContent
                })
              )}
            </div>
          </section>

          {detail?.evidenceItems.length ? (
            <section className="replica-shell__analysis-card replica-shell__analysis-card--full">
              <h4>文章摘录证据</h4>
              <div className="replica-shell__evidence-list">
                {visibleEvidenceItems.map((item) => (
                  <article key={item.id} className="replica-shell__evidence-card">
                    <div className="replica-shell__evidence-head">
                      <strong>{item.title}</strong>
                      <span>{item.platformId}</span>
                    </div>
                    <p>{item.briefSummary}</p>
                    {item.keywords.length ? (
                      <div className="replica-shell__tag-list">
                        {item.keywords.map((keyword) => (
                          <span
                            key={`${item.id}-${keyword}`}
                            className="replica-shell__tag-item"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {item.highlights.length ? (
                      <ul className="replica-shell__evidence-points">
                        {item.highlights.map((highlight) => (
                          <li key={`${item.id}-${highlight}`}>{highlight}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <div className="replica-shell__summary-shell">
          <h4>最近 {reportWindow} 天选题方向汇总</h4>
          <div className="replica-shell__topic-list">
            {visibleReports.flatMap((report) =>
              report.suggestions.map((suggestion) => (
                <div key={`${report.id}:${suggestion.id}`} className="replica-shell__topic-with-date">
                  <div className="replica-shell__topic-meta">{report.date}</div>
                  {renderTopicCard({
                    suggestion,
                    reportId: report.id,
                    reportDate: report.date,
                    isInTopicLibrary: topicLibraryTopicIds.includes(suggestion.id),
                    isMutating: upsertingTopicIds.includes(suggestion.id),
                    onToggleTopicLibrary,
                    onViewSupportContent
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReplicaAnalysisPanel;
