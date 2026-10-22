import { execSync } from "node:child_process";
import type { NextConfig } from "next";

// Footer status line: BUILD <sha> · DEPLOYED <date>, fixed at build time.
function gitSha() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "local";
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  env: {
    BUILD_SHA: gitSha(),
    BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
