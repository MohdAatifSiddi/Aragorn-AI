import type { NextConfig } from "next";
import path from "node:path";

// Loader path from orchids-visual-edits - use direct resolve to get the actual file
const loaderPath = require.resolve('orchids-visual-edits/loader.js');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
    allowedDevOrigins: [
      '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.cloud',
      '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy01.net',
      '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.proxy.daytona.works'
    ],
    outputFileTracingRoot: path.resolve(__dirname, '../../'),
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    experimental: {
      serverActions: {
        allowedOrigins: [
          '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.cloud',
          '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy01.net',
          '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.proxy.daytona.works',
          '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy02.net',
          'https://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.cloud',
          'https://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy01.net',
          'https://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.proxy.daytona.works',
          'https://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy02.net',
          'http://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.cloud',
          'http://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy01.net',
          'http://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.proxy.daytona.works',
          'http://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy02.net',
          '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.app',
          'https://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.app',
          'http://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.app',
          'www.orchids.app',
          'https://www.orchids.app',
          'orchids.cloud',
          'orchids.app',
          'daytonaproxy01.net',
          'proxy.daytona.works',
          'localhost:3000',
          'localhost:3001',
          'http://localhost:3000',
          'http://localhost:3001'
        ],
      },
    },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [loaderPath]
      }
    }
  }
} as NextConfig;

export default nextConfig;
