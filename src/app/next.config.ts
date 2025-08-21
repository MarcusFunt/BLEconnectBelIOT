import type {NextConfig} from 'next';

// Determine if we are in production mode.
const isProd = process.env.NODE_ENV === 'production';
// The name of the repository. Used for basePath and assetPrefix when
// deploying to GitHub Pages. Update this if you fork the repo.
const repo = 'BLEconnectBelIOT';

/**
 * Next.js configuration for static export.
 *
 * The `output: 'export'` option tells Next.js to generate a static
 * site into the `out/` folder. When deploying to GitHub Pages, we
 * additionally set `basePath` and `assetPrefix` to `/${repo}` to
 * ensure that all links and assets are correctly prefixed. On
 * non-production builds (i.e. `npm run dev`) these are left
 * undefined so the app runs at the root path.
 */
const nextConfig: NextConfig = {
  // Enable static site generation (Next.js 14+)
  output: 'export',
  // Configure paths for GitHub Pages. Only used in production.
  basePath: isProd ? `/${repo}` : undefined,
  assetPrefix: isProd ? `/${repo}/` : undefined,
  // Preserve existing settings.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Disable the automatic Image Optimization API on static hosts.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;