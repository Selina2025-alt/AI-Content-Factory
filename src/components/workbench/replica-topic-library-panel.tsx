import Link from "next/link";

import type { ReplicaTopicLibraryEntry } from "@/lib/replica-workbench-data";

export interface TopicLibraryBatchResult {
  entryId: string;
  title: string;
  success: boolean;
  generatedTaskId: string | null;
  message: string;
}

interface ReplicaTopicLibraryPanelProps {
  entries: ReplicaTopicLibraryEntry[];
  isLoading: boolean;
  isGenerating: boolean;
  statusMessage: string;
  results: TopicLibraryBatchResult[];
  onToggleSelect: (entryId: string, selected: boolean) => void;
  onToggleSelectAll: (selected: boolean) => void;
  onSoftDelete: (entryId: string) => void;
  onBatchGenerate: () => void;
}

export function ReplicaTopicLibraryPanel({
  entries,
  isLoading,
  isGenerating,
  statusMessage,
  results,
  onToggleSelect,
  onToggleSelectAll,
  onSoftDelete,
  onBatchGenerate
}: ReplicaTopicLibraryPanelProps) {
  const selectedCount = entries.filter((entry) => entry.selected).length;
  const allSelected = entries.length > 0 && selectedCount === entries.length;
  const runningCount = entries.filter(
    (entry) => entry.generationStatus === "generating"
  ).length;

  function getGenerationStatusLabel(status: ReplicaTopicLibraryEntry["generationStatus"]) {
    if (status === "generating") {
      return "生成中";
    }

    if (status === "generated") {
      return "已生成";
    }

    if (status === "failed") {
      return "生成失败";
    }

    return "待生成";
  }

  return (
    <div className="replica-shell__analysis-shell">
      <div className="replica-shell__analysis-toolbar">
        <div className="replica-shell__analysis-toolbar-head">
          <div>
            <h3 className="replica-shell__topic-library-title">选题汇总库</h3>
            <p className="replica-shell__topic-library-hint">
              跨关键词汇总你加入的选题，在这里统一筛选并批量进入内容创作。
            </p>
          </div>
          <Link className="replica-shell__action-button" href="/content-creation">
            去内容创作工作台
          </Link>
        </div>

        <div className="replica-shell__topic-library-actions">
          <button
            className="replica-shell__action-button"
            type="button"
            disabled={entries.length === 0}
            onClick={() => onToggleSelectAll(!allSelected)}
          >
            {allSelected ? "取消全选" : "全选"}
          </button>
          <button
            className="replica-shell__action-button replica-shell__action-button--primary"
            type="button"
            disabled={selectedCount === 0 || isGenerating}
            onClick={onBatchGenerate}
          >
            {isGenerating
              ? "批量生成中..."
              : `批量生成（已选 ${selectedCount}）`}
          </button>
        </div>

        {statusMessage ? (
          <p className="replica-shell__analysis-status">{statusMessage}</p>
        ) : null}

        {runningCount > 0 ? (
          <p className="replica-shell__analysis-status">
            后台任务运行中：{runningCount} 个选题正在生成，请稍后查看结果。
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="replica-shell__empty-card">选题库加载中...</div>
      ) : null}

      {!isLoading && entries.length === 0 ? (
        <div className="replica-shell__empty-card">
          选题库还没有内容。先在「选题分析」里把选题加进来。
        </div>
      ) : null}

      {!isLoading && entries.length > 0 ? (
        <div className="replica-shell__topic-list">
          {entries.map((entry) => (
            <article key={entry.id} className="replica-shell__topic-card">
              <div className="replica-shell__topic-card-head">
                <h5>{entry.title}</h5>
                <span className="replica-shell__topic-status">
                  {getGenerationStatusLabel(entry.generationStatus)}
                </span>
                <label className="replica-shell__topic-select">
                  <input
                    type="checkbox"
                    checked={entry.selected}
                    onChange={(event) =>
                      onToggleSelect(entry.id, event.target.checked)
                    }
                    aria-label={`选中选题：${entry.title}`}
                  />
                  <span>用于批量生成</span>
                </label>
              </div>

              <div className="replica-shell__topic-meta-row">
                <span>{entry.categoryName}</span>
                <span>{entry.keyword}</span>
                <span>{entry.reportDate ?? "未记录日期"}</span>
              </div>

              <p>{entry.intro}</p>

              {entry.generationStatus === "failed" && entry.lastErrorMessage ? (
                <p className="replica-shell__analysis-status">
                  失败原因：{entry.lastErrorMessage}
                </p>
              ) : null}

              <dl>
                <div>
                  <dt>为什么现在做</dt>
                  <dd>{entry.whyNow}</dd>
                </div>
                <div>
                  <dt>爆点</dt>
                  <dd>{entry.hook}</dd>
                </div>
                <div>
                  <dt>增长空间</dt>
                  <dd>{entry.growth}</dd>
                </div>
              </dl>

              <div className="replica-shell__topic-actions">
                <button
                  className="replica-shell__action-button"
                  type="button"
                  onClick={() => onSoftDelete(entry.id)}
                >
                  移出选题库
                </button>
                {entry.generatedTaskId ? (
                  <Link
                    className="replica-shell__action-button replica-shell__action-button--secondary"
                    href={`/content-creation/workspace/${entry.generatedTaskId}`}
                  >
                    查看生成结果
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="replica-shell__result-list">
          <h4>最近一次批量生成结果</h4>
          <ul>
            {results.map((result) => (
              <li key={`${result.entryId}:${result.generatedTaskId ?? "failed"}`}>
                <strong>{result.title}</strong>
                <span>{result.success ? "成功" : "失败"}</span>
                <span>{result.message}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default ReplicaTopicLibraryPanel;
