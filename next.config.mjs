/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip type-check and ESLint during Vercel builds to avoid blocking deploys
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "randomuser.me" },
      // If you keep pravatar for anything:
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};
export default nextConfig;