# AI Content Factory

统一的双 Agent 内容生产系统：

1. 数据采集与选题分析 Agent
2. 内容创作与自动分发 Agent

本仓库对应你当前 `http://localhost:3013` 的完整工程版本，可通过配置 API Key 直接运行全部主流程。

## 核心能力

1. 多平台监控抓取（公众号 / 小红书 / Twitter）
2. 选题分析与选题库沉淀（支持批量入库）
3. 选题到创作工作台的联动批量生成
4. 公众号文章 + 小红书 + Twitter + 视频脚本一键生成
5. 公众号首图自动生成（4 模型可切换）
6. 内容库批量选择与批量发布到公众号草稿箱
7. SQLite 本地持久化（重启后保留数据）

## 项目文档

完整前后端说明见：

- `docs/AI-Content-Factory-3013-Project-Guide.md`

包含：架构、目录、API、数据库、业务链路、测试与排障。

## 环境要求

1. Node.js 18+
2. npm 9+

## 快速启动

```bash
npm install
npm run dev -- --port 3013
```

打开：`http://localhost:3013`

## 登录说明（新增）

系统已开启登录与会话拦截：

1. 未登录访问业务页面会自动跳转到 `/login`
2. 默认管理员账号（首次自动初始化）：
   - 邮箱：`admin@aicontentfactory.local`
   - 密码：`Admin@123456`
3. 登录成功后会自动进入你的工作空间（workspace）并隔离数据

说明：`/api/...` 是接口地址，不是可视化页面。直接在浏览器打开 API 会看到 JSON（或 401），这是正常行为。

## 配置

复制环境变量模板：

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

然后编辑 `.env.local`：

```env
WECHAT_MONITOR_TOKEN=replace-with-your-token
XIAOHONGSHU_MONITOR_TOKEN=replace-with-your-token
TWITTER_BEARER_TOKEN=replace-with-your-token

SILICONFLOW_API_KEY=replace-with-your-key
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
SILICONFLOW_MODEL=Pro/zai-org/GLM-5
SILICONFLOW_IMAGE_MODEL=Qwen/Qwen-Image-Edit-2509

WECHAT_OPENAPI_KEY=replace-with-your-wechat-openapi-key
WECHAT_OPENAPI_BASE_URL=https://wx.limyai.com/api/openapi
XIAOHONGSHU_OPENAPI_KEY=replace-with-your-xiaohongshu-openapi-key
XIAOHONGSHU_OPENAPI_BASE_URL=https://note.limyai.com/api/openapi

CONTENT_CREATION_AGENT_DATA_ROOT=.codex-data
```

## 图片模型切换（设置页）

在 `内容创作 > 设置` 中可切换以下 4 个模型（公众号/小红书图片链路共用）：

1. `Qwen-Image-Edit-2509`
2. `Qwen-Image-Edit`
3. `Qwen-Image`
4. `Kolors`

## 常用命令

```bash
npm run test
npm run lint
npm run build
npm run analysis:daily
```

## 数据目录

- 默认：`.codex-data/`
- 已在 `.gitignore`，不会推送敏感本地数据。

## 常见问题

1. 首图失败：优先检查 `SILICONFLOW_API_KEY` 与设置页图片模型。
2. 批量发布失败：检查 `WECHAT_OPENAPI_KEY`。
3. 刷新后数据丢失：检查 `.codex-data` 是否被清理，或 `CONTENT_CREATION_AGENT_DATA_ROOT` 是否变更。

