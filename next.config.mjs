/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This disables ESLint during production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
