import type { NextConfig } from "next";
import { execSync } from "child_process";

// 获取 Git commit ID
function getGitCommitId(): string {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_COMMIT_ID: getGitCommitId(),
    NEXT_PUBLIC_BUILD_ID: process.env.GITHUB_RUN_NUMBER || "local",
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
