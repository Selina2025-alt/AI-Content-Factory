import type { PersistedAnalysisSnapshotDetail } from "@/lib/db/monitoring-repository";
import type {
  ReplicaDailyReport,
  ReplicaTopicSuggestion
} from "@/lib/replica-workbench-data";
import { formatLocalDate, formatLocalDateTime } from "@/lib/time-utils";
import type { ContentItem } from "@/lib/types";

const MIN_TOPIC_SUGGESTIONS = 8;
const MAX_TOPIC_SUGGESTIONS = 8;

const TOPIC_BLUEPRINTS = [
  {
    id: "results-proof",
    title: "结果证明拆解",
    intro: "把真实结果链路拆开，聚焦“做了什么、为什么有效、怎么复现”。",
    whyNow: "读者已经不满足概念介绍，更在意结果是否可被验证。",
    hook: "开头先给结果对比，再反推关键动作，提升停留和收藏。",
    growth: "后续可扩展成“不同团队规模下的结果模板”系列。"
  },
  {
    id: "workflow-playbook",
    title: "工作流实操手册",
    intro: "围绕真实任务给出端到端流程，强调步骤、输入、输出与检查点。",
    whyNow: "讨论焦点从“工具能力”转向“如何稳定落地到日常工作”。",
    hook: "用一条具体工作流做主线，让读者马上对号入座。",
    growth: "可继续补齐不同岗位版本，形成可复用 SOP 内容池。"
  },
  {
    id: "pitfall-guide",
    title: "高频踩坑避雷",
    intro: "提炼最常见失败场景与误区，并给出逐条修正策略。",
    whyNow: "同类内容增多后，避坑信息更容易形成差异化价值。",
    hook: "先抛“失败代价”，再给“防错清单”，提高转发意愿。",
    growth: "可持续沉淀为“版本更新后避坑周报”。"
  },
  {
    id: "debate-viewpoint",
    title: "观点对照评测",
    intro: "把两种常见做法正反对比，给出边界条件和选择建议。",
    whyNow: "用户开始出现方法选择焦虑，需要清晰决策框架。",
    hook: "用“何时选 A / 何时选 B”切入，增强讨论度。",
    growth: "可延展成系列评测专栏，逐步覆盖核心决策场景。"
  },
  {
    id: "case-story",
    title: "案例故事复盘",
    intro: "把样本内容重写为故事线，突出冲突、决策与转折节点。",
    whyNow: "案例叙事比纯知识点更容易建立信任和阅读代入感。",
    hook: "先讲问题爆发时刻，再展开解决过程，提升完读率。",
    growth: "可持续积累行业案例库，支撑后续选题扩写。"
  },
  {
    id: "toolkit-list",
    title: "工具清单与模板",
    intro: "沉淀可直接复制的提示词、流程表与检查模板。",
    whyNow: "执行型读者更需要拿来即用的内容交付形式。",
    hook: "标题直接强调“可复制模板”，提高点击与收藏转化。",
    growth: "可持续更新模板版本，形成长期订阅价值。"
  },
  {
    id: "data-observation",
    title: "数据观察与趋势",
    intro: "基于抓取样本归纳变化信号，给出下一阶段选题判断。",
    whyNow: "热点迭代快，读者需要“当下有效”的判断依据。",
    hook: "先给关键信号，再解释背后动因，增强专业感。",
    growth: "可固定为周期栏目，持续输出趋势判断。"
  },
  {
    id: "emotion-resonance",
    title: "情绪共鸣与表达",
    intro: "围绕用户焦虑与期待组织表达，让内容更有共情和温度。",
    whyNow: "同质化信息多，情绪共鸣是提升互动的重要杠杆。",
    hook: "用真实困境开场，再给可落地解法，触发留言互动。",
    growth: "可延展为“真实困境答疑”系列，增强社区粘性。"
  },
  {
    id: "cross-platform",
    title: "跨平台改写策略",
    intro: "同一主题拆成不同平台表达版本，强调结构与语气差异。",
    whyNow: "多平台分发成为常态，改写能力直接影响传播效率。",
    hook: "展示同一内容的三种改写示例，直观体现差异价值。",
    growth: "可沉淀为跨平台改写规范，支持团队协作产出。"
  },
  {
    id: "qa-interactive",
    title: "互动问答选题",
    intro: "聚焦高频问题，用问答结构快速覆盖核心疑惑。",
    whyNow: "用户提问密度上升，问答形式能快速建立互动反馈闭环。",
    hook: "用“最常被问的 5 个问题”开场，降低阅读门槛。",
    growth: "可持续扩展为 FAQ 系列并连接后续专题长文。"
  }
] as const;

function titleCaseKeyword(keyword: string) {
  return keyword
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function summarizePlatforms(items: ContentItem[]) {
  const labels = Array.from(new Set(items.map((item) => item.platformId)));

  if (labels.length === 0) {
    return "多平台";
  }

  return labels.join(" / ");
}

function buildKeywordSeed(keyword: string) {
  return keyword.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function buildTopicSuggestions(keyword: string, items: ContentItem[]): ReplicaTopicSuggestion[] {
  const displayKeyword = titleCaseKeyword(keyword);
  const topItems = items.slice(0, 5);
  const supportContentIds = topItems.map((item) => item.id);
  const leadTitle = topItems[0]?.title || `${displayKeyword} 最新案例`;
  const secondTitle = topItems[1]?.title || topItems[0]?.title || `${displayKeyword} 近期讨论`;
  const startIndex = buildKeywordSeed(keyword) % TOPIC_BLUEPRINTS.length;
  const rotatedBlueprints = [
    ...TOPIC_BLUEPRINTS.slice(startIndex),
    ...TOPIC_BLUEPRINTS.slice(0, startIndex)
  ];
  const selectedBlueprints = rotatedBlueprints.slice(0, MAX_TOPIC_SUGGESTIONS);

  return selectedBlueprints.map((blueprint, index) => ({
    id: `${formatLocalDate(new Date())}-${keyword}-${blueprint.id}-${index + 1}`,
    title: `${displayKeyword}｜${blueprint.title}`,
    intro: `基于「${leadTitle}」与「${secondTitle}」样本，${blueprint.intro}`,
    whyNow: blueprint.whyNow,
    hook: blueprint.hook,
    growth: blueprint.growth,
    supportContentIds
  }));
}

function ensureMinimumTopicSuggestions(
  keyword: string,
  suggestions: ReplicaTopicSuggestion[]
): ReplicaTopicSuggestion[] {
  if (suggestions.length >= MIN_TOPIC_SUGGESTIONS) {
    return suggestions.slice(0, MAX_TOPIC_SUGGESTIONS);
  }

  const fallbackSuggestions = buildTopicSuggestions(keyword, []);
  const seenTitles = new Set(suggestions.map((suggestion) => suggestion.title));
  const nextSuggestions = [...suggestions];

  for (const fallbackSuggestion of fallbackSuggestions) {
    if (nextSuggestions.length >= MIN_TOPIC_SUGGESTIONS) {
      break;
    }

    if (seenTitles.has(fallbackSuggestion.title)) {
      continue;
    }

    seenTitles.add(fallbackSuggestion.title);
    nextSuggestions.push({
      ...fallbackSuggestion,
      id: `${fallbackSuggestion.id}-persisted-fill-${nextSuggestions.length + 1}`
    });
  }

  return nextSuggestions.slice(0, MAX_TOPIC_SUGGESTIONS);
}

function shouldUpgradeLegacySuggestions(suggestions: ReplicaTopicSuggestion[]) {
  if (suggestions.length < MIN_TOPIC_SUGGESTIONS) {
    return false;
  }

  const legacyPatternCount = suggestions.filter((suggestion) => {
    const title = suggestion.title.toLowerCase();
    return (
      title.includes(" + ") ||
      title.includes("＋") ||
      title.includes("选题 ") ||
      title.includes("选题")
    );
  }).length;

  return legacyPatternCount >= Math.max(5, Math.floor(suggestions.length * 0.6));
}

export function buildFreshAnalysisReport(
  keyword: string,
  items: ContentItem[],
  generatedAt: Date | string = new Date()
) {
  const generatedDate = formatLocalDate(generatedAt);
  const generatedDateTime = formatLocalDateTime(generatedAt);
  const displayKeyword = titleCaseKeyword(keyword);
  const topItem = items[0];
  const platformSummary = summarizePlatforms(items);

  if (items.length === 0) {
    return {
      id: `report-${keyword}-${generatedDate}`,
      date: generatedDate,
      label: generatedDate,
      hotSummary: `今天围绕 ${displayKeyword} 暂无新增高热内容，建议继续观察跨平台变化。`,
      focusSummary: `${generatedDateTime} 这次刷新没有拿到新的有效样本，用户关注点仍需通过后续更新继续验证。`,
      patternSummary: "当前样本不足，暂时无法形成新的爆款共性拆解。",
      insightSummary: "可以继续观察同关键词在不同平台的发酵节奏，必要时扩大关键词覆盖范围。",
      suggestions: buildTopicSuggestions(keyword, items)
    } satisfies ReplicaDailyReport;
  }

  return {
    id: `report-${keyword}-${generatedDate}`,
    date: generatedDate,
    label: generatedDate,
    hotSummary: `${displayKeyword} 最新高热样本主要集中在 ${platformSummary}，最值得优先拆解的是「${topItem?.title || `${displayKeyword} 最新案例`}」。`,
    focusSummary: `用户昨天更关注 ${displayKeyword} 是否真的能接入日常生产流，而不是单纯的功能演示。`,
    patternSummary: "高热内容普遍采用强结论标题、真实案例和可复用步骤，且会给出明确的前后对比。",
    insightSummary: "优先做结果证明型和工作流拆解型选题，再补充团队协作、边界风险和落地模板。",
    suggestions: buildTopicSuggestions(keyword, items)
  } satisfies ReplicaDailyReport;
}

export function mergeFreshReportIntoReports(
  reports: ReplicaDailyReport[],
  freshReport: ReplicaDailyReport,
  limit = 14
) {
  return [
    freshReport,
    ...reports.filter((report) => report.id !== freshReport.id && report.date !== freshReport.date)
  ]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, limit);
}

export function mapPersistedAnalysisSnapshotToReport(
  detail: PersistedAnalysisSnapshotDetail
): ReplicaDailyReport {
  const mappedSuggestions = detail.topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    intro: topic.intro,
    whyNow: topic.whyNow,
    hook: topic.hook,
    growth: topic.growth,
    supportContentIds: topic.supportContentIds
  }));

  return {
    id: detail.snapshot.id,
    date: formatLocalDate(detail.snapshot.generatedAt),
    label: formatLocalDate(detail.snapshot.generatedAt),
    hotSummary: detail.snapshot.hotSummary,
    focusSummary: detail.snapshot.focusSummary,
    patternSummary: detail.snapshot.patternSummary,
    insightSummary: detail.snapshot.insightSummary,
    suggestions: ensureMinimumTopicSuggestions(
      detail.snapshot.keyword,
      shouldUpgradeLegacySuggestions(mappedSuggestions)
        ? buildTopicSuggestions(detail.snapshot.keyword, [])
        : mappedSuggestions
    )
  };
}

export function mergePersistedReportsIntoReports(
  reports: ReplicaDailyReport[],
  persistedReports: ReplicaDailyReport[],
  limit = 14
) {
  const dedupedPersistedReports = persistedReports.reduce<ReplicaDailyReport[]>((current, report) => {
    if (current.some((item) => item.date === report.date)) {
      return current;
    }

    return [...current, report];
  }, []);

  return dedupedPersistedReports.reduce(
    (current, report) => mergeFreshReportIntoReports(current, report, limit),
    reports
  );
}
