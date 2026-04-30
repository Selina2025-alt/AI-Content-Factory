"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import type { HistoryActionRecord, WechatLibraryItem } from "@/lib/content-creation-types";

const publishStatusLabels = {
  idle: "未发布",
  publishing: "发布中",
  published: "已发布",
  failed: "发布失败"
} as const;

interface WechatAccountsResponsePayload {
  accounts?: Array<{
    wechatAppid?: string;
    status?: string;
  }>;
  message?: string;
}

interface PublishTaskResponsePayload {
  message?: string;
  status?: WechatLibraryItem["publishStatus"];
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatActionLabel(action: HistoryActionRecord) {
  if (action.actionType === "task_created") {
    return "任务已生成";
  }

  if (action.actionType === "wechat_published") {
    return "公众号模拟发布成功";
  }

  if (action.actionType === "library_saved") {
    return "已加入内容库";
  }

  return action.actionType;
}

function buildActionDetail(action: HistoryActionRecord) {
  if (typeof action.payload.title === "string") {
    return action.payload.title;
  }

  if (typeof action.payload.platform === "string") {
    return `平台：${action.payload.platform}`;
  }

  return `任务 ID：${action.taskId}`;
}

async function resolveDefaultWechatAppid() {
  const response = await fetch("/api/wechat/accounts", {
    method: "POST"
  });
  const payload = (await response.json()) as WechatAccountsResponsePayload;

  if (!response.ok || !payload.accounts || payload.accounts.length === 0) {
    throw new Error(payload.message ?? "未获取到可用的公众号账号");
  }

  const preferred =
    payload.accounts.find((account) => {
      const status = account.status?.toLowerCase().trim();
      return status === "active" || status === "enabled" || status === "ok";
    }) ?? payload.accounts[0];

  if (!preferred?.wechatAppid) {
    throw new Error("公众号账号缺少 wechatAppid");
  }

  return preferred.wechatAppid;
}

export function WechatLibraryShell(props: {
  items: WechatLibraryItem[];
  recentActions: HistoryActionRecord[];
}) {
  const [query, setQuery] = useState("");
  const [libraryItems, setLibraryItems] = useState(props.items);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isBatchPublishing, setIsBatchPublishing] = useState(false);
  const [batchPublishStatusMessage, setBatchPublishStatusMessage] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredItems = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return libraryItems;
    }

    return libraryItems.filter((item) =>
      `${item.title} ${item.summary} ${item.userInput}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [deferredQuery, libraryItems]);

  const selectableItems = useMemo(
    () => filteredItems.filter((item) => item.publishStatus !== "published"),
    [filteredItems]
  );
  const allSelectableChecked =
    selectableItems.length > 0 &&
    selectableItems.every((item) => selectedTaskIds.includes(item.taskId));
  const hasSelectableItems = selectableItems.length > 0;
  const selectedCount = selectedTaskIds.length;

  function toggleTaskSelection(taskId: string, checked: boolean) {
    setSelectedTaskIds((current) => {
      if (checked) {
        return current.includes(taskId) ? current : [...current, taskId];
      }

      return current.filter((id) => id !== taskId);
    });
    setBatchPublishStatusMessage("");
  }

  function setAllSelectableSelection(checked: boolean) {
    setSelectedTaskIds((current) => {
      if (!checked) {
        const selectableSet = new Set(selectableItems.map((item) => item.taskId));
        return current.filter((taskId) => !selectableSet.has(taskId));
      }

      const merged = new Set(current);
      for (const item of selectableItems) {
        merged.add(item.taskId);
      }
      return [...merged];
    });
    setBatchPublishStatusMessage("");
  }

  function toggleAllSelectable() {
    setAllSelectableSelection(!allSelectableChecked);
  }

  async function handleBatchPublishWechat() {
    const targetTaskIds = Array.from(new Set(selectedTaskIds));

    if (targetTaskIds.length === 0) {
      setBatchPublishStatusMessage("请先勾选要发布的文章");
      return;
    }

    setIsBatchPublishing(true);
    setBatchPublishStatusMessage("");

    try {
      const wechatAppid = await resolveDefaultWechatAppid();
      let successCount = 0;
      const failedTaskIds = new Set<string>();

      for (const taskId of targetTaskIds) {
        setLibraryItems((current) =>
          current.map((item) =>
            item.taskId === taskId ? { ...item, publishStatus: "publishing" } : item
          )
        );

        const response = await fetch(`/api/tasks/${taskId}/publish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            platform: "wechat",
            wechatAppid,
            articleType: "news"
          })
        });
        const payload = (await response.json()) as PublishTaskResponsePayload;

        if (!response.ok) {
          failedTaskIds.add(taskId);
          setLibraryItems((current) =>
            current.map((item) =>
              item.taskId === taskId ? { ...item, publishStatus: "failed" } : item
            )
          );
          if (payload.message) {
            setBatchPublishStatusMessage(payload.message);
          }
          continue;
        }

        successCount += 1;
        const nextStatus = payload.status ?? "published";
        setLibraryItems((current) =>
          current.map((item) =>
            item.taskId === taskId ? { ...item, publishStatus: nextStatus } : item
          )
        );
      }

      const failedCount = failedTaskIds.size;
      setBatchPublishStatusMessage(
        failedCount === 0
          ? `批量发布完成：成功 ${successCount} 篇`
          : `批量发布完成：成功 ${successCount} 篇，失败 ${failedCount} 篇`
      );
      setSelectedTaskIds([...failedTaskIds]);
    } catch (error) {
      setBatchPublishStatusMessage(
        error instanceof Error ? error.message : "批量发布失败"
      );
    } finally {
      setIsBatchPublishing(false);
    }
  }

  return (
    <main className="library-layout">
      <aside className="library-nav">
        <Link className="page-return-link" href="/content-creation">
          <svg
            aria-hidden="true"
            fill="none"
            height="14"
            viewBox="0 0 16 16"
            width="14"
          >
            <path
              d="M6.5 3.5 2.5 8l4 4.5M3 8h10.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
          <span>返回主页</span>
        </Link>

        <p className="library-nav__eyebrow">Content Library</p>
        <h1 className="library-nav__title">内容库</h1>
        <p className="library-nav__description">
          这里收纳你主动加入内容库的公众号文章。列表只看标题和摘要，正文进入详情页查看。
        </p>

        <div className="library-nav__actions">
          <Link className="library-nav__action" href="/content-creation">
            新建需求
          </Link>
          <Link
            className="library-nav__action library-nav__action--ghost"
            href="/content-creation/settings"
          >
            打开设置
          </Link>
        </div>
      </aside>

      <section className="library-content">
        <div className="library-toolbar">
          <div>
            <p className="library-toolbar__eyebrow">Wechat Articles</p>
            <h2 className="library-toolbar__title">公众号文章资产</h2>
          </div>
          <label className="library-search" htmlFor="library-search">
            <span className="library-search__label">搜索内容库</span>
            <input
              aria-label="搜索内容库"
              id="library-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="按标题、摘要或来源需求搜索"
              type="search"
              value={query}
            />
          </label>
        </div>

        <div className="library-main-grid">
          <section className="library-articles">
            {filteredItems.length > 0 ? (
              <div className="library-batch-controls">
                <label className="library-batch-controls__select-all">
                  <input
                    type="checkbox"
                    checked={allSelectableChecked}
                    disabled={!hasSelectableItems || isBatchPublishing}
                    onChange={(event) =>
                      setAllSelectableSelection(event.target.checked)
                    }
                    aria-label="全选用于批量发布"
                  />
                  <span>全选</span>
                </label>
                <button
                  className="library-batch-controls__button"
                  type="button"
                  disabled={!hasSelectableItems || isBatchPublishing}
                  onClick={toggleAllSelectable}
                >
                  {allSelectableChecked ? "取消全选" : "全选当前列表"}
                </button>
                <button
                  className="library-batch-controls__button library-batch-controls__button--primary"
                  type="button"
                  disabled={selectedCount === 0 || isBatchPublishing}
                  onClick={() => {
                    void handleBatchPublishWechat();
                  }}
                >
                  {isBatchPublishing
                    ? "批量发布中..."
                    : `批量发布到公众号草稿箱（已选 ${selectedCount}）`}
                </button>
              </div>
            ) : null}

            {batchPublishStatusMessage ? (
              <p className="library-batch-status">{batchPublishStatusMessage}</p>
            ) : null}

            {filteredItems.length === 0 ? (
              <div className="library-empty">
                还没有匹配的公众号文章。先回到首页，把草稿箱里已生成的文章加入内容库。
              </div>
            ) : (
              filteredItems.map((item) => {
                const canSelect = item.publishStatus !== "published";

                return (
                  <article className="library-article-card" key={item.taskId}>
                    <div className="library-article-card__meta">
                      <span className="library-article-card__platform">公众号文章</span>
                      <div className="library-article-card__meta-right">
                        <span className="library-article-card__status">
                          {publishStatusLabels[item.publishStatus]}
                        </span>
                        <label className="library-article-card__select">
                          <input
                            type="checkbox"
                            checked={selectedTaskIds.includes(item.taskId)}
                            disabled={!canSelect || isBatchPublishing}
                            onChange={(event) =>
                              toggleTaskSelection(item.taskId, event.target.checked)
                            }
                            aria-label={`勾选发布 ${item.title}`}
                          />
                          <span>用于批量发布</span>
                        </label>
                      </div>
                    </div>
                    <h3 className="library-article-card__title">{item.title}</h3>
                    <p className="library-article-card__summary">{item.summary}</p>
                    <p className="library-article-card__source">{item.userInput}</p>
                    <div className="library-article-card__footer">
                      <span>{formatUpdatedAt(item.updatedAt)}</span>
                      <div className="library-article-card__links">
                        <Link
                          aria-label={`查看正文 ${item.title}`}
                          className="library-article-card__link library-article-card__link--ghost"
                          href={`/content-creation/library/${item.taskId}`}
                        >
                          查看正文
                        </Link>
                        <Link
                          aria-label={`打开工作台 ${item.title}`}
                          className="library-article-card__link"
                          href={`/content-creation/workspace/${item.taskId}`}
                        >
                          打开工作台
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>

          <aside className="library-timeline">
            <div className="library-timeline__header">
              <p className="library-timeline__eyebrow">Recent Actions</p>
              <h2 className="library-timeline__title">最近操作</h2>
            </div>

            {props.recentActions.length === 0 ? (
              <div className="library-empty library-empty--compact">
                还没有操作记录。生成、归档或发布内容后，这里会自动留下时间线。
              </div>
            ) : (
              <div className="library-timeline__list">
                {props.recentActions.map((action) => (
                  <article className="library-timeline__item" key={action.id}>
                    <div className="library-timeline__dot" />
                    <div>
                      <strong>{formatActionLabel(action)}</strong>
                      <p>{buildActionDetail(action)}</p>
                      <span>{formatUpdatedAt(action.createdAt)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
