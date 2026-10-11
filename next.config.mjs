import path from 'node:path'

const remotionRoot = path.resolve('node_modules/remotion')

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // The composition in /video has its own node_modules; alias to a single remotion copy so the Player and composition share React context.
  turbopack: {
    resolveAlias: {
      remotion: './node_modules/remotion',
    },
  },
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, remotion: remotionRoot }
    return config
  },
}

export default nextConfig
