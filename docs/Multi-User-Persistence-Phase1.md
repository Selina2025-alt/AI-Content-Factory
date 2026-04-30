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
