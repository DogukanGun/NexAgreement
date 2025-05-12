import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  clientId: process.env.NEXT_PUBLIC_CIVIC_KEY,
});

export default withCivicAuth(nextConfig); 