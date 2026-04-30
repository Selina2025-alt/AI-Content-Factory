import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WechatArticleDetail } from "@/components/library/wechat-article-detail";

describe("WechatArticleDetail", () => {
  it("links back to content creation workspace using the correct route", () => {
    render(
      <WechatArticleDetail
        detail={{
          taskId: "task-1",
          title: "标题",
          summary: "摘要",
          body: "正文段落",
          publishStatus: "idle",
          userInput: "需求",
          updatedAt: "2026-04-30T10:00:00.000Z"
        }}
      />
    );

    expect(screen.getByRole("link", { name: "打开工作台继续编辑" })).toHaveAttribute(
      "href",
      "/content-creation/workspace/task-1"
    );
  });
});
