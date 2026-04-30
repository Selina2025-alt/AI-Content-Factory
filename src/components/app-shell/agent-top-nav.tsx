"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const AGENT_NAV_ITEMS = [
  {
    href: "/",
    label: "数据采集与选题分析agent"
  },
  {
    href: "/content-creation",
    label: "内容创作与自动分发agent"
  }
] as const;

function isActive(pathname: string, href: (typeof AGENT_NAV_ITEMS)[number]["href"]) {
  if (href === "/") {
    return !pathname.startsWith("/content-creation");
  }

  return pathname.startsWith(href);
}

export default function AgentTopNav() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [workspaceName, setWorkspaceName] = useState("");

  useEffect(() => {
    if (pathname === "/login" || typeof fetch !== "function") {
      return;
    }

    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });

        if (!response.ok || cancelled) {
          return;
        }

        const payload = (await response.json()) as {
          authenticated?: boolean;
          user?: { workspaceName?: string };
        };

        if (!cancelled && payload.authenticated) {
          setWorkspaceName(payload.user?.workspaceName ?? "");
        }
      } catch {
        // Ignore session hint fetch errors in navigation.
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <nav className="agent-top-nav" aria-label="Agent Menu">
      <div className="agent-top-nav__inner">
        {AGENT_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`agent-top-nav__link${isActive(pathname, item.href) ? " is-active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
        <div className="agent-top-nav__spacer" />
        {pathname !== "/login" ? (
          <>
            {workspaceName ? (
              <span className="agent-top-nav__workspace">{workspaceName}</span>
            ) : null}
            <button
              type="button"
              className="agent-top-nav__link agent-top-nav__logout"
              onClick={() => void handleLogout()}
            >
              退出登录
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
}
