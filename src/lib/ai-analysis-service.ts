import type { ContentItem } from "@/lib/types";

export interface AnalysisEvidenceDraft {
  contentId: string;
  title: string;
  platform: string;
  author: string;
  briefSummary: string;
  keyFacts: string[];
  keywords: string[];
  highlights: string[];
  attentionSignals: string[];
  topicAngles: string[];
}

export interface AnalysisTopicDraft {
  title: string;
  intro: string;
  whyNow: string;
  hook: string;
  growth: string;
  coreKeywords: string[];
  supportContentIds: string[];
  evidenceSummary: string;
}

export interface AnalysisSnapshotDraft {
  hotSummary: string;
  focusSummary: string;
  patternSummary: string;
  insightSummary: string;
  topics: AnalysisTopicDraft[];
}

interface AnalysisClient {
  completeJson(input: { system: string; user: string }): Promise<unknown>;
}

const MIN_TOPIC_COUNT = 8;
const MAX_TOPIC_COUNT = 8;

const TOPIC_BLUEPRINTS = [
  {
    topicType: "结果复盘",
    angle: "案例拆解",
    style: "结论先行",
    titleSuffix: "结果证明型复盘"
  },
  {
    topicType: "流程手册",
    angle: "实操方法",
    style: "步骤清单",
    titleSuffix: "工作流落地指南"
  },
  {
    topicType: "避坑指南",
    angle: "失败样本",
    style: "风险清单",
    titleSuffix: "高频误区与修正"
  },
  {
    topicType: "观点评测",
    angle: "方案对比",
    style: "正反辩论",
    titleSuffix: "两种做法如何选"
  },
  {
    topicType: "故事案例",
    angle: "人物与场景",
    style: "叙事复盘",
    titleSuffix: "真实场景故事线"
  },
  {
    topicType: "模板工具",
    angle: "可复制资产",
    style: "工具清单",
    titleSuffix: "拿来即用模板包"
  },
  {
    topicType: "趋势观察",
    angle: "数据信号",
    style: "趋势解读",
    titleSuffix: "近期信号与判断"
  },
  {
    topicType: "情绪共鸣",
    angle: "用户困境",
    style: "共情表达",
    titleSuffix: "焦虑问题与破局"
  },
  {
    topicType: "跨平台分发",
    angle: "内容改写",
    style: "平台策略",
    titleSuffix: "一稿多平台改写"
  },
  {
    topicType: "互动问答",
    angle: "高频问题",
    style: "FAQ 问答",
    titleSuffix: "最常被问的 8 个问题"
  }
] as const;

function toText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function buildKeywordSeed(keyword: string) {
  return keyword.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function normalizeEvidenceItems(
  rawItems: unknown,
  fallbackItems: ContentItem[]
): AnalysisEvidenceDraft[] {
  const fallback = fallbackItems.map((item, index) => ({
    contentId: item.id || `fallback-content-${index + 1}`,
    title: item.title || `样本内容 ${index + 1}`,
    platform: item.platformId,
    author: item.authorName ?? item.author,
    briefSummary: item.summary ?? item.aiSummary ?? "",
    keyFacts: [],
    keywords: [],
    highlights: [],
    attentionSignals: [],
    topicAngles: []
  }));

  if (!Array.isArray(rawItems)) {
    return fallback;
  }

  const normalized = rawItems
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const value = item as Record<string, unknown>;
      const contentId =
        toText(value.contentId) || fallback[index]?.contentId || `content-${index + 1}`;
      const title = toText(value.title) || fallback[index]?.title || `样本内容 ${index + 1}`;

      return {
        contentId,
        title,
        platform: toText(value.platform) || fallback[index]?.platform || "wechat",
        author: toText(value.author) || fallback[index]?.author || "",
        briefSummary: toText(value.briefSummary) || fallback[index]?.briefSummary || "",
        keyFacts: toStringArray(value.keyFacts),
        keywords: toStringArray(value.keywords),
        highlights: toStringArray(value.highlights),
        attentionSignals: toStringArray(value.attentionSignals),
        topicAngles: toStringArray(value.topicAngles)
      } satisfies AnalysisEvidenceDraft;
    })
    .filter((item): item is AnalysisEvidenceDraft => Boolean(item));

  return normalized.length > 0 ? normalized : fallback;
}

function buildTopicBackfill(keyword: string, evidenceItems: AnalysisEvidenceDraft[]) {
  const supportContentIds = evidenceItems.slice(0, 5).map((item) => item.contentId);
  const leadTitle = evidenceItems[0]?.title ?? `${keyword} 最新案例`;
  const secondTitle = evidenceItems[1]?.title ?? evidenceItems[0]?.title ?? `${keyword} 热门样本`;
  const startIndex = buildKeywordSeed(keyword) % TOPIC_BLUEPRINTS.length;
  const rotated = [...TOPIC_BLUEPRINTS.slice(startIndex), ...TOPIC_BLUEPRINTS.slice(0, startIndex)];
  const selected = rotated.slice(0, MAX_TOPIC_COUNT);

  return selected.map((blueprint) => ({
    title: `${keyword}｜${blueprint.titleSuffix}`,
    intro: `结合「${leadTitle}」与「${secondTitle}」样本，输出一篇${blueprint.style}的${blueprint.topicType}内容。`,
    whyNow: `${keyword} 的关注重点正在转向可执行落地，${blueprint.angle}视角更容易打中当下需求。`,
    hook: `开头以${blueprint.angle}问题切入，中段给${blueprint.style}结构，结尾给可执行动作。`,
    growth: `后续可以沿着${blueprint.topicType}方向持续扩展，形成专题内容序列。`,
    coreKeywords: [keyword, blueprint.topicType, blueprint.angle, blueprint.style],
    supportContentIds,
    evidenceSummary: `重点参考样本：${leadTitle}；补充样本：${secondTitle}。`
  } satisfies AnalysisTopicDraft));
}

function normalizeTopicDraft(
  rawTopic: unknown,
  fallbackTopic: AnalysisTopicDraft,
  evidenceItems: AnalysisEvidenceDraft[]
) {
  if (!rawTopic || typeof rawTopic !== "object") {
    return fallbackTopic;
  }

  const topic = rawTopic as Record<string, unknown>;
  const supportContentIds = toStringArray(topic.supportContentIds).filter((contentId) =>
    evidenceItems.some((item) => item.contentId === contentId)
  );

  return {
    title: toText(topic.title) || fallbackTopic.title,
    intro: toText(topic.intro) || fallbackTopic.intro,
    whyNow: toText(topic.whyNow) || fallbackTopic.whyNow,
    hook: toText(topic.hook) || fallbackTopic.hook,
    growth: toText(topic.growth) || fallbackTopic.growth,
    coreKeywords: toStringArray(topic.coreKeywords),
    supportContentIds:
      supportContentIds.length > 0 ? supportContentIds : fallbackTopic.supportContentIds,
    evidenceSummary: toText(topic.evidenceSummary) || fallbackTopic.evidenceSummary
  } satisfies AnalysisTopicDraft;
}

function normalizeSnapshotDraft(
  rawSnapshot: unknown,
  keyword: string,
  evidenceItems: AnalysisEvidenceDraft[]
): AnalysisSnapshotDraft {
  const fallbackTopics = buildTopicBackfill(keyword, evidenceItems);

  if (!rawSnapshot || typeof rawSnapshot !== "object") {
    return {
      hotSummary: `围绕 ${keyword} 的高热内容出现明显扩散，可优先拆解实操路线。`,
      focusSummary: "读者正在从概念关注转向可复用方法和真实结果。",
      patternSummary: "高互动内容更偏好结构化表达、真实案例和明确结论。",
      insightSummary: "保持题型和视角多样化，比只重复一个模板更能提升转化。",
      topics: fallbackTopics.slice(0, MIN_TOPIC_COUNT)
    };
  }

  const snapshot = rawSnapshot as Record<string, unknown>;
  const inputTopics = Array.isArray(snapshot.topics) ? snapshot.topics : [];
  const normalizedTopics = inputTopics
    .slice(0, 12)
    .map((topic, index) =>
      normalizeTopicDraft(
        topic,
        fallbackTopics[index % fallbackTopics.length] ?? fallbackTopics[0],
        evidenceItems
      )
    );

  const nextTopics: AnalysisTopicDraft[] = [];
  const seenTitles = new Set<string>();

  for (const topic of normalizedTopics) {
    const normalizedTitle = topic.title.toLowerCase();

    if (!normalizedTitle || seenTitles.has(normalizedTitle)) {
      continue;
    }

    seenTitles.add(normalizedTitle);
    nextTopics.push(topic);

    if (nextTopics.length >= MAX_TOPIC_COUNT) {
      break;
    }
  }

  for (const fallbackTopic of fallbackTopics) {
    if (nextTopics.length >= MIN_TOPIC_COUNT) {
      break;
    }

    const normalizedTitle = fallbackTopic.title.toLowerCase();
    if (seenTitles.has(normalizedTitle)) {
      continue;
    }

    seenTitles.add(normalizedTitle);
    nextTopics.push(fallbackTopic);
  }

  return {
    hotSummary:
      toText(snapshot.hotSummary) || `围绕 ${keyword} 的讨论热度正在上升，建议优先拆解代表性样本。`,
    focusSummary: toText(snapshot.focusSummary) || "用户更关注方法是否可执行、结果是否可验证。",
    patternSummary:
      toText(snapshot.patternSummary) ||
      "高表现内容通常具备结论明确、结构清晰、案例具体三个特点。",
    insightSummary:
      toText(snapshot.insightSummary) ||
      "保持题型、角度、表达风格的多样化，才能持续降低选题同质化。",
    topics: nextTopics.slice(0, MIN_TOPIC_COUNT)
  };
}

export async function buildTopicAnalysis(input: {
  keyword: string;
  items: ContentItem[];
  client: AnalysisClient;
}): Promise<
  | {
      evidenceItems: AnalysisEvidenceDraft[];
      snapshot: AnalysisSnapshotDraft;
    }
  | null
> {
  if (input.items.length === 0) {
    return null;
  }

  const evidencePayload = (await input.client.completeJson({
    system:
      "You extract structured evidence from monitored content. Return valid JSON only.",
    user: JSON.stringify({
      keyword: input.keyword,
      items: input.items.map((item) => ({
        contentId: item.id,
        title: item.title,
        platform: item.platformId,
        author: item.authorName ?? item.author,
        summary: item.summary ?? item.aiSummary ?? "",
        publishedAt: item.publishedAt
      }))
    })
  })) as { items?: unknown };

  const evidenceItems = normalizeEvidenceItems(evidencePayload.items, input.items);

  const snapshotPayload = await input.client.completeJson({
    system:
      "You generate a structured daily topic analysis report. Return valid JSON only.",
    user: JSON.stringify({
      keyword: input.keyword,
      requirement: {
        topicCount: 8,
        diversityRule:
          "Provide 8 topics with clearly different topicType, angle, and writingStyle. Avoid repeated framing.",
        schema: {
          hotSummary: "string",
          focusSummary: "string",
          patternSummary: "string",
          insightSummary: "string",
          topics: [
            {
              title: "string",
              topicType: "string",
              angle: "string",
              writingStyle: "string",
              intro: "string",
              whyNow: "string",
              hook: "string",
              growth: "string",
              coreKeywords: ["string"],
              supportContentIds: ["string"],
              evidenceSummary: "string"
            }
          ]
        },
        titleRule: "Each title must represent a unique angle and unique writing form."
      },
      evidenceItems
    })
  });

  const snapshot = normalizeSnapshotDraft(snapshotPayload, input.keyword, evidenceItems);

  return {
    evidenceItems,
    snapshot
  };
}
