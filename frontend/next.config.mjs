/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects: async () => [
    {
      source: "/:path*",
      has: [{ type: "host", value: "vaagai.vercel.app" }],
      destination: "https://mcqpalagu.in/:path*",
      permanent: true,
    },
  ],
};

export default nextConfig;
