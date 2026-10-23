import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Trace files from the monorepo root so the standalone build includes @repo/shared.
  outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
};

export default nextConfig;
