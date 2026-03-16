/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable output file tracing to prevent permission errors
  outputFileTracing: false,
  // Disable experimental features that might cause issues
  experimental: {
    // Disable Webpack build worker
    webpackBuildWorker: false,
  },
}

module.exports = nextConfig