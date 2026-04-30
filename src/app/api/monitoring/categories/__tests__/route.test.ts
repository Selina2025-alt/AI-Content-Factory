// @vitest-environment node

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = {
  database: {
    close: vi.fn()
  }
};

const createMonitoringRepositoryMock = vi.fn(() => repository);
const listMonitorCategoriesMock = vi.fn();
const listMonitorCategoryCreatorsMock = vi.fn();
const replaceMonitorCategoriesSnapshotMock = vi.fn();
const resolveAuthRequestContextMock = vi.fn();

vi.mock("@/lib/db/monitoring-repository", () => ({
  createMonitoringRepository: createMonitoringRepositoryMock,
  listMonitorCategories: listMonitorCategoriesMock,
  listMonitorCategoryCreators: listMonitorCategoryCreatorsMock,
  replaceMonitorCategoriesSnapshot: replaceMonitorCategoriesSnapshotMock
}));

vi.mock("@/lib/auth/request-context", () => ({
  resolveAuthRequestContext: resolveAuthRequestContextMock
}));

describe("monitoring categories route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository.database.close.mockReset();
    resolveAuthRequestContextMock.mockReturnValue({
      sessionToken: "token",
      user: {
        id: "user-1",
        email: "admin@aicontentfactory.local",
        displayName: "Admin",
        workspaceId: "team-a",
        workspaceName: "Team A"
      }
    });
  });

  it("returns categories and creators for a workspace", async () => {
    listMonitorCategoriesMock.mockReturnValue([
      {
        workspaceId: "team-a",
        id: "ws-team-a-claude",
        icon: "⚡",
        name: "Claude Code 选题监控",
        description: "desc",
        keyword: "claude code",
        createdAt: "2026-04-30T00:00:00.000Z",
        updatedAt: "2026-04-30T00:00:00.000Z"
      }
    ]);
    listMonitorCategoryCreatorsMock.mockReturnValue([
      {
        workspaceId: "team-a",
        id: "ws-team-a-claude--creator-1",
        categoryId: "ws-team-a-claude",
        name: "机器之心",
        platformId: "wechat",
        createdAt: "2026-04-30T00:00:00.000Z",
        updatedAt: "2026-04-30T00:00:00.000Z"
      }
    ]);

    const { GET } = await import("@/app/api/monitoring/categories/route");
    const request = new NextRequest(
      "http://localhost/api/monitoring/categories?workspaceId=team-a"
    );
    const response = await GET(request);
    const payload = await response.json();

    expect(listMonitorCategoriesMock).toHaveBeenCalledWith(repository, "team-a");
    expect(listMonitorCategoryCreatorsMock).toHaveBeenCalledWith(repository, "team-a");
    expect(payload.categories).toEqual([
      {
        id: "ws-team-a-claude",
        icon: "⚡",
        name: "Claude Code 选题监控",
        description: "desc",
        keyword: "claude code",
        creators: [
          {
            id: "ws-team-a-claude--creator-1",
            name: "机器之心",
            platformId: "wechat"
          }
        ]
      }
    ]);
  });

  it("normalizes and saves workspace-scoped categories", async () => {
    const { POST } = await import("@/app/api/monitoring/categories/route");
    const request = new NextRequest(
      "http://localhost/api/monitoring/categories?workspaceId=team-a",
      {
        method: "POST",
        body: JSON.stringify({
          categories: [
            {
              id: "claude",
              icon: "⚡",
              name: "Claude Code 选题监控",
              description: "desc",
              keyword: "Claude Code",
              creators: [
                {
                  id: "creator-1",
                  name: "机器之心",
                  platformId: "wechat"
                }
              ]
            }
          ]
        })
      }
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(replaceMonitorCategoriesSnapshotMock).toHaveBeenCalledWith(repository, {
      workspaceId: "team-a",
      categories: [
        {
          id: "ws-team-a-claude",
          icon: "⚡",
          name: "Claude Code 选题监控",
          description: "desc",
          keyword: "claude code",
          creators: [
            {
              id: "ws-team-a-claude--creator-1",
              name: "机器之心",
              platformId: "wechat"
            }
          ]
        }
      ]
    });
    expect(payload).toEqual({ ok: true });
  });
});
