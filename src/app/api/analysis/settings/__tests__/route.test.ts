// @vitest-environment node

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = {
  database: {
    close: vi.fn()
  }
};

const createMonitoringRepositoryMock = vi.fn(() => repository);
const getGlobalAnalysisSettingsMock = vi.fn();
const saveGlobalAnalysisSettingsMock = vi.fn();
const syncDailyAnalysisTaskMock = vi.fn();
const resolveAuthRequestContextMock = vi.fn();

vi.mock("@/lib/db/monitoring-repository", () => ({
  createMonitoringRepository: createMonitoringRepositoryMock,
  getGlobalAnalysisSettings: getGlobalAnalysisSettingsMock,
  saveGlobalAnalysisSettings: saveGlobalAnalysisSettingsMock
}));

vi.mock("@/lib/analysis-scheduler", () => ({
  syncDailyAnalysisTask: syncDailyAnalysisTaskMock
}));

vi.mock("@/lib/auth/request-context", () => ({
  resolveAuthRequestContext: resolveAuthRequestContextMock
}));

describe("analysis settings route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repository.database.close.mockReset();
    getGlobalAnalysisSettingsMock.mockReturnValue({
      enabled: true,
      time: "08:00",
      provider: "SiliconFlow",
      model: "Pro/zai-org/GLM-5"
    });
    resolveAuthRequestContextMock.mockReturnValue({
      sessionToken: "token",
      user: {
        id: "user-1",
        email: "admin@aicontentfactory.local",
        displayName: "Admin",
        workspaceId: "default-workspace",
        workspaceName: "默认工作空间"
      }
    });
    syncDailyAnalysisTaskMock.mockReturnValue({
      ok: true,
      taskName: "ContentPulseDailyAnalysis-default-workspace",
      message: "Daily analysis task scheduled at 09:30"
    });
  });

  it("returns the saved global analysis settings", async () => {
    const { GET } = await import("@/app/api/analysis/settings/route");
    const request = new NextRequest("http://localhost/api/analysis/settings");
    const response = await GET(request);
    const payload = await response.json();

    expect(payload).toEqual({
      settings: {
        enabled: true,
        time: "08:00",
        provider: "SiliconFlow",
        model: "Pro/zai-org/GLM-5"
      }
    });
  });

  it("saves settings and syncs the Windows task", async () => {
    const { POST } = await import("@/app/api/analysis/settings/route");
    const request = new NextRequest("http://localhost/api/analysis/settings", {
      method: "POST",
      body: JSON.stringify({
        enabled: true,
        time: "09:30"
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(saveGlobalAnalysisSettingsMock).toHaveBeenCalledWith(
      repository,
      expect.objectContaining({
        enabled: true,
        time: "09:30",
        provider: "SiliconFlow",
        model: "Pro/zai-org/GLM-5"
      }),
      "default-workspace"
    );
    expect(syncDailyAnalysisTaskMock).toHaveBeenCalledWith({
      enabled: true,
      time: "09:30",
      taskName: "ContentPulseDailyAnalysis-default-workspace"
    });
    expect(payload).toEqual({
      settings: {
        enabled: true,
        time: "09:30",
        provider: "SiliconFlow",
        model: "Pro/zai-org/GLM-5"
      },
      task: {
        ok: true,
        taskName: "ContentPulseDailyAnalysis-default-workspace",
        message: "Daily analysis task scheduled at 09:30"
      }
    });
  });
});
