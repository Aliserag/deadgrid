/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Enable static optimization for better performance
  experimental: {
    scrollRestoration: true,
  },
}

module.exports = nextConfig 