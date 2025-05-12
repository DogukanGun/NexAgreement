import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs"
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['tan-accurate-ant-19.mypinata.cloud'],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};
const withCivicAuth = createCivicAuthPlugin({
  clientId: process.env.NEXT_PUBLIC_CIVIC_KEY || '3b2c1c54-7b14-47c3-bfca-8aaf351e5b77',
});

export default withCivicAuth(nextConfig)
