import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import type { NextConfig } from "next";

const distDir = process.env.NEXT_DIST_DIR?.trim();

const nextConfig = (phase: string): NextConfig => {
  if (distDir) {
    return { distDir };
  }

  return {
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next" : ".next-build"
  };
};

export default nextConfig;
