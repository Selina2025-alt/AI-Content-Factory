import type { NextRequest } from "next/server";

export const DEFAULT_WORKSPACE_ID = "default-workspace";
export const WORKSPACE_ID_HEADER = "x-workspace-id";
export const WORKSPACE_ID_COOKIE = "acf_workspace_id";
export const WORKSPACE_ID_QUERY = "workspaceId";
export const SESSION_TOKEN_COOKIE = "acf_session_token";

function sanitizeWorkspaceId(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function normalizeWorkspaceId(input?: string | null) {
  if (!input) {
    return DEFAULT_WORKSPACE_ID;
  }

  const normalized = sanitizeWorkspaceId(input);
  return normalized || DEFAULT_WORKSPACE_ID;
}

export function resolveWorkspaceIdFromRequest(request: NextRequest) {
  const fromHeader = request.headers.get(WORKSPACE_ID_HEADER);

  if (fromHeader) {
    return normalizeWorkspaceId(fromHeader);
  }

  const fromCookie = request.cookies.get(WORKSPACE_ID_COOKIE)?.value;

  if (fromCookie) {
    return normalizeWorkspaceId(fromCookie);
  }

  const fromQuery = new URL(request.url).searchParams.get(WORKSPACE_ID_QUERY);
  return normalizeWorkspaceId(fromQuery);
}
