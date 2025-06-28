/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Vercel에서 SSE 지원을 위한 설정
    runtime: "experimental-edge",
  },
  // API 라우트 설정
  async headers() {
    return [
      {
        source: "/api/events",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "Connection",
            value: "keep-alive",
          },
          {
            key: "Content-Type",
            value: "text/event-stream",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
