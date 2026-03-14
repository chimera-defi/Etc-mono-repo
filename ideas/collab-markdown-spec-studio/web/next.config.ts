import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  turbopack: {
    root: path.resolve(rootDir),
  },
};

export default nextConfig;
