# Multi-User Persistence Phase 1 (2026-04-30)

## Goal
- Keep current UX unchanged.
- Move critical monitoring settings from browser-only storage to backend persistence.
- Prepare for user/workspace isolation in production deployment.

## Implemented
1. Workspace context helper:
   - `src/lib/workspace/workspace-context.ts`
   - Resolve `workspaceId` from:
     - `x-workspace-id` header
     - `acf_workspace_id` cookie
     - `workspaceId` query param
   - Fallback: `default-workspace`

2. Monitoring DB schema extension:
   - `monitor_categories`
   - `monitor_category_creators`
   - File: `src/lib/db/schema.ts`

3. Monitoring repository extension:
   - Load categories by workspace
   - Load creators by workspace
   - Replace category+creator snapshot by workspace
   - Global analysis settings now saved/read by workspace key
   - File: `src/lib/db/monitoring-repository.ts`

4. New API route:
   - `GET/POST /api/monitoring/categories`
   - File: `src/app/api/monitoring/categories/route.ts`

5. Frontend persistence upgrade:
   - `src/components/workbench/monitoring-workbench.tsx`
   - Categories/accounts now sync to backend automatically.
   - Browser localStorage remains as fallback cache.
   - Global analysis settings use workspace-aware API calls.

6. Workspace-specific scheduler task name:
   - `ContentPulseDailyAnalysis-${workspaceId}`
   - File: `src/app/api/analysis/settings/route.ts`

## Compatibility
- Existing single-user behavior remains available under `default-workspace`.
- For non-default workspaces, category IDs are workspace-scoped to avoid collisions.

## Test coverage added/updated
- `src/app/api/monitoring/categories/__tests__/route.test.ts`
- `src/app/api/analysis/settings/__tests__/route.test.ts`

## Next phases
1. Add user auth and workspace membership tables.
2. Move keyword targets + sync/history tables to explicit `workspace_id` columns.
3. Remove category/account dependency on localStorage entirely.

## Confirmed deferred phase

The next confirmed phase is the `standard multi-user registration + isolation` track.
This phase has been selected as the preferred direction, but is intentionally deferred for a later session.

### Scope
1. Add a `Register` button on the login screen and a `/register` page.
2. Allow each new user to create their own email/password account.
3. Automatically create a dedicated workspace for each registered account.
4. Isolate per-workspace data for:
   - monitoring categories, creators, query history, topic library
   - drafts, tasks, task contents, content library
   - generated images, covers, exports, uploaded skills
   - per-user API keys and publishing configuration

### Required backend changes
1. Keep `.env.local` for system-level defaults only.
2. Move user-owned API keys from env-style assumptions into encrypted database storage.
3. Add `workspace_id` to content-creation tables that are still globally shared:
   - `drafts`
   - `tasks`
   - `task_contents`
   - `platform_settings`
   - `skills`
   - `skill_files`
   - `skill_learning_results`
   - `skill_bindings`
   - `history_actions`
   - `library_entries`
4. Change generated asset and skill storage paths to workspace-scoped directories.

### Out of scope for this phase
1. Team collaboration inside one workspace.
2. Member invitations.
3. Fine-grained role/permission management.

### Suggested execution order
1. Registration UI and `/api/auth/register`.
2. Workspace-aware schema migration for content-creation tables.
3. Repository and route handler filtering by session `workspaceId`.
4. Encrypted API key storage and settings UI migration.
5. Workspace-specific file storage migration for images and skills.
6. README and deployment documentation update.
