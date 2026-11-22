/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/heart-score",
        destination: "http://127.0.0.1:8000/score",
      },
    ];
  },
};

export default nextConfig;
