"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname() ?? "/";

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
      </div>
    </nav>
  );
}
