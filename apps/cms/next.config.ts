import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  agentRules: false,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    return webpackConfig;
  },
  turbopack: {
    // In this pnpm monorepo the workspace root (where pnpm-lock.yaml lives)
    // is the repository root. Turbopack resolves modules inside this root,
    // so it must point to the lockfile directory, not to apps/cms.
    root: path.resolve(dirname, "../.."),
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
