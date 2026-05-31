import path from "node:path";
import type { NextConfig } from "next";

const asyncStorageStub = path.join(
  __dirname,
  "src/stubs/async-storage.ts",
);

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@react-native-async-storage/async-storage": "./src/stubs/async-storage.ts",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": asyncStorageStub,
    };
    return config;
  },
};

export default nextConfig;
