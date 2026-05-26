/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mksqwzkgfgkdpzvwatsc.supabase.co",
      },
    ],
  },
};

export default nextConfig;