/**
 * Next.js Configuration
 * 
 * Configures Next.js framework settings for the Aragorn AI project.
 * 
 * Image Configuration:
 * - remotePatterns: Allows loading images from any HTTPS/HTTP domain
 *   - Used for AWS S3 image URLs
 *   - Used for external construction site images
 *   - Security: Consider restricting to specific domains in production
 * 
 * Development Origins:
 * - allowedDevOrigins: Trusted development environments
 *   - Orchids Cloud development instances
 *   - Daytona proxy domains
 *   - Used for CMS integration and visual editing
 * 
 * Build Configuration:
 * - outputFileTracingRoot: Resolves monorepo dependencies
 * - typescript.ignoreBuildErrors: true - Allows build with TS errors (use with caution)
 * - eslint.ignoreDuringBuilds: true - Skips ESLint during build (faster builds)
 * 
 * Experimental Features:
 * 
 * Server Actions:
 * - bodySizeLimit: "10mb" - Allows uploading images up to 10MB
 * - allowedOrigins: Extensive list of trusted origins for server actions
 *   - Development environments (Orchids, Daytona)
 *   - Production domains
 *   - Localhost for local development
 *   - Required for image upload functionality
 * 
 * Turbopack (Next.js 15+ bundler):
 * - rules: Custom loader for JSX/TSX files
 * - Uses orchids-visual-edits loader for CMS integration
 * - Enables visual editing in development
 * 
 * Output:
 * - output: undefined - Uses default Next.js output mode
 *   - Supports both static and dynamic rendering
 *   - Optimized for Vercel deployment
 * 
 * Security Notes:
 * - Review allowedOrigins before production deployment
 * - Consider restricting image domains to AWS S3 only
 * - Enable TypeScript/ESLint checks in CI/CD pipeline
 * 
 * @see https://nextjs.org/docs/app/api-reference/next-config-js
 */

import type { NextConfig } from "next";
import path from "node:path";

// Loader path from orchids-visual-edits - use direct resolve to get the actual file
const loaderPath = require.resolve('orchids-visual-edits/loader.js');

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS domains
      },
      {
        protocol: 'http',
        hostname: '**', // Allow all HTTP domains (dev only)
      },
    ],
  },
  
  // Allowed development origins for CMS integration
  allowedDevOrigins: [
    '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.cloud',
    '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy01.net',
    '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.proxy.daytona.works'
  ],
  
  // Monorepo support
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  
  // Build configuration (use with caution in production)
  typescript: {
    ignoreBuildErrors: true, // TODO: Fix TypeScript errors and set to false
  },
  eslint: {
    ignoreDuringBuilds: true, // TODO: Fix ESLint errors and set to false
  },
  
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Allow 10MB uploads for construction site images
      allowedOrigins: [
        // Orchids Cloud development
        '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.cloud',
        '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy01.net',
        '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.proxy.daytona.works',
        '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy02.net',
        
        // HTTPS variants
        'https://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.cloud',
        'https://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy01.net',
        'https://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.proxy.daytona.works',
        'https://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy02.net',
        
        // HTTP variants (dev only)
        'http://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.cloud',
        'http://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy01.net',
        'http://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.proxy.daytona.works',
        'http://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.daytonaproxy02.net',
        
        // Production domains
        '3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.app',
        'https://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.app',
        'http://3000-bbe24610-8ebf-404a-9d8e-505a40fb9492.orchids.app',
        'www.orchids.app',
        'https://www.orchids.app',
        'orchids.cloud',
        'orchids.app',
        'daytonaproxy01.net',
        'proxy.daytona.works',
        
        // Local development
        'localhost:3000',
        'localhost:3001',
        'http://localhost:3000',
        'http://localhost:3001'
      ],
    },
  },
  
  // Turbopack configuration (Next.js 15+ bundler)
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [loaderPath] // Orchids visual editing loader
      }
    }
  },
  
  // Disable output tracing issues on Vercel
  output: undefined,
} as NextConfig;

export default nextConfig;
