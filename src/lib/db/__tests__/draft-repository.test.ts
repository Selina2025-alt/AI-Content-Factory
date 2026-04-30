// @vitest-environment node

import { rmSync } from "node:fs";
import path from "node:path";

import { beforeEach, describe, expect, it } from "vitest";

import { migrateDatabase } from "@/lib/db/migrate";
import {
  createDraft,
  deleteDraft,
  getDraftById,
  listDrafts,
  markDraftGenerated,
  upsertGeneratedDraft,
  updateDraft
} from "@/lib/db/repositories/draft-repository";

process.env.CONTENT_CREATION_AGENT_DATA_ROOT = path.join(
  process.cwd(),
  ".codex-data-tests",
  "draft-repository"
);

describe("draft repository", () => {
  beforeEach(() => {
    rmSync(process.env.CONTENT_CREATION_AGENT_DATA_ROOT!, {
      recursive: true,
      force: true
    });

    migrateDatabase();
  });

  it("creates and lists drafts in reverse updated order", () => {
    createDraft({
      id: "draft-1",
      title: "智能体选题",
      prompt: "写一篇关于智能体发展的文章",
      selectedPlatforms: ["wechat"],
      status: "draft"
    });

    createDraft({
      id: "draft-2",
      title: "效率选题",
      prompt: "写一篇关于效率提升的文章",
      selectedPlatforms: ["wechat", "twitter"],
      status: "draft"
    });

    expect(listDrafts().map((draft) => draft.id)).toEqual(["draft-2", "draft-1"]);
  });

  it("updates draft content, marks generation, and deletes a draft", () => {
    createDraft({
      id: "draft-3",
      title: "原始标题",
      prompt: "原始需求",
      selectedPlatforms: ["wechat"],
      status: "draft"
    });

    updateDraft({
      id: "draft-3",
      title: "更新后的标题",
      prompt: "更新后的需求",
      selectedPlatforms: ["wechat", "videoScript"],
      status: "draft"
    });

    markDraftGenerated("draft-3", "task-123");

    expect(getDraftById("draft-3")).toMatchObject({
      id: "draft-3",
      title: "更新后的标题",
      prompt: "更新后的需求",
      selectedPlatforms: ["wechat", "videoScript"],
      status: "generated",
      lastGeneratedTaskId: "task-123"
    });

    deleteDraft("draft-3");
    expect(getDraftById("draft-3")).toBeNull();
  });

  it("upserts a generating draft and then marks it failed", () => {
    upsertGeneratedDraft({
      id: "topic-library-draft:1",
      title: "批量选题 1",
      prompt: "生成中的草稿",
      selectedPlatforms: ["wechat"],
      status: "generating",
      lastGeneratedTaskId: null
    });

    expect(getDraftById("topic-library-draft:1")).toMatchObject({
      status: "generating",
      lastGeneratedTaskId: null
    });

    upsertGeneratedDraft({
      id: "topic-library-draft:1",
      title: "批量选题 1",
      prompt: "生成失败草稿",
      selectedPlatforms: ["wechat"],
      status: "failed",
      lastGeneratedTaskId: null
    });

    expect(getDraftById("topic-library-draft:1")).toMatchObject({
      status: "failed",
      lastGeneratedTaskId: null
    });
  });
});
