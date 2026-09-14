import type { NextConfig } from "next";
const projectRoot = process.cwd();
const config: NextConfig = {
  devIndicators: false,
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
};
export default config;
