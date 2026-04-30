# AI Content Factory (3013) 项目全景文档

## 0. 配套文档

建议按下面顺序阅读：

1. `README.md`
2. `docs/Repository-Inventory.md`
3. `docs/AI-Content-Factory-3013-Project-Guide.md`
4. `docs/Multi-User-Persistence-Phase1.md`

## 1. 项目定位

本项目是一个双 Agent 融合工作台（端口 3013）：

1. `数据采集与选题分析 agent`
2. `内容创作与自动分发 agent`

核心目标：从“关键词抓取 -> 数据分析 -> 选题沉淀 -> 批量生成 -> 多平台内容创作 -> 公众号发布”形成闭环。

---

## 2. 运行与环境

### 2.1 Node / 包管理

1. Node.js 18+
2. npm 9+

### 2.2 安装与启动

```bash
npm install
npm run dev -- --port 3013
```

访问：`http://localhost:3013`

### 2.3 必要环境变量（`.env.local`）

```env
WECHAT_MONITOR_TOKEN=...
XIAOHONGSHU_MONITOR_TOKEN=...
TWITTER_BEARER_TOKEN=...

SILICONFLOW_API_KEY=...
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
SILICONFLOW_MODEL=Pro/zai-org/GLM-5
SILICONFLOW_IMAGE_MODEL=Qwen/Qwen-Image-Edit-2509

WECHAT_OPENAPI_KEY=...
WECHAT_OPENAPI_BASE_URL=https://wx.limyai.com/api/openapi
XIAOHONGSHU_OPENAPI_KEY=...
XIAOHONGSHU_OPENAPI_BASE_URL=https://note.limyai.com/api/openapi

CONTENT_CREATION_AGENT_DATA_ROOT=.codex-data
```

---

## 3. 图片模型（已实现：四模型可切换）

支持并限制为以下 4 个模型（设置页可切换并保存）：

1. `Qwen/Qwen-Image-Edit-2509`（显示名：`Qwen-Image-Edit-2509`）
2. `Qwen/Qwen-Image-Edit`（显示名：`Qwen-Image-Edit`）
3. `Qwen/Qwen-Image`（显示名：`Qwen-Image`）
4. `Kwai-Kolors/Kolors`（显示名：`Kolors`）

实现点：

1. 模型枚举与校验：`src/lib/content/siliconflow-image-models.ts`
2. 平台模型解析：`src/lib/content/platform-image-model.ts`
3. 设置页可选并持久化：
   - `src/app/content-creation/settings/page.tsx`
   - `src/components/settings/settings-shell.tsx`
   - `src/components/settings/platform-rule-binding-panel.tsx`
4. 后端保存接口：`src/app/api/platform-settings/[platform]/route.ts`
5. 生成链路接入：
   - `src/lib/content/wechat-cover-image-generation-service.ts`
   - `src/lib/content/xiaohongshu-image-generation-service.ts`
   - `src/lib/content/siliconflow-client.ts`

---

## 4. 目录结构（核心）

```text
src/
  app/
    api/                         # 后端 API 路由（Next Route Handlers）
    content-creation/            # 内容创作系统页面
    page.tsx                     # 主入口
  components/
    app-shell/                   # 顶部导航（双 Agent 切换）
    home/                        # 创作首页、草稿箱
    workbench/                   # 数据采集与选题分析工作台
    workspace/                   # 单任务内容创作工作台
    library/                     # 内容库（批量发布）
    settings/                    # 技能/平台规则/图片模型配置
  lib/
    content/                     # 内容生成与图片生成服务
    db/                          # SQLite schema/repository/migrate
    publish/                     # 发布服务封装
    skills/                      # 技能导入、学习、内置技能
```

---

## 5. 前端页面与关键组件

补充：完整组件与目录清单见 `docs/Repository-Inventory.md`，本节只保留业务主组件。

### 5.1 数据采集与选题分析 Agent

1. 工作台：`src/components/workbench/monitoring-workbench.tsx`
2. 选题分析面板：`src/components/workbench/replica-analysis-panel.tsx`
3. 选题汇总库面板：`src/components/workbench/replica-topic-library-panel.tsx`
4. 顶部标签：`src/components/workbench/replica-topbar.tsx`

### 5.2 内容创作与自动分发 Agent

1. 首页：`src/app/content-creation/page.tsx`
2. 工作台壳：`src/components/workspace/workspace-shell.tsx`
3. 内容库页：`src/components/library/wechat-library-shell.tsx`
4. 设置页壳：`src/components/settings/settings-shell.tsx`

### 5.3 跨页导航

1. 顶部 Agent 菜单：`src/components/app-shell/agent-top-nav.tsx`
2. 内容创作页返回链路：`/content-creation`、`/content-creation/workspace/[taskId]`

---

## 6. 后端 API 总览

补充：完整 route 文件清单见 `docs/Repository-Inventory.md`。

### 6.1 采集与分析

1. `/api/content/list`
2. `/api/content/refresh`
3. `/api/keyword-targets`
4. `/api/history`
5. `/api/history/[queryId]`
6. `/api/analysis/run`
7. `/api/analysis/reports`
8. `/api/analysis/report/[snapshotId]`
9. `/api/analysis/settings`

### 6.2 选题库

1. `/api/topic-library`
2. `/api/topic-library/batch-generate`

### 6.3 任务与创作

1. `/api/drafts`
2. `/api/drafts/[draftId]`
3. `/api/tasks`
4. `/api/tasks/[taskId]`
5. `/api/tasks/[taskId]/regenerate`
6. `/api/tasks/[taskId]/export`
7. `/api/tasks/[taskId]/wechat-cover`
8. `/api/tasks/[taskId]/xiaohongshu-images/[imageId]/retry`

### 6.4 发布与账号

1. `/api/tasks/[taskId]/publish`
2. `/api/wechat/accounts`
3. `/api/wechat-articles`
4. `/api/library`

### 6.5 技能与平台设置

1. `/api/skills`
2. `/api/skills/upload`
3. `/api/skills/install`
4. `/api/skills/prompt`
5. `/api/skills/[skillId]`
6. `/api/platform-settings/[platform]`

### 6.6 外部搜索

1. `/api/twitter/keyword-search`
2. `/api/xiaohongshu/keyword-search`
3. `/api/assets/[...assetPath]`

---

## 7. 数据存储与表结构

### 7.1 主数据目录

1. `.codex-data/`
2. SQLite 数据文件由 `src/lib/db/client.ts` + `CONTENT_CREATION_AGENT_DATA_ROOT` 决定

### 7.2 内容创作核心表（`content-creation-schema.ts`）

1. `drafts`
2. `tasks`
3. `task_contents`
4. `platform_settings`（含 `image_skill_ids_json`、`image_model`）
5. `skills`
6. `skill_files`
7. `skill_learning_results`
8. `skill_bindings`
9. `history_actions`
10. `library_entries`

### 7.3 采集分析表（`schema.ts`）

1. `keyword_targets`
2. `search_queries` / `search_query_contents`
3. `analysis_snapshots` / `analysis_topics` / `analysis_evidence_items`
4. `topic_library_entries`

### 7.4 登录与工作空间相关表

1. `auth_users`
2. `auth_workspaces`
3. `auth_workspace_members`
4. `auth_sessions`

---

## 8. 业务主链路（当前 3013 一致）

1. 创建/选择监控分类与关键词
2. 一键更新抓取内容（支持历史留存）
3. 生成分析与选题建议
4. 将选题加入选题库
5. 批量生成内容任务（后台进行）
6. 自动进入内容创作工作台可查看草稿
7. 生成公众号正文 + 小红书 + Twitter + 视频脚本
8. 生成公众号首图（按当前平台图片模型）
9. 加入内容库
10. 在内容库单选/全选后批量发布到公众号草稿箱

---

## 9. 测试建议

### 9.1 当前建议命令

```bash
npm run test
npm run lint
npm run build
```

### 9.2 与图片模型切换强相关测试

1. `src/components/settings/__tests__/image-skills-settings.test.tsx`
2. `src/lib/content/__tests__/siliconflow-client.test.ts`
3. `src/lib/content/__tests__/xiaohongshu-generation-service.test.ts`
4. `src/app/api/tasks/[taskId]/wechat-cover/__tests__/route.test.ts`

---

## 10. 常见问题排查

1. 图片生成失败：先检查 `SILICONFLOW_API_KEY`，再检查设置页所选图片模型是否可用。
2. 批量发布提示未配置：检查 `WECHAT_OPENAPI_KEY` 与 `WECHAT_OPENAPI_BASE_URL`。
3. 刷新后数据丢失：确认 `.codex-data` 未被清理、`CONTENT_CREATION_AGENT_DATA_ROOT` 未变更。
4. 端口冲突：使用 `npm run dev -- --port 3013` 固定端口。

---

## 11. 文档维护建议

1. 新增 API 时同步更新本文件第 6 节。
2. 新增数据表/字段时同步更新第 7 节。
3. 新增业务流程节点时同步更新第 8 节。

---

## 12. 已确认待办（暂缓开发）

### 12.1 标准版多账号注册与数据隔离

这是当前已经确认方向、但本轮不开发的下一阶段能力。

目标：

1. 登录页新增 `注册` 按钮，进入 `/register`
2. 新用户可设置自己的邮箱、密码、显示名称，并完成注册后登录
3. 系统为每个注册用户自动创建独立 `workspace`
4. 每个账号独立管理自己的：
   - API Key / 发布平台配置
   - 监控分类、监控账号、抓取历史、选题库
   - 草稿、任务、内容库、生成内容
   - 图片、首图、导出文件、技能配置

为什么必须做这一步：

1. 当前项目虽然已有登录与 session，但内容创作侧仍有不少全局共享数据
2. 只补“注册按钮”并不能真正实现多用户隔离
3. 如果以后要通过 GitHub 给别人部署使用，必须让每个人都能管理自己的 API 和历史数据

实施范围（标准版）：

1. 账号注册
2. 用户自动创建独立 workspace
3. 内容创作表补齐 `workspace_id`
4. 用户 API Key 改为数据库加密存储
5. 生成图片、技能上传、导出文件改为按 workspace 分目录

第一期不做：

1. 多成员协作
2. 邀请加入 workspace
3. 细粒度权限角色系统

建议实施顺序：

1. 注册页与注册 API
2. 数据库 schema 迁移：内容创作表补 `workspace_id`
3. repository / API / 页面查询全部按 session 的 `workspaceId` 过滤
4. API Key 加密存储与设置页改造
5. 资产目录从全局路径迁移到 `workspace` 路径
6. README、部署文档、初始化脚本更新

建议优先参考文档：

1. `docs/Multi-User-Persistence-Phase1.md`
2. `src/lib/auth/auth-service.ts`
3. `src/lib/db/schema.ts`
4. `src/lib/db/content-creation-schema.ts`

