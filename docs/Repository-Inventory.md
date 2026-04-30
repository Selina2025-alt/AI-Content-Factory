# AI Content Factory 仓库清单

## 1. 仓库定位

本仓库对应当前本地运行的 `http://localhost:3013` 项目版本，是一个已经打通主链路的双 Agent 内容工厂：

1. 数据采集与选题分析 Agent
2. 内容创作与自动分发 Agent

目标闭环：

1. 多平台抓取
2. 选题分析
3. 选题汇总入库
4. 批量生成内容
5. 多平台内容创作
6. 内容库沉淀
7. 批量发布到公众号草稿箱

---

## 2. 顶层目录

```text
AI Content Factory/
  docs/                 # 项目文档、计划、规格说明
  scripts/              # 脚本（如每日分析）
  src/                  # 前后端源码
  .codex-data/          # 本地运行数据目录（默认，不提交）
  package.json          # 依赖与脚本
  README.md             # 快速使用说明
```

---

## 3. 前端页面结构

### 3.1 应用页面

1. `src/app/page.tsx`
   - 主入口
   - 承载双 Agent 顶部导航与默认内容视图

2. `src/app/login/page.tsx`
   - 登录页
   - 当前为单入口登录，后续可扩展注册

3. `src/app/content-creation/page.tsx`
   - 内容创作首页
   - 包含需求输入、平台选择、草稿箱、内容库预览

4. `src/app/content-creation/workspace/[taskId]/page.tsx`
   - 单篇内容工作台

5. `src/app/content-creation/library/page.tsx`
   - 内容库首页

6. `src/app/content-creation/library/[taskId]/page.tsx`
   - 内容库文章详情

7. `src/app/content-creation/settings/page.tsx`
   - 平台规则、技能、图片模型设置页

### 3.2 顶部壳层

1. `src/app/layout.tsx`
   - 全局布局
   - 加载全局样式和顶部 Agent 导航

2. `src/components/app-shell/agent-top-nav.tsx`
   - 数据采集与选题分析 / 内容创作与自动分发 顶部切换

---

## 4. 前端组件分区

### 4.1 `src/components/auth`

1. `login-form.tsx`
   - 登录表单
   - 负责调用 `/api/auth/login`

### 4.2 `src/components/home`

1. `create-task-hero.tsx`
   - 内容创作首页主输入区
   - 支持平台选择、联网搜索、小红书 AI 生图开关

2. `draft-inbox.tsx`
   - 草稿箱

3. `generation-progress.tsx`
   - 生成过程提示

4. `home-library-preview.tsx`
   - 首页内容库预览

5. `platform-multi-select.tsx`
   - 多平台选择器

### 4.3 `src/components/workbench`

负责数据采集与选题分析 Agent：

1. `monitoring-workbench.tsx`
   - 主工作台
   - 管理分类、账号、抓取、分析、选题汇总

2. `replica-analysis-panel.tsx`
   - 选题分析展示

3. `replica-topic-library-panel.tsx`
   - 选题汇总库
   - 支持批量生成并跳转内容创作系统

4. `replica-settings-panel.tsx`
   - 工作台侧设置

### 4.4 `src/components/workspace`

负责内容创作工作台：

1. `workspace-shell.tsx`
   - 工作台总控组件
   - 当前已支持：
   - 单平台重生成
   - 一键全生成
   - 生成小红书时默认启用 AI 生图
   - 内容库加入
   - 发布到公众号 / 小红书

2. `article-editor.tsx`
   - 公众号文章编辑器

3. `xiaohongshu-editor.tsx`
   - 小红书内容编辑器
   - 含配图批量重试

4. `twitter-editor.tsx`
   - Twitter 内容编辑器

5. `video-script-editor.tsx`
   - 视频脚本编辑器

6. `content-actions.tsx`
   - 顶部操作按钮组

7. `history-sidebar.tsx`
   - 工作台左侧历史记录

8. `generation-trace-panel.tsx`
   - 生成溯源面板

### 4.5 `src/components/library`

1. `wechat-library-shell.tsx`
   - 内容库首页壳
   - 支持全选、全选当前列表、批量发布到公众号草稿箱

2. `wechat-article-detail.tsx`
   - 内容库单文章详情

### 4.6 `src/components/settings`

1. `settings-shell.tsx`
   - 设置页壳

2. `platform-rule-binding-panel.tsx`
   - 平台规则 / 图片模型绑定

3. `skills-library.tsx`
   - 技能库

4. `skill-upload-panel.tsx`
   - 上传技能

5. `skill-detail-panel.tsx`
   - 技能详情

6. `prompt-skill-panel.tsx`
   - Prompt 技能配置

---

## 5. 后端 API 结构

当前主要 Route Handlers：

1. `src/app/api/auth/login/route.ts`
2. `src/app/api/auth/logout/route.ts`
3. `src/app/api/auth/session/route.ts`
4. `src/app/api/monitoring/categories/route.ts`
5. `src/app/api/content/list/route.ts`
6. `src/app/api/content/refresh/route.ts`
7. `src/app/api/keyword-targets/route.ts`
8. `src/app/api/history/route.ts`
9. `src/app/api/history/[queryId]/route.ts`
10. `src/app/api/analysis/run/route.ts`
11. `src/app/api/analysis/reports/route.ts`
12. `src/app/api/analysis/report/[snapshotId]/route.ts`
13. `src/app/api/analysis/settings/route.ts`
14. `src/app/api/topic-library/route.ts`
15. `src/app/api/topic-library/batch-generate/route.ts`
16. `src/app/api/drafts/route.ts`
17. `src/app/api/drafts/[draftId]/route.ts`
18. `src/app/api/tasks/route.ts`
19. `src/app/api/tasks/[taskId]/route.ts`
20. `src/app/api/tasks/[taskId]/regenerate/route.ts`
21. `src/app/api/tasks/[taskId]/export/route.ts`
22. `src/app/api/tasks/[taskId]/wechat-cover/route.ts`
23. `src/app/api/tasks/[taskId]/publish/route.ts`
24. `src/app/api/tasks/[taskId]/xiaohongshu-images/[imageId]/retry/route.ts`
25. `src/app/api/library/route.ts`
26. `src/app/api/wechat/accounts/route.ts`
27. `src/app/api/wechat-articles/route.ts`
28. `src/app/api/platform-settings/[platform]/route.ts`
29. `src/app/api/skills/route.ts`
30. `src/app/api/skills/upload/route.ts`
31. `src/app/api/skills/install/route.ts`
32. `src/app/api/skills/prompt/route.ts`
33. `src/app/api/skills/[skillId]/route.ts`
34. `src/app/api/twitter/keyword-search/route.ts`
35. `src/app/api/xiaohongshu/keyword-search/route.ts`
36. `src/app/api/assets/[...assetPath]/route.ts`

---

## 6. 核心后端模块

### 6.1 `src/lib/auth`

1. `auth-service.ts`
   - 登录认证
   - session 创建
   - 默认管理员 bootstrap

2. `request-context.ts`
   - 从 cookie 解析当前登录用户与 workspace

### 6.2 `src/lib/db`

1. `client.ts`
   - 内容创作 SQLite 入口

2. `database.ts`
   - 监控分析 SQLite 初始化

3. `schema.ts`
   - 监控分析 schema

4. `content-creation-schema.ts`
   - 内容创作 schema

5. `monitoring-repository.ts`
   - 监控分析侧 repository

6. `repositories/*`
   - 草稿、任务、内容库、平台设置、技能等 repository

### 6.3 `src/lib/content`

1. 文案生成、图片生成、模型适配、trace 构建
2. 当前已包含公众号首图与小红书图片生成链路

### 6.4 `src/lib/publish`

1. 第三方发布平台封装
2. 公众号与小红书发布调用

### 6.5 `src/lib/assets`

1. `generated-asset-service.ts`
   - 将生成图片落盘
   - 通过 `/api/assets/...` 提供访问

### 6.6 `src/lib/fs`

1. `app-paths.ts`
   - 统一管理数据库、技能、生成图片目录

---

## 7. 数据与本地存储

默认数据根目录：

1. `.codex-data/content-creation-agent.sqlite`
2. `.codex-data/generated-assets/`
3. `.codex-data/skills/`

说明：

1. 这部分属于运行数据，不进入 Git
2. 重启项目后数据仍保留
3. 如果部署到新机器，需要用户自己重新配置 `.env.local` 和业务 API Key

---

## 8. 当前已完成的关键闭环

1. 监控分类与账号持久化
2. 关键词抓取与历史归档
3. 选题分析与 8 条以上多角度选题生成
4. 选题汇总库跨关键词汇总
5. 批量生成内容任务并进入创作链路
6. 工作台内一键全生成扩展平台内容
7. 生成小红书时默认启用 AI 生图
8. 图片模型限定为 4 个可切换模型
9. 内容库全选 / 全选当前列表 / 批量发布
10. 登录与 session 拦截

---

## 9. 文档索引

1. `README.md`
   - 快速启动、配置、核心能力

2. `docs/AI-Content-Factory-3013-Project-Guide.md`
   - 总体架构、业务链路、API、数据库说明

3. `docs/Multi-User-Persistence-Phase1.md`
   - 多用户/工作空间持久化阶段说明

4. `docs/superpowers/specs/*`
   - 历史设计文档

5. `docs/superpowers/plans/*`
   - 历史实施计划

---

## 10. GitHub 仓库

当前远端仓库：

`https://github.com/Selina2025-alt/AI-Content-Factory.git`

建议把本文件作为“新人接手时第一份清单文档”使用。
