import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
